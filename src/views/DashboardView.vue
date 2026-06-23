<script setup>
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBugStore } from '@/store/bugs';
import { useBrsStore } from '@/store/brs';
import { useFolderStore } from '@/store/folders';
import { useAuthStore } from '@/store/auth';
import { useProjectStore } from '@/store/projects';
import { PORTALS } from '@/utils/constants';

const router = useRouter();
const bugStore = useBugStore();
const brsStore = useBrsStore();
const folderStore = useFolderStore();
const auth = useAuthStore();
const projectStore = useProjectStore();
const { counts } = storeToRefs(bugStore);
const { currentProject } = storeToRefs(projectStore);

const steps = [
  { key: 'step1', icon: 'mdi-upload-outline', to: '/bugs' },
  { key: 'step2', icon: 'mdi-cog-outline', to: '/settings' },
  { key: 'step3', icon: 'mdi-flask-outline', to: '/tests' },
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
      :title="`${$t('dashboard.hello')}, ${auth.currentUser?.name || auth.username}`"
      :subtitle="
        currentProject ? `${$t('settings.project')}: ${currentProject.name}` : $t('app.tagline')
      "
      icon="mdi-view-dashboard-outline"
    />

    <v-alert
      v-if="!currentProject"
      type="info"
      variant="tonal"
      class="mb-4"
      text="You have no project assigned yet — ask an admin to add you to a project."
    />

    <v-row>
      <v-col v-for="s in stats()" :key="s.label" cols="6" md="3">
        <Card>
          <div class="text-caption text-medium-emphasis">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="`text-${s.color}`">{{ s.value }}</div>
        </Card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" md="7">
        <Card>
          <template #header>{{ $t('dashboard.gettingStarted') }}</template>
          <v-list lines="one">
            <v-list-item
              v-for="(step, i) in steps"
              :key="step.key"
              :title="$t(`dashboard.${step.key}`)"
              class="cursor-pointer"
              @click="router.push(step.to)"
            >
              <template #prepend>
                <v-avatar size="28" color="primary" variant="tonal" class="mr-3">{{
                  i + 1
                }}</v-avatar>
              </template>
              <template #append>
                <v-icon icon="mdi-chevron-right" size="small" />
              </template>
            </v-list-item>
          </v-list>
        </Card>
      </v-col>

      <v-col cols="12" md="5">
        <Card>
          <template #header>{{ $t('folders.title') }}</template>
          <div class="d-flex align-center justify-space-between mb-2">
            <span
              ><v-icon icon="mdi-web" size="small" class="mr-1" />{{ $t('general.external') }}</span
            >
            <Badge :variant="folderStore.isConnected(PORTALS.EXTERNAL) ? 'green' : 'grey'">
              {{ folderState(PORTALS.EXTERNAL) }}
            </Badge>
          </div>
          <div class="d-flex align-center justify-space-between">
            <span
              ><v-icon icon="mdi-shield-lock-outline" size="small" class="mr-1" />{{
                $t('general.internal')
              }}</span
            >
            <Badge :variant="folderStore.isConnected(PORTALS.INTERNAL) ? 'green' : 'grey'">
              {{ folderState(PORTALS.INTERNAL) }}
            </Badge>
          </div>
          <FormButton
            class="mt-4"
            variant="line-primary"
            block
            prependIcon="mdi-cog-outline"
            @click="router.push('/settings')"
          >
            {{ $t('settings.title') }}
          </FormButton>
        </Card>
      </v-col>
    </v-row>
  </div>
</template>
