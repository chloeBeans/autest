import { defineStore } from 'pinia';
import { uid } from '@/utils/format';
import { useAuthStore } from './auth';

/**
 * Projects — every sidebar feature (bugs, tests, BRS, folders) is scoped to the
 * current project. Users see only projects they are a member of; admins see all.
 * Admin-only actions manage projects and membership.
 */
export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [
      {
        id: 'proj_icoms',
        name: 'ICOMS Portal',
        createdBy: 'admin',
        members: ['admin', 'qa1', 'qa2', 'dev1'],
      },
    ],
    currentProjectId: 'proj_icoms',
  }),
  getters: {
    currentProject: state => state.projects.find(p => p.id === state.currentProjectId) || null,
    // Projects visible to the logged-in user (admins see all).
    myProjects(state) {
      const auth = useAuthStore();
      if (!auth.currentUser) return [];
      if (auth.isAdmin) return state.projects;
      return state.projects.filter(p => p.members.includes(auth.currentUser.username));
    },
    membersOf: state => projectId => state.projects.find(p => p.id === projectId)?.members || [],
  },
  actions: {
    selectProject(id) {
      this.currentProjectId = id;
    },
    // Ensure the current selection is a project the user may see.
    ensureValidSelection() {
      const mine = this.myProjects;
      if (!mine.some(p => p.id === this.currentProjectId)) {
        this.currentProjectId = mine[0]?.id || null;
      }
    },
    addProject(name) {
      const auth = useAuthStore();
      if (!auth.isAdmin) throw new Error('Only an admin can add projects');
      const trimmed = String(name || '').trim();
      if (!trimmed) throw new Error('Project name is required');
      const id = uid('proj');
      const creator = auth.username || 'admin';
      this.projects.push({ id, name: trimmed, createdBy: creator, members: [creator] });
      return id;
    },
    assignUser(projectId, username) {
      const auth = useAuthStore();
      if (!auth.isAdmin) throw new Error('Only an admin can assign users');
      const project = this.projects.find(p => p.id === projectId);
      if (project && !project.members.includes(username)) project.members.push(username);
    },
    unassignUser(projectId, username) {
      const auth = useAuthStore();
      if (!auth.isAdmin) throw new Error('Only an admin can unassign users');
      const project = this.projects.find(p => p.id === projectId);
      if (project) project.members = project.members.filter(u => u !== username);
    },
  },
  persist: true,
});
