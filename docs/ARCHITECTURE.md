# Architecture — real vs mock

## What runs purely in the browser (no backend)

- Import & parse CSV/XLSX bug lists (SheetJS).
- List/filter bugs by portal and environment.
- Connect local folders and **write test files into them** (File System Access API).
- Generate Playwright specs from a bug, from manual steps, or from a recording.
- Upload & view a BRS, auto-extract requirements, track sprints.

## What needs a backend (currently mocked)

These go through one seam — `src/api/index.js` → `request()`:

| Capability | Mock now | Real later |
| --- | --- | --- |
| Analyze bug → confidence + draft test | heuristic in `src/api/mock` | LLM / service |
| Commit fix | fake commit hash | real `git commit` on the connected repo |
| Run Playwright | not run in-browser | Node runner streams pass/fail |

Switch to a real backend by setting `VITE_USE_MOCK=false`; calls then go over
HTTP to the `/api` proxy in `vite.config.js`. The `src/api/*.js` modules do not
change — only the transport behind `request()`.

## "If I pick a directory from the website, can I still edit the code locally?"

**Yes.** The File System Access API returns a handle to the **real folder on
your disk**. Files the portal writes (e.g. `tests/BUG-101.spec.js`) are the
actual project files. You can keep editing them in VS Code at the same time —
both the portal and your editor operate on the same files.

Caveat: the portal writes **whole files**. If the portal writes a file while you
have unsaved local edits to that exact file, the portal's version wins. It only
ever touches files it creates under `tests/`, so day-to-day editing is safe.

## Confident → commit, doubt → note

When a bug is analyzed:

- **High confidence** → the spec can be saved and the fix **auto-committed**
  (mock commit hash for now). Status becomes `Committed`.
- **Low confidence** → no commit. A description is written into the bug's
  **Notes / Doubts** column and status becomes `Needs review`, so a human can
  look before anything lands.

## Data model note (backend-ready)

Bugs carry both `portal` (external/internal) and `env` (dev/sit/uat) so they can
be listed together or separated on either axis. Records keep their original
`raw` row, so a future backend can persist and re-sync without losing columns.
