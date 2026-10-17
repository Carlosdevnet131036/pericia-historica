import { checkMarks, expectedVerdict } from '../forensics/match';
import type { CaseFile, GameState } from './types';

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

/** Pontuação do laboratório: 2 por conclusão correta, 1 por minúcia bem localizada. */
export function labScore(c: CaseFile, s: GameState): ScoreLine {
  let points = 0;
  let max = 0;
  for (const suspect of c.suspects) {
    const expected = expectedVerdict(c.latent.minutiaIds, suspect.print.minutiae);
    max += 2;
    if (s.lab.verdicts[suspect.id] === expected) points += 2;
    if (expected === 'identificada') {
      max += c.latent.minutiaIds.length;
      points += checkMarks(s.lab.marks[suspect.id] ?? {}, suspect.print.minutiae).filter((r) => r.hit).length;
    }
  }
  return { label: 'Confronto no laboratório', points, max };
}

export function computeScore(c: CaseFile, s: GameState): Score {
  const training: ScoreLine = {
    label: 'Classificação na primeira tentativa',
    points: c.training.filter((t) => s.training.firstTry[t.id] === true).length,
    max: c.training.length,
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
  const rank = ratio >= 0.9 ? 'Perito de Vucetich' : ratio >= 0.65 ? 'Inspetor' : ratio >= 0.4 ? 'Escrivão' : 'Aprendiz';
  return { lines, total, max, rank };
}
