export const PORTALS = {
  EXTERNAL: 'external',
  INTERNAL: 'internal',
};

export const PORTAL_OPTIONS = [
  { value: PORTALS.EXTERNAL, label: 'External' },
  { value: PORTALS.INTERNAL, label: 'Internal' },
];

export const ENVIRONMENTS = {
  DEV: 'dev',
  SIT: 'sit',
  UAT: 'uat',
};

export const ENV_OPTIONS = [
  { value: ENVIRONMENTS.DEV, label: 'DEV' },
  { value: ENVIRONMENTS.SIT, label: 'SIT' },
  { value: ENVIRONMENTS.UAT, label: 'UAT' },
];

// Heuristics used to auto-detect columns when importing a bug list.
export const COLUMN_HINTS = {
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
};

export const CONFIDENCE = {
  HIGH: 'high',
  LOW: 'low',
  UNKNOWN: 'unknown',
};

export const REQ_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};
