<script setup>
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBugStore } from '@/store/bugs';
import { useBrsStore } from '@/store/brs';
import { useFolderStore } from '@/store/folders';
import { PORTALS } from '@/utils/constants';

const router = useRouter();
const bugStore = useBugStore();
const brsStore = useBrsStore();
const folderStore = useFolderStore();
const { counts } = storeToRefs(bugStore);

const steps = [
  { key: 'step1', icon: 'mdi-upload-outline', to: '/import' },
  { key: 'step2', icon: 'mdi-folder-cog-outline', to: '/folders' },
  { key: 'step3', icon: 'mdi-flask-outline', to: '/bugs' },
  { key: 'step4', icon: 'mdi-file-document-outline', to: '/brs' },
];

const stats = () => [
  { label: $t('general.all'), value: counts.value.all, color: 'primary' },
  { label: $t('general.external'), value: counts.value.external, color: 'info' },
  { label: $t('general.internal'), value: counts.value.internal, color: 'secondary' },
  {
    label: 'BRS done',
    value: `${brsStore.progress.done}/${brsStore.progress.total}`,
    color: 'success',
  },
];

const folderState = portal =>
  folderStore.isConnected(portal) ? $t('folders.connected') : $t('folders.notConnected');
</script>

<template>
  <div>
    <PageHeader
      :title="$t('nav.dashboard')"
      :subtitle="$t('app.tagline')"
      icon="mdi-view-dashboard-outline"
    />

    <v-row>
      <v-col v-for="s in stats()" :key="s.label" cols="6" md="3">
        <v-card rounded="lg" border flat>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">{{ s.label }}</div>
            <div class="text-h4 font-weight-bold" :class="`text-${s.color}`">{{ s.value }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="7">
        <v-card rounded="lg" border flat>
          <v-card-title class="text-subtitle-1 font-weight-bold">
            {{ $t('dashboard.gettingStarted') }}
          </v-card-title>
          <v-list lines="one">
            <v-list-item
              v-for="(step, i) in steps"
              :key="step.key"
              :prepend-icon="step.icon"
              :title="$t(`dashboard.${step.key}`)"
              class="cursor-pointer"
              @click="router.push(step.to)"
            >
              <template #prepend>
                <v-avatar size="28" color="primary" variant="tonal" class="mr-3">
                  {{ i + 1 }}
                </v-avatar>
              </template>
              <template #append>
                <v-icon icon="mdi-chevron-right" size="small" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="lg" border flat>
          <v-card-title class="text-subtitle-1 font-weight-bold">
            {{ $t('folders.title') }}
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <span
                ><v-icon icon="mdi-web" size="small" class="mr-1" />{{
                  $t('general.external')
                }}</span
              >
              <v-chip
                size="small"
                :color="folderStore.isConnected(PORTALS.EXTERNAL) ? 'success' : 'grey'"
              >
                {{ folderState(PORTALS.EXTERNAL) }}
              </v-chip>
            </div>
            <div class="d-flex align-center justify-space-between">
              <span
                ><v-icon icon="mdi-shield-lock-outline" size="small" class="mr-1" />{{
                  $t('general.internal')
                }}</span
              >
              <v-chip
                size="small"
                :color="folderStore.isConnected(PORTALS.INTERNAL) ? 'success' : 'grey'"
              >
                {{ folderState(PORTALS.INTERNAL) }}
              </v-chip>
            </div>
            <v-btn
              class="mt-4"
              variant="tonal"
              block
              to="/folders"
              prepend-icon="mdi-folder-cog-outline"
            >
              {{ $t('folders.title') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
