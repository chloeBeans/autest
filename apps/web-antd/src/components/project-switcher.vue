<script lang="ts" setup>
import { computed } from 'vue';

import { preferences } from '@vben/preferences';

import { Select, Tooltip } from 'ant-design-vue';

import { $t } from '#/locales';
import { useProjectStore } from '#/store/projects';

/**
 * Sidebar control (top-left, below the app name) — switch the active project.
 * Every Autest feature (bugs, tests, BRS, folders) is scoped to
 * `projectStore.currentProjectId`, so this is the global context selector.
 * Shows only the projects the user belongs to (admins see all). Hidden when the
 * user belongs to no project, or while the sidebar is collapsed (no room).
 */
const projectStore = useProjectStore();

const options = computed(() =>
  projectStore.myProjects.map((p) => ({ label: p.name, value: p.id })),
);

const visible = computed(
  () => options.value.length > 0 && !preferences.sidebar.collapsed,
);

function onChange(value: unknown) {
  if (typeof value === 'string') projectStore.selectProject(value);
}
</script>

<template>
  <div v-if="visible" class="project-switcher">
    <Tooltip :title="$t('autest.settings.project')" placement="right">
      <Select
        :value="projectStore.currentProjectId ?? undefined"
        :options="options"
        option-filter-prop="label"
        class="project-switcher__select"
        @change="onChange"
      />
    </Tooltip>
  </div>
</template>

<style scoped>
.project-switcher {
  padding: 4px 12px 8px;
}

.project-switcher__select {
  width: 100%;
  font-weight: 600;
}
</style>
