import type { Bug, ColumnMapping, ParsedSheet } from '#/types/domain';

import * as XLSX from 'xlsx';

import { BUG_FIELDS, COLUMN_HINTS } from './constants';

/**
 * Parse a CSV/XLSX file into one or more sheets.
 */
export async function parseSpreadsheet(file: File): Promise<ParsedSheet[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  return wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    if (!ws) return { name, columns: [] as string[], rows: [] };
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: '',
      raw: false,
    });
    const columns = rows.length > 0 ? Object.keys(rows[0] ?? {}) : [];
    return { name, columns, rows };
  }).filter((sheet) => sheet.rows.length > 0);
}

/** Normalize a header for matching: lowercased, trimmed, first line only. */
function normalizeHeader(c: unknown): string {
  const [first = ''] = String(c).toLowerCase().trim().split('\n');
  return first.trim();
}

function matchColumn(
  columns: string[],
  fieldKey: string,
  mode: 'both' | 'contains' | 'exact',
): null | string {
  const hints = COLUMN_HINTS[fieldKey] || [];
  const lower = columns.map((c) => ({ raw: c, low: normalizeHeader(c) }));
  if (mode !== 'contains') {
    for (const hint of hints) {
      const exact = lower.find((c) => c.low === hint);
      if (exact) return exact.raw;
    }
  }
  if (mode !== 'exact') {
    for (const hint of hints) {
      const partial = lower.find((c) => c.low.includes(hint));
      if (partial) return partial.raw;
    }
  }
  return null;
}

/** Best-effort auto-detect a column name from a field's header hints. */
export function detectColumn(
  columns: string[],
  fieldKey: string,
): null | string {
  return matchColumn(columns, fieldKey, 'both');
}

/**
 * Auto-map every bug field to a column by header hints. Two global passes —
 * exact matches first, then "contains" — so a loose substring match for an
 * earlier field never steals a column that a later field matches exactly.
 */
export function autoMap(columns: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const taken = new Set<string>();
  for (const mode of ['exact', 'contains'] as const) {
    for (const field of BUG_FIELDS) {
      if (mapping[field.key]) continue;
      const available = columns.filter((c) => !taken.has(c));
      const col = matchColumn(available, field.key, mode);
      if (col) {
        mapping[field.key] = col;
        taken.add(col);
      }
    }
  }
  return mapping;
}

/**
 * Turn parsed sheets into bug rows using a field -> column mapping. Rows with no
 * Issue Description are skipped. `no` / `logId` fall back to a running counter.
 */
export function rowsToBugs(
  sheets: ParsedSheet[],
  mapping: ColumnMapping,
): Bug[] {
  const bugs: Bug[] = [];
  let counter = 1;

  for (const sheet of sheets) {
    for (const row of sheet.rows) {
      const descCol = mapping.description;
      const description = String((descCol ? row[descCol] : '') ?? '').trim();
      if (!description) continue;

      const bug = { raw: row } as Bug;
      const writable = bug as unknown as Record<string, unknown>;
      for (const field of BUG_FIELDS) {
        const col = mapping[field.key];
        writable[field.key] = col ? String(row[col] ?? '').trim() : '';
      }
      if (!bug.no) bug.no = String(counter);
      if (!bug.logId) bug.logId = `BUG-${counter}`;

      bugs.push(bug);
      counter += 1;
    }
  }

  return bugs;
}
