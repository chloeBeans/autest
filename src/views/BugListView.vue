<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useBugStore } from '@/store/bugs';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import GenerateTestDialog from '@/components/dialog/GenerateTestDialog.vue';
import ImportBugsDialog from '@/components/dialog/ImportBugsDialog.vue';
import AddBugDialog from '@/components/dialog/AddBugDialog.vue';
import { BUG_STATUS, CONFIDENCE } from '@/utils/constants';

const bugStore = useBugStore();
const auth = useAuthStore();
const toast = useToastStore();
const { counts, envCounts } = storeToRefs(bugStore);

const portalTab = ref('all');
const envTab = ref('all');
const search = ref('');

const genDialog = ref(false);
const importDialog = ref(false);
const addDialog = ref(false);
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
  { key: 'id', title: $t('bugs.id'), minWidth: '100px' },
  {
    key: 'portal',
    title: $t('bugs.portal'),
    minWidth: '100px',
    badge: true,
    badgeEval: val => (val === 'external' ? 'blue' : 'purple'),
    formatter: val => (val === 'external' ? $t('general.external') : $t('general.internal')),
  },
  {
    key: 'env',
    title: 'Env',
    minWidth: '70px',
    badge: true,
    badgeEval: () => 'grey',
    formatter: val => String(val).toUpperCase(),
  },
  { key: 'description', title: $t('bugs.description'), minWidth: '300px' },
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
    minWidth: '100px',
    badge: true,
    badgeEval: val =>
      val === CONFIDENCE.HIGH ? 'green' : val === CONFIDENCE.LOW ? 'yellow' : 'grey',
    formatter: val => (val === CONFIDENCE.UNKNOWN ? '-' : val),
  },
  { key: 'pickedUpBy', title: $t('bugs.pickedUpBy'), minWidth: '120px' },
  { key: 'note', title: $t('bugs.notes'), minWidth: '180px' },
]);

function openGenerate(bug) {
  activeBug.value = bug;
  genDialog.value = true;
}

function pickUp(bug) {
  bugStore.pickUp(bug.key, auth.username);
  toast.success(`${bug.id} picked up by ${auth.username}`);
}
</script>

<template>
  <div>
    <PageHeader :title="$t('bugs.title')" :subtitle="bugStore.sourceName" icon="mdi-bug-outline">
      <template #actions>
        <FormButton
          variant="line-secondary"
          prependIcon="mdi-upload-outline"
          @click="importDialog = true"
        >
          {{ $t('nav.import') }}
        </FormButton>
        <FormButton prependIcon="mdi-plus" @click="addDialog = true">
          {{ $t('bugs.addBug') }}
        </FormButton>
      </template>
    </PageHeader>

    <Card v-if="!counts.all">
      <div class="text-center py-8 text-medium-emphasis">
        <v-icon icon="mdi-bug-outline" size="48" class="mb-2" />
        <div>{{ $t('bugs.empty') }}</div>
        <div class="d-flex justify-center ga-2 mt-4">
          <FormButton prependIcon="mdi-upload-outline" @click="importDialog = true">
            {{ $t('nav.import') }}
          </FormButton>
          <FormButton variant="line-primary" prependIcon="mdi-plus" @click="addDialog = true">
            {{ $t('bugs.addBug') }}
          </FormButton>
        </div>
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
          <div class="text-truncate" style="max-width: 340px" :title="value">{{ value }}</div>
        </template>
        <template #cell-pickedUpBy="{ value }">
          <Badge v-if="value" variant="blue">{{ value }}</Badge>
          <span v-else class="text-medium-emphasis">-</span>
        </template>
        <template #cell-note="{ value }">
          <span v-if="value" class="text-warning text-caption">{{ value }}</span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>
        <template #actions="{ row }">
          <div class="d-flex ga-1 justify-end">
            <FormButton
              v-if="!row.pickedUpBy"
              size="md"
              variant="line-secondary"
              prependIcon="mdi-hand-back-right-outline"
              @click="pickUp(row)"
            >
              {{ $t('bugs.pickUp') }}
            </FormButton>
            <FormButton
              size="md"
              variant="line-primary"
              prependIcon="mdi-flask-outline"
              @click="openGenerate(row)"
            >
              {{ $t('bugs.generateTest') }}
            </FormButton>
          </div>
        </template>
      </DataTable>
    </Card>

    <GenerateTestDialog v-model="genDialog" :bug="activeBug" />
    <ImportBugsDialog v-model="importDialog" />
    <AddBugDialog v-model="addDialog" />
  </div>
</template>
