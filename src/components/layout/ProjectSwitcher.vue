<script setup>
import { storeToRefs } from 'pinia';
import { useProjectStore } from '@/store/projects';

const projectStore = useProjectStore();
const { currentProject, myProjects } = storeToRefs(projectStore);

function select(id) {
  projectStore.selectProject(id);
}
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="tonal"
        size="small"
        append-icon="mdi-chevron-down"
        class="text-none"
      >
        <v-icon icon="mdi-folder-multiple-outline" start size="small" />
        {{ currentProject ? currentProject.name : 'No project' }}
      </v-btn>
    </template>
    <v-list density="comfortable" min-width="220">
      <v-list-subheader>Projects</v-list-subheader>
      <v-list-item
        v-for="p in myProjects"
        :key="p.id"
        :active="currentProject && p.id === currentProject.id"
        :title="p.name"
        @click="select(p.id)"
      >
        <template #append>
          <v-icon
            v-if="currentProject && p.id === currentProject.id"
            icon="mdi-check"
            size="small"
            color="primary"
          />
        </template>
      </v-list-item>
      <v-list-item v-if="!myProjects.length" title="No projects assigned" disabled />
      <v-divider />
      <v-list-item prepend-icon="mdi-cog-outline" title="Manage in Settings" to="/settings" />
    </v-list>
  </v-menu>
</template>
