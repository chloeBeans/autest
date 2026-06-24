# Module: Bugs (import + list + manual + pick-up)

**Route:** `/bugs` · **View:** `src/views/BugListView.vue` ·
**Store:** `src/store/bugs.js` ·
**Dialogs:** `src/components/dialog/{ImportBugsDialog,AddBugDialog}.vue`

## Purpose
One menu to get bugs in (import or manual), see them split by portal and
environment, pick them up, and drive test generation — scoped to the current project.

## Requirements
- ✅ **Import** CSV/XLSX via a dialog with column auto-mapping (Sprint 1)
- ✅ **Add bug manually** via a dialog (id, portal, env, description) (Sprint 1)
- ✅ **Edit a bug inline** in the table row (id, portal, env, description,
  status, confidence) with Save/Cancel; add stays in the dialog
- ✅ List in a DataTable; filter by portal (All/External/Internal) (Sprint 1)
- ✅ Filter by environment (All/DEV/SIT/UAT); search id + description (Sprint 1)
- ✅ Status, Confidence, **Picked up by**, Notes/Doubts columns (Sprint 1)
- ✅ **Pick up** action sets the bug's assignee to the current user (Sprint 1)
- ✅ Generate Test per row (Sprint 1)
- ✅ Bug data is scoped to the current project (Sprint 1)

## Data model
`{ key, id, portal, env, description, raw, status, confidence, note,
generatedFile, commitHash, pickedUpBy }` — held in `bugs.byProject[projectId]`.
