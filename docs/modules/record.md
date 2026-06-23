# Module: Record test

**Route:** `/record` · **View:** `src/views/RecordView.vue` ·
**Utils:** `src/utils/recorder.js`

## Purpose
Let testers **record** real interactions instead of hand-writing 1000s of tests.

## Requirements
- ✅ Generate a `npx playwright codegen <url> -o tests/<name>.spec.js` command
  with copy button (Sprint 1)
- ✅ Target URL + test name inputs feed the command/output path (Sprint 1)
- ✅ In-browser recorder as a draggable bookmarklet (no terminal) (Sprint 1)
- ✅ Recorder snippet viewable + copyable for console paste (Sprint 1)
- 🔜 One-click record (backend spawns codegen) (Sprint 2)

## How it works
- **Codegen** (recommended): Playwright's own recorder opens a real browser and
  writes every action into a spec automatically.
- **Bookmarklet**: injects a small recorder into the running app; it captures
  clicks/inputs, builds Playwright steps live, and copies them out.
