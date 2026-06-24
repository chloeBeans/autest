import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { useProjectStore } from '#/store/projects';

type HandleMap = Record<string, FileSystemDirectoryHandle | null>;
type NameMap = Record<string, string>;

/**
 * Holds the live FileSystemDirectoryHandle for each portal, per project.
 *
 * Handles are NOT serializable, so they (and the displayed folder names) are
 * kept in memory only — after a reload the user reconnects. Scoped by project so
 * each project points at its own External/Internal folders.
 */
export const useFolderStore = defineStore('folders', () => {
  const projectStore = useProjectStore();

  const handlesByProject = ref<Record<string, HandleMap>>({});
  const namesByProject = ref<Record<string, NameMap>>({});

  const pid = computed(() => projectStore.currentProjectId);

  const handles = computed<HandleMap>(() =>
    pid.value ? (handlesByProject.value[pid.value] ?? {}) : {},
  );
  const names = computed<NameMap>(() =>
    pid.value ? (namesByProject.value[pid.value] ?? {}) : {},
  );

  function isConnected(portal: string): boolean {
    if (!pid.value) return false;
    return !!handlesByProject.value[pid.value]?.[portal];
  }

  function handleFor(portal: string): FileSystemDirectoryHandle | null {
    if (!pid.value) return null;
    return handlesByProject.value[pid.value]?.[portal] ?? null;
  }

  function setHandle(portal: string, handle: FileSystemDirectoryHandle) {
    const id = pid.value;
    if (!id) return;
    const handleMap = (handlesByProject.value[id] ??= {});
    const nameMap = (namesByProject.value[id] ??= {});
    handleMap[portal] = handle;
    nameMap[portal] = handle?.name || '';
  }

  function disconnect(portal: string) {
    const id = pid.value;
    if (id && handlesByProject.value[id]) {
      handlesByProject.value[id]![portal] = null;
    }
  }

  return {
    handlesByProject,
    namesByProject,
    handles,
    names,
    isConnected,
    handleFor,
    setHandle,
    disconnect,
  };
});
