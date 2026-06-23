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

## Accounts & projects

Log in (mock, seeded users) — everything is scoped to the **project** you select
in the topbar. Admins manage projects, users, and membership in **Settings**.

Demo logins: `admin/admin` (admin), `qa1/qa1`, `qa2/qa2`, `dev1/dev1`.

## What it does

| Menu | What it does |
| --- | --- |
| **Dashboard** | Overview, per-project status, getting-started links. |
| **Bugs** | Import CSV/XLSX **or** add manually; split by portal (External/Internal) **and** environment (DEV/SIT/UAT); **pick up** bugs (who took it); Confidence + Notes/Doubts; generate a Playwright test (confident → commit [mock], doubt → note). |
| **Tests** | One place to author tests: **Record** (codegen + bookmarklet), **Build** (drag & drop steps), or **Code** — saved into the connected folder. |
| **BRS** | Upload + view a BRS, auto-list requirements, track by sprint with due dates and completed dates. |
| **Settings** | Connect per-project External/Internal folders; language; **admin**: projects, users, membership. |

## Architecture (real vs mock)

Everything except *running* tests works in the browser with no backend. The
parts that need a server (executing Playwright, real git commits, AI generation)
go through a single `src/api` seam that currently uses an **in-app mock**. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Docs

- [docs/README.md](docs/README.md) — module requirement docs index
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — real vs mock, File System Access
- [docs/BRS-TRACKING.md](docs/BRS-TRACKING.md) — feature tracker (done / sprint)
