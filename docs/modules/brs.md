# Module: BRS (grouped by module)

**Route:** `/autest/brs` · **View:** `apps/web-antd/src/views/autest/brs/index.vue` ·
**Store:** `apps/web-antd/src/store/modules.ts` · **Utils:** `apps/web-antd/src/utils/brs.ts`

## Purpose
A project is split into **modules** (admin-managed — see
[management.md](management.md)). Each module groups **multiple BRS documents** and
owns **one shared requirement tracker** (items) + sprints. Upload BRS by module,
auto-list each one's requirements into the module tracker, and track them by
sprint.

## Requirements
- ✅ **Modules per project**: pick a module via the selector; admins manage the
  list in Management (Sprint 1)
- ✅ **Multiple BRS per module**: add many, switch via a selector, delete (Sprint 1)
- ✅ Each module has ONE requirement tracker + sprints, shared across its BRS (Sprint 1)
- ✅ **Updated date** per BRS — the uploader picks/edits it after upload (Sprint 1)
- ✅ Upload BRS: PDF, DOCX, MD, TXT (Sprint 1)
- ✅ View in-app: PDF (iframe), DOCX (mammoth→HTML), MD (marked), TXT (Sprint 1)
- ✅ Auto-extract requirements from DOCX/MD/TXT on upload (Sprint 1)
- ✅ Paste-to-extract fallback for PDF (Sprint 1)
- ✅ Requirement tracker editable by **anyone** with access to the module: add /
  edit / delete; text, sprint, status (Sprint 1)
- ✅ Status set to Done stamps a **completed date** automatically (Sprint 1)
- ✅ Each sprint has an editable **due date** (Sprint 1)
- ✅ Progress bar (done / total) per module (Sprint 1)
- 🔜 PDF text auto-extraction via pdf.js (Sprint 2)

## Visibility
- Admins see every module in the current project.
- Non-admins see only modules they're a member of (module members are a subset
  of the project's members — see [management.md](management.md)).

## Notes
- Extraction heuristic (`extractRequirements`) picks bullet/numbered lines, lines
  with shall/must/should, and requirement IDs (REQ-/FR-/US-…).
- HTML/Markdown are sanitized with DOMPurify before render.
- Per project, `byProject[pid].modules` (each module's BRS metadata + items +
  sprints) is persisted; document file blobs live in memory only (`documents`),
  so after a reload the requirements persist and the doc is re-uploaded to view.
  A real backend stores the files.
