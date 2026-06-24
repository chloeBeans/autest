<script lang="ts" setup>
import type { RequirementItem } from '#/types/domain';

import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  AutoComplete,
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Progress,
  Select,
  Table,
  Tag,
  Textarea,
  Upload,
} from 'ant-design-vue';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { $t } from '#/locales';
import { useBrsStore } from '#/store/brs';
import { extractRequirements, readBrsFile } from '#/utils/brs';
import { REQ_STATUS } from '#/utils/constants';
import { toast } from '#/utils/toast';

const brsStore = useBrsStore();

const ACCEPT = '.pdf,.docx,.md,.markdown,.txt';
const pasteText = ref('');

const brsOptions = computed(() =>
  brsStore.brsList.map((b) => ({ label: b.name, value: b.id })),
);
const sprintOptions = computed(() =>
  brsStore.sprintNames.map((name) => ({ value: name })),
);
const statusOptions = computed(() => [
  { label: $t('autest.brs.notStarted'), value: REQ_STATUS.NOT_STARTED },
  { label: $t('autest.brs.inProgress'), value: REQ_STATUS.IN_PROGRESS },
  { label: $t('autest.brs.done'), value: REQ_STATUS.DONE },
]);

const renderedDoc = computed(() => {
  const doc = brsStore.document;
  if (!doc) return '';
  if (doc.kind === 'markdown') {
    return DOMPurify.sanitize(marked.parse(doc.data) as string);
  }
  if (doc.kind === 'html') return DOMPurify.sanitize(doc.data);
  return '';
});

const columns = [
  { title: $t('autest.brs.requirement'), key: 'text' },
  { title: $t('autest.brs.sprint'), key: 'sprint', width: 200 },
  { title: $t('autest.brs.reqStatus'), key: 'status', width: 170 },
  { title: 'Completed', key: 'completedDate', width: 130 },
  { title: '', key: 'actions', width: 60 },
];

function itemRowKey(record: RequirementItem) {
  return record.id;
}

async function onAddBrs(file: File) {
  try {
    const doc = await readBrsFile(file);
    brsStore.addBrs(doc);
    const added = brsStore.autoAddItems(extractRequirements(doc.text));
    toast.success(
      added
        ? `Added ${doc.name} — auto-listed ${added} requirements`
        : `Added ${doc.name}`,
    );
  } catch (error) {
    toast.error((error as Error).message);
  }
  return false;
}

async function onReattach(file: File) {
  try {
    const doc = await readBrsFile(file);
    brsStore.setDocument(doc);
    brsStore.autoAddItems(extractRequirements(doc.text));
    toast.success(`Loaded ${doc.name}`);
  } catch (error) {
    toast.error((error as Error).message);
  }
  return false;
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

function changeBrs(value: unknown) {
  brsStore.selectBrs(String(value));
}

function changeText(id: string, value: unknown) {
  brsStore.updateItem(id, { text: (value as string) ?? '' });
}

function changeStatus(id: string, value: unknown) {
  brsStore.updateItem(id, { status: value as RequirementItem['status'] });
}

function changeSprintDue(name: string, value: unknown) {
  brsStore.setSprintDueDate(name, (value as string) ?? '');
}

function onSprintChange(id: string, value: unknown) {
  const sprint = (value as string) ?? '';
  brsStore.ensureSprint(sprint);
  brsStore.updateItem(id, { sprint });
}
</script>

<template>
  <Page :title="$t('autest.brs.title')">
    <Card class="mb-4">
      <!-- No BRS yet -->
      <Upload
        v-if="brsStore.brsList.length === 0"
        :before-upload="onAddBrs"
        :show-upload-list="false"
        :accept="ACCEPT"
      >
        <Button type="primary">
          {{ $t('autest.brs.upload') }} (PDF / DOCX / MD / TXT)
        </Button>
      </Upload>

      <!-- One or more BRS -->
      <template v-else>
        <div class="brs-controls">
          <Select
            :value="brsStore.currentBrs?.id"
            :options="brsOptions"
            class="brs-select"
            @change="changeBrs"
          />
          <Upload
            :before-upload="onAddBrs"
            :show-upload-list="false"
            :accept="ACCEPT"
          >
            <Button>+ Add another BRS</Button>
          </Upload>
          <Popconfirm title="Remove this BRS?" @confirm="removeCurrent">
            <Button danger>{{ $t('autest.general.remove') }}</Button>
          </Popconfirm>
          <div class="spacer"></div>
          <Tag color="blue">{{ brsStore.brsList.length }} BRS</Tag>
        </div>
        <Progress
          v-if="brsStore.progress.total"
          :percent="brsStore.progress.pct"
          size="small"
          class="mt-3"
        />
        <div class="muted mt-1 text-xs">
          {{ brsStore.progress.done }}/{{ brsStore.progress.total }}
          requirements done
        </div>
      </template>
    </Card>

    <div v-if="brsStore.currentBrs" class="brs-grid">
      <!-- Viewer -->
      <Card :title="`${$t('autest.brs.viewer')} — ${brsStore.currentBrs.name}`">
        <div v-if="!brsStore.document" class="reupload">
          <Empty description="Document not loaded this session.">
            <p class="muted mb-2 text-xs">
              Requirements are saved — re-upload the file to view it.
            </p>
            <Upload
              :before-upload="onReattach"
              :show-upload-list="false"
              :accept="ACCEPT"
            >
              <Button>Re-upload to view</Button>
            </Upload>
          </Empty>
        </div>

        <iframe
          v-else-if="brsStore.document.kind === 'pdf'"
          :src="brsStore.document.data"
          class="pdf-frame"
        ></iframe>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else-if="renderedDoc" class="brs-doc" v-html="renderedDoc"></div>
        <pre v-else class="brs-text">{{ brsStore.document.data }}</pre>

        <div v-if="brsStore.document?.kind === 'pdf'" class="mt-3">
          <Textarea
            v-model:value="pasteText"
            placeholder="Paste BRS text to auto-list requirements"
            :rows="4"
          />
          <Button class="mt-2" @click="autoFromPaste">
            Auto-list from text
          </Button>
        </div>
      </Card>

      <!-- Sprints + tracker -->
      <div>
        <Card title="Sprints & due dates" class="mb-4">
          <div v-if="brsStore.sprints.length === 0" class="muted text-sm">
            Assign a sprint to a requirement below to create one.
          </div>
          <div v-for="s in brsStore.sprints" :key="s.name" class="sprint-row">
            <Tag color="blue">{{ s.name }}</Tag>
            <Input
              type="date"
              :value="s.dueDate"
              class="sprint-date"
              @update:value="(v) => changeSprintDue(s.name, v)"
            />
          </div>
        </Card>

        <Card>
          <template #title>
            {{ $t('autest.brs.tracker') }}
          </template>
          <template #extra>
            <Button type="primary" size="small" @click="brsStore.addItem()">
              {{ $t('autest.brs.addItem') }}
            </Button>
          </template>

          <Table
            :columns="columns"
            :data-source="brsStore.items"
            :row-key="itemRowKey"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'text'">
                <Input
                  :value="record.text"
                  :bordered="false"
                  @update:value="(v) => changeText(record.id, v)"
                />
              </template>
              <template v-else-if="column.key === 'sprint'">
                <AutoComplete
                  :value="record.sprint"
                  :options="sprintOptions"
                  placeholder="Sprint"
                  class="w-full"
                  @change="(v) => onSprintChange(record.id, v)"
                />
              </template>
              <template v-else-if="column.key === 'status'">
                <Select
                  :value="record.status"
                  :options="statusOptions"
                  class="w-full"
                  @change="(v) => changeStatus(record.id, v)"
                />
              </template>
              <template v-else-if="column.key === 'completedDate'">
                <span v-if="record.completedDate" class="done-date">
                  {{ record.completedDate }}
                </span>
                <span v-else class="muted">-</span>
              </template>
              <template v-else-if="column.key === 'actions'">
                <Button
                  danger
                  type="text"
                  size="small"
                  @click="brsStore.removeItem(record.id)"
                >
                  ✕
                </Button>
              </template>
            </template>
          </Table>
        </Card>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.mb-2 {
  margin-bottom: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-1 {
  margin-top: 4px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.text-xs {
  font-size: 12px;
}
.text-sm {
  font-size: 13px;
}
.muted {
  color: hsl(var(--foreground) / 0.6);
}
.w-full {
  width: 100%;
}
.spacer {
  flex: 1 1 auto;
}
.brs-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.brs-select {
  min-width: 240px;
}
.brs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
.pdf-frame {
  width: 100%;
  height: 520px;
  border: 0;
}
.brs-doc {
  max-height: 520px;
  overflow: auto;
  line-height: 1.6;
}
.brs-doc :deep(table) {
  border-collapse: collapse;
}
.brs-doc :deep(td),
.brs-doc :deep(th) {
  border: 1px solid hsl(var(--border));
  padding: 4px 8px;
}
.brs-text {
  max-height: 520px;
  overflow: auto;
  white-space: pre-wrap;
}
.sprint-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.sprint-date {
  max-width: 200px;
}
.done-date {
  color: hsl(var(--primary));
  font-family: monospace;
}
@media (max-width: 960px) {
  .brs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
