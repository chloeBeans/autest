import { defineStore } from 'pinia';
import { REQ_STATUS } from '@/utils/constants';
import { uid } from '@/utils/format';

/**
 * BRS (Business Requirements Specification) store.
 *
 * - `document` holds the uploaded BRS for in-app viewing.
 *   { name, kind: 'pdf'|'html'|'markdown'|'text', data }
 * - `items` is the requirement tracker — auto-extracted from the document, each
 *   carrying a status, sprint, and completedDate (stamped when marked Done).
 * - `sprints` records each sprint and its due date.
 */
export const useBrsStore = defineStore('brs', {
  state: () => ({
    document: null,
    items: [],
    sprints: [], // { name, dueDate }
  }),
  getters: {
    sprintNames: state => state.sprints.map(s => s.name),
    dueDateFor: state => name => state.sprints.find(s => s.name === name)?.dueDate || '',
    bySprint: state => {
      const groups = {};
      for (const item of state.items) {
        const key = item.sprint || 'Unassigned';
        (groups[key] ||= []).push(item);
      }
      return groups;
    },
    progress: state => {
      const total = state.items.length;
      const done = state.items.filter(i => i.status === REQ_STATUS.DONE).length;
      return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
    },
  },
  actions: {
    setDocument(doc) {
      this.document = doc;
    },
    clearDocument() {
      this.document = null;
    },
    addItem(text = '', sprint = '') {
      this.items.push({
        id: uid('req'),
        text,
        sprint,
        status: REQ_STATUS.NOT_STARTED,
        completedDate: '',
      });
    },
    // Auto-list requirements parsed from the BRS document (skips duplicates).
    autoAddItems(texts = []) {
      const existing = new Set(this.items.map(i => i.text.trim().toLowerCase()));
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
      const item = this.items.find(i => i.id === id);
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
      this.items = this.items.filter(i => i.id !== id);
    },
    clearItems() {
      this.items = [];
    },
    ensureSprint(name) {
      if (name && !this.sprints.some(s => s.name === name)) {
        this.sprints.push({ name, dueDate: '' });
      }
    },
    setSprintDueDate(name, dueDate) {
      const sprint = this.sprints.find(s => s.name === name);
      if (sprint) sprint.dueDate = dueDate;
      else this.sprints.push({ name, dueDate });
    },
    removeSprint(name) {
      this.sprints = this.sprints.filter(s => s.name !== name);
    },
  },
  persist: true,
});
