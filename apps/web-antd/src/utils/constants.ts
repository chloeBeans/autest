export interface Option<T = string> {
  label: string;
  value: T;
}

// Portal is still used by the dashboard + the connected-folder feature.
export const PORTALS = {
  EXTERNAL: 'external',
  INTERNAL: 'internal',
} as const;
export type Portal = (typeof PORTALS)[keyof typeof PORTALS];

export const PORTAL_OPTIONS: Option<Portal>[] = [
  { value: PORTALS.EXTERNAL, label: 'External' },
  { value: PORTALS.INTERNAL, label: 'Internal' },
];

// --- Bug defect status (mirrors the QA bug sheet) -------------------------
export const BUG_STATUS = {
  OPEN: 'OPEN',
  RETEST: 'RETEST',
  CLOSED: 'CLOSED',
  REOPEN: 'REOPEN',
  INVALID: 'INVALID',
} as const;
export type BugStatus = (typeof BUG_STATUS)[keyof typeof BUG_STATUS];

export const STATUS_OPTIONS: Option[] = [
  { value: BUG_STATUS.OPEN, label: 'OPEN' },
  { value: BUG_STATUS.RETEST, label: 'RETEST' },
  { value: BUG_STATUS.CLOSED, label: 'CLOSED' },
  { value: BUG_STATUS.REOPEN, label: 'REOPEN' },
  { value: BUG_STATUS.INVALID, label: 'INVALID' },
];

// --- Dev/fix status (mirrors the QA bug sheet) ----------------------------
export const DEV_STATUS = {
  IN_PROGRESS: 'IN PROGRESS',
  FIXED_IN_LOCAL_ENV: 'FIXED IN LOCAL ENV',
  DEPLOYED_TO_PRE_SIT: 'DEPLOYED to PRE-SIT',
} as const;
export type DevStatus = (typeof DEV_STATUS)[keyof typeof DEV_STATUS];

export const DEV_STATUS_OPTIONS: Option[] = [
  { value: DEV_STATUS.IN_PROGRESS, label: 'IN PROGRESS' },
  { value: DEV_STATUS.FIXED_IN_LOCAL_ENV, label: 'FIXED IN LOCAL ENV' },
  { value: DEV_STATUS.DEPLOYED_TO_PRE_SIT, label: 'DEPLOYED to PRE-SIT' },
];

/**
 * The bug-list field model — one entry per column in the QA bug sheet, in
 * sheet order. Drives the table columns, inline editing, the add-bug form and
 * the import column-mapping. The display label is resolved via i18n at
 * `autest.bugs.fields.<key>`.
 */
export interface BugFieldDef {
  key: string;
  kind: 'select' | 'text' | 'textarea';
  options?: Option[];
  width: number;
}

export const BUG_FIELDS: BugFieldDef[] = [
  { key: 'no', kind: 'text', width: 70 },
  { key: 'env', kind: 'text', width: 90 },
  { key: 'logId', kind: 'text', width: 150 },
  { key: 'sprint', kind: 'text', width: 90 },
  { key: 'usingMigrationData', kind: 'text', width: 140 },
  { key: 'module', kind: 'text', width: 110 },
  { key: 'portion', kind: 'text', width: 120 },
  { key: 'processFunction', kind: 'text', width: 160 },
  { key: 'description', kind: 'textarea', width: 320 },
  { key: 'status', kind: 'select', options: STATUS_OPTIONS, width: 120 },
  { key: 'reportedBy', kind: 'text', width: 130 },
  { key: 'dateReported', kind: 'text', width: 130 },
  { key: 'regress', kind: 'text', width: 90 },
  { key: 'defectSeverity', kind: 'text', width: 120 },
  { key: 'defectPriority', kind: 'text', width: 120 },
  { key: 'qaUse', kind: 'text', width: 110 },
  { key: 'readinessAssessment', kind: 'text', width: 160 },
  { key: 'devRemarks', kind: 'textarea', width: 220 },
  { key: 'targetResolvedDate', kind: 'text', width: 150 },
  { key: 'devStatus', kind: 'select', options: DEV_STATUS_OPTIONS, width: 180 },
  { key: 'defectFixedDate', kind: 'text', width: 140 },
  { key: 'deploymentVersion', kind: 'text', width: 150 },
  { key: 'regressReason', kind: 'textarea', width: 200 },
  { key: 'resolutionRemarks', kind: 'textarea', width: 200 },
];

// Header hints used to auto-map a column to each field when importing a sheet.
export const COLUMN_HINTS: Record<string, string[]> = {
  no: ['no', 'no.', 'number', '#'],
  env: ['env', 'environment'],
  logId: ['log id', 'logid', 'defect id', 'bug id', 'ticket', 'id'],
  sprint: ['sprint'],
  usingMigrationData: ['using migration data', 'migration data', 'migration'],
  module: ['modules', 'module'],
  portion: ['portion', 'portal'],
  processFunction: [
    'process/function',
    'process / function',
    'process',
    'function',
  ],
  description: [
    'issue description',
    'description',
    'issue',
    'summary',
    'details',
  ],
  status: ['status'],
  reportedBy: ['reported by', 'reporter'],
  dateReported: ['date reported', 'reported date'],
  regress: ['regress'],
  defectSeverity: ['defect severity', 'severity'],
  defectPriority: ['defect priority', 'priority'],
  qaUse: ['qa use', 'qa'],
  readinessAssessment: ['readiness assessment', 'readiness'],
  devRemarks: ['dev remarks to tester', 'dev remarks', 'remarks to tester'],
  targetResolvedDate: [
    'target resolved date',
    'target resolve date',
    'target date',
  ],
  devStatus: ['dev status'],
  defectFixedDate: ['defect fixed date', 'fixed date'],
  deploymentVersion: ['deployment version', 'deployment', 'version'],
  regressReason: [
    'regress reason/comments',
    'regress reason',
    'regress comments',
  ],
  resolutionRemarks: ['resolution remarks', 'resolution'],
};

export const REQ_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;
export type ReqStatus = (typeof REQ_STATUS)[keyof typeof REQ_STATUS];
