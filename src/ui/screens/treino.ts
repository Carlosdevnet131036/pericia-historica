import { fingerprintTraining } from '../modules/datiloscopia';
import { reasoningTraining } from '../modules/raciocinio';
import type { Screen } from './context';

export const treino: Screen = (ctx) => {
  const t = ctx.caseFile.training;
  switch (t.kind) {
    case 'datiloscopia':
      return fingerprintTraining(ctx, t);
    case 'raciocinio':
      return reasoningTraining(ctx, t);
  }
};
