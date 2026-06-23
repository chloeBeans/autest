import { mockHandle } from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/**
 * Single seam between the frontend and "the backend".
 *
 * Right now every call is served by the in-app mock adapter (./mock) so the
 * portal runs with no separate server. When a real backend exists, set
 * VITE_USE_MOCK=false and these calls go out over HTTP to the /api proxy
 * configured in vite.config.js — the api/*.js modules do not change.
 */
export async function request(method, url, body) {
  if (USE_MOCK) {
    return mockHandle(method, url, body);
  }

  const res = await fetch(`/api${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const isMock = USE_MOCK;
