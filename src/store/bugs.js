import { defineStore } from 'pinia';
import { PORTALS, ENVIRONMENTS, BUG_STATUS, CONFIDENCE } from '@/utils/constants';
import { uid } from '@/utils/format';

export const useBugStore = defineStore('bugs', {
  state: () => ({
    // Each bug: { key, id, portal, description, raw, status, confidence, note,
    //             generatedFile, commitHash }
    bugs: [],
    importedAt: null,
    sourceName: '',
  }),
  getters: {
    external: state => state.bugs.filter(b => b.portal === PORTALS.EXTERNAL),
    internal: state => state.bugs.filter(b => b.portal === PORTALS.INTERNAL),
    counts: state => ({
      all: state.bugs.length,
      external: state.bugs.filter(b => b.portal === PORTALS.EXTERNAL).length,
      internal: state.bugs.filter(b => b.portal === PORTALS.INTERNAL).length,
    }),
    envCounts: state => ({
      all: state.bugs.length,
      dev: state.bugs.filter(b => b.env === ENVIRONMENTS.DEV).length,
      sit: state.bugs.filter(b => b.env === ENVIRONMENTS.SIT).length,
      uat: state.bugs.filter(b => b.env === ENVIRONMENTS.UAT).length,
    }),
    byPortal: state => portal =>
      portal === 'all' ? state.bugs : state.bugs.filter(b => b.portal === portal),
    // Filter by portal and environment together ('all' = no filter on that axis).
    filtered: state => (portal, env) =>
      state.bugs.filter(
        b => (portal === 'all' || b.portal === portal) && (env === 'all' || b.env === env)
      ),
  },
  actions: {
    setBugs(bugs, sourceName = '') {
      this.bugs = bugs.map(b => ({
        key: uid('bug'),
        status: BUG_STATUS.NEW,
        confidence: CONFIDENCE.UNKNOWN,
        note: '',
        generatedFile: '',
        commitHash: '',
        ...b,
      }));
      this.importedAt = new Date().toISOString();
      this.sourceName = sourceName;
    },
    updateBug(key, patch) {
      const bug = this.bugs.find(b => b.key === key);
      if (bug) Object.assign(bug, patch);
    },
    clear() {
      this.bugs = [];
      this.importedAt = null;
      this.sourceName = '';
    },
  },
  persist: true,
});
