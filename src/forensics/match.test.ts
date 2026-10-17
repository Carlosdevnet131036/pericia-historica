import { describe, expect, it } from 'vitest';
import { rojas1892 } from '../cases/rojas1892';
import { ridgePhase, type Minutia } from './fingerprint';
import { checkMarks, expectedVerdict, MATCH_RADIUS } from './match';

const minutiae: Minutia[] = [
  { id: '1', x: 0.2, y: 0.1, polarity: 1 },
  { id: '2', x: -0.2, y: 0.3, polarity: -1 },
];

describe('checkMarks', () => {
  it('aceita marca dentro do raio da minúcia de mesmo id', () => {
    const [r] = checkMarks({ '1': { x: 0.2 + MATCH_RADIUS * 0.9, y: 0.1 } }, minutiae);
    expect(r?.hit).toBe(true);
  });

  it('rejeita marca fora do raio', () => {
    const [r] = checkMarks({ '1': { x: 0.2 + MATCH_RADIUS * 1.1, y: 0.1 } }, minutiae);
    expect(r?.hit).toBe(false);
  });

  it('rejeita marca sobre a minúcia certa com o número errado', () => {
    const [r] = checkMarks({ '1': { x: -0.2, y: 0.3 } }, minutiae);
    expect(r?.hit).toBe(false);
  });
});

describe('expectedVerdict', () => {
  it('identifica quando todas as minúcias da latente existem na ficha', () => {
    expect(expectedVerdict(['1', '2'], minutiae)).toBe('identificada');
  });

  it('exclui quando falta alguma', () => {
    expect(expectedVerdict(['1', '3'], minutiae)).toBe('excluida');
  });
});

describe('caso Rojas 1892', () => {
  const lab = rojas1892.lab;
  if (lab.kind !== 'confronto-digital') throw new Error('o caso 1 usa confronto digital');
  const { latent, suspects } = lab;

  it('a latente vem de quem o caso diz', () => {
    const source = suspects.find((s) => s.id === latent.sourceSuspectId);
    expect(source && expectedVerdict(latent.minutiaIds, source.print.minutiae)).toBe('identificada');
  });

  it('os demais suspeitos são excluídos', () => {
    for (const s of suspects.filter((x) => x.id !== latent.sourceSuspectId)) {
      expect(expectedVerdict(latent.minutiaIds, s.print.minutiae)).toBe('excluida');
    }
  });

  it('as minúcias da latente ficam dentro do recorte visível', () => {
    const source = suspects.find((s) => s.id === latent.sourceSuspectId)!;
    for (const id of latent.minutiaIds) {
      const m = source.print.minutiae.find((x) => x.id === id)!;
      expect(m.x).toBeGreaterThan(latent.view.x0);
      expect(m.x).toBeLessThan(latent.view.x1);
      expect(m.y).toBeGreaterThan(latent.view.y0);
      expect(m.y).toBeLessThan(latent.view.y1);
    }
  });
});

describe('ridgePhase', () => {
  it('uma volta em torno de uma minúcia acrescenta 2π à fase (uma crista a mais)', () => {
    const spec = { pattern: 'arco' as const, core: { x: 0, y: 0 }, seed: 1, minutiae: [minutiae[0]!] };
    const steps = 360;
    let total = 0;
    let prev = ridgePhase(spec, 0.2 + 0.02, 0.1);
    for (let i = 1; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const cur = ridgePhase(spec, 0.2 + 0.02 * Math.cos(a), 0.1 + 0.02 * Math.sin(a));
      let d = cur - prev;
      d -= Math.round(d / (Math.PI * 2)) * Math.PI * 2;
      total += d;
      prev = cur;
    }
    expect(Math.abs(total)).toBeCloseTo(Math.PI * 2, 1);
  });
});
