# Writing test IDs

Stable selectors are the single biggest thing that makes Playwright generation
and authoring reliable. This guide is also shown in-app on the **Tests → Test IDs**
tab.

## The rule

- **Locate by `data-testid`.** Don't locate by visible text/labels — they change
  with copy edits and language (EN ↔ BM), which silently breaks tests.
- **Assert on the visible label/value.** That's the behaviour you're verifying.
- `data-testid` is Playwright's default `testIdAttribute`, so `page.getByTestId('x')`
  works with no extra config.

```js
await page.getByTestId('status-badge').click();        // selection: stable id
await expect(page.getByTestId('status-badge'))
  .toHaveText('Approved');                              // assertion: visible value
```

## Naming convention

`module-screen-element[-qualifier]`, kebab-case. Examples:

| Element | Test ID |
| --- | --- |
| Login submit button | `login-submit` |
| Username field | `login-username` |
| A listing table | `registration-list-table` |
| One row (by record key) | `registration-list-row-REG-1023` |
| Edit action on that row | `registration-list-edit-REG-1023` |

Keep IDs **authored and stable** — treat a `data-testid` as a public contract;
don't rename it casually.

## How to add a test ID

### 1. Inline
```html
<button data-testid="login-submit">Sign in</button>
<input data-testid="login-username" />
```

### 2. Reusable component prop (instrument once)
Add a `testId` prop to a shared component and forward it to the **real** inner
element (the actual `<button>`/`<input>`, not the wrapper):

```vue
<script setup>
defineProps({ testId: { type: String, default: null } });
</script>

<template>
  <button :data-testid="testId"><slot /></button>
</template>
```
```html
<FormButton testId="employer-registration-submit">Submit</FormButton>
```

> Vuetify note: when binding `:data-testid` on `v-text-field` / `v-select`,
> Vuetify forwards it onto the inner `<input>`, so `getByTestId(id).fill()` works.

### 3. Table rows — stable key, never the index
Derive row IDs from a **business key** so they survive sort / filter / pagination:

```vue
<!-- GOOD -->
<tr v-for="row in rows" :key="row.id"
    :data-testid="`registration-list-row-${row.refNo}`">
  <td>
    <button :data-testid="`registration-list-edit-${row.refNo}`">Edit</button>
  </td>
</tr>

<!-- BAD: index shifts when the list reorders -> flaky -->
<tr :data-testid="`row-${index}`">...</tr>
```
If a table has no stable key, skip row IDs and scope by the table's `data-testid`
plus cell text instead.

## What test IDs don't do

They make **selection** reliable, not **assertions**. You still write the
"it actually worked" checks, cover error/empty states, and avoid index-based IDs.
For assertions on translated text, pin a locale or assert a known value so
EN ↔ BM doesn't make them flaky.
