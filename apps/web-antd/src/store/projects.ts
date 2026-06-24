import type { Project } from '#/types/domain';

import { computed, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { defineStore } from 'pinia';

import { uid } from '#/utils/format';

/**
 * Projects — every feature (bugs, tests, BRS, folders) is scoped to the current
 * project. Users see only projects they belong to; admins see all and manage
 * projects + membership. The current user is read from Vben's user store.
 */
export const useProjectStore = defineStore(
  'projects',
  () => {
    const userStore = useUserStore();

    const projects = ref<Project[]>([
      {
        id: 'proj_icoms',
        name: 'ICOMS Portal',
        createdBy: 'admin',
        members: ['admin', 'qa1', 'qa2', 'dev1'],
      },
    ]);
    const currentProjectId = ref<null | string>('proj_icoms');

    const username = computed(() => userStore.userInfo?.username ?? '');
    const isAdmin = computed(() => {
      const roles = userStore.userInfo?.roles ?? [];
      return roles.includes('admin') || roles.includes('super');
    });

    const currentProject = computed(
      () => projects.value.find((p) => p.id === currentProjectId.value) ?? null,
    );

    /** Projects visible to the logged-in user (admins see all). */
    const myProjects = computed<Project[]>(() => {
      if (!userStore.userInfo) return [];
      if (isAdmin.value) return projects.value;
      return projects.value.filter((p) => p.members.includes(username.value));
    });

    function membersOf(projectId: string): string[] {
      return projects.value.find((p) => p.id === projectId)?.members ?? [];
    }

    function selectProject(id: string) {
      currentProjectId.value = id;
    }

    /** Keep the current selection valid for the logged-in user. */
    function ensureValidSelection() {
      const mine = myProjects.value;
      if (!mine.some((p) => p.id === currentProjectId.value)) {
        currentProjectId.value = mine[0]?.id ?? null;
      }
    }

    function addProject(name: string): string {
      if (!isAdmin.value) throw new Error('Only an admin can add projects');
      const trimmed = String(name || '').trim();
      if (!trimmed) throw new Error('Project name is required');
      const id = uid('proj');
      const creator = username.value || 'admin';
      projects.value.push({
        id,
        name: trimmed,
        createdBy: creator,
        members: [creator],
      });
      return id;
    }

    function assignUser(projectId: string, user: string) {
      if (!isAdmin.value) throw new Error('Only an admin can assign users');
      const project = projects.value.find((p) => p.id === projectId);
      if (project && !project.members.includes(user)) project.members.push(user);
    }

    function unassignUser(projectId: string, user: string) {
      if (!isAdmin.value) throw new Error('Only an admin can unassign users');
      const project = projects.value.find((p) => p.id === projectId);
      if (project) {
        project.members = project.members.filter((u) => u !== user);
      }
    }

    return {
      projects,
      currentProjectId,
      currentProject,
      myProjects,
      isAdmin,
      membersOf,
      selectProject,
      ensureValidSelection,
      addProject,
      assignUser,
      unassignUser,
    };
  },
  { persist: { pick: ['projects', 'currentProjectId'] } },
);
