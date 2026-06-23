<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useBugStore } from '@/store/bugs';
import GenerateTestDialog from '@/components/dialog/GenerateTestDialog.vue';
import { BUG_STATUS, CONFIDENCE } from '@/utils/constants';

const bugStore = useBugStore();
const { counts, envCounts } = storeToRefs(bugStore);

const portalTab = ref('all');
const envTab = ref('all');
const search = ref('');

const dialog = ref(false);
const activeBug = ref(null);

const portalTabs = computed(() => [
  { label: $t('general.all'), value: 'all', badge: counts.value.all },
  {
    label: $t('general.external'),
    value: 'external',
    badge: counts.value.external,
    icon: 'mdi-web',
  },
  {
    label: $t('general.internal'),
    value: 'internal',
    badge: counts.value.internal,
    icon: 'mdi-shield-lock-outline',
  },
]);

const envTabs = computed(() => [
  { label: 'All env', value: 'all', badge: envCounts.value.all },
  { label: 'DEV', value: 'dev', badge: envCounts.value.dev },
  { label: 'SIT', value: 'sit', badge: envCounts.value.sit },
  { label: 'UAT', value: 'uat', badge: envCounts.value.uat },
]);

const rows = computed(() => {
  const list = bugStore.filtered(portalTab.value, envTab.value);
  if (!search.value) return list;
  const q = search.value.toLowerCase();
  return list.filter(
    b => b.id.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
  );
});

const statusVariant = status =>
  ({
    [BUG_STATUS.NEW]: 'grey',
    [BUG_STATUS.ANALYZED]: 'blue',
    [BUG_STATUS.GENERATED]: 'yellow',
    [BUG_STATUS.COMMITTED]: 'green',
    [BUG_STATUS.NEEDS_REVIEW]: 'red',
  })[status] || 'grey';

const statusLabel = status =>
  ({
    [BUG_STATUS.NEW]: 'New',
    [BUG_STATUS.ANALYZED]: 'Analyzed',
    [BUG_STATUS.GENERATED]: 'Generated',
    [BUG_STATUS.COMMITTED]: 'Committed',
    [BUG_STATUS.NEEDS_REVIEW]: 'Needs review',
  })[status] || status;

const columns = computed(() => [
  { key: 'id', title: $t('bugs.id'), minWidth: '110px' },
  {
    key: 'portal',
    title: $t('bugs.portal'),
    minWidth: '110px',
    badge: true,
    badgeEval: val => (val === 'external' ? 'blue' : 'purple'),
    formatter: val => (val === 'external' ? $t('general.external') : $t('general.internal')),
  },
  {
    key: 'env',
    title: 'Env',
    minWidth: '80px',
    badge: true,
    badgeEval: () => 'grey',
    formatter: val => String(val).toUpperCase(),
  },
  { key: 'description', title: $t('bugs.description'), minWidth: '320px' },
  {
    key: 'status',
    title: $t('bugs.status'),
    minWidth: '120px',
    badge: true,
    badgeEval: val => statusVariant(val),
    formatter: val => statusLabel(val),
  },
  {
    key: 'confidence',
    title: $t('bugs.confidence'),
    minWidth: '110px',
    badge: true,
    badgeEval: val =>
      val === CONFIDENCE.HIGH ? 'green' : val === CONFIDENCE.LOW ? 'yellow' : 'grey',
    formatter: val => (val === CONFIDENCE.UNKNOWN ? '-' : val),
  },
  { key: 'note', title: $t('bugs.notes'), minWidth: '200px' },
]);

function openDialog(bug) {
  activeBug.value = bug;
  dialog.value = true;
}
</script>

<template>
  <div>
    <PageHeader :title="$t('bugs.title')" :subtitle="bugStore.sourceName" icon="mdi-bug-outline">
      <template #actions>
        <FormButton
          variant="line-secondary"
          prependIcon="mdi-upload-outline"
          @click="$router.push('/import')"
        >
          {{ $t('nav.import') }}
        </FormButton>
      </template>
    </PageHeader>

    <Card v-if="!counts.all">
      <div class="text-center py-8 text-medium-emphasis">
        <v-icon icon="mdi-bug-outline" size="48" class="mb-2" />
        <div>{{ $t('bugs.empty') }}</div>
        <FormButton class="mt-4" prependIcon="mdi-upload-outline" @click="$router.push('/import')">
          {{ $t('nav.import') }}
        </FormButton>
      </div>
    </Card>

    <Card v-else>
      <Tabs v-model="portalTab" :tabs="portalTabs" :show-badges="true" />
      <Tabs v-model="envTab" :tabs="envTabs" :show-badges="true" />

      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        :label="$t('general.search')"
        density="comfortable"
        variant="outlined"
        hide-details
        clearable
        class="mb-4"
        style="max-width: 360px"
      />

      <DataTable :columns="columns" :data="rows" :empty-text="$t('bugs.empty')">
        <template #cell-description="{ value }">
          <div class="text-truncate" style="max-width: 360px" :title="value">{{ value }}</div>
        </template>
        <template #cell-note="{ value }">
          <span v-if="value" class="text-warning text-caption">{{ value }}</span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>
        <template #actions="{ row }">
          <FormButton
            size="md"
            variant="line-primary"
            prependIcon="mdi-flask-outline"
            @click="openDialog(row)"
          >
            {{ $t('bugs.generateTest') }}
          </FormButton>
        </template>
      </DataTable>
    </Card>

    <GenerateTestDialog v-model="dialog" :bug="activeBug" />
  </div>
</template>
