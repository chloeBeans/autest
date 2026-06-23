# Autest — working rules

These rules apply to **everyone working on this repo, on every machine** (humans
and AI assistants alike). They are committed so each clone gets them. The
`git push` guard is enforced by a committed hook in
[`.claude/settings.json`](.claude/settings.json).

## Git workflow (hard rules)

1. **Never commit before the user has checked the work.** Finish the change,
   report what was done, and stop. Do **not** run `git commit` until the user
   has reviewed and explicitly says to commit.
2. **After the user checks**, the commit message is written (using the format the
   user provides — until then, propose a recommended message) and the commit is
   made only on the user's go-ahead.
3. **The assistant never pushes.** `git push` is blocked by the committed
   PreToolUse hook. Only a human pushes.
4. On completing any change, **write a recommended commit message** and
   **remind the user to review before committing and pushing.**

## Other conventions
- Keep `docs/modules/*` requirement docs and `docs/BRS-TRACKING.md` up to date
  with every change.
- Match the code style of `icoms-external-portal/src/views` (globally-registered
  PageHeader / Card / FormButton / DataTable / Tabs / Badge; `columns = computed`).
- Backend is mocked behind `src/api` (`VITE_USE_MOCK`) until the real one exists.
