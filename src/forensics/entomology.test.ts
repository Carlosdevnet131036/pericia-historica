import { describe, expect, it } from 'vitest';
import { ruxton1935 } from '../cases/ruxton1935';
import { computeScore, expectedOvipositionDay } from '../engine/scoring';
import { initialState } from '../engine/state';
import { accumulated, dayDegrees, estimateOviposition } from './entomology';

const lab = ruxton1935.lab;
if (lab.kind !== 'entomologia') throw new Error('o caso 5 usa o laboratório de entomologia');
const { larvae } = lab;
const stage = (id: string) => larvae.stages.find((s) => s.id === id)!;

describe('graus-dia', () => {
  it('um dia mais frio que a temperatura-base não soma nem subtrai', () => {
    expect(dayDegrees(1, 2)).toBe(0);
    expect(dayDegrees(12, 2)).toBe(10);
  });

  it('a soma inclui o primeiro e o último dia', () => {
    const temps = [
      { day: 1, temp: 12 },
      { day: 2, temp: 12 },
      { day: 3, temp: 12 },
    ];
    expect(accumulated(temps, 2, 1, 3)).toBe(30);
    expect(estimateOviposition(temps, 2, 20, 3)).toBe(2);
  });
});

describe('larvas do caso 5', () => {
  const expected = expectedOvipositionDay(lab);

  it('a estimativa fica entre 12 e 14 dias antes da coleta, como a de Mearns', () => {
    const daysBeforeCollection = larvae.lastDay + 1 - expected;
    expect(daysBeforeCollection).toBeGreaterThanOrEqual(12);
    expect(daysBeforeCollection).toBeLessThanOrEqual(14);
  });

  it('a postura é depois do desaparecimento (dia 14)', () => {
    expect(expected).toBeGreaterThanOrEqual(14);
  });

  it('só um dia do calendário fica dentro da margem que a tela indica como encaixe (±6)', () => {
    const required = stage(larvae.correctStage).degreeDays;
    const close = larvae.temps.filter((d) => Math.abs(accumulated(larvae.temps, larvae.baseTemp, d.day, larvae.lastDay) - required) <= 6);
    expect(close.map((d) => d.day)).toEqual([expected]);
  });

  it('escolher o estágio errado leva a outro dia', () => {
    for (const s of larvae.stages.filter((x) => x.id !== larvae.correctStage)) {
      expect(estimateOviposition(larvae.temps, larvae.baseTemp, s.degreeDays, larvae.lastDay)).not.toBe(expected);
    }
  });
});

describe('pontuação do laboratório de entomologia', () => {
  it('dá nota máxima a um laudo perfeito', () => {
    const s = initialState(ruxton1935.id);
    s.lab.answers = {
      estagio: larvae.correctStage,
      dia: String(expectedOvipositionDay(lab)),
      jornal: lab.wrapping.leadPaperId,
      data: lab.wrapping.correctDate,
    };
    const line = computeScore(ruxton1935, s).lines.find((l) => l.label === 'Larvas e embrulho')!;
    expect(line.points).toBe(line.max);
  });
});
