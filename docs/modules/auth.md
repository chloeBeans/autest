# Module: Auth & users

**Views:** `src/views/LoginView.vue` · **Stores:** `src/store/{auth,users}.js` ·
**Guard:** `src/router/index.js`

## Purpose
Identify who is logged in (and who picks up a bug). Roles gate admin features.

## Requirements
- ✅ Login with username/password against a seeded user list (Sprint 1)
- ✅ Roles: `admin` | `user`; `isAdmin` getter gates admin UI (Sprint 1)
- ✅ Route guard: unauthenticated → `/login`; authenticated skip `/login` (Sprint 1)
- ✅ Topbar shows current user + role + logout (Sprint 1)
- ✅ Admin can add users (Settings → Users) (Sprint 1)
- 🔜 Real `/auth/login` backend + hashed passwords (Sprint 2)

## Seeded logins (mock)
`admin/admin` (admin), `qa1/qa1`, `qa2/qa2`, `dev1/dev1` (users).

## Notes
- `users` store is the mock data layer (persisted, plain passwords — mock only).
- `auth.login()` validates against it; swap to a backend later without changing
  call sites.
