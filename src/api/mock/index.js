import { CONFIDENCE } from '@/utils/constants';
import { buildTestFromBug } from '@/utils/playwright';

/**
 * In-app mock backend. Each handler simulates a server endpoint and returns
 * the shape a real backend would. Swap for real HTTP by setting
 * VITE_USE_MOCK=false (see src/api/index.js).
 */

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));

// Words in a bug description that make an automated fix uncertain.
const DOUBT_HINTS = [
  'sometimes',
  'intermittent',
  'occasionally',
  'random',
  'not sure',
  'unclear',
  'unable to reproduce',
  'cannot reproduce',
  'flaky',
  'maybe',
  '?',
];

function assessConfidence(description = '') {
  const text = description.toLowerCase();
  const hit = DOUBT_HINTS.find(h => text.includes(h));
  if (hit || description.trim().length < 15) {
    return {
      confidence: CONFIDENCE.LOW,
      reason: hit
        ? `Description mentions "${hit.trim()}", so the reproduction is uncertain.`
        : 'Description is too short to derive reliable steps.',
    };
  }
  return { confidence: CONFIDENCE.HIGH, reason: 'Clear, reproducible description.' };
}

const handlers = {
  // Analyze a bug: decide confidence, draft a Playwright test, and (when
  // uncertain) return a note the UI drops into the bug's "Notes / Doubts" column.
  'POST /fixes/analyze': async ({ bug }) => {
    await delay();
    const { confidence, reason } = assessConfidence(bug?.description);
    const test = buildTestFromBug(bug);
    return {
      confidence,
      summary: reason,
      suggestedTest: test.content,
      suggestedFileName: test.fileName,
      // Only populated when we are NOT confident — the UI shows this instead of committing.
      note: confidence === CONFIDENCE.LOW ? `Needs human review: ${reason}` : '',
    };
  },

  // Simulate committing a generated fix/test to the connected repo.
  'POST /fixes/commit': async ({ bugId, fileName }) => {
    await delay();
    const hash = Math.random().toString(16).slice(2, 9);
    return {
      committed: true,
      commitHash: hash,
      message: `test(${bugId}): add Playwright spec ${fileName} [mock commit]`,
    };
  },
};

export async function mockHandle(method, url, body) {
  const key = `${method.toUpperCase()} ${url}`;
  const handler = handlers[key];
  if (!handler) {
    throw new Error(`[mock] No handler for ${key}`);
  }
  return handler(body || {});
}
