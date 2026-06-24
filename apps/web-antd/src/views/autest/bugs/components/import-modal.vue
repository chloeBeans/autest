<script lang="ts" setup>
import type { Bug, ColumnMapping, ParsedSheet } from '#/types/domain';

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
import {
  detectColumn,
  parseSpreadsheet,
  rowsToBugs,
} from '#/utils/spreadsheet';
import { toast } from '#/utils/toast';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const visible = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const bugStore = useBugStore();
const sheets = ref<ParsedSheet[]>([]);
const fileName = ref('');
const mapping = reactive<ColumnMapping>({
  idCol: '',
  descCol: '',
  portalCol: '',
  envCol: '',
  useSheetNameAsPortal: false,
});

const allColumns = computed(() => {
  const set = new Set<string>();
  sheets.value.forEach((s) => s.columns.forEach((c) => set.add(c)));
  return [...set].map((c) => ({ label: c, value: c }));
});

const previewBugs = computed<Bug[]>(() => {
  if (!mapping.descCol) return [];
  return rowsToBugs(sheets.value, mapping).slice(0, 6);
});

const previewColumns = [
  { title: $t('autest.bugs.id'), dataIndex: 'id', key: 'id' },
  { title: $t('autest.bugs.portal'), dataIndex: 'portal', key: 'portal' },
  { title: 'Env', dataIndex: 'env', key: 'env' },
  {
    title: $t('autest.bugs.description'),
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
];

function previewKey(record: Bug) {
  return record.id;
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
    mapping.idCol = detectColumn(cols, 'id') ?? '';
    mapping.descCol = detectColumn(cols, 'description') ?? '';
    mapping.portalCol = detectColumn(cols, 'portal') ?? '';
    mapping.envCol = detectColumn(cols, 'env') ?? '';
    mapping.useSheetNameAsPortal = !mapping.portalCol && parsed.length > 1;
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
      <Form layout="vertical">
        <div class="grid">
          <FormItem :label="$t('autest.import.idColumn')">
            <Select
              v-model:value="mapping.idCol"
              :options="allColumns"
              allow-clear
            />
          </FormItem>
          <FormItem :label="$t('autest.import.descriptionColumn')">
            <Select v-model:value="mapping.descCol" :options="allColumns" />
          </FormItem>
          <FormItem :label="$t('autest.import.portalColumn')">
            <Select
              v-model:value="mapping.portalCol"
              :options="allColumns"
              :disabled="mapping.useSheetNameAsPortal"
              allow-clear
            />
          </FormItem>
          <FormItem label="Environment column">
            <Select
              v-model:value="mapping.envCol"
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
        size="small"
        class="mt-2"
      >
        <template #bodyCell="{ column, record }">
          <Tag v-if="column.key === 'portal'">{{ record.portal }}</Tag>
          <Tag v-else-if="column.key === 'env'">
            {{ String(record.env).toUpperCase() }}
          </Tag>
        </template>
      </Table>

      <div class="actions">
        <Button @click="visible = false">
          {{ $t('autest.general.cancel') }}
        </Button>
        <Button type="primary" :disabled="!mapping.descCol" @click="load">
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
