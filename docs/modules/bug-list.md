# Module: Bug list

**Route:** `/bugs` · **View:** `src/views/BugListView.vue` ·
**Store:** `src/store/bugs.js`

## Purpose
Show imported bugs together or separated by portal and environment, and drive
test generation per bug.

## Requirements
- ✅ List all bugs in a DataTable (Sprint 1)
- ✅ Filter by portal: All / External / Internal (Sprint 1)
- ✅ Filter by environment: All / DEV / SIT / UAT (Sprint 1)
- ✅ Free-text search over ID + description (Sprint 1)
- ✅ Show Status, Confidence and Notes/Doubts columns (Sprint 1)
- ✅ Open the Generate Test dialog per row (Sprint 1)
- ✅ Counts per portal and per environment (Sprint 1)

## Data model
`{ key, id, portal, env, description, raw, status, confidence, note, generatedFile, commitHash }`

- `portal`: `external` | `internal`
- `env`: `dev` | `sit` | `uat`
- `status`: `new | analyzed | generated | committed | needs_review`
- `confidence`: `high | low | unknown`
