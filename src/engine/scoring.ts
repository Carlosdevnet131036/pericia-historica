import { checkMarks, expectedVerdict } from '../forensics/match';
import type { CaseFile, FingerprintLab, GameState, PathologyLab } from './types';

export interface ScoreLine {
  label: string;
  points: number;
  max: number;
}

export interface Score {
  lines: ScoreLine[];
  total: number;
  max: number;
  rank: string;
}

/** Confronto digital: 2 por conclusão correta, 1 por minúcia bem localizada. */
function fingerprintLabScore(lab: FingerprintLab, s: GameState): ScoreLine {
  let points = 0;
  let max = 0;
  for (const suspect of lab.suspects) {
    const expected = expectedVerdict(lab.latent.minutiaIds, suspect.print.minutiae);
    max += 2;
    if (s.lab.verdicts[suspect.id] === expected) points += 2;
    if (expected === 'identificada') {
      max += lab.latent.minutiaIds.length;
      points += checkMarks(s.lab.marks[suspect.id] ?? {}, suspect.print.minutiae).filter((r) => r.hit).length;
    }
  }
  return { label: 'Confronto no laboratório', points, max };
}

/**
 * Patologia: 1 ponto por linha do quadro classificada corretamente (marcada
 * se aparece nos três casos, desmarcada se não) e 3 pela hipótese da banheira.
 */
function pathologyLabScore(lab: PathologyLab, s: GameState): ScoreLine {
  const marked = new Set(s.lab.features);
  const featurePoints = lab.pattern.features.filter((f) => marked.has(f.id) === f.inAll).length;
  const bathPoints = s.lab.hypothesis === lab.bath.correct ? 3 : 0;
  return { label: 'Quadro e simulação', points: featurePoints + bathPoints, max: lab.pattern.features.length + 3 };
}

export function labScore(c: CaseFile, s: GameState): ScoreLine {
  switch (c.lab.kind) {
    case 'confronto-digital':
      return fingerprintLabScore(c.lab, s);
    case 'patologia-banho':
      return pathologyLabScore(c.lab, s);
  }
}

function trainingIds(c: CaseFile): string[] {
  switch (c.training.kind) {
    case 'datiloscopia':
      return c.training.samples.map((t) => t.id);
    case 'raciocinio':
      return c.training.items.map((t) => t.id);
  }
}

export function computeScore(c: CaseFile, s: GameState): Score {
  const ids = trainingIds(c);
  const training: ScoreLine = {
    label: 'Treino na primeira tentativa',
    points: ids.filter((id) => s.training.firstTry[id] === true).length,
    max: ids.length,
  };
  const accusation: ScoreLine = {
    label: 'Conclusões',
    points: c.accusation.filter((q) => s.accusation.answers[q.id] === q.correct).length * 2,
    max: c.accusation.length * 2,
  };
  const lines = [training, labScore(c, s), accusation];
  const total = lines.reduce((a, l) => a + l.points, 0);
  const max = lines.reduce((a, l) => a + l.max, 0);
  const ratio = max === 0 ? 0 : total / max;
  const rank = ratio >= 0.9 ? 'Perito-chefe' : ratio >= 0.65 ? 'Inspetor' : ratio >= 0.4 ? 'Escrivão' : 'Aprendiz';
  return { lines, total, max, rank };
}
