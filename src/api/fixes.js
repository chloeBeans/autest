import { request } from './index';

/**
 * Analyze a bug and draft a Playwright test.
 * @returns {Promise<{confidence, summary, suggestedTest, suggestedFileName, note}>}
 */
export function analyzeBug(bug) {
  return request('POST', '/fixes/analyze', { bug });
}

/**
 * Commit a generated test/fix. Mocked for now (no real git from the browser).
 * @returns {Promise<{committed, commitHash, message}>}
 */
export function commitFix({ bugId, fileName }) {
  return request('POST', '/fixes/commit', { bugId, fileName });
}
