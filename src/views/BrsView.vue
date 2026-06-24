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

const addFile = ref(null);
const reattachFile = ref(null);
const pasteText = ref('');

const ACCEPT = '.pdf,.docx,.md,.markdown,.txt';

const brsItems = computed(() => brsStore.brsList.map(b => ({ title: b.name, value: b.id })));

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

function pickFirst(files) {
  return Array.isArray(files) ? files[0] : files;
}

// Upload a brand-new BRS document.
async function onAddBrs(files) {
  const f = pickFirst(files);
  if (!f) return;
  try {
    const doc = await readBrsFile(f);
    brsStore.addBrs(doc);
    const added = brsStore.autoAddItems(extractRequirements(doc.text));
    toast.success(
      added ? `Added ${doc.name} — auto-listed ${added} requirements` : `Added ${doc.name}`
    );
    if (!added && doc.kind === 'pdf') {
      toast.info('PDF added for viewing. Paste its text below to auto-list requirements.');
    }
  } catch (err) {
    toast.error(err.message);
  } finally {
    addFile.value = null;
  }
}

// Re-attach a document to the current BRS (content is in-memory only).
async function onReattach(files) {
  const f = pickFirst(files);
  if (!f) return;
  try {
    const doc = await readBrsFile(f);
    brsStore.setDocument(doc);
    brsStore.autoAddItems(extractRequirements(doc.text));
    toast.success(`Loaded ${doc.name}`);
  } catch (err) {
    toast.error(err.message);
  } finally {
    reattachFile.value = null;
  }
}

function removeCurrent() {
  const brs = brsStore.currentBrs;
  if (!brs) return;
  brsStore.removeBrs(brs.id);
  toast.warning(`Removed ${brs.name}`);
}

function autoFromPaste() {
  const added = brsStore.autoAddItems(extractRequirements(pasteText.value));
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
        <Badge variant="green">
          {{ brsStore.progress.done }}/{{ brsStore.progress.total }} done
        </Badge>
      </template>
    </PageHeader>

    <Card>
      <!-- No BRS yet -->
      <v-file-input
        v-if="!brsStore.brsList.length"
        v-model="addFile"
        :accept="ACCEPT"
        prepend-icon="mdi-file-upload-outline"
        :label="$t('brs.upload') + ' (PDF / DOCX / MD / TXT)'"
        variant="outlined"
        density="comfortable"
        show-size
        @update:model-value="onAddBrs"
      />

      <!-- One or more BRS -->
      <template v-else>
        <v-row dense align="center">
          <v-col cols="12" md="5">
            <v-select
              :model-value="brsStore.currentBrs?.id"
              :items="brsItems"
              label="BRS document"
              prepend-inner-icon="mdi-file-document-outline"
              hide-details
              density="comfortable"
              @update:model-value="brsStore.selectBrs($event)"
            />
          </v-col>
          <v-col cols="12" md="5">
            <v-file-input
              v-model="addFile"
              :accept="ACCEPT"
              prepend-icon="mdi-file-plus-outline"
              label="Add another BRS"
              hide-details
              density="comfortable"
              @update:model-value="onAddBrs"
            />
          </v-col>
          <v-col cols="12" md="2" class="d-flex justify-end">
            <FormButton
              variant="line-secondary"
              prependIcon="mdi-delete-outline"
              @click="removeCurrent"
            >
              {{ $t('general.remove') }}
            </FormButton>
          </v-col>
        </v-row>
        <div class="text-caption text-medium-emphasis mt-2">
          {{ brsStore.brsList.length }} BRS in this project · {{ brsStore.progress.done }}/{{
            brsStore.progress.total
          }}
          requirements done
        </div>
        <v-progress-linear
          v-if="brsStore.progress.total"
          :model-value="brsStore.progress.pct"
          color="success"
          height="8"
          rounded
          class="mt-1"
        />
      </template>
    </Card>

    <v-row v-if="brsStore.currentBrs">
      <v-col cols="12" md="6">
        <Card full-height>
          <template #header>{{ $t('brs.viewer') }} — {{ brsStore.currentBrs.name }}</template>

          <div v-if="!brsStore.document" class="text-center text-medium-emphasis py-6">
            <v-icon icon="mdi-file-outline" size="48" class="mb-2" />
            <div>Document not loaded this session.</div>
            <div class="text-caption mb-3">
              Requirements are saved — re-upload the file to view it.
            </div>
            <v-file-input
              v-model="reattachFile"
              :accept="ACCEPT"
              label="Re-upload to view"
              density="compact"
              hide-details
              style="max-width: 320px; margin: 0 auto"
              @update:model-value="onReattach"
            />
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
