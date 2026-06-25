import type { Bug, BugRecord } from '#/types/domain';

import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { useProjectStore } from '#/store/projects';
import { STATUS_OPTIONS } from '#/utils/constants';
import { uid } from '#/utils/format';

interface BugSlice {
  bugs: BugRecord[];
  importedAt: null | string;
  sourceName: string;
}

function emptySlice(): BugSlice {
  return { bugs: [], importedAt: null, sourceName: '' };
}

/** A blank bug — every field defaults to '' so partial input is always safe. */
function emptyBug(): Bug {
  return {
    no: '',
    env: '',
    logId: '',
    sprint: '',
    usingMigrationData: '',
    module: '',
    portion: '',
    processFunction: '',
    description: '',
    status: '',
    reportedBy: '',
    dateReported: '',
    regress: '',
    defectSeverity: '',
    defectPriority: '',
    qaUse: '',
    readinessAssessment: '',
    devRemarks: '',
    targetResolvedDate: '',
    devStatus: '',
    defectFixedDate: '',
    deploymentVersion: '',
    regressReason: '',
    resolutionRemarks: '',
    raw: {},
  };
}

function decorate(bug: Partial<Bug>): BugRecord {
  return { key: uid('bug'), ...emptyBug(), ...bug };
}

const VALID_STATUS = new Set<string>(STATUS_OPTIONS.map((o) => o.value));

/**
 * Bring a persisted record up to the current model. Older saved data used the
 * pre-sheet shape (id/portal/env/status='new'/confidence/...); this back-fills
 * the new fields so counts, filters and the table behave consistently.
 */
function normalizeRecord(raw: Record<string, unknown>): BugRecord {
  const rec: BugRecord = {
    key: (raw.key as string) || uid('bug'),
    ...emptyBug(),
  };
  for (const key of Object.keys(rec)) {
    const v = raw[key];
    if (v !== undefined && v !== null) {
      (rec as unknown as Record<string, unknown>)[key] = v;
    }
  }
  // Map old fields onto the new model.
  if (!rec.logId && raw.id) rec.logId = String(raw.id);
  if (!rec.portion && raw.portal) {
    const p = String(raw.portal);
    const portionByPortal: Record<string, string> = {
      external: 'Ext Portal',
      internal: 'Int Portal',
    };
    rec.portion = portionByPortal[p] ?? p;
  }
  // Drop legacy status values that aren't part of the sheet's status list.
  if (rec.status && !VALID_STATUS.has(rec.status)) rec.status = '';
  return rec;
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

    // External/Internal counts are derived from the Portion column (e.g.
    // "Ext Portal" / "Int Portal"). Kept for the dashboard statistics.
    const counts = computed(() => {
      const list = bugs.value;
      return {
        all: list.length,
        external: list.filter((b) => /\bext/i.test(b.portion)).length,
        internal: list.filter((b) => /\bint/i.test(b.portion)).length,
      };
    });

    /** Filter by Portion and ENV together ('all' = no filter on that axis). */
    function filtered(portion: string, env: string): BugRecord[] {
      return bugs.value.filter(
        (b) =>
          (portion === 'all' || b.portion === portion) &&
          (env === 'all' || b.env === env),
      );
    }

    function ensureSlice(): BugSlice | null {
      const id = projectStore.currentProjectId;
      if (!id) return null;
      const existing = byProject.value[id];
      if (existing) return existing;
      const created = emptySlice();
      byProject.value[id] = created;
      return created;
    }

    function setBugs(list: Bug[], sourceName = '') {
      const s = ensureSlice();
      if (!s) return;
      s.bugs = list.map((b) => decorate(b));
      s.importedAt = new Date().toISOString();
      s.sourceName = sourceName;
    }

    function addBug(bug: Partial<Bug>) {
      const s = ensureSlice();
      if (!s) return;
      s.bugs.unshift(decorate(bug));
    }

    function updateBug(key: string, patch: Partial<BugRecord>) {
      const bug = slice.value.bugs.find((b) => b.key === key);
      if (bug) Object.assign(bug, patch);
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
      filtered,
      setBugs,
      addBug,
      updateBug,
      clear,
    };
  },
  {
    persist: {
      pick: ['byProject'],
      // Normalize any pre-sheet records restored from localStorage.
      afterHydrate: ({ store }) => {
        const byProject = (store.byProject ?? {}) as Record<string, BugSlice>;
        for (const id of Object.keys(byProject)) {
          const s = byProject[id];
          if (s?.bugs) {
            s.bugs = s.bugs.map((b) =>
              normalizeRecord(b as unknown as Record<string, unknown>),
            );
          }
        }
      },
    },
  },
);
