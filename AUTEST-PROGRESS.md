# Autest on Vben — progress & handoff

Status snapshot for continuing on another machine. Autest (bug & test automation
portal) has been rebuilt on **Vue Vben Admin** (`apps/web-antd`, pnpm/turbo
monorepo, TypeScript, Ant Design Vue) with a fully **client-side data layer**
(no backend / Nitro mock).

## Run it
```bash
pnpm install
pnpm dev:antd            # or: cd apps/web-antd && pnpm dev
```
Login (mock, seeded): `admin/admin` (admin) · `qa1/qa1` · `qa2/qa2` · `dev1/dev1`.
The **Autest** menu appears in the sidebar (Dashboard / Bugs / Tests / BRS / Setup).

## Verify (source of truth — not the IDE)
```bash
cd apps/web-antd
pnpm typecheck          # vue-tsc --noEmit --skipLibCheck   (must be clean)
pnpm exec eslint "src/views/autest/**/*.vue" "src/router/routes/modules/autest.ts"
```

---

## ✅ Completed

### Data layer (pre-existing, ported to TS)
- Stores (pinia setup, persisted): `src/store/{auth,accounts,projects,bugs,brs,folders}.ts`
- Utils: `src/utils/{constants,format,spreadsheet,playwright,recorder,fileSystem,brs,toast}.ts`
- Types: `src/types/domain.ts` · Locale keys: `src/locales/langs/en-US/autest.json`
- Auth integrates with Vben's `useUserStore` / `useAccessStore` (mock token).

### UI built this round (`apps/web-antd/src/...`)
- **Route/menu module** — `router/routes/modules/autest.ts` (auto-registers via glob).
- **Dashboard** — `views/autest/dashboard/index.vue` (counts, getting-started, folder status).
- **Bugs** — `views/autest/bugs/index.vue` + `components/add-bug-modal.vue` + `components/import-modal.vue`
  (Ant table, portal/env filters, search, pick-up, generate-test → writes spec to folder/downloads;
  Add Bug; Import CSV/XLSX with column mapping).
- **Setup** — `views/autest/setup/index.vue` (portal folders connect/reconnect via File System Access;
  admin: add/list projects, add/list users, **scalable membership** with searchable multi-add + filterable table).
- **BRS** — `views/autest/brs/index.vue` (multiple BRS per project: select/add/remove; viewer for
  PDF/DOCX/MD/TXT; requirement tracker with sprint AutoComplete, status, completed date; sprint due dates).
- **Tests** — `views/autest/tests/index.vue` (4 tabs on Ant `Tabs`/`TabPane`):
  - **Record**: live `npx playwright codegen` command (copy), draggable bookmarklet, `Collapse`
    with full recorder snippet (copy) — from `#/utils/recorder`.
  - **Build (drag & drop)**: native HTML5 drag-to-reorder step rows (type/selector/value + delete),
    live spec preview via `buildTestFromSteps` (`#/utils/playwright`).
  - **Code**: raw spec editor (`Textarea` `auto-size`).
  - **Test IDs**: in-app guide + 4 copyable examples (inline / component-prop / stable table keys /
    Playwright usage).
  - Save: `folderStore.handleFor(portal)` → `writeFile(handle, 'tests', …)` else `downloadTextFile`.
  - New i18n keys under `autest.tests` (savePortal/saveToFolder/notConnected/selector/stepValue)
    and `autest.record` (showSnippet/dragHint). Adversarially reviewed (clipboard error handling +
    editor auto-grow) and verified.

All of the above: **typecheck ✅ · eslint ✅**.

---

## 🔜 Next steps (in order)

### 1. Topbar project switcher + selection on login
- Add a switcher (dropdown of `projectStore.myProjects`) into the Vben layout header
  (header slot/widget) to set `projectStore.currentProjectId` via `selectProject`.
- Call `projectStore.ensureValidSelection()` after login — hook into `auth.ts`
  `fetchUserInfo()` (or a router guard) so a user lands on a project they belong to.
  Currently `currentProjectId` is fixed to the seeded `proj_icoms`.

### 2. (Optional) Generate-test confidence flow
Old version had an analyze step (confidence high → commit-mock, low → Notes/Doubts).
Not ported. Bugs "Generate test" currently builds a spec from the template directly.
If wanted, add an analyze modal + wire `bug.confidence` / `bug.note`.

---

## Conventions & gotchas (read before editing on the other machine)
- **View shape**: `<script lang="ts" setup>`; page wrapper `<Page>` from `@vben/common-ui`;
  Ant components imported from `ant-design-vue`; i18n `$t('autest.*')` from `#/locales`.
- **Template parser gotcha (bit us twice)**: do **NOT** put TS `as` casts or typed
  arrow params `(x: Type) =>` inside template expressions — `vue-eslint-parser` throws
  `Unexpected token as` / `:`. Put the cast/typed handler in `<script>` and call it
  (e.g. handlers take `value: unknown` and cast inside). Define `rowKey` functions in
  script, not inline.
- **Ant Table** `#bodyCell` `record` is `Record<string, any>` — cast at the call site
  in script (param `unknown`, or `record as XRecord`).
- **SFC block-scan gotcha (Tests view)**: a literal `</script>` anywhere in the
  `<script>` block — even inside a **JS comment or string** — ends the SFC block early
  (`@vue/compiler-sfc` reads `<script>` as raw text). For code samples that contain
  `</script>` (the Test IDs guide), split it: `` `…<${'/script>'}` ``. Literal `${…}`
  inside single-quoted example strings trips `no-template-curly-in-string`; wrap with
  `/* eslint-disable no-template-curly-in-string */`.
- **Ant Select with a union-typed model**: bind `:value` + `@change` (handler casts),
  not `v-model:value` — `v-model` writes the wide `SelectValue` back into the narrow
  union and vue-tsc errors. Plain `string`/`string[]` refs are fine with `v-model:value`.
- **IDE false positives**: editor may show `Cannot find module '#/...'`. Ignore — the
  CLI `pnpm typecheck` (vue-tsc) resolves the `#/*` path map (= `apps/web-antd/src`).
  `@vben/*` = workspace packages.
- **Stores**: pinia setup stores, persisted via `persist: { pick: [...] }`. Current
  user from `useUserStore` (`@vben/stores`). `projectStore.isAdmin` gates admin UI.
  Everything is scoped per project via `byProject` slices keyed by `currentProjectId`.

## Git rule (project policy)
- **Do not commit before the user reviews. Never `git push`** (a hook blocks it; the
  user pushes). **No `Co-Authored-By` trailer** in commit messages.
- On finishing a change, propose a commit message; the user reviews, commits, pushes.

### Suggested commits so far (review, then commit yourself)
```
feat(autest): wire UI — menu + Dashboard + Bugs on Ant/Vben
feat(autest): build Setup view (folders + admin)
feat(autest): build BRS view (multiple BRS, viewer, requirement tracker)
docs(autest): add progress/handoff notes
```
