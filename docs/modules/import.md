# Module: Import bug list

**Route:** `/import` · **View:** `src/views/ImportView.vue` ·
**Utils:** `src/utils/spreadsheet.js`

## Purpose
Upload a bug list (CSV/XLSX) and turn its rows into structured bug records.

## Requirements
- ✅ Accept `.csv`, `.xlsx`, `.xls` upload (Sprint 1)
- ✅ Parse all non-empty sheets/tabs (Sprint 1)
- ✅ Auto-detect ID, Issue Description, Portal and Environment columns (Sprint 1)
- ✅ Let the user override the column mapping (Sprint 1)
- ✅ Option to use the sheet/tab name as the portal (Sprint 1)
- ✅ Preview first rows before loading (Sprint 1)
- ✅ Load into the bug store and navigate to the bug list (Sprint 1)
- 🔜 Import live from a shared Google Sheet link (Sprint 3)

## Notes
- Column detection lives in `COLUMN_HINTS` (`src/utils/constants.js`).
- Each bug keeps its original row in `raw` for a future backend.
