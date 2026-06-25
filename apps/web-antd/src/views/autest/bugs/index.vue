<script lang="ts" setup>
import type { TableColumnsType } from 'ant-design-vue';

import type { BugRecord } from '#/types/domain';
import type { Option } from '#/utils/constants';

import { computed, reactive, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input, Select, Space, Table, Tag } from 'ant-design-vue';

import { $t } from '#/locales';
import { useBugStore } from '#/store/bugs';
import { BUG_FIELDS, BUG_STATUS, DEV_STATUS } from '#/utils/constants';
import { toast } from '#/utils/toast';

import AddBugModal from './components/add-bug-modal.vue';
import ImportModal from './components/import-modal.vue';

const bugStore = useBugStore();

const portionTab = ref('all');
const envTab = ref('all');
const search = ref('');
const addOpen = ref(false);
const importOpen = ref(false);

// Select fields get a dropdown when editing; everything else is a text input.
// Options come straight off the single source of truth in BUG_FIELDS.
function fieldOptions(key: string): Option[] | undefined {
  return BUG_FIELDS.find((f) => f.key === key)?.options;
}
function isSelect(key: string) {
  return fieldOptions(key) !== undefined;
}

// Filter dropdowns are built from the Portion/ENV values present in the data.
function distinctOptions(pick: (b: BugRecord) => string) {
  const set = new Set<string>();
  bugStore.bugs.forEach((b) => {
    const v = pick(b);
    if (v) set.add(v);
  });
  return [
    { label: $t('autest.general.all'), value: 'all' },
    ...[...set].map((v) => ({ label: v, value: v })),
  ];
}
const portionOptions = computed(() => distinctOptions((b) => b.portion));
const envFilterOptions = computed(() => distinctOptions((b) => b.env));

// If the selected filter value disappears from the data, fall back to 'all'.
watch(portionOptions, (opts) => {
  if (!opts.some((o) => o.value === portionTab.value)) portionTab.value = 'all';
});
watch(envFilterOptions, (opts) => {
  if (!opts.some((o) => o.value === envTab.value)) envTab.value = 'all';
});

const rows = computed(() => {
  const list = bugStore.filtered(portionTab.value, envTab.value);
  const q = search.value.trim().toLowerCase();
  if (!q) return list;
  const has = (v: unknown) =>
    String(v ?? '')
      .toLowerCase()
      .includes(q);
  return list.filter(
    (b) => has(b.logId) || has(b.description) || has(b.no) || has(b.module),
  );
});

const columns = computed<TableColumnsType>(() => [
  ...BUG_FIELDS.map((f) => ({
    title: $t(`autest.bugs.fields.${f.key}`),
    dataIndex: f.key,
    key: f.key,
    width: f.width,
    ...(f.kind === 'textarea' ? { ellipsis: true } : {}),
  })),
  {
    title: $t('autest.bugs.actions'),
    key: 'actions',
    width: 150,
    fixed: 'right',
  },
]);

const tableScrollX = computed(
  () => BUG_FIELDS.reduce((sum, f) => sum + f.width, 0) + 150,
);

const statusColor: Record<string, string> = {
  [BUG_STATUS.OPEN]: 'red',
  [BUG_STATUS.RETEST]: 'gold',
  [BUG_STATUS.CLOSED]: 'green',
  [BUG_STATUS.REOPEN]: 'volcano',
  [BUG_STATUS.INVALID]: 'default',
};
const devStatusColor: Record<string, string> = {
  [DEV_STATUS.IN_PROGRESS]: 'blue',
  [DEV_STATUS.FIXED_IN_LOCAL_ENV]: 'gold',
  [DEV_STATUS.DEPLOYED_TO_PRE_SIT]: 'green',
};

function rowKey(record: BugRecord) {
  return record.key;
}
function val(record: BugRecord, key: string) {
  return (record as unknown as Record<string, unknown>)[key] ?? '';
}

// --- Inline row editing ---------------------------------------------------
const editingKey = ref('');
const draft = reactive<Record<string, string>>({});

function isEditing(record: BugRecord) {
  return editingKey.value === record.key;
}
function startEdit(record: BugRecord) {
  editingKey.value = record.key;
  BUG_FIELDS.forEach((f) => {
    draft[f.key] = String(val(record, f.key));
  });
}
function cancelEdit() {
  editingKey.value = '';
}
function saveEdit(record: BugRecord) {
  if (!String(draft.description ?? '').trim()) {
    toast.error('Issue description is required');
    return;
  }
  const patch: Record<string, string> = {};
  BUG_FIELDS.forEach((f) => {
    patch[f.key] = String(draft[f.key] ?? '').trim();
  });
  bugStore.updateBug(record.key, patch);
  editingKey.value = '';
  toast.success(`${patch.logId || record.logId} updated`);
}
</script>

<template>
  <Page :title="$t('autest.bugs.title')" :description="bugStore.sourceName">
    <div class="toolbar">
      <span class="filter-label">{{ $t('autest.bugs.fields.portion') }}</span>
      <Select
        v-model:value="portionTab"
        :options="portionOptions"
        class="filter"
      />
      <span class="filter-label">{{ $t('autest.bugs.fields.env') }}</span>
      <Select
        v-model:value="envTab"
        :options="envFilterOptions"
        class="filter"
      />
      <Input
        v-model:value="search"
        :placeholder="$t('autest.general.search')"
        allow-clear
        class="search"
      />
      <div class="spacer"></div>
      <Space>
        <Button @click="importOpen = true">
          {{ $t('autest.nav.import') }}
        </Button>
        <Button type="primary" @click="addOpen = true">
          {{ $t('autest.bugs.addBug') }}
        </Button>
      </Space>
    </div>

    <Table
      :columns="columns"
      :data-source="rows"
      :row-key="rowKey"
      :pagination="{ pageSize: 10, showSizeChanger: true }"
      :scroll="{ x: tableScrollX }"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <Space v-if="isEditing(record as BugRecord)">
            <Button
              size="small"
              type="primary"
              @click="saveEdit(record as BugRecord)"
            >
              {{ $t('autest.general.save') }}
            </Button>
            <Button size="small" @click="cancelEdit()">
              {{ $t('autest.general.cancel') }}
            </Button>
          </Space>
          <Button v-else size="small" @click="startEdit(record as BugRecord)">
            {{ $t('autest.bugs.edit') }}
          </Button>
        </template>

        <template v-else-if="isEditing(record as BugRecord)">
          <Select
            v-if="isSelect(String(column.key))"
            v-model:value="draft[String(column.key)]"
            :options="fieldOptions(String(column.key))"
            size="small"
            allow-clear
            class="cell-edit"
          />
          <Input
            v-else
            v-model:value="draft[String(column.key)]"
            size="small"
          />
        </template>

        <template v-else-if="column.key === 'status'">
          <Tag
            v-if="record.status"
            :color="statusColor[record.status] ?? 'default'"
          >
            {{ record.status }}
          </Tag>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'devStatus'">
          <Tag
            v-if="record.devStatus"
            :color="devStatusColor[record.devStatus] ?? 'default'"
          >
            {{ record.devStatus }}
          </Tag>
          <span v-else>-</span>
        </template>
        <template v-else>
          {{ val(record as BugRecord, String(column.key)) }}
        </template>
      </template>
    </Table>

    <AddBugModal v-model:open="addOpen" />
    <ImportModal v-model:open="importOpen" />
  </Page>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}
.filter-label {
  font-weight: 600;
  color: hsl(var(--foreground) / 0.7);
}
.filter {
  min-width: 140px;
}
.spacer {
  flex: 1 1 auto;
}
.search {
  max-width: 260px;
}
.cell-edit {
  width: 100%;
}
</style>
