# Module: Projects & membership

**Store:** `src/store/projects.js` ·
**Switcher:** `src/components/layout/ProjectSwitcher.vue` ·
**Admin UI:** `src/views/SettingsView.vue`

## Purpose
Everything (bugs, tests, BRS, portal folders) is scoped to a project. Users work
inside the projects they're assigned to; admins manage projects and membership.

## Requirements
- ✅ Project switcher in the topbar lists the user's projects (Sprint 1)
- ✅ Users see only assigned projects; admins see all (Sprint 1)
- ✅ Admin can add projects (Sprint 1)
- ✅ Admin can assign/unassign users to projects (Sprint 1)
- ✅ All feature data is scoped per project via `byProject` slices in the
  `bugs`, `brs`, and `folders` stores (Sprint 1)
- ✅ Switching project swaps the active data; each project's data is kept (Sprint 1)

## Data model
`project = { id, name, createdBy, members: [username] }`; `currentProjectId`
drives the scoped getters in the data stores.
