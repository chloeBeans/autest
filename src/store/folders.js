import { defineStore } from 'pinia';
import { useProjectStore } from './projects';

/**
 * Holds the live FileSystemDirectoryHandle for each portal, per project.
 *
 * Handles are NOT serializable, so they (and the displayed folder names) are kept
 * in memory only — after a reload the user reconnects. Scoped by project so each
 * project points at its own External/Internal folders.
 */
export const useFolderStore = defineStore('folders', {
  state: () => ({
    handlesByProject: {}, // { [projectId]: { external: handle, internal: handle } }
    namesByProject: {}, // { [projectId]: { external: name, internal: name } }
  }),
  getters: {
    pid() {
      return useProjectStore().currentProjectId;
    },
    handles(state) {
      return state.handlesByProject[this.pid] || {};
    },
    names(state) {
      return state.namesByProject[this.pid] || {};
    },
    isConnected(state) {
      return portal => !!state.handlesByProject[this.pid]?.[portal];
    },
    handleFor(state) {
      return portal => state.handlesByProject[this.pid]?.[portal] || null;
    },
  },
  actions: {
    setHandle(portal, handle) {
      const pid = this.pid;
      if (!pid) return;
      if (!this.handlesByProject[pid]) this.handlesByProject[pid] = {};
      if (!this.namesByProject[pid]) this.namesByProject[pid] = {};
      this.handlesByProject[pid][portal] = handle;
      this.namesByProject[pid][portal] = handle?.name || '';
    },
    disconnect(portal) {
      const pid = this.pid;
      if (this.handlesByProject[pid]) this.handlesByProject[pid][portal] = null;
    },
  },
});
