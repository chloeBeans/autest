import type {
  BugStatus,
  Confidence,
  Environment,
  Portal,
  ReqStatus,
} from '#/utils/constants';

/** A single imported/added bug row (raw shape, before it enters the store). */
export interface Bug {
  id: string;
  portal: Portal | string;
  env: Environment | string;
  description: string;
  raw?: Record<string, unknown>;
}

/** A bug as stored (decorated with tracking fields + a stable key). */
export interface BugRecord extends Bug {
  key: string;
  status: BugStatus;
  confidence: Confidence;
  note: string;
  generatedFile: string;
  commitHash: string;
  pickedUpBy: string;
}

/** A user account (mock auth/data layer, client-side). */
export interface Account {
  username: string;
  password: string;
  realName: string;
  roles: string[];
  homePath?: string;
}

/** Account without the password, for listing in the UI. */
export type PublicAccount = Omit<Account, 'password'>;

/** A project; every feature (bugs, tests, BRS, folders) is scoped to one. */
export interface Project {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
}

/** One tracked requirement inside a BRS. */
export interface RequirementItem {
  id: string;
  text: string;
  sprint: string;
  status: ReqStatus;
  completedDate: string;
}

/** A sprint with an optional due date. */
export interface Sprint {
  name: string;
  dueDate: string;
}

/**
 * A BRS record — now just a document descriptor under a module. The requirement
 * items + sprints live on the {@link Module}; the doc blob is kept separately
 * (in-memory). `updatedDate` is picked by the uploader (the BRS version date).
 */
export interface BrsRecord {
  id: string;
  name: string;
  uploadedAt: string;
  updatedDate: string;
}

/**
 * A module groups several BRS documents under a project and owns one shared
 * requirement tracker (items) + sprints. Admin-managed; `members` lists the
 * users who can see/use the module (a subset of the project's members).
 */
export interface Module {
  id: string;
  projectId: string;
  name: string;
  members: string[];
  createdBy: string;
  brsList: BrsRecord[];
  currentBrsId: null | string;
  items: RequirementItem[];
  sprints: Sprint[];
}

/** A generated Playwright spec ({ fileName, content }). */
export interface SpecFile {
  fileName: string;
  content: string;
}

/** One step in the drag-and-drop test builder. */
export interface PlaywrightStep {
  type: 'click' | 'expectText' | 'expectVisible' | 'fill' | 'goto';
  selector?: string;
  value?: string;
}

/** A parsed sheet/tab from an uploaded spreadsheet. */
export interface ParsedSheet {
  name: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

/** Column mapping used to turn parsed rows into bugs. */
export interface ColumnMapping {
  idCol: string;
  descCol: string;
  portalCol?: string;
  envCol?: string;
  useSheetNameAsPortal?: boolean;
}

export type BrsKind = 'html' | 'markdown' | 'pdf' | 'text';

/** A BRS document read into a viewable + extractable form. */
export interface BrsDocument {
  name: string;
  kind: BrsKind;
  data: string;
  text: string;
}
