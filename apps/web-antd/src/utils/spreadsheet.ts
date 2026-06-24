import type { Bug, ColumnMapping, ParsedSheet } from '#/types/domain';

import * as XLSX from 'xlsx';

import { COLUMN_HINTS, ENVIRONMENTS, PORTALS } from './constants';

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
    const columns = rows.length > 0 ? Object.keys(rows[0]!) : [];
    return { name, columns, rows };
  }).filter((sheet) => sheet.rows.length > 0);
}

/** Best-effort auto-detect a column name from a list of header hints. */
export function detectColumn(columns: string[], hintKey: string): string | null {
  const hints = COLUMN_HINTS[hintKey] || [];
  const lower = columns.map((c) => ({
    raw: c,
    low: String(c).toLowerCase().trim(),
  }));
  // Exact match first, then "contains".
  for (const hint of hints) {
    const exact = lower.find((c) => c.low === hint);
    if (exact) return exact.raw;
  }
  for (const hint of hints) {
    const partial = lower.find((c) => c.low.includes(hint));
    if (partial) return partial.raw;
  }
  return null;
}

/** Normalize a free-text portal value to 'external' | 'internal' | raw. */
export function normalizePortal(value: unknown): string {
  const v = String(value || '').toLowerCase();
  if (v.includes('ext')) return PORTALS.EXTERNAL;
  if (v.includes('int')) return PORTALS.INTERNAL;
  return v || PORTALS.EXTERNAL;
}

/** Normalize a free-text environment value to 'dev' | 'sit' | 'uat'. */
export function normalizeEnv(value: unknown): string {
  const v = String(value || '').toLowerCase();
  if (v.includes('uat')) return ENVIRONMENTS.UAT;
  if (v.includes('sit')) return ENVIRONMENTS.SIT;
  if (v.includes('dev')) return ENVIRONMENTS.DEV;
  return v || ENVIRONMENTS.DEV;
}

/**
 * Turn parsed sheets into bug records using a column mapping.
 */
export function rowsToBugs(sheets: ParsedSheet[], mapping: ColumnMapping): Bug[] {
  const bugs: Bug[] = [];
  let counter = 1;

  for (const sheet of sheets) {
    for (const row of sheet.rows) {
      const description = String(row[mapping.descCol] ?? '').trim();
      if (!description) continue;

      const rawPortal = mapping.useSheetNameAsPortal
        ? sheet.name
        : mapping.portalCol
          ? row[mapping.portalCol]
          : '';

      bugs.push({
        id:
          String(row[mapping.idCol] ?? `BUG-${counter}`).trim() ||
          `BUG-${counter}`,
        portal: normalizePortal(rawPortal),
        env: normalizeEnv(mapping.envCol ? row[mapping.envCol] : ''),
        description,
        raw: row,
      });
      counter += 1;
    }
  }

  return bugs;
}
