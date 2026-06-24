# Module: BRS

**Route:** `/brs` · **View:** `src/views/BrsView.vue` ·
**Store:** `src/store/brs.js` · **Utils:** `src/utils/brs.js`

## Purpose
Upload and view **multiple** Business Requirements Specifications per project,
auto-list each one's requirements, and track them by sprint.

## Requirements
- ✅ **Multiple BRS per project**: add many, switch via a selector, delete (Sprint 1)
- ✅ Each BRS has its own document, requirement items, and sprints (Sprint 1)
- ✅ Upload BRS: PDF, DOCX, MD, TXT (Sprint 1)
- ✅ View in-app: PDF (iframe), DOCX (mammoth→HTML), MD (marked), TXT (Sprint 1)
- ✅ Auto-extract requirements from DOCX/MD/TXT on upload (Sprint 1)
- ✅ Paste-to-extract fallback for PDF (Sprint 1)
- ✅ Requirement tracker: text, sprint, status (Sprint 1)
- ✅ Status set to Done stamps a **completed date** automatically (Sprint 1)
- ✅ Each sprint has an editable **due date** (Sprint 1)
- ✅ Progress bar (done / total) (Sprint 1)
- 🔜 PDF text auto-extraction via pdf.js (Sprint 2)

## Notes
- Extraction heuristic (`extractRequirements`) picks bullet/numbered lines, lines
  with shall/must/should, and requirement IDs (REQ-/FR-/US-…).
- HTML/Markdown are sanitized with DOMPurify before render.
- Per project, `byProject[pid].brsList` (metadata + items + sprints) is persisted;
  document file blobs live in memory only (`documents`), so after a reload the
  requirements persist and the doc is re-uploaded to view. A real backend stores
  the files.
