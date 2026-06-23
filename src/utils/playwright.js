import { slugify, shortTitle, escapeJsString } from './format';

/**
 * Build a Playwright .spec.js file from a single bug row.
 * Returns { fileName, content }.
 */
export function buildTestFromBug(bug = {}) {
  const id = bug.id || 'BUG';
  const portal = bug.portal || 'portal';
  const description = bug.description || '';
  const title = shortTitle(description) || `${id} regression`;

  const descComment = description
    .split('\n')
    .map(line => ` * ${line}`.trimEnd())
    .join('\n');

  const fileName = `${slugify(`${id}-${title}`)}.spec.js`;

  const content = `import { test, expect } from '@playwright/test';

/**
 * Bug ${id} — ${portal} portal
 * Issue Description:
${descComment}
 */
test('${escapeJsString(`${id} — ${title}`)}', async ({ page }) => {
  // 1. Arrange — open the page under test.
  await page.goto('/');

  // 2. Act — reproduce the reported steps.
  // TODO: translate the issue description above into concrete actions, e.g.
  // await page.getByRole('button', { name: 'Submit' }).click();

  // 3. Assert — confirm the bug is fixed.
  // TODO: replace with the real expectation.
  await expect(page).toHaveTitle(/.*/);
});
`;

  return { fileName, content };
}

/**
 * Build a Playwright .spec.js file from the manual step builder.
 * steps: [{ type, selector, value }]
 */
export function buildTestFromSteps({ name, baseUrl, steps = [] }) {
  const testName = name || 'manual test';
  const fileName = `${slugify(testName)}.spec.js`;

  const lines = [];
  if (baseUrl) {
    lines.push(`  await page.goto('${escapeJsString(baseUrl)}');`);
  }
  for (const step of steps) {
    const sel = escapeJsString(step.selector || '');
    const val = escapeJsString(step.value || '');
    switch (step.type) {
      case 'goto':
        lines.push(`  await page.goto('${val || sel}');`);
        break;
      case 'click':
        lines.push(`  await page.locator('${sel}').click();`);
        break;
      case 'fill':
        lines.push(`  await page.locator('${sel}').fill('${val}');`);
        break;
      case 'expectVisible':
        lines.push(`  await expect(page.locator('${sel}')).toBeVisible();`);
        break;
      case 'expectText':
        lines.push(`  await expect(page.locator('${sel}')).toHaveText('${val}');`);
        break;
      default:
        break;
    }
  }
  if (!lines.length) {
    lines.push('  // TODO: add steps');
  }

  const content = `import { test, expect } from '@playwright/test';

test('${escapeJsString(testName)}', async ({ page }) => {
${lines.join('\n')}
});
`;

  return { fileName, content };
}

/**
 * Build a ready-to-paste prompt from a bug — the "auto prompt" the user can
 * copy into an AI tool to generate or refine the test.
 */
export function buildPrompt(bug = {}) {
  return [
    `Write a Playwright test (JavaScript) that reproduces and verifies the fix for this bug.`,
    ``,
    `Bug ID: ${bug.id || 'N/A'}`,
    `Portal: ${bug.portal || 'N/A'}`,
    `Issue Description:`,
    bug.description || '(none)',
    ``,
    `Requirements:`,
    `- Use @playwright/test.`,
    `- Include clear arrange / act / assert sections.`,
    `- Add an assertion that fails before the fix and passes after.`,
  ].join('\n');
}
