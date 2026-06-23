# Module: Portal folders

**Route:** `/folders` · **View:** `src/views/FoldersView.vue` ·
**Store:** `src/store/folders.js` · **Utils:** `src/utils/fileSystem.js`

## Purpose
Connect the real External and Internal project folders so generated tests can be
written straight into them.

## Requirements
- ✅ Pick a folder per portal via File System Access API (read+write) (Sprint 1)
- ✅ Show connected/disconnected state and folder name (Sprint 1)
- ✅ Warn when the browser lacks File System Access (Firefox/Safari) (Sprint 1)
- ✅ Re-request permission when needed before writing (Sprint 1)
- 🔜 Persist handles across reloads via IndexedDB (Sprint 2)

## Notes
- Handles are not serializable → kept in memory; folder **name** persists for display.
- Writes target `tests/` under the chosen folder; these are the real files on disk.
