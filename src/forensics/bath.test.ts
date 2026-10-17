import { describe, expect, it } from 'vitest';
import { smith1915 } from '../cases/smith1915';
import { computeScore } from '../engine/scoring';
import { initialState } from '../engine/state';
import { assess, bodyPoints, sameAssessment } from './bath';

const lab = smith1915.lab;
if (lab.kind !== 'patologia-banho') throw new Error('o caso 2 usa o laboratório de patologia');
const { bath } = lab;

describe('simulação da banheira (caso 2)', () => {
  it('só a hipótese correta reproduz a posição descrita pelo médico', () => {
    const matching = bath.hypotheses.filter((x) => sameAssessment(assess(x.pose, bath), bath.found));
    expect(matching.map((x) => x.id)).toEqual([bath.correct]);
  });

  it('desmaio e ataque deixam a cabeça fora da água numa banheira mais curta que a vítima', () => {
    for (const id of ['desmaio', 'epilepsia']) {
      const x = bath.hypotheses.find((hyp) => hyp.id === id)!;
      expect(assess(x.pose, bath).headUnderwater).toBe(false);
    }
  });

  it('nenhuma pose atravessa as paredes da banheira', () => {
    for (const x of bath.hypotheses) {
      const b = bodyPoints(x.pose, bath);
      expect(b.foot.x).toBeLessThanOrEqual(bath.bathLength);
      expect(b.head.x).toBeGreaterThan(0);
      expect(Math.min(b.foot.y, b.knee.y, b.head.y)).toBeGreaterThanOrEqual(0);
    }
  });

  it('a vítima é mais alta que a banheira, premissa de todo o raciocínio', () => {
    expect(bath.victimHeight).toBeGreaterThan(bath.bathLength);
  });
});

describe('pontuação do laboratório de patologia', () => {
  it('dá nota máxima a quem marca exatamente as características comuns e a hipótese certa', () => {
    const s = initialState(smith1915.id);
    s.lab.features = lab.pattern.features.filter((f) => f.inAll).map((f) => f.id);
    s.lab.hypothesis = bath.correct;
    const line = computeScore(smith1915, s).lines.find((l) => l.label === 'Quadro e simulação')!;
    expect(line.points).toBe(line.max);
  });

  it('marcar uma característica que não é comum custa ponto', () => {
    const s = initialState(smith1915.id);
    s.lab.features = lab.pattern.features.map((f) => f.id);
    s.lab.hypothesis = bath.correct;
    const line = computeScore(smith1915, s).lines.find((l) => l.label === 'Quadro e simulação')!;
    const wrong = lab.pattern.features.filter((f) => !f.inAll).length;
    expect(line.points).toBe(line.max - wrong);
  });
});
