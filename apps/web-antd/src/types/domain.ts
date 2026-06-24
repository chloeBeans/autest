import type {
  BugStatus,
  Confidence,
  Environment,
  Portal,
} from '#/utils/constants';

/** A single imported/added bug row. */
export interface Bug {
  id: string;
  portal: Portal | string;
  env: Environment | string;
  description: string;
  status?: BugStatus;
  confidence?: Confidence;
  notes?: string;
  pickedUpBy?: string;
  raw?: Record<string, unknown>;
}

/** A generated Playwright spec ({ fileName, content }). */
export interface SpecFile {
  fileName: string;
  content: string;
}

/** One step in the drag-and-drop test builder. */
export interface PlaywrightStep {
  type: 'goto' | 'click' | 'fill' | 'expectVisible' | 'expectText';
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

export type BrsKind = 'pdf' | 'html' | 'markdown' | 'text';

/** A BRS document read into a viewable + extractable form. */
export interface BrsDocument {
  name: string;
  kind: BrsKind;
  data: string;
  text: string;
}
