# Module: Shared UI

**Files:** `src/components/**`, registered globally in `src/main.js`

## Purpose
Reusable components matching the `icoms-external-portal` style so views compose
the same way (no per-view imports for these).

## Components
- ✅ `PageHeader` — title/subtitle/icon + actions slot
- ✅ `Card` — bordered content card with optional header slot
- ✅ `FormButton` — variant vocabulary (primary/green/red/yellow/line-*)
- ✅ `Badge` — tonal status chip
- ✅ `DataTable` — `columns` config (key/title/formatter/badge/badgeEval/minWidth)
  + `#cell-<key>` and `#actions` slots
- ✅ `Tabs` — `tabs` array + `v-model` + optional badges
- ✅ `AppTopbar`, `AppSidebar`, `DefaultLayout` — app shell
- ✅ `AppToast` — global snackbar bound to the toast store

## Requirements
- ✅ Globally registered, used in views without imports (Sprint 1)
- ✅ Vuetify-backed, reference-style prop APIs and USAGE doc-comments (Sprint 1)
