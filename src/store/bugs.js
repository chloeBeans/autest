import { defineStore } from 'pinia';
import { PORTALS, ENVIRONMENTS, BUG_STATUS, CONFIDENCE } from '@/utils/constants';
import { uid } from '@/utils/format';
import { useProjectStore } from './projects';

// One bug-list slice per project.
function emptySlice() {
  return { bugs: [], importedAt: null, sourceName: '' };
}

function decorate(bug) {
  return {
    key: uid('bug'),
    status: BUG_STATUS.NEW,
    confidence: CONFIDENCE.UNKNOWN,
    note: '',
    generatedFile: '',
    commitHash: '',
    pickedUpBy: '',
    env: ENVIRONMENTS.DEV,
    portal: PORTALS.EXTERNAL,
    ...bug,
  };
}

export const useBugStore = defineStore('bugs', {
  state: () => ({
    byProject: {}, // { [projectId]: { bugs, importedAt, sourceName } }
  }),
  getters: {
    slice(state) {
      const id = useProjectStore().currentProjectId;
      return state.byProject[id] || emptySlice();
    },
    bugs() {
      return this.slice.bugs;
    },
    sourceName() {
      return this.slice.sourceName;
    },
    counts() {
      const bugs = this.bugs;
      return {
        all: bugs.length,
        external: bugs.filter(b => b.portal === PORTALS.EXTERNAL).length,
        internal: bugs.filter(b => b.portal === PORTALS.INTERNAL).length,
      };
    },
    envCounts() {
      const bugs = this.bugs;
      return {
        all: bugs.length,
        dev: bugs.filter(b => b.env === ENVIRONMENTS.DEV).length,
        sit: bugs.filter(b => b.env === ENVIRONMENTS.SIT).length,
        uat: bugs.filter(b => b.env === ENVIRONMENTS.UAT).length,
      };
    },
    // Filter by portal and environment together ('all' = no filter on that axis).
    filtered() {
      return (portal, env) =>
        this.bugs.filter(
          b => (portal === 'all' || b.portal === portal) && (env === 'all' || b.env === env)
        );
    },
  },
  actions: {
    _ensureSlice() {
      const id = useProjectStore().currentProjectId;
      if (!id) return null;
      if (!this.byProject[id]) this.byProject[id] = emptySlice();
      return this.byProject[id];
    },
    setBugs(bugs, sourceName = '') {
      const slice = this._ensureSlice();
      if (!slice) return;
      slice.bugs = bugs.map(decorate);
      slice.importedAt = new Date().toISOString();
      slice.sourceName = sourceName;
    },
    addBug(bug) {
      const slice = this._ensureSlice();
      if (!slice) return;
      slice.bugs.unshift(decorate(bug));
    },
    updateBug(key, patch) {
      const bug = this.slice.bugs.find(b => b.key === key);
      if (bug) Object.assign(bug, patch);
    },
    pickUp(key, username) {
      this.updateBug(key, { pickedUpBy: username });
    },
    clear() {
      const id = useProjectStore().currentProjectId;
      if (id) this.byProject[id] = emptySlice();
    },
  },
  persist: true,
});
