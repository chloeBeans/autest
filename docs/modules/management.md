# Module: Management (admin only)

**Route:** `/autest/management` · **View:** `apps/web-antd/src/views/autest/management/index.vue`

## Purpose
A dedicated, **admin-only** page for project/user/**module** administration —
split out of [settings.md](settings.md) so admin controls don't mix with the
per-project Setup (portal folders) page.

## Sidebar placement
- Lives under an **Admin** group (route `AutestAdmin`, path `/autest/admin`) — a
  collapsible section pinned below the project-scoped views (Dashboard … Setup)
  so org-wide admin doesn't read as "part of the current project". Mirrors the
  Extra group's parent-with-children structure (Vben's sidebar has no divider
  primitive, so a titled group is the idiomatic separator).

## Access control
- The **Admin group** and the Management child are both gated by
  `meta.authority: ['admin', 'super']`. In Vben's **frontend** access mode this
  hides the whole group from the sidebar and blocks the routes for non-admins
  (see `packages/utils/src/helpers/generate-routes-frontend.ts`).
- Roles come from the logged-in user (`projectStore.isAdmin` uses the same
  `admin`/`super` roles) — see [auth.md](auth.md) and [projects.md](projects.md).

## Requirements
- ✅ **Admin only**: add projects; add users; assign/unassign users to projects
  (Sprint 1)
- ✅ **Admin only**: create / rename / delete **modules** per project (Sprint 1)
- ✅ **Admin only**: assign/unassign **module members** — chosen from the
  project's members (Sprint 1)

## Notes
- Modules live in `apps/web-antd/src/store/modules.ts`, scoped per project. A
  user only sees a module on the BRS page if they're a member of it (admins see
  all) — see [brs.md](brs.md).
- Module member picker offers only members of the selected project, so module
  membership stays a subset of project membership.
- Section labels reuse the `autest.settings.*` locale keys (the redundant
  "(admin)" suffixes were dropped now that the whole page is admin-only).
