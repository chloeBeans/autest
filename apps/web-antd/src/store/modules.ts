import type {
  BrsDocument,
  BrsRecord,
  Module,
  RequirementItem,
} from '#/types/domain';

import { computed, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { defineStore } from 'pinia';

import { useProjectStore } from '#/store/projects';
import { REQ_STATUS } from '#/utils/constants';
import { uid } from '#/utils/format';

interface ModuleSlice {
  modules: Module[];
  currentModuleId: null | string;
}

function emptySlice(): ModuleSlice {
  return { modules: [], currentModuleId: null };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyProgress() {
  return { total: 0, done: 0, pct: 0 };
}

function progressOf(items: RequirementItem[]) {
  const total = items.length;
  const done = items.filter((i) => i.status === REQ_STATUS.DONE).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function newModule(projectId: string, name: string, createdBy: string): Module {
  return {
    id: uid('mod'),
    projectId,
    name,
    members: [],
    createdBy,
    brsList: [],
    currentBrsId: null,
    items: [],
    sprints: [],
  };
}

function newBrs(name?: string, updatedDate?: string): BrsRecord {
  return {
    id: uid('brs'),
    name: name || 'BRS',
    uploadedAt: new Date().toISOString(),
    updatedDate: updatedDate || today(),
  };
}

/**
 * Modules store — a project is split into modules; each module groups several
 * BRS documents and owns ONE shared requirement tracker (items) + sprints.
 *
 * `byProject` (persisted) holds, per project, the module list + the selected
 * module. Module create/rename/delete and module-member assignment are
 * admin-only (mirrors the projects store). Uploading BRS and editing the
 * requirement tracker is open to anyone who can see the module. Document file
 * contents (`documents`) are in-memory only — they can be large (base64 PDFs)
 * and a real backend would store them; requirements/sprints persist, re-upload
 * to re-view the doc.
 */
export const useModuleStore = defineStore(
  'modules',
  () => {
    const projectStore = useProjectStore();
    const userStore = useUserStore();

    const byProject = ref<Record<string, ModuleSlice>>({
      proj_icoms: {
        modules: [
          {
            id: 'mod_general',
            projectId: 'proj_icoms',
            name: 'General',
            members: ['qa1', 'qa2', 'dev1'],
            createdBy: 'admin',
            brsList: [],
            currentBrsId: null,
            items: [],
            sprints: [],
          },
        ],
        currentModuleId: 'mod_general',
      },
    });
    const documents = ref<Record<string, BrsDocument>>({}); // in-memory only

    const username = computed(() => userStore.userInfo?.username ?? '');
    const isAdmin = computed(() => projectStore.isAdmin);

    const slice = computed<ModuleSlice>(() => {
      const id = projectStore.currentProjectId;
      return (id ? byProject.value[id] : undefined) ?? emptySlice();
    });

    /** Modules visible to the current user — admins see all. */
    const myModules = computed<Module[]>(() => {
      if (isAdmin.value) return slice.value.modules;
      return slice.value.modules.filter((m) =>
        m.members.includes(username.value),
      );
    });

    /** The selected module, falling back to the first one the user can see. */
    const currentModule = computed<Module | null>(() => {
      const mine = myModules.value;
      return (
        mine.find((m) => m.id === slice.value.currentModuleId) ??
        mine[0] ??
        null
      );
    });

    const brsList = computed<BrsRecord[]>(
      () => currentModule.value?.brsList ?? [],
    );

    const currentBrs = computed<BrsRecord | null>(() => {
      const m = currentModule.value;
      if (!m) return null;
      return (
        m.brsList.find((b) => b.id === m.currentBrsId) ?? m.brsList[0] ?? null
      );
    });

    /** Document content for the current BRS (in-memory; null after reload). */
    const document = computed<BrsDocument | null>(() => {
      const b = currentBrs.value;
      return b ? (documents.value[b.id] ?? null) : null;
    });

    const items = computed(() => currentModule.value?.items ?? []);
    const sprints = computed(() => currentModule.value?.sprints ?? []);
    const sprintNames = computed(() => sprints.value.map((s) => s.name));

    const memberCount = computed(
      () => currentModule.value?.members.length ?? 0,
    );

    /** Progress of the current module (BRS page). */
    const progress = computed(() =>
      currentModule.value
        ? progressOf(currentModule.value.items)
        : emptyProgress(),
    );

    /** Aggregate progress across the user's visible modules (dashboard). */
    const projectProgress = computed(() =>
      progressOf(myModules.value.flatMap((m) => m.items)),
    );

    function ensureSlice(projectId?: null | string): ModuleSlice | null {
      const id = projectId ?? projectStore.currentProjectId;
      if (!id) return null;
      const existing = byProject.value[id];
      if (existing) return existing;
      const created = emptySlice();
      byProject.value[id] = created;
      return created;
    }

    /** Modules of an arbitrary project (admin management in Settings). */
    function modulesOf(projectId: string): Module[] {
      return byProject.value[projectId]?.modules ?? [];
    }

    function moduleById(id: string): Module | undefined {
      for (const s of Object.values(byProject.value)) {
        const mod = s.modules.find((m) => m.id === id);
        if (mod) return mod;
      }
      return undefined;
    }

    /** The current module, resolved like the getter (used by mutations). */
    function current(): Module | null {
      return currentModule.value;
    }

    // --- module management (admin only) ---
    function addModule(name: string, projectId?: string): null | string {
      if (!isAdmin.value) throw new Error('Only an admin can manage modules');
      const pid = projectId ?? projectStore.currentProjectId;
      if (!pid) throw new Error('Select a project first');
      const trimmed = String(name || '').trim();
      if (!trimmed) throw new Error('Module name is required');
      const s = ensureSlice(pid);
      if (!s) throw new Error('Select a project first');
      const mod = newModule(pid, trimmed, username.value || 'admin');
      s.modules.push(mod);
      if (!s.currentModuleId) s.currentModuleId = mod.id;
      return mod.id;
    }

    function renameModule(id: string, name: string) {
      if (!isAdmin.value) throw new Error('Only an admin can manage modules');
      const trimmed = String(name || '').trim();
      const mod = moduleById(id);
      if (mod && trimmed) mod.name = trimmed;
    }

    function removeModule(id: string) {
      if (!isAdmin.value) throw new Error('Only an admin can manage modules');
      for (const s of Object.values(byProject.value)) {
        const idx = s.modules.findIndex((m) => m.id === id);
        if (idx === -1) continue;
        const [removed] = s.modules.splice(idx, 1);
        if (removed) {
          for (const b of removed.brsList) {
            Reflect.deleteProperty(documents.value, b.id);
          }
        }
        // Keep the selection valid even if it pointed elsewhere.
        if (!s.modules.some((m) => m.id === s.currentModuleId)) {
          s.currentModuleId = s.modules[0]?.id ?? null;
        }
        return;
      }
    }

    function assignMember(moduleId: string, user: string) {
      if (!isAdmin.value) throw new Error('Only an admin can manage members');
      const mod = moduleById(moduleId);
      if (!mod) return;
      // Module members are a subset of the project's members.
      if (!projectStore.membersOf(mod.projectId).includes(user)) {
        throw new Error('User is not a member of the project');
      }
      if (!mod.members.includes(user)) mod.members.push(user);
    }

    function unassignMember(moduleId: string, user: string) {
      if (!isAdmin.value) throw new Error('Only an admin can manage members');
      const mod = moduleById(moduleId);
      if (mod) mod.members = mod.members.filter((u) => u !== user);
    }

    /** Select a module — ignored unless it's one the user can see. */
    function selectModule(id: string) {
      const s = ensureSlice();
      if (s && myModules.value.some((m) => m.id === id)) {
        s.currentModuleId = id;
      }
    }

    // --- BRS documents (any user with access to the current module) ---
    /** Add a BRS from an uploaded document into the current module + select it. */
    function addBrs(doc?: BrsDocument, updatedDate?: string): null | string {
      const m = current();
      if (!m) return null;
      const brs = newBrs(doc?.name, updatedDate);
      m.brsList.push(brs);
      m.currentBrsId = brs.id;
      if (doc) documents.value[brs.id] = doc;
      return brs.id;
    }

    function selectBrs(id: string) {
      const m = current();
      if (m) m.currentBrsId = id;
    }

    /** Re-attach a document to the current BRS (content lives in memory only). */
    function setDocument(doc: BrsDocument) {
      const b = currentBrs.value;
      if (b && doc) documents.value[b.id] = doc;
    }

    function removeBrs(id: string) {
      const m = current();
      if (!m) return;
      m.brsList = m.brsList.filter((b) => b.id !== id);
      Reflect.deleteProperty(documents.value, id);
      // Keep the selection valid (covers a stale/orphaned currentBrsId too).
      if (!m.brsList.some((b) => b.id === m.currentBrsId)) {
        m.currentBrsId = m.brsList[0]?.id ?? null;
      }
    }

    function renameBrs(id: string, name: string) {
      const b = current()?.brsList.find((x) => x.id === id);
      if (b && name?.trim()) b.name = name.trim();
    }

    /** Set the user-picked "updated date" on a BRS (the version date). */
    function setBrsUpdatedDate(id: string, date: string) {
      const b = current()?.brsList.find((x) => x.id === id);
      if (b) b.updatedDate = date;
    }

    // --- requirement tracker (any user) — operates on the current module ---
    function addItem(text = '', sprint = '') {
      const m = current();
      if (!m) return;
      m.items.push({
        id: uid('req'),
        text,
        sprint,
        status: REQ_STATUS.NOT_STARTED,
        completedDate: '',
      });
    }

    function autoAddItems(texts: string[] = []): number {
      const m = current();
      if (!m) return 0;
      const existing = new Set(m.items.map((i) => i.text.trim().toLowerCase()));
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
      const m = current();
      if (!m) return;
      const item = m.items.find((i) => i.id === id);
      if (!item) return;
      Object.assign(item, patch);
      if (patch.status === REQ_STATUS.DONE && !item.completedDate) {
        item.completedDate = today();
      } else if (patch.status && patch.status !== REQ_STATUS.DONE) {
        item.completedDate = '';
      }
    }

    function removeItem(id: string) {
      const m = current();
      if (m) m.items = m.items.filter((i) => i.id !== id);
    }

    function setSprintDueDate(name: string, dueDate: string) {
      const m = current();
      if (!m) return;
      const sprint = m.sprints.find((s) => s.name === name);
      if (sprint) sprint.dueDate = dueDate;
      else m.sprints.push({ name, dueDate });
    }

    function ensureSprint(name: string) {
      const m = current();
      if (m && name && !m.sprints.some((s) => s.name === name)) {
        m.sprints.push({ name, dueDate: '' });
      }
    }

    return {
      byProject,
      documents,
      myModules,
      currentModule,
      brsList,
      currentBrs,
      document,
      items,
      sprints,
      sprintNames,
      memberCount,
      progress,
      projectProgress,
      modulesOf,
      moduleById,
      addModule,
      renameModule,
      removeModule,
      assignMember,
      unassignMember,
      selectModule,
      addBrs,
      selectBrs,
      setDocument,
      removeBrs,
      renameBrs,
      setBrsUpdatedDate,
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
