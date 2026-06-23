# Module: Generate test (analyze / commit / notes)

**Component:** `src/components/dialog/GenerateTestDialog.vue` ·
**API:** `src/api/fixes.js` · **Utils:** `src/utils/playwright.js`

## Purpose
Turn one bug into a Playwright test, and route the result by confidence.

## Requirements
- ✅ "Copy prompt" builds a ready-to-paste AI prompt from the description (Sprint 1)
- ✅ "Analyze" returns confidence + a drafted spec (mock backend) (Sprint 1)
- ✅ Editable spec preview before saving (Sprint 1)
- ✅ Save spec into the connected folder's `tests/` (or download fallback) (Sprint 1)
- ✅ High confidence → commit fix (mock hash) → status `Committed` (Sprint 1)
- ✅ Low confidence → write description to Notes/Doubts → status `Needs review` (Sprint 1)
- 🔜 Real commit + real test run (Sprint 2)
- 🔜 AI-authored spec (Sprint 3)

## Notes
- Confidence heuristic + draft live in `src/api/mock/index.js`.
- `buildTestFromBug` / `buildPrompt` in `src/utils/playwright.js`.
