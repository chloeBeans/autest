import type {
  BrsDocument,
  BrsRecord,
  RequirementItem,
} from '#/types/domain';

import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { REQ_STATUS } from '#/utils/constants';
import { uid } from '#/utils/format';
import { useProjectStore } from '#/store/projects';

interface BrsSlice {
  brsList: BrsRecord[];
  currentBrsId: null | string;
}

function emptySlice(): BrsSlice {
  return { brsList: [], currentBrsId: null };
}

function newBrs(name?: string): BrsRecord {
  return {
    id: uid('brs'),
    name: name || 'BRS',
    items: [],
    sprints: [],
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * BRS store — multiple BRS documents per project.
 *
 * `byProject` (persisted) holds, per project, a list of BRS records — each with
 * its own requirement items and sprints — plus the selected one. Document file
 * contents (`documents`) are kept in memory only: they can be large (base64
 * PDFs) and a real backend would store the files. After a reload the
 * requirements/sprints persist; re-upload to re-view the doc.
 */
export const useBrsStore = defineStore(
  'brs',
  () => {
    const projectStore = useProjectStore();
    const byProject = ref<Record<string, BrsSlice>>({});
    const documents = ref<Record<string, BrsDocument>>({}); // in-memory only

    const slice = computed<BrsSlice>(() => {
      const id = projectStore.currentProjectId;
      return (id ? byProject.value[id] : undefined) ?? emptySlice();
    });
    const brsList = computed(() => slice.value.brsList);

    const currentBrs = computed<BrsRecord | null>(() => {
      const s = slice.value;
      return s.brsList.find((b) => b.id === s.currentBrsId) ?? null;
    });

    /** Document content for the current BRS (in-memory; null after reload). */
    const document = computed<BrsDocument | null>(() => {
      const b = currentBrs.value;
      return b ? (documents.value[b.id] ?? null) : null;
    });

    const items = computed(() => currentBrs.value?.items ?? []);
    const sprints = computed(() => currentBrs.value?.sprints ?? []);
    const sprintNames = computed(() => sprints.value.map((s) => s.name));

    const progress = computed(() => {
      const list = items.value;
      const total = list.length;
      const done = list.filter((i) => i.status === REQ_STATUS.DONE).length;
      return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
    });

    function ensureSlice(): BrsSlice | null {
      const id = projectStore.currentProjectId;
      if (!id) return null;
      if (!byProject.value[id]) byProject.value[id] = emptySlice();
      return byProject.value[id]!;
    }

    function current(): BrsRecord | null {
      const s = slice.value;
      return s.brsList.find((b) => b.id === s.currentBrsId) ?? null;
    }

    /** Add a new BRS from an uploaded document and select it. */
    function addBrs(doc?: BrsDocument): null | string {
      const s = ensureSlice();
      if (!s) return null;
      const brs = newBrs(doc?.name);
      s.brsList.push(brs);
      s.currentBrsId = brs.id;
      if (doc) documents.value[brs.id] = doc;
      return brs.id;
    }

    function selectBrs(id: string) {
      const s = ensureSlice();
      if (s) s.currentBrsId = id;
    }

    /** Re-attach a document to the current BRS (content lives in memory only). */
    function setDocument(doc: BrsDocument) {
      const brs = current();
      if (brs && doc) documents.value[brs.id] = doc;
    }

    function removeBrs(id: string) {
      const s = ensureSlice();
      if (!s) return;
      s.brsList = s.brsList.filter((b) => b.id !== id);
      delete documents.value[id];
      if (s.currentBrsId === id) s.currentBrsId = s.brsList[0]?.id ?? null;
    }

    function renameBrs(id: string, name: string) {
      const brs = slice.value.brsList.find((b) => b.id === id);
      if (brs && name?.trim()) brs.name = name.trim();
    }

    // --- requirement actions operate on the current BRS ---
    function addItem(text = '', sprint = '') {
      const brs = current();
      if (!brs) return;
      brs.items.push({
        id: uid('req'),
        text,
        sprint,
        status: REQ_STATUS.NOT_STARTED,
        completedDate: '',
      });
    }

    function autoAddItems(texts: string[] = []): number {
      const brs = current();
      if (!brs) return 0;
      const existing = new Set(brs.items.map((i) => i.text.trim().toLowerCase()));
      let added = 0;
      for (const text of texts) {
        const key = text.trim().toLowerCase();
        if (!key || existing.has(key)) continue;
        existing.add(key);
        addItem(text);
        added += 1;
      }
      return added;
    }

    function updateItem(id: string, patch: Partial<RequirementItem>) {
      const brs = current();
      if (!brs) return;
      const item = brs.items.find((i) => i.id === id);
      if (!item) return;
      Object.assign(item, patch);
      if (patch.status === REQ_STATUS.DONE && !item.completedDate) {
        item.completedDate = new Date().toISOString().slice(0, 10);
      } else if (patch.status && patch.status !== REQ_STATUS.DONE) {
        item.completedDate = '';
      }
    }

    function removeItem(id: string) {
      const brs = current();
      if (brs) brs.items = brs.items.filter((i) => i.id !== id);
    }

    function setSprintDueDate(name: string, dueDate: string) {
      const brs = current();
      if (!brs) return;
      const sprint = brs.sprints.find((s) => s.name === name);
      if (sprint) sprint.dueDate = dueDate;
      else brs.sprints.push({ name, dueDate });
    }

    function ensureSprint(name: string) {
      const brs = current();
      if (brs && name && !brs.sprints.some((s) => s.name === name)) {
        brs.sprints.push({ name, dueDate: '' });
      }
    }

    return {
      byProject,
      documents,
      slice,
      brsList,
      currentBrs,
      document,
      items,
      sprints,
      sprintNames,
      progress,
      addBrs,
      selectBrs,
      setDocument,
      removeBrs,
      renameBrs,
      addItem,
      autoAddItems,
      updateItem,
      removeItem,
      setSprintDueDate,
      ensureSprint,
    };
  },
  { persist: { pick: ['byProject'] } },
);
