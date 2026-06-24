# Module: Auth & users

**Views:** `apps/web-antd/src/views/_core/authentication/login.vue` ·
**Stores:** `apps/web-antd/src/store/{auth,accounts}.ts` ·
**Guard:** Vben router access guard

## Purpose
Identify who is logged in (and who picks up a bug). Roles gate admin features.

## Requirements
- ✅ Login with username/password against a seeded user list (Sprint 1)
- ✅ Roles: `admin` | `user`; `isAdmin` getter gates admin UI (Sprint 1)
- ✅ Route guard: unauthenticated → `/login`; authenticated skip `/login` (Sprint 1)
- ✅ After login, land on the Autest dashboard (`/autest/dashboard`), not the
  Vben `/analytics` demo (Sprint 1)
- ✅ Topbar shows current user + role + logout (Sprint 1)
- ✅ Admin can add users (Settings → Users) (Sprint 1)
- 🔜 Real `/auth/login` backend + hashed passwords (Sprint 2)

## Seeded logins (mock)
`admin/admin` (admin), `qa1/qa1`, `qa2/qa2`, `dev1/dev1` (users).

## Notes
- Post-login landing is `DEFAULT_HOME_PATH` (`/autest/dashboard`) from
  `@vben/constants`. The guard, `auth` store, and root `/` redirect read this
  constant directly instead of `preferences.app.defaultHomePath`: preferences are
  cached in localStorage and merged first-wins (`defu`), so a stale cached value
  would otherwise keep sending users to the old `/analytics` default. Deep-link
  return (`?redirect=…`) still takes priority when present.
- `accounts` store is the mock data layer (persisted, plain passwords — mock only).
- `auth.authLogin()` validates against it; swap to a backend later without changing
  call sites.
- Login page is a quick-select + username/password form. The "Select account"
  dropdown is sourced from the `accounts` store (not the stock Vben demo list,
  which filled non-existent `vben`/`jack`/`123456` and broke login); picking an
  account auto-fills its real username + password. The stock slider captcha was
  removed, and the alternate login methods are hidden via props
  (`show-third-party-login`, `show-code-login`, `show-qrcode-login`,
  `show-register`, `show-forget-password` = `false`).
