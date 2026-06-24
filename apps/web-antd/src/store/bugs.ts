import type { Bug, BugRecord } from '#/types/domain';

import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { BUG_STATUS, CONFIDENCE, ENVIRONMENTS, PORTALS } from '#/utils/constants';
import { uid } from '#/utils/format';
import { useProjectStore } from '#/store/projects';

interface BugSlice {
  bugs: BugRecord[];
  importedAt: null | string;
  sourceName: string;
}

function emptySlice(): BugSlice {
  return { bugs: [], importedAt: null, sourceName: '' };
}

function decorate(bug: Bug): BugRecord {
  return {
    key: uid('bug'),
    status: BUG_STATUS.NEW,
    confidence: CONFIDENCE.UNKNOWN,
    note: '',
    generatedFile: '',
    commitHash: '',
    pickedUpBy: '',
    ...bug, // a Bug always carries its own portal + env
  };
}

/** One bug-list slice per project. */
export const useBugStore = defineStore(
  'bugs',
  () => {
    const projectStore = useProjectStore();
    const byProject = ref<Record<string, BugSlice>>({});

    const slice = computed<BugSlice>(() => {
      const id = projectStore.currentProjectId;
      return (id ? byProject.value[id] : undefined) ?? emptySlice();
    });
    const bugs = computed(() => slice.value.bugs);
    const sourceName = computed(() => slice.value.sourceName);

    const counts = computed(() => ({
      all: bugs.value.length,
      external: bugs.value.filter((b) => b.portal === PORTALS.EXTERNAL).length,
      internal: bugs.value.filter((b) => b.portal === PORTALS.INTERNAL).length,
    }));

    const envCounts = computed(() => ({
      all: bugs.value.length,
      dev: bugs.value.filter((b) => b.env === ENVIRONMENTS.DEV).length,
      sit: bugs.value.filter((b) => b.env === ENVIRONMENTS.SIT).length,
      uat: bugs.value.filter((b) => b.env === ENVIRONMENTS.UAT).length,
    }));

    /** Filter by portal and environment together ('all' = no filter on that axis). */
    function filtered(portal: string, env: string): BugRecord[] {
      return bugs.value.filter(
        (b) =>
          (portal === 'all' || b.portal === portal) &&
          (env === 'all' || b.env === env),
      );
    }

    function ensureSlice(): BugSlice | null {
      const id = projectStore.currentProjectId;
      if (!id) return null;
      if (!byProject.value[id]) byProject.value[id] = emptySlice();
      return byProject.value[id]!;
    }

    function setBugs(list: Bug[], sourceName = '') {
      const s = ensureSlice();
      if (!s) return;
      s.bugs = list.map((b) => decorate(b));
      s.importedAt = new Date().toISOString();
      s.sourceName = sourceName;
    }

    function addBug(bug: Bug) {
      const s = ensureSlice();
      if (!s) return;
      s.bugs.unshift(decorate(bug));
    }

    function updateBug(key: string, patch: Partial<BugRecord>) {
      const bug = slice.value.bugs.find((b) => b.key === key);
      if (bug) Object.assign(bug, patch);
    }

    function pickUp(key: string, user: string) {
      updateBug(key, { pickedUpBy: user });
    }

    function clear() {
      const id = projectStore.currentProjectId;
      if (id) byProject.value[id] = emptySlice();
    }

    return {
      byProject,
      slice,
      bugs,
      sourceName,
      counts,
      envCounts,
      filtered,
      setBugs,
      addBug,
      updateBug,
      pickUp,
      clear,
    };
  },
  { persist: { pick: ['byProject'] } },
);
