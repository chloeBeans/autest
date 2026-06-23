# BRS / Feature tracking

Treating Autest's own feature set as the BRS. Each requirement is marked done or
assigned to a sprint. **Dates are placeholders — adjust to your real calendar.**

## Sprints

| Sprint | Due date | Focus |
| --- | --- | --- |
| Sprint 1 | 2026-06-23 | MVP portal (frontend-only + mock backend) |
| Sprint 2 | 2026-07-07 | Real backend: run Playwright, real commits |
| Sprint 3 | 2026-07-21 | AI generation, live Sheet import, auth |

## Requirements

| # | Requirement | Status | Sprint | Completed |
| --- | --- | --- | --- | --- |
| R1 | Import bug list from CSV/XLSX with column auto-mapping | ✅ Done | Sprint 1 | 2026-06-23 |
| R2 | List bugs together or separated by portal (External/Internal) | ✅ Done | Sprint 1 | 2026-06-23 |
| R3 | Separate bugs by environment (DEV/SIT/UAT) | ✅ Done | Sprint 1 | 2026-06-23 |
| R4 | Connect local portal folders (File System Access) | ✅ Done | Sprint 1 | 2026-06-23 |
| R5 | Auto-build a prompt from the Issue Description column | ✅ Done | Sprint 1 | 2026-06-23 |
| R6 | Generate Playwright spec from a bug and write to folder | ✅ Done | Sprint 1 | 2026-06-23 |
| R7 | Confident → commit; doubt → Notes/Doubts column | ✅ Done (commit mocked) | Sprint 1 | 2026-06-23 |
| R8 | Manual Playwright test builder (UI) | ✅ Done | Sprint 1 | 2026-06-23 |
| R9 | Record tester interactions → Playwright (codegen + bookmarklet) | ✅ Done | Sprint 1 | 2026-06-23 |
| R10 | Upload & view BRS (PDF/DOCX/MD/TXT) | ✅ Done | Sprint 1 | 2026-06-23 |
| R11 | Auto-list BRS requirements | ✅ Done | Sprint 1 | 2026-06-23 |
| R12 | Track requirements by sprint with due dates + completed dates | ✅ Done | Sprint 1 | 2026-06-23 |
| R13 | Mock backend behind a switchable `src/api` seam | ✅ Done | Sprint 1 | 2026-06-23 |
| R14 | Per-module requirement docs | ✅ Done | Sprint 1 | 2026-06-23 |
| R22 | Login + roles (mock, seeded users) | ✅ Done | Sprint 1 | 2026-06-24 |
| R23 | Multi-project + per-project scoping | ✅ Done | Sprint 1 | 2026-06-24 |
| R24 | Admin manages projects, users, and membership | ✅ Done | Sprint 1 | 2026-06-24 |
| R25 | Users see only assigned projects | ✅ Done | Sprint 1 | 2026-06-24 |
| R26 | Bugs: add manually + pick-up (who took the bug) | ✅ Done | Sprint 1 | 2026-06-24 |
| R27 | Merge import into the Bugs menu | ✅ Done | Sprint 1 | 2026-06-24 |
| R28 | Unified Tests menu (record / drag-drop / code) | ✅ Done | Sprint 1 | 2026-06-24 |
| R29 | Portal folders in Settings (linked from dashboard) | ✅ Done | Sprint 1 | 2026-06-24 |
| R30 | Shared git rule (committed CLAUDE.md + .claude/settings.json hook) | ✅ Done | Sprint 1 | 2026-06-24 |
| R15 | Real backend: execute `npx playwright test`, stream results | 🔜 Planned | Sprint 2 | — |
| R16 | Real git commit of confident fixes | 🔜 Planned | Sprint 2 | — |
| R17 | Persist folder handles across reloads (IndexedDB) | 🔜 Planned | Sprint 2 | — |
| R18 | PDF text auto-extraction (pdf.js) | 🔜 Planned | Sprint 2 | — |
| R19 | AI-generate tests from Issue Description | 🔜 Planned | Sprint 3 | — |
| R20 | Live Google Sheet import (shared link) | 🔜 Planned | Sprint 3 | — |
| R21 | Auth / multi-user | 🔜 Planned | Sprint 3 | — |
