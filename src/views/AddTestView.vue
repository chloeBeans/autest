<script setup>
import { ref, computed } from 'vue';
import { buildTestFromSteps } from '@/utils/playwright';
import { writeFile, downloadTextFile } from '@/utils/fileSystem';
import { useFolderStore } from '@/store/folders';
import { useToastStore } from '@/store/toast';
import { PORTALS } from '@/utils/constants';

const folderStore = useFolderStore();
const toast = useToastStore();

const name = ref('new test');
const baseUrl = ref('http://localhost:5173');
const targetPortal = ref(PORTALS.EXTERNAL);
const steps = ref([{ type: 'click', selector: '', value: '' }]);

const stepTypes = [
  { title: 'Go to URL', value: 'goto' },
  { title: 'Click', value: 'click' },
  { title: 'Fill', value: 'fill' },
  { title: 'Expect visible', value: 'expectVisible' },
  { title: 'Expect text', value: 'expectText' },
];

const portalOptions = [
  { title: 'External', value: PORTALS.EXTERNAL },
  { title: 'Internal', value: PORTALS.INTERNAL },
];

const generated = computed(() =>
  buildTestFromSteps({ name: name.value, baseUrl: baseUrl.value, steps: steps.value })
);

const connected = computed(() => folderStore.isConnected(targetPortal.value));

function addStep() {
  steps.value.push({ type: 'click', selector: '', value: '' });
}
function removeStep(i) {
  steps.value.splice(i, 1);
}

async function save() {
  try {
    if (connected.value) {
      const path = await writeFile(
        folderStore.handleFor(targetPortal.value),
        'tests',
        generated.value.fileName,
        generated.value.content
      );
      toast.success(`Saved ${path}`);
    } else {
      downloadTextFile(generated.value.fileName, generated.value.content);
      toast.info('No folder connected — downloaded the spec instead.');
    }
  } catch (err) {
    toast.error(err.message);
  }
}
</script>

<template>
  <div>
    <PageHeader :title="$t('addTest.title')" icon="mdi-flask-outline" />

    <v-row>
      <v-col cols="12" md="8">
        <Card>
          <template #header>{{ $t('addTest.steps') }}</template>
          <v-row class="mb-2">
            <v-col cols="12" md="6">
              <v-text-field v-model="name" :label="$t('addTest.name')" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="baseUrl" :label="$t('addTest.baseUrl')" />
            </v-col>
          </v-row>

          <div v-for="(step, i) in steps" :key="i" class="d-flex ga-2 mb-2 align-center">
            <v-select
              v-model="step.type"
              :items="stepTypes"
              style="max-width: 180px"
              hide-details
            />
            <v-text-field v-model="step.selector" label="Selector" hide-details />
            <v-text-field v-model="step.value" label="Value" hide-details />
            <v-btn icon="mdi-delete-outline" variant="text" color="error" @click="removeStep(i)" />
          </div>

          <FormButton variant="line-primary" prependIcon="mdi-plus" @click="addStep">
            {{ $t('addTest.addStep') }}
          </FormButton>
        </Card>
      </v-col>

      <v-col cols="12" md="4">
        <Card>
          <template #header>{{ $t('addTest.preview') }}</template>
          <v-select
            v-model="targetPortal"
            :items="portalOptions"
            label="Save into portal"
            class="mb-3"
          />
          <div class="text-caption text-medium-emphasis mb-1">{{ generated.fileName }}</div>
          <div class="code-block mb-3" style="max-height: 320px">{{ generated.content }}</div>
          <FormButton block prependIcon="mdi-content-save-outline" @click="save">
            {{ connected ? 'Save to folder' : $t('general.download') }}
          </FormButton>
        </Card>
      </v-col>
    </v-row>
  </div>
</template>
