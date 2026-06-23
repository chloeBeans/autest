# Module: Add test (builder)

**Route:** `/add-test` · **View:** `src/views/AddTestView.vue` ·
**Utils:** `src/utils/playwright.js`

## Purpose
Author a Playwright test from the UI by composing steps — for cases without a
bug row or recording.

## Requirements
- ✅ Test name + base URL inputs (Sprint 1)
- ✅ Add/remove ordered steps: goto, click, fill, expect visible, expect text (Sprint 1)
- ✅ Live generated spec preview (Sprint 1)
- ✅ Choose target portal and save into its `tests/` folder (or download) (Sprint 1)

## Notes
- `buildTestFromSteps` in `src/utils/playwright.js` renders the spec.
