<script setup>
import { useFolderStore } from '@/store/folders';
import { useToastStore } from '@/store/toast';
import { useFileSystemSupport } from '@/composables/useFileSystemSupport';
import { pickDirectory } from '@/utils/fileSystem';
import { PORTALS } from '@/utils/constants';

const folderStore = useFolderStore();
const toast = useToastStore();
const { supported } = useFileSystemSupport();

const portals = [
  { value: PORTALS.EXTERNAL, label: 'general.external', icon: 'mdi-web' },
  { value: PORTALS.INTERNAL, label: 'general.internal', icon: 'mdi-shield-lock-outline' },
];

async function connect(portal) {
  try {
    const handle = await pickDirectory();
    folderStore.setHandle(portal, handle);
    toast.success(`${handle.name} ${$t('folders.connected').toLowerCase()}`);
  } catch (err) {
    if (err?.name !== 'AbortError') toast.error(err.message);
  }
}
</script>

<template>
  <div>
    <PageHeader :title="$t('folders.title')" icon="mdi-folder-cog-outline" />

    <v-alert v-if="!supported" type="warning" variant="tonal" class="mb-4" border="start">
      {{ $t('folders.unsupported') }}
    </v-alert>

    <v-alert type="info" variant="tonal" class="mb-4" border="start" icon="mdi-information-outline">
      {{ $t('folders.info') }}
    </v-alert>

    <v-row>
      <v-col v-for="p in portals" :key="p.value" cols="12" md="6">
        <v-card rounded="lg" border flat>
          <v-card-text>
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="primary" variant="tonal" rounded="lg">
                <v-icon :icon="p.icon" />
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">{{ $t(p.label) }}</div>
                <v-chip
                  size="x-small"
                  :color="folderStore.isConnected(p.value) ? 'success' : 'grey'"
                  variant="tonal"
                >
                  {{
                    folderStore.isConnected(p.value)
                      ? $t('folders.connected')
                      : $t('folders.notConnected')
                  }}
                </v-chip>
              </div>
            </div>

            <div v-if="folderStore.names[p.value]" class="mono text-medium-emphasis mb-3">
              <v-icon icon="mdi-folder-outline" size="small" /> {{ folderStore.names[p.value] }}
            </div>

            <v-btn
              :disabled="!supported"
              variant="flat"
              color="primary"
              :prepend-icon="
                folderStore.isConnected(p.value) ? 'mdi-refresh' : 'mdi-folder-plus-outline'
              "
              @click="connect(p.value)"
            >
              {{
                folderStore.isConnected(p.value) ? $t('folders.reconnect') : $t('folders.connect')
              }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
