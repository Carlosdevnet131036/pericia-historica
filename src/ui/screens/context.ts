import type { Store } from '../../engine/state';
import type { CaseFile } from '../../engine/types';

export interface ScreenContext {
  caseFile: CaseFile;
  store: Store;
}

export type Screen = (ctx: ScreenContext) => HTMLElement;
