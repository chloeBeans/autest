import { defineStore } from 'pinia';
import { REQ_STATUS } from '@/utils/constants';
import { uid } from '@/utils/format';
import { useProjectStore } from './projects';

// One BRS slice per project: the document, requirement items, and sprints.
function emptySlice() {
  return { document: null, items: [], sprints: [] };
}

export const useBrsStore = defineStore('brs', {
  state: () => ({
    byProject: {}, // { [projectId]: { document, items, sprints } }
  }),
  getters: {
    slice(state) {
      const id = useProjectStore().currentProjectId;
      return state.byProject[id] || emptySlice();
    },
    document() {
      return this.slice.document;
    },
    items() {
      return this.slice.items;
    },
    sprints() {
      return this.slice.sprints;
    },
    sprintNames() {
      return this.slice.sprints.map(s => s.name);
    },
    bySprint() {
      const groups = {};
      for (const item of this.slice.items) {
        const key = item.sprint || 'Unassigned';
        (groups[key] ||= []).push(item);
      }
      return groups;
    },
    progress() {
      const items = this.slice.items;
      const total = items.length;
      const done = items.filter(i => i.status === REQ_STATUS.DONE).length;
      return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
    },
  },
  actions: {
    _ensureSlice() {
      const id = useProjectStore().currentProjectId;
      if (!id) return null;
      if (!this.byProject[id]) this.byProject[id] = emptySlice();
      return this.byProject[id];
    },
    setDocument(doc) {
      const slice = this._ensureSlice();
      if (slice) slice.document = doc;
    },
    addItem(text = '', sprint = '') {
      const slice = this._ensureSlice();
      if (!slice) return;
      slice.items.push({
        id: uid('req'),
        text,
        sprint,
        status: REQ_STATUS.NOT_STARTED,
        completedDate: '',
      });
    },
    // Auto-list requirements parsed from the BRS document (skips duplicates).
    autoAddItems(texts = []) {
      const slice = this._ensureSlice();
      if (!slice) return 0;
      const existing = new Set(slice.items.map(i => i.text.trim().toLowerCase()));
      let added = 0;
      for (const text of texts) {
        const key = text.trim().toLowerCase();
        if (!key || existing.has(key)) continue;
        existing.add(key);
        this.addItem(text);
        added += 1;
      }
      return added;
    },
    updateItem(id, patch) {
      const item = this.slice.items.find(i => i.id === id);
      if (!item) return;
      Object.assign(item, patch);
      // Stamp / clear the completed date based on status.
      if (patch.status === REQ_STATUS.DONE && !item.completedDate) {
        item.completedDate = new Date().toISOString().slice(0, 10);
      } else if (patch.status && patch.status !== REQ_STATUS.DONE) {
        item.completedDate = '';
      }
    },
    removeItem(id) {
      const slice = this.slice;
      slice.items = slice.items.filter(i => i.id !== id);
    },
    setSprintDueDate(name, dueDate) {
      const slice = this._ensureSlice();
      if (!slice) return;
      const sprint = slice.sprints.find(s => s.name === name);
      if (sprint) sprint.dueDate = dueDate;
      else slice.sprints.push({ name, dueDate });
    },
    ensureSprint(name) {
      const slice = this._ensureSlice();
      if (slice && name && !slice.sprints.some(s => s.name === name)) {
        slice.sprints.push({ name, dueDate: '' });
      }
    },
  },
  persist: true,
});
