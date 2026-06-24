# Module: Settings (+ admin area)

**Route:** `/autest/setup` · **View:** `apps/web-antd/src/views/autest/setup/index.vue`

## Purpose
Per-project portal folders and preferences for everyone; project/user/**module**
administration for admins.

## Requirements
- ✅ Connect/reconnect External & Internal portal folders **for the current
  project** (File System Access API) (Sprint 1)
- ✅ Language toggle (EN/BM); backend mode indicator (Mock / Live) (Sprint 1)
- ✅ Reachable from the dashboard "Portal Folders" card (Sprint 1)
- ✅ **Admin only**: add projects; add users; assign/unassign users to projects
  (Sprint 1)
- ✅ **Admin only**: create / rename / delete **modules** per project (Sprint 1)
- ✅ **Admin only**: assign/unassign **module members** — chosen from the
  project's members (Sprint 1)
- 🔜 Persist folder handles across reloads (IndexedDB) (Sprint 2)

## Notes
- Admin sections are gated by `projectStore.isAdmin`.
- Modules live in `apps/web-antd/src/store/modules.ts`, scoped per project. A
  user only sees a module on the BRS page if they're a member of it (admins see
  all) — see [brs.md](brs.md).
- Module member picker offers only members of the selected project, so module
  membership stays a subset of project membership.
- Folder handles point at the real on-disk folders, scoped per project — see
  [../ARCHITECTURE.md](../ARCHITECTURE.md).
