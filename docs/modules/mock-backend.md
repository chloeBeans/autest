# Module: Mock backend

**Files:** `src/api/index.js`, `src/api/mock/index.js`, `src/api/fixes.js`

## Purpose
Provide a backend seam so the portal runs with no server now, and a real backend
can be dropped in later without touching the views.

## Requirements
- ✅ Single `request(method, url, body)` entry point (Sprint 1)
- ✅ In-app mock adapter resolves canned responses with a delay (Sprint 1)
- ✅ `POST /fixes/analyze` → confidence + draft spec + note (Sprint 1)
- ✅ `POST /fixes/commit` → mock commit hash + message (Sprint 1)
- ✅ `VITE_USE_MOCK=false` switches to real HTTP via the `/api` proxy (Sprint 1)
- 🔜 Real endpoints: run tests, real git commit (Sprint 2)

## Notes
- API modules (`src/api/*.js`) are transport-agnostic — only `request()` changes.
- See [../ARCHITECTURE.md](../ARCHITECTURE.md).
