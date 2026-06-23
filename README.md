# Autest — Bug & Test Automation Portal

A Vue 3 portal that turns a QA bug list into Playwright tests. Import a bug list
(CSV/XLSX), connect the **External** and **Internal** portal folders on your
disk, then generate / record Playwright tests straight into those folders. Also
tracks BRS (Business Requirements Specification) requirements by sprint.

Built to match the conventions of `icoms-external-portal`
(Vue 3 + Vite + Vuetify + Pinia + vue-router + vue-i18n).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run lint
npm run format
```

> Folder writing uses the **File System Access API** — use **Chrome or Edge**.

## What it does

| Module | What it does |
| --- | --- |
| **Import** | Upload a CSV/XLSX bug list, auto-map columns, list bugs. |
| **Bug List** | Bugs split by portal (External/Internal) **and** environment (DEV/SIT/UAT), with Confidence and Notes/Doubts columns. |
| **Folders** | Connect the real External/Internal project folders from your PC. |
| **Generate Test** | Analyze a bug, draft a Playwright spec, save it into the folder; confident fixes auto-commit (mock), uncertain ones write a note. |
| **Record** | Record real tester interactions into a Playwright test (codegen command + in-browser recorder). |
| **Add Test** | Build a Playwright test from steps in the UI. |
| **BRS** | Upload + view a BRS, auto-list requirements, track by sprint with due dates and completed dates. |

## Architecture (real vs mock)

Everything except *running* tests works in the browser with no backend. The
parts that need a server (executing Playwright, real git commits, AI generation)
go through a single `src/api` seam that currently uses an **in-app mock**. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Docs

- [docs/README.md](docs/README.md) — module requirement docs index
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — real vs mock, File System Access
- [docs/BRS-TRACKING.md](docs/BRS-TRACKING.md) — feature tracker (done / sprint)
