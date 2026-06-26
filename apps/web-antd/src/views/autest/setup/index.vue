<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { Alert, Button, Card } from 'ant-design-vue';

import { $t } from '#/locales';
import { useFolderStore } from '#/store/folders';
import { useProjectStore } from '#/store/projects';
import { PORTALS } from '#/utils/constants';
import { isFileSystemAccessSupported, pickDirectory } from '#/utils/fileSystem';
import { toast } from '#/utils/toast';

const projectStore = useProjectStore();
const folderStore = useFolderStore();

const supported = isFileSystemAccessSupported();

const portals = [
  { value: PORTALS.EXTERNAL, label: $t('autest.general.external') },
  { value: PORTALS.INTERNAL, label: $t('autest.general.internal') },
];

async function connect(portal: string) {
  try {
    const handle = await pickDirectory();
    folderStore.setHandle(portal, handle);
    toast.success(
      `${handle.name} ${$t('autest.folders.connected').toLowerCase()}`,
    );
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      toast.error((error as Error).message);
    }
  }
}

function folderPath(portal: string) {
  return folderStore.isConnected(portal)
    ? `${folderStore.names[portal]}/tests/`
    : $t('autest.folders.notConnected');
}
</script>

<template>
  <Page :title="$t('autest.settings.title')">
    <!-- Portal folders -->
    <Card
      :title="`${$t('autest.folders.title')}${projectStore.currentProject ? ` — ${projectStore.currentProject.name}` : ''}`"
      class="mb-4"
    >
      <Alert
        v-if="!supported"
        type="warning"
        :message="$t('autest.folders.unsupported')"
        show-icon
        class="mb-3"
      />
      <p class="muted mb-3">{{ $t('autest.folders.info') }}</p>

      <div class="folder-grid">
        <div v-for="p in portals" :key="p.value" class="folder-row">
          <div>
            <div class="folder-name">{{ p.label }}</div>
            <div
              class="folder-path"
              :class="{ connected: folderStore.isConnected(p.value) }"
            >
              {{ folderPath(p.value) }}
            </div>
          </div>
          <Button :disabled="!supported" @click="connect(p.value)">
            {{
              folderStore.isConnected(p.value)
                ? $t('autest.folders.reconnect')
                : $t('autest.folders.connect')
            }}
          </Button>
        </div>
      </div>
      <p class="muted mt-2 text-xs">
        Browsers expose only the folder name, not the full disk path; specs are
        written to &lt;folder&gt;/tests/.
      </p>
    </Card>
  </Page>
</template>

<style scoped>
.mb-3 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.text-xs {
  font-size: 12px;
}
.muted {
  color: hsl(var(--foreground) / 0.6);
}
.folder-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.folder-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}
.folder-name {
  font-weight: 600;
}
.folder-path {
  font-family: monospace;
  font-size: 12px;
  color: hsl(var(--foreground) / 0.6);
}
.folder-path.connected {
  color: hsl(var(--primary));
}
@media (max-width: 768px) {
  .folder-grid {
    grid-template-columns: 1fr;
  }
}
</style>
