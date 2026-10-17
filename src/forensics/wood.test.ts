import { describe, expect, it } from 'vitest';
import { lindbergh1932 } from '../cases/lindbergh1932';
import { computeScore } from '../engine/scoring';
import { initialState } from '../engine/state';
import { compare, isFullMatch, maxOffset, trueOffset, type Placement } from './wood';

const lab = lindbergh1932.lab;
if (lab.kind !== 'cedulas-madeira') throw new Error('o caso 3 usa o laboratório de cédulas e madeira');
const { setup, candidates } = lab.wood;
const sotao = candidates.find((c) => c.grainSeed === setup.railSourceSeed)!;
const deposito = candidates.find((c) => c.grainSeed !== setup.railSourceSeed)!;

/** Todas as posições que o slider permite, nas duas orientações. */
function allPlacements(): Placement[] {
  const out: Placement[] = [];
  for (let o = 0; o <= maxOffset(setup); o += 0.2) {
    out.push({ offset: o, flip: false }, { offset: o, flip: true });
  }
  return out;
}

describe('confronto da madeira (caso 3)', () => {
  it('o trilho encaixa na tábua de origem na posição verdadeira', () => {
    expect(isFullMatch(compare(setup, sotao.grainSeed, true, { offset: trueOffset(setup), flip: false }))).toBe(true);
  });

  it('só existe um encaixe perfeito: posição verdadeira, sem girar', () => {
    const matches = allPlacements().filter((p) => isFullMatch(compare(setup, sotao.grainSeed, sotao.joists, p)));
    expect(matches.length).toBeGreaterThan(0);
    for (const p of matches) {
      expect(p.flip).toBe(false);
      expect(Math.abs(p.offset - trueOffset(setup))).toBeLessThanOrEqual(1.2);
    }
  });

  it('girado, os furos chegam a alinhar, mas os veios não continuam', () => {
    const flippedHoles = allPlacements().filter((p) => {
      const c = compare(setup, sotao.grainSeed, true, p);
      return p.flip && c.holesAligned === c.holesTotal;
    });
    expect(flippedHoles.length).toBeGreaterThan(0);
    expect(flippedHoles.some((p) => compare(setup, sotao.grainSeed, true, p).grainContinuous)).toBe(false);
  });

  it('a tábua do depósito nunca tem veios contínuos com o trilho', () => {
    const continuous = allPlacements().filter((p) => compare(setup, deposito.grainSeed, deposito.joists, p).grainContinuous);
    expect(continuous).toEqual([]);
  });
});

describe('livro de notas (caso 3)', () => {
  const { ransomList, ledger, leadBillId } = lab.bills;

  it('a nota-chave é do resgate e tem anotação', () => {
    const lead = ledger.find((b) => b.id === leadBillId)!;
    expect(ransomList).toContain(lead.serial);
    expect(lead.note).toBeTruthy();
  });

  it('há armadilhas: notas anotadas ou quase iguais que não são do resgate', () => {
    // Distância de Hamming: em quantas posições dois números diferem.
    const hamming = (a: string, b: string) => [...a].filter((ch, i) => ch !== b[i]).length;
    const traps = ledger.filter((b) => !ransomList.includes(b.serial));
    expect(traps.some((b) => b.note)).toBe(true);
    expect(traps.some((b) => ransomList.some((r) => hamming(r, b.serial) <= 2))).toBe(true);
  });

  it('números de série do livro não se repetem', () => {
    expect(new Set(ledger.map((b) => b.serial)).size).toBe(ledger.length);
  });
});

describe('pontuação do laboratório de cédulas e madeira', () => {
  it('dá nota máxima a um laudo perfeito', () => {
    const s = initialState(lindbergh1932.id);
    s.lab.bills = lab.bills.ledger.filter((b) => lab.bills.ransomList.includes(b.serial)).map((b) => b.id);
    s.lab.lead = lab.bills.leadBillId;
    s.lab.verdicts = { [sotao.id]: 'identificada', [deposito.id]: 'excluida' };
    s.lab.align = { [sotao.id]: { offset: trueOffset(setup), flip: false } };
    const line = computeScore(lindbergh1932, s).lines.find((l) => l.label === 'Cédulas e madeira')!;
    expect(line.points).toBe(line.max);
  });

  it('acertar as conclusões sem encaixar o trilho não dá a nota máxima', () => {
    const s = initialState(lindbergh1932.id);
    s.lab.verdicts = { [sotao.id]: 'identificada', [deposito.id]: 'excluida' };
    s.lab.align = { [sotao.id]: { offset: 0, flip: false } };
    const line = computeScore(lindbergh1932, s).lines.find((l) => l.label === 'Cédulas e madeira')!;
    expect(line.points).toBeLessThan(line.max);
  });
});
