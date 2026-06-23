# Module: Settings (+ admin area)

**Route:** `/settings` · **View:** `src/views/SettingsView.vue`

## Purpose
Per-project portal folders and preferences for everyone; project/user
administration for admins.

## Requirements
- ✅ Connect/reconnect External & Internal portal folders **for the current
  project** (File System Access API) (Sprint 1)
- ✅ Language toggle (EN/BM); backend mode indicator (Mock / Live) (Sprint 1)
- ✅ Reachable from the dashboard "Portal Folders" card (Sprint 1)
- ✅ **Admin only**: add projects; add users; assign/unassign users to projects
  (Sprint 1)
- 🔜 Persist folder handles across reloads (IndexedDB) (Sprint 2)

## Notes
- Admin sections are gated by `auth.isAdmin`.
- Folder handles point at the real on-disk folders, scoped per project — see
  [../ARCHITECTURE.md](../ARCHITECTURE.md).
