# Module: Bugs (import + list + manual add)

**Route:** `/autest/bugs` · **View:** `apps/web-antd/src/views/autest/bugs/index.vue` ·
**Store:** `apps/web-antd/src/store/bugs.ts` ·
**Dialogs:** `apps/web-antd/src/views/autest/bugs/components/{import-modal,add-bug-modal}.vue`

## Purpose
One menu to get bugs in (import or manual) and track them in a list that mirrors
the QA bug sheet column-for-column — scoped to the current project.

## Requirements
- ✅ **Import** CSV/XLSX via a dialog; columns are auto-mapped to bug fields by
  header name, with the primary columns (Log ID, Issue Description, Status, Dev
  Status, Portion, ENV, Modules) exposed for manual override
- ✅ **Add bug manually** via a dialog covering every field
- ✅ **Edit a bug inline** in the table row across all fields, with Save/Cancel;
  add stays in the dialog
- ✅ List every sheet column in a wide, horizontally-scrolling table
- ✅ Filter by **Portion** and **ENV** (built from the values present in the
  data); search Log ID + Issue Description + No + Modules
- ✅ **Status** (OPEN/RETEST/CLOSED/REOPEN/INVALID) and **Dev Status**
  (IN PROGRESS/FIXED IN LOCAL ENV/DEPLOYED to PRE-SIT) shown as colored tags
- ✅ Bug data is scoped to the current project

## Data model
Mirrors the QA bug sheet (`docs/TEST BUG LIST.csv`). Each record is
`{ key }` plus these fields, held in `bugs.byProject[projectId]`:

`no, env, logId, sprint, usingMigrationData, module, portion, processFunction,
description, status, reportedBy, dateReported, regress, defectSeverity,
defectPriority, qaUse, readinessAssessment, devRemarks, targetResolvedDate,
devStatus, defectFixedDate, deploymentVersion, regressReason, resolutionRemarks`

The field list lives in `BUG_FIELDS` (`apps/web-antd/src/utils/constants.ts`) and
drives the table columns, inline editing, the add form and the import mapping.
Column display labels are resolved via i18n at `autest.bugs.fields.<key>`.

## Notes
- The earlier app-internal lifecycle (status NEW→GENERATED→COMMITTED,
  confidence, notes, picked-up-by) and the per-row **Generate Test** /
  **Pick Up** actions were removed when the list was switched to mirror the
  QA sheet. The Playwright test builder still lives in the **Tests** menu.
