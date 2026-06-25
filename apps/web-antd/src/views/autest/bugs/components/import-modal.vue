<script lang="ts" setup>
import type { ColumnMapping, ParsedSheet } from '#/types/domain';

import { computed, reactive, ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Modal,
  Select,
  Table,
  Tag,
  Upload,
} from 'ant-design-vue';

import { $t } from '#/locales';
import { useBugStore } from '#/store/bugs';
import { autoMap, parseSpreadsheet, rowsToBugs } from '#/utils/spreadsheet';
import { toast } from '#/utils/toast';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const visible = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

// The columns surfaced for manual override; every other column is auto-mapped
// by header name behind the scenes.
const PRIMARY_FIELDS = [
  'logId',
  'description',
  'status',
  'devStatus',
  'portion',
  'env',
  'module',
];

const bugStore = useBugStore();
const sheets = ref<ParsedSheet[]>([]);
const fileName = ref('');
const mapping = reactive<ColumnMapping>({});

const allColumns = computed(() => {
  const set = new Set<string>();
  sheets.value.forEach((s) => s.columns.forEach((c) => set.add(c)));
  return [...set].map((c) => ({ label: c, value: c }));
});

const previewBugs = computed(() =>
  mapping.description
    ? rowsToBugs(sheets.value, mapping)
        .slice(0, 6)
        .map((b, i) => ({ ...b, _key: i }))
    : [],
);

const previewColumns = computed(() =>
  ['logId', 'portion', 'env', 'description', 'status'].map((key) => ({
    title: $t(`autest.bugs.fields.${key}`),
    dataIndex: key,
    key,
    ellipsis: key === 'description',
  })),
);

function previewKey(record: { _key: number }) {
  return record._key;
}

async function beforeUpload(file: File) {
  try {
    const parsed = await parseSpreadsheet(file);
    if (parsed.length === 0) {
      toast.error($t('autest.import.noData'));
      return false;
    }
    sheets.value = parsed;
    fileName.value = file.name;
    const cols = parsed.flatMap((s) => s.columns);
    // Replace the mapping in place so the reactive object stays the same ref.
    Object.keys(mapping).forEach((k) => delete mapping[k]);
    Object.assign(mapping, autoMap(cols));
  } catch (error) {
    toast.error((error as Error).message);
  }
  return false; // never auto-upload
}

function load() {
  const bugs = rowsToBugs(sheets.value, mapping);
  if (bugs.length === 0) {
    toast.error($t('autest.import.noData'));
    return;
  }
  bugStore.setBugs(bugs, fileName.value);
  toast.success($t('autest.import.loaded', { count: bugs.length }));
  sheets.value = [];
  fileName.value = '';
  visible.value = false;
}
</script>

<template>
  <Modal
    v-model:open="visible"
    :title="$t('autest.import.title')"
    :footer="null"
    width="760px"
  >
    <Upload
      :before-upload="beforeUpload"
      :show-upload-list="false"
      accept=".csv,.xlsx,.xls"
    >
      <Button>{{ $t('autest.import.drop') }}</Button>
    </Upload>

    <template v-if="sheets.length > 0">
      <div class="muted mb-1 mt-3">{{ $t('autest.import.mapping') }}</div>
      <div class="hint">{{ $t('autest.import.primaryHint') }}</div>
      <Form layout="vertical">
        <div class="grid">
          <FormItem
            v-for="key in PRIMARY_FIELDS"
            :key="key"
            :label="$t(`autest.bugs.fields.${key}`)"
          >
            <Select
              v-model:value="mapping[key]"
              :options="allColumns"
              allow-clear
            />
          </FormItem>
        </div>
      </Form>

      <Table
        v-if="previewBugs.length > 0"
        :columns="previewColumns"
        :data-source="previewBugs"
        :row-key="previewKey"
        :pagination="false"
        :scroll="{ x: 720 }"
        size="small"
        class="mt-2"
      >
        <template #bodyCell="{ column, record }">
          <Tag v-if="column.key === 'status' && record.status">
            {{ record.status }}
          </Tag>
        </template>
      </Table>

      <div class="actions">
        <Button @click="visible = false">
          {{ $t('autest.general.cancel') }}
        </Button>
        <Button type="primary" :disabled="!mapping.description" @click="load">
          {{ $t('autest.import.load') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}
.muted {
  color: hsl(var(--foreground) / 0.6);
  font-weight: 600;
}
.hint {
  color: hsl(var(--foreground) / 0.5);
  font-size: 12px;
  margin-bottom: 8px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.mb-1 {
  margin-bottom: 4px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
