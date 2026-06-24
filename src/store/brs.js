import { defineStore } from 'pinia';
import { REQ_STATUS } from '@/utils/constants';
import { uid } from '@/utils/format';
import { useProjectStore } from './projects';

/**
 * BRS store — multiple BRS documents per project.
 *
 * `byProject` (persisted) holds, per project, a list of BRS records — each with
 * its own requirement items and sprints — plus the currently selected one.
 * Document file contents (`documents`) are kept in memory only (not persisted):
 * they can be large (base64 PDFs) and a real backend would store the files. So
 * after a reload the requirements/sprints persist; re-upload to re-view the doc.
 */
function emptySlice() {
  return { brsList: [], currentBrsId: null };
}

function newBrs(name) {
  return {
    id: uid('brs'),
    name: name || 'BRS',
    items: [],
    sprints: [],
    uploadedAt: new Date().toISOString(),
  };
}

export const useBrsStore = defineStore('brs', {
  state: () => ({
    byProject: {}, // persisted
    documents: {}, // in-memory only: { [brsId]: doc }
  }),
  getters: {
    slice(state) {
      const id = useProjectStore().currentProjectId;
      return state.byProject[id] || emptySlice();
    },
    brsList() {
      return this.slice.brsList;
    },
    currentBrs() {
      const s = this.slice;
      return s.brsList.find(b => b.id === s.currentBrsId) || null;
    },
    // Document content for the current BRS (in-memory; may be null after reload).
    document(state) {
      const b = this.currentBrs;
      return b ? state.documents[b.id] || null : null;
    },
    items() {
      return this.currentBrs?.items || [];
    },
    sprints() {
      return this.currentBrs?.sprints || [];
    },
    sprintNames() {
      return this.sprints.map(s => s.name);
    },
    progress() {
      const items = this.items;
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
    _current() {
      const s = this.slice;
      return s.brsList.find(b => b.id === s.currentBrsId) || null;
    },
    // Add a new BRS from an uploaded document and select it.
    addBrs(doc) {
      const slice = this._ensureSlice();
      if (!slice) return null;
      const brs = newBrs(doc?.name);
      slice.brsList.push(brs);
      slice.currentBrsId = brs.id;
      if (doc) this.documents[brs.id] = doc;
      return brs.id;
    },
    selectBrs(id) {
      const slice = this._ensureSlice();
      if (slice) slice.currentBrsId = id;
    },
    // Re-attach a document to the current BRS (its content lives in memory only).
    setDocument(doc) {
      const brs = this._current();
      if (brs && doc) this.documents[brs.id] = doc;
    },
    removeBrs(id) {
      const slice = this._ensureSlice();
      if (!slice) return;
      slice.brsList = slice.brsList.filter(b => b.id !== id);
      delete this.documents[id];
      if (slice.currentBrsId === id) slice.currentBrsId = slice.brsList[0]?.id || null;
    },
    renameBrs(id, name) {
      const brs = this.slice.brsList.find(b => b.id === id);
      if (brs && name?.trim()) brs.name = name.trim();
    },
    // --- requirement actions operate on the current BRS ---
    addItem(text = '', sprint = '') {
      const brs = this._current();
      if (!brs) return;
      brs.items.push({
        id: uid('req'),
        text,
        sprint,
        status: REQ_STATUS.NOT_STARTED,
        completedDate: '',
      });
    },
    autoAddItems(texts = []) {
      const brs = this._current();
      if (!brs) return 0;
      const existing = new Set(brs.items.map(i => i.text.trim().toLowerCase()));
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
      const brs = this._current();
      if (!brs) return;
      const item = brs.items.find(i => i.id === id);
      if (!item) return;
      Object.assign(item, patch);
      if (patch.status === REQ_STATUS.DONE && !item.completedDate) {
        item.completedDate = new Date().toISOString().slice(0, 10);
      } else if (patch.status && patch.status !== REQ_STATUS.DONE) {
        item.completedDate = '';
      }
    },
    removeItem(id) {
      const brs = this._current();
      if (brs) brs.items = brs.items.filter(i => i.id !== id);
    },
    setSprintDueDate(name, dueDate) {
      const brs = this._current();
      if (!brs) return;
      const sprint = brs.sprints.find(s => s.name === name);
      if (sprint) sprint.dueDate = dueDate;
      else brs.sprints.push({ name, dueDate });
    },
    ensureSprint(name) {
      const brs = this._current();
      if (brs && name && !brs.sprints.some(s => s.name === name)) {
        brs.sprints.push({ name, dueDate: '' });
      }
    },
  },
  // Persist metadata + requirements only; keep document blobs in memory.
  persist: { pick: ['byProject'] },
});
