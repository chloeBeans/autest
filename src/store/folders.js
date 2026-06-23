import { defineStore } from 'pinia';
import { PORTALS } from '@/utils/constants';

/**
 * Holds the live FileSystemDirectoryHandle for each portal.
 *
 * Handles are NOT serializable, so they are kept in memory only (not persisted).
 * After a page reload the user reconnects the folders — we keep the last folder
 * NAME persisted purely for display.
 */
export const useFolderStore = defineStore('folders', {
  state: () => ({
    handles: {
      [PORTALS.EXTERNAL]: null,
      [PORTALS.INTERNAL]: null,
    },
    names: {
      [PORTALS.EXTERNAL]: localStorage.getItem('folder-name-external') || '',
      [PORTALS.INTERNAL]: localStorage.getItem('folder-name-internal') || '',
    },
  }),
  getters: {
    isConnected: state => portal => !!state.handles[portal],
    handleFor: state => portal => state.handles[portal],
  },
  actions: {
    setHandle(portal, handle) {
      this.handles[portal] = handle;
      this.names[portal] = handle?.name || '';
      localStorage.setItem(`folder-name-${portal}`, this.names[portal]);
    },
    disconnect(portal) {
      this.handles[portal] = null;
    },
  },
});
