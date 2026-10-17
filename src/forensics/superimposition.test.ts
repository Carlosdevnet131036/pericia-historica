import { describe, expect, it } from 'vitest';
import { mengele1985 } from '../cases/mengele1985';
import { computeScore } from '../engine/scoring';
import { initialState } from '../engine/state';
import { bestOverlay, meanError } from './superimposition';

const lab = mengele1985.lab;
if (lab.kind !== 'antropologia') throw new Error('o caso 4 usa o laboratório de antropologia');
const { overlay, profile } = lab;
const source = overlay.candidates.find((c) => c.id === overlay.sourceCandidateId)!;
const others = overlay.candidates.filter((c) => c.id !== overlay.sourceCandidateId);

describe('superposição crânio-foto (caso 4)', () => {
  it('a foto de origem encaixa dentro do limite no melhor ajuste', () => {
    expect(bestOverlay(overlay.skull, source.landmarks).error).toBeLessThanOrEqual(overlay.threshold);
  });

  it('nenhum ajuste faz as outras fotos encaixarem, com folga', () => {
    for (const c of others) {
      expect(bestOverlay(overlay.skull, c.landmarks).error).toBeGreaterThan(overlay.threshold * 2);
    }
  });

  it('a posição inicial dos controles não encaixa: o jogador precisa ajustar', () => {
    expect(meanError(overlay.skull, source.landmarks, { scale: 1, dy: 0 })).toBeGreaterThan(overlay.threshold);
  });

  it('crânio e fotos têm exatamente os mesmos pontos anatômicos', () => {
    const ids = overlay.skull.map((p) => p.id).sort();
    for (const c of overlay.candidates) expect(c.landmarks.map((p) => p.id).sort()).toEqual(ids);
  });
});

describe('perfil biológico (caso 4)', () => {
  it('a estatura correta é a que sai da fórmula de Trotter e Gleser', () => {
    const q = profile.questions.find((x) => x.id === 'estatura')!;
    const stature = 2.38 * 47.3 + 61.41;
    expect(Math.abs(Number(q.correct) - stature)).toBeLessThan(1);
  });
});

describe('pontuação do laboratório de antropologia', () => {
  it('dá nota máxima a um laudo perfeito', () => {
    const s = initialState(mengele1985.id);
    s.lab.answers = Object.fromEntries(profile.questions.map((q) => [q.id, q.correct]));
    s.lab.verdicts = Object.fromEntries(overlay.candidates.map((c) => [c.id, c.id === source.id ? 'identificada' : 'excluida']));
    s.lab.overlay = { [source.id]: bestOverlay(overlay.skull, source.landmarks).overlay };
    const line = computeScore(mengele1985, s).lines.find((l) => l.label === 'Perfil e superposição')!;
    expect(line.points).toBe(line.max);
  });
});
