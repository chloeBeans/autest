# Module requirement docs

One file per module. Each lists the module's requirements with status and the
sprint it belongs to. **Update the relevant file whenever its module changes.**

| Module | Doc |
| --- | --- |
| Auth & users | [modules/auth.md](modules/auth.md) |
| Projects & membership | [modules/projects.md](modules/projects.md) |
| Bugs (import + manual + pick-up) | [modules/bug-list.md](modules/bug-list.md) |
| Generate test (analyze / commit / notes) | [modules/generate-test.md](modules/generate-test.md) |
| Tests (record / drag-drop / code) | [modules/tests.md](modules/tests.md) |
| BRS | [modules/brs.md](modules/brs.md) |
| Settings (+ admin area) | [modules/settings.md](modules/settings.md) |
| Mock backend | [modules/mock-backend.md](modules/mock-backend.md) |
| Shared UI | [modules/shared-ui.md](modules/shared-ui.md) |

Status legend: ✅ done · 🔜 planned · 🚧 in progress.
Sprint due dates live in [BRS-TRACKING.md](BRS-TRACKING.md).

## Guides
- [testing/test-ids.md](testing/test-ids.md) — how to write `data-testid` for
  reliable Playwright tests (also shown in-app on Tests → Test IDs).
