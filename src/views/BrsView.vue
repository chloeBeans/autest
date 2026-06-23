<script setup>
import { ref, computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useBrsStore } from '@/store/brs';
import { useToastStore } from '@/store/toast';
import { readBrsFile, extractRequirements } from '@/utils/brs';
import { REQ_STATUS } from '@/utils/constants';

const brsStore = useBrsStore();
const toast = useToastStore();

const file = ref(null);
const pasteText = ref('');

const statusOptions = computed(() => [
  { title: $t('brs.notStarted'), value: REQ_STATUS.NOT_STARTED },
  { title: $t('brs.inProgress'), value: REQ_STATUS.IN_PROGRESS },
  { title: $t('brs.done'), value: REQ_STATUS.DONE },
]);

const renderedDoc = computed(() => {
  const doc = brsStore.document;
  if (!doc) return '';
  if (doc.kind === 'markdown') return DOMPurify.sanitize(marked.parse(doc.data));
  if (doc.kind === 'html') return DOMPurify.sanitize(doc.data);
  return '';
});

const columns = computed(() => [
  { key: 'text', title: $t('brs.requirement'), minWidth: '280px' },
  { key: 'sprint', title: $t('brs.sprint'), minWidth: '160px' },
  { key: 'status', title: $t('brs.reqStatus'), minWidth: '150px' },
  { key: 'completedDate', title: 'Completed', minWidth: '120px' },
]);

async function onFile(files) {
  const f = Array.isArray(files) ? files[0] : files;
  if (!f) return;
  try {
    const doc = await readBrsFile(f);
    brsStore.setDocument(doc);
    const reqs = extractRequirements(doc.text);
    const added = brsStore.autoAddItems(reqs);
    toast.success(
      added ? `Loaded ${doc.name} — auto-listed ${added} requirements` : `Loaded ${doc.name}`
    );
    if (!added && doc.kind === 'pdf') {
      toast.info('PDF loaded for viewing. Paste its text below to auto-list requirements.');
    }
  } catch (err) {
    toast.error(err.message);
  }
}

function autoFromPaste() {
  const reqs = extractRequirements(pasteText.value);
  const added = brsStore.autoAddItems(reqs);
  toast.success(`Auto-listed ${added} requirements`);
  pasteText.value = '';
}

function onSprintChange(item, value) {
  brsStore.ensureSprint(value);
  brsStore.updateItem(item.id, { sprint: value || '' });
}
</script>

<template>
  <div>
    <PageHeader :title="$t('brs.title')" icon="mdi-file-document-outline">
      <template #actions>
        <Badge variant="green"
          >{{ brsStore.progress.done }}/{{ brsStore.progress.total }} done</Badge
        >
      </template>
    </PageHeader>

    <Card>
      <v-file-input
        v-model="file"
        accept=".pdf,.docx,.md,.markdown,.txt"
        prepend-icon="mdi-file-upload-outline"
        :label="$t('brs.upload') + ' (PDF / DOCX / MD / TXT)'"
        variant="outlined"
        density="comfortable"
        show-size
        @update:model-value="onFile"
      />
      <v-progress-linear
        v-if="brsStore.progress.total"
        :model-value="brsStore.progress.pct"
        color="success"
        height="8"
        rounded
        class="mt-2"
      />
    </Card>

    <v-row>
      <v-col cols="12" md="6">
        <Card full-height>
          <template #header>{{ $t('brs.viewer') }}</template>
          <div v-if="!brsStore.document" class="text-center text-medium-emphasis py-8">
            <v-icon icon="mdi-file-outline" size="48" class="mb-2" />
            <div>No BRS uploaded</div>
          </div>
          <iframe
            v-else-if="brsStore.document.kind === 'pdf'"
            :src="brsStore.document.data"
            style="width: 100%; height: 520px; border: 0"
          />
          <div v-else-if="renderedDoc" class="brs-doc" v-html="renderedDoc" />
          <pre v-else class="text-pre-wrap" style="max-height: 520px; overflow: auto">{{
            brsStore.document.data
          }}</pre>

          <div v-if="brsStore.document && brsStore.document.kind === 'pdf'" class="mt-4">
            <v-textarea
              v-model="pasteText"
              label="Paste BRS text to auto-list requirements"
              rows="4"
            />
            <FormButton
              class="mt-2"
              variant="line-primary"
              prependIcon="mdi-format-list-checks"
              @click="autoFromPaste"
            >
              Auto-list from text
            </FormButton>
          </div>
        </Card>
      </v-col>

      <v-col cols="12" md="6">
        <Card>
          <template #header>Sprints & due dates</template>
          <div v-if="!brsStore.sprints.length" class="text-medium-emphasis text-body-2">
            Assign a sprint to a requirement below to create one.
          </div>
          <div v-for="s in brsStore.sprints" :key="s.name" class="d-flex align-center ga-3 mb-2">
            <Badge variant="blue">{{ s.name }}</Badge>
            <v-text-field
              type="date"
              :model-value="s.dueDate"
              label="Due date"
              density="compact"
              hide-details
              style="max-width: 200px"
              @update:model-value="brsStore.setSprintDueDate(s.name, $event)"
            />
          </div>
        </Card>

        <Card>
          <template #header>
            <div class="d-flex align-center justify-space-between" style="width: 100%">
              <span>{{ $t('brs.tracker') }}</span>
              <FormButton
                size="md"
                variant="line-primary"
                prependIcon="mdi-plus"
                @click="brsStore.addItem()"
              >
                {{ $t('brs.addItem') }}
              </FormButton>
            </div>
          </template>

          <DataTable :columns="columns" :data="brsStore.items" empty-text="No requirements yet">
            <template #cell-text="{ row }">
              <v-text-field
                :model-value="row.text"
                density="compact"
                hide-details
                variant="plain"
                @update:model-value="brsStore.updateItem(row.id, { text: $event })"
              />
            </template>
            <template #cell-sprint="{ row }">
              <v-combobox
                :model-value="row.sprint"
                :items="brsStore.sprintNames"
                density="compact"
                hide-details
                placeholder="Sprint"
                @update:model-value="onSprintChange(row, $event)"
              />
            </template>
            <template #cell-status="{ row }">
              <v-select
                :model-value="row.status"
                :items="statusOptions"
                density="compact"
                hide-details
                @update:model-value="brsStore.updateItem(row.id, { status: $event })"
              />
            </template>
            <template #cell-completedDate="{ value }">
              <span v-if="value" class="text-success mono">{{ value }}</span>
              <span v-else class="text-medium-emphasis">-</span>
            </template>
            <template #actions="{ row }">
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                @click="brsStore.removeItem(row.id)"
              />
            </template>
          </DataTable>
        </Card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.brs-doc {
  max-height: 520px;
  overflow: auto;
  line-height: 1.6;
}
.brs-doc :deep(h1),
.brs-doc :deep(h2),
.brs-doc :deep(h3) {
  margin: 0.6em 0 0.3em;
}
.brs-doc :deep(table) {
  border-collapse: collapse;
}
.brs-doc :deep(td),
.brs-doc :deep(th) {
  border: 1px solid #ddd;
  padding: 4px 8px;
}
</style>
