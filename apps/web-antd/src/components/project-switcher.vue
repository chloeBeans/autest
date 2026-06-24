<script lang="ts" setup>
import { computed } from 'vue';

import { Select, Tooltip } from 'ant-design-vue';

import { $t } from '#/locales';
import { useProjectStore } from '#/store/projects';

/**
 * Header widget — switch the active project. Every Autest feature (bugs, tests,
 * BRS, folders) is scoped to `projectStore.currentProjectId`, so this is the
 * global context selector. Shows only the projects the user belongs to (admins
 * see all). Hidden when the user belongs to no project.
 */
const projectStore = useProjectStore();

const options = computed(() =>
  projectStore.myProjects.map((p) => ({ label: p.name, value: p.id })),
);

function onChange(value: unknown) {
  if (typeof value === 'string') projectStore.selectProject(value);
}
</script>

<template>
  <Tooltip v-if="options.length > 0" :title="$t('autest.settings.project')">
    <Select
      :value="projectStore.currentProjectId ?? undefined"
      :options="options"
      :bordered="false"
      option-filter-prop="label"
      class="project-switcher"
      @change="onChange"
    />
  </Tooltip>
</template>

<style scoped>
.project-switcher {
  min-width: 150px;
  font-weight: 600;
}
</style>
