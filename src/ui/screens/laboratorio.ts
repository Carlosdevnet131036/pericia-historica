import { fingerprintLab } from '../modules/confronto-digital';
import { anthropologyLab } from '../modules/antropologia';
import { moneyWoodLab } from '../modules/cedulas-madeira';
import { entomologyLab } from '../modules/entomologia';
import { pathologyLab } from '../modules/patologia';
import type { Screen } from './context';

export const laboratorio: Screen = (ctx) => {
  const lab = ctx.caseFile.lab;
  switch (lab.kind) {
    case 'confronto-digital':
      return fingerprintLab(ctx, lab);
    case 'patologia-banho':
      return pathologyLab(ctx, lab);
    case 'cedulas-madeira':
      return moneyWoodLab(ctx, lab);
    case 'antropologia':
      return anthropologyLab(ctx, lab);
    case 'entomologia':
      return entomologyLab(ctx, lab);
  }
};
