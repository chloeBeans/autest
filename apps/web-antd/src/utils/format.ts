/** Convert arbitrary text into a safe kebab-case slug for file names. */
export function slugify(text: string, fallback = 'bug'): string {
  const slug = String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || fallback;
}

/** Short single-line title from a longer description. */
export function shortTitle(text: string, max = 60): string {
  const line = (String(text || '').split('\n')[0] ?? '').trim();
  return line.length > max ? `${line.slice(0, max)}…` : line;
}

/** Escape a string so it can sit safely inside a JS single-quoted literal. */
export function escapeJsString(text: string): string {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

/** Short random unique id, optionally prefixed. */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
