import type { Minutia, Point } from './fingerprint';

/** Raio de tolerância de um ponto marcado, em unidades normalizadas do dedo. */
export const MATCH_RADIUS = 0.09;

export interface MarkResult {
  minutiaId: string;
  /** O ponto marcado caiu sobre a minúcia correspondente? */
  hit: boolean;
}

/**
 * Confere os pontos que o jogador marcou na ficha do suspeito contra as
 * minúcias reais daquela ficha. Uma marca só conta se cair perto da minúcia
 * com o mesmo id (mesmo número do ponto na latente).
 */
export function checkMarks(marks: Record<string, Point>, cardMinutiae: Minutia[]): MarkResult[] {
  return Object.entries(marks).map(([minutiaId, p]) => {
    const target = cardMinutiae.find((m) => m.id === minutiaId);
    const hit = target !== undefined && Math.hypot(target.x - p.x, target.y - p.y) <= MATCH_RADIUS;
    return { minutiaId, hit };
  });
}

export type Verdict = 'identificada' | 'excluida';

/**
 * Conclusão pericial correta para uma ficha: identifica se todas as minúcias
 * da latente existem na ficha, exclui caso contrário.
 */
export function expectedVerdict(latentIds: string[], cardMinutiae: Minutia[]): Verdict {
  const ids = new Set(cardMinutiae.map((m) => m.id));
  return latentIds.every((id) => ids.has(id)) ? 'identificada' : 'excluida';
}
