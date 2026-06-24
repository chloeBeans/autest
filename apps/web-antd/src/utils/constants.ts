export interface Option<T = string> {
  label: string;
  value: T;
}

export const PORTALS = {
  EXTERNAL: 'external',
  INTERNAL: 'internal',
} as const;
export type Portal = (typeof PORTALS)[keyof typeof PORTALS];

export const PORTAL_OPTIONS: Option<Portal>[] = [
  { value: PORTALS.EXTERNAL, label: 'External' },
  { value: PORTALS.INTERNAL, label: 'Internal' },
];

export const ENVIRONMENTS = {
  DEV: 'dev',
  SIT: 'sit',
  UAT: 'uat',
} as const;
export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

export const ENV_OPTIONS: Option<Environment>[] = [
  { value: ENVIRONMENTS.DEV, label: 'DEV' },
  { value: ENVIRONMENTS.SIT, label: 'SIT' },
  { value: ENVIRONMENTS.UAT, label: 'UAT' },
];

// Heuristics used to auto-detect columns when importing a bug list.
export const COLUMN_HINTS: Record<string, string[]> = {
  id: ['bug id', 'id', 'issue id', 'ticket', 'no', 'no.', 'bug no'],
  description: [
    'issue description',
    'description',
    'issue',
    'summary',
    'details',
    'bug description',
  ],
  portal: ['portal', 'module', 'application', 'app', 'system', 'project'],
  env: ['env', 'environment', 'stage', 'phase', 'dev/sit/uat', 'testing phase'],
};

export const BUG_STATUS = {
  NEW: 'new',
  ANALYZED: 'analyzed',
  GENERATED: 'generated',
  COMMITTED: 'committed',
  NEEDS_REVIEW: 'needs_review',
} as const;
export type BugStatus = (typeof BUG_STATUS)[keyof typeof BUG_STATUS];

export const CONFIDENCE = {
  HIGH: 'high',
  LOW: 'low',
  UNKNOWN: 'unknown',
} as const;
export type Confidence = (typeof CONFIDENCE)[keyof typeof CONFIDENCE];

export const REQ_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;
export type ReqStatus = (typeof REQ_STATUS)[keyof typeof REQ_STATUS];
