# Module: Settings

**Route:** `/autest/setup` · **View:** `apps/web-antd/src/views/autest/setup/index.vue`

## Purpose
Per-project portal folders for everyone. Admin-only project/user/module
administration now lives on its own page — see [management.md](management.md).

## Requirements
- ✅ Connect/reconnect External & Internal portal folders **for the current
  project** (File System Access API) (Sprint 1)
- ✅ Reachable from the dashboard "Portal Folders" card (Sprint 1)
- 🔜 Persist folder handles across reloads (IndexedDB) (Sprint 2)

## Notes
- Folder handles point at the real on-disk folders, scoped per project — see
  [../ARCHITECTURE.md](../ARCHITECTURE.md).
- All admin sections (projects, users, project membership, modules, module
  membership) moved to the **Management** page (`/autest/management`), gated to
  admins via route `meta.authority` — see [management.md](management.md).
