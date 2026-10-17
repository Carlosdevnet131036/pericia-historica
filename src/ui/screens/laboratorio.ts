import { fingerprintLab } from '../modules/confronto-digital';
import { pathologyLab } from '../modules/patologia';
import type { Screen } from './context';

export const laboratorio: Screen = (ctx) => {
  const lab = ctx.caseFile.lab;
  switch (lab.kind) {
    case 'confronto-digital':
      return fingerprintLab(ctx, lab);
    case 'patologia-banho':
      return pathologyLab(ctx, lab);
  }
};
