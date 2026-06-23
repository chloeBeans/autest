<script setup>
import { ref, watch, computed } from 'vue';
import { analyzeBug, commitFix } from '@/api/fixes';
import { buildPrompt } from '@/utils/playwright';
import { writeFile, downloadTextFile } from '@/utils/fileSystem';
import { useFolderStore } from '@/store/folders';
import { useBugStore } from '@/store/bugs';
import { useToastStore } from '@/store/toast';
import { BUG_STATUS, CONFIDENCE } from '@/utils/constants';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  bug: { type: Object, default: null },
});
const emit = defineEmits(['update:modelValue']);

const folderStore = useFolderStore();
const bugStore = useBugStore();
const toast = useToastStore();

const loading = ref(false);
const committing = ref(false);
const analyzed = ref(false);
const confidence = ref(CONFIDENCE.UNKNOWN);
const summary = ref('');
const note = ref('');
const fileName = ref('');
const code = ref('');

const isConfident = computed(() => confidence.value === CONFIDENCE.HIGH);
const connected = computed(() => props.bug && folderStore.isConnected(props.bug.portal));

watch(
  () => props.modelValue,
  open => {
    if (open && props.bug) reset();
  }
);

function reset() {
  analyzed.value = false;
  confidence.value = CONFIDENCE.UNKNOWN;
  summary.value = '';
  note.value = '';
  fileName.value = '';
  code.value = '';
}

function close() {
  emit('update:modelValue', false);
}

async function analyze() {
  loading.value = true;
  try {
    const res = await analyzeBug(props.bug);
    confidence.value = res.confidence;
    summary.value = res.summary;
    note.value = res.note;
    fileName.value = res.suggestedFileName;
    code.value = res.suggestedTest;
    analyzed.value = true;
    bugStore.updateBug(props.bug.key, {
      status: BUG_STATUS.ANALYZED,
      confidence: res.confidence,
      note: res.note,
    });
  } catch (err) {
    toast.error(err.message);
  } finally {
    loading.value = false;
  }
}

async function save() {
  try {
    if (connected.value) {
      const path = await writeFile(
        folderStore.handleFor(props.bug.portal),
        'tests',
        fileName.value,
        code.value
      );
      bugStore.updateBug(props.bug.key, { status: BUG_STATUS.GENERATED, generatedFile: path });
      toast.success(`Saved ${path}`);
    } else {
      downloadTextFile(fileName.value, code.value);
      bugStore.updateBug(props.bug.key, {
        status: BUG_STATUS.GENERATED,
        generatedFile: fileName.value,
      });
      toast.info('No folder connected — downloaded the spec instead.');
    }
  } catch (err) {
    toast.error(err.message);
  }
}

async function commit() {
  committing.value = true;
  try {
    const res = await commitFix({ bugId: props.bug.id, fileName: fileName.value });
    bugStore.updateBug(props.bug.key, {
      status: BUG_STATUS.COMMITTED,
      commitHash: res.commitHash,
    });
    toast.success(`${res.message} (${res.commitHash})`);
    close();
  } catch (err) {
    toast.error(err.message);
  } finally {
    committing.value = false;
  }
}

function saveNote() {
  bugStore.updateBug(props.bug.key, { status: BUG_STATUS.NEEDS_REVIEW, note: note.value });
  toast.warning('Saved to Notes / Doubts for human review.');
  close();
}

async function copyPrompt() {
  await navigator.clipboard.writeText(buildPrompt(props.bug));
  toast.success($t('general.copied'));
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="820"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="bug" rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-subtitle-1 font-weight-bold">
          <span class="mono">{{ bug.id }}</span> — {{ $t('bugs.generateTest') }}
        </span>
        <v-btn variant="text" icon="mdi-close" @click="close" />
      </v-card-title>

      <v-card-text>
        <div class="text-body-2 text-medium-emphasis mb-3 text-pre-wrap">{{ bug.description }}</div>

        <div class="d-flex ga-2 mb-4">
          <v-btn
            color="primary"
            :loading="loading"
            prepend-icon="mdi-robot-outline"
            @click="analyze"
          >
            {{ $t('bugs.analyze') }}
          </v-btn>
          <v-btn variant="tonal" prepend-icon="mdi-content-copy" @click="copyPrompt">
            {{ $t('bugs.copyPrompt') }}
          </v-btn>
        </div>

        <template v-if="analyzed">
          <v-alert
            :type="isConfident ? 'success' : 'warning'"
            variant="tonal"
            border="start"
            class="mb-3"
          >
            <strong>{{ isConfident ? 'High confidence' : 'Low confidence' }}.</strong>
            {{ summary }}
          </v-alert>

          <div class="text-caption text-medium-emphasis mb-1">
            {{ fileName }}
            <span v-if="connected">→ tests/ in {{ folderStore.names[bug.portal] }}</span>
          </div>
          <v-textarea
            v-model="code"
            rows="14"
            class="mono"
            variant="outlined"
            hide-details
            auto-grow
          />
        </template>
      </v-card-text>

      <v-card-actions v-if="analyzed" class="px-4 pb-4">
        <v-btn variant="tonal" prepend-icon="mdi-content-save-outline" @click="save">
          {{ connected ? 'Save to folder' : $t('general.download') }}
        </v-btn>
        <v-spacer />
        <template v-if="isConfident">
          <v-btn
            color="success"
            :loading="committing"
            prepend-icon="mdi-source-commit"
            @click="commit"
          >
            Commit fix (mock)
          </v-btn>
        </template>
        <template v-else>
          <v-btn color="warning" prepend-icon="mdi-comment-alert-outline" @click="saveNote">
            Save note for review
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
