<script lang="ts" setup>
import type { TableColumnsType } from 'ant-design-vue';

import type { BugRecord } from '#/types/domain';

import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, Input, Segmented, Space, Table, Tag } from 'ant-design-vue';

import { $t } from '#/locales';
import { useBugStore } from '#/store/bugs';
import { useFolderStore } from '#/store/folders';
import { BUG_STATUS, CONFIDENCE } from '#/utils/constants';
import { downloadTextFile, writeFile } from '#/utils/fileSystem';
import { buildTestFromBug } from '#/utils/playwright';
import { toast } from '#/utils/toast';

import AddBugModal from './components/add-bug-modal.vue';
import ImportModal from './components/import-modal.vue';

const bugStore = useBugStore();
const folderStore = useFolderStore();
const userStore = useUserStore();

const portalTab = ref('all');
const envTab = ref('all');
const search = ref('');
const addOpen = ref(false);
const importOpen = ref(false);

const portalOptions = computed(() => [
  {
    label: `${$t('autest.general.all')} (${bugStore.counts.all})`,
    value: 'all',
  },
  {
    label: `${$t('autest.general.external')} (${bugStore.counts.external})`,
    value: 'external',
  },
  {
    label: `${$t('autest.general.internal')} (${bugStore.counts.internal})`,
    value: 'internal',
  },
]);
const envOptions = computed(() => [
  { label: `All (${bugStore.envCounts.all})`, value: 'all' },
  { label: `DEV (${bugStore.envCounts.dev})`, value: 'dev' },
  { label: `SIT (${bugStore.envCounts.sit})`, value: 'sit' },
  { label: `UAT (${bugStore.envCounts.uat})`, value: 'uat' },
]);

const rows = computed(() => {
  const list = bugStore.filtered(portalTab.value, envTab.value);
  const q = search.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (b) =>
      b.id.toLowerCase().includes(q) || b.description.toLowerCase().includes(q),
  );
});

const columns: TableColumnsType = [
  { title: $t('autest.bugs.id'), dataIndex: 'id', key: 'id', width: 110 },
  {
    title: $t('autest.bugs.portal'),
    dataIndex: 'portal',
    key: 'portal',
    width: 110,
  },
  { title: 'Env', dataIndex: 'env', key: 'env', width: 80 },
  {
    title: $t('autest.bugs.description'),
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: $t('autest.bugs.status'),
    dataIndex: 'status',
    key: 'status',
    width: 130,
  },
  {
    title: $t('autest.bugs.confidence'),
    dataIndex: 'confidence',
    key: 'confidence',
    width: 120,
  },
  {
    title: $t('autest.bugs.pickedUpBy'),
    dataIndex: 'pickedUpBy',
    key: 'pickedUpBy',
    width: 140,
  },
  {
    title: $t('autest.bugs.actions'),
    key: 'actions',
    width: 210,
    fixed: 'right',
  },
];

const statusColor: Record<string, string> = {
  [BUG_STATUS.NEW]: 'default',
  [BUG_STATUS.ANALYZED]: 'blue',
  [BUG_STATUS.GENERATED]: 'gold',
  [BUG_STATUS.COMMITTED]: 'green',
  [BUG_STATUS.NEEDS_REVIEW]: 'red',
};

function rowKey(record: BugRecord) {
  return record.key;
}

function pickUp(record: BugRecord) {
  bugStore.pickUp(record.key, userStore.userInfo?.username ?? '');
  toast.success(`${record.id} picked up`);
}

async function generate(record: BugRecord) {
  const spec = buildTestFromBug(record);
  const handle = folderStore.handleFor(record.portal);
  try {
    if (handle) {
      await writeFile(handle, 'tests', spec.fileName, spec.content);
      bugStore.updateBug(record.key, {
        status: BUG_STATUS.GENERATED,
        generatedFile: spec.fileName,
      });
      toast.success(`Saved ${spec.fileName}`);
    } else {
      downloadTextFile(spec.fileName, spec.content);
      toast.info('No folder connected — downloaded the spec.');
    }
  } catch (error) {
    toast.error((error as Error).message);
  }
}
</script>

<template>
  <Page :title="$t('autest.bugs.title')" :description="bugStore.sourceName">
    <div class="toolbar">
      <Segmented v-model:value="portalTab" :options="portalOptions" />
      <Segmented v-model:value="envTab" :options="envOptions" />
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
      :scroll="{ x: 1150 }"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'portal'">
          <Tag :color="record.portal === 'external' ? 'blue' : 'purple'">
            {{ record.portal }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'env'">
          <Tag>{{ String(record.env).toUpperCase() }}</Tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <Tag :color="statusColor[record.status]">{{ record.status }}</Tag>
        </template>
        <template v-else-if="column.key === 'confidence'">
          <Tag
            v-if="record.confidence !== CONFIDENCE.UNKNOWN"
            :color="record.confidence === CONFIDENCE.HIGH ? 'green' : 'gold'"
          >
            {{ record.confidence }}
          </Tag>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'pickedUpBy'">
          <Tag v-if="record.pickedUpBy" color="blue">
            {{ record.pickedUpBy }}
          </Tag>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button
              v-if="!record.pickedUpBy"
              size="small"
              @click="pickUp(record as BugRecord)"
            >
              {{ $t('autest.bugs.pickUp') }}
            </Button>
            <Button
              size="small"
              type="primary"
              ghost
              @click="generate(record as BugRecord)"
            >
              {{ $t('autest.bugs.generateTest') }}
            </Button>
          </Space>
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
.spacer {
  flex: 1 1 auto;
}
.search {
  max-width: 260px;
}
</style>
