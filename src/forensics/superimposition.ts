/**
 * Superposição crânio-foto, como a feita por Richard Helmer em 1985.
 *
 * Pontos anatômicos do crânio (órbitas, base do nariz, queixo...) são
 * projetados sobre os mesmos pontos de uma fotografia do rosto. O perito
 * ajusta escala e posição até a melhor sobreposição possível; se nem a melhor
 * sobreposição encaixa, a identidade é excluída.
 *
 * Coordenadas normalizadas do rosto: x de -1 a 1, y cresce para baixo, com
 * os olhos perto de y = 0. A projeção real envolve perspectiva e rotação da
 * cabeça; o modelo do jogo usa só escala e deslocamento vertical.
 */

export interface Landmark {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface Overlay {
  scale: number;
  dy: number;
}

export const SCALE_RANGE = { min: 0.8, max: 1.3, step: 0.01 } as const;
export const DY_RANGE = { min: -0.2, max: 0.3, step: 0.01 } as const;

export function transform(points: Landmark[], o: Overlay): Landmark[] {
  return points.map((p) => ({ ...p, x: p.x * o.scale, y: p.y * o.scale + o.dy }));
}

/** Distância média entre cada ponto do crânio transformado e o ponto de mesmo id na foto. */
export function meanError(skull: Landmark[], photo: Landmark[], o: Overlay): number {
  const placed = transform(skull, o);
  let sum = 0;
  for (const p of placed) {
    const q = photo.find((x) => x.id === p.id);
    if (!q) throw new Error(`ponto ${p.id} não existe na foto`);
    sum += Math.hypot(p.x - q.x, p.y - q.y);
  }
  return sum / placed.length;
}

/** Melhor sobreposição possível dentro dos limites dos controles (busca em grade). */
export function bestOverlay(skull: Landmark[], photo: Landmark[]): { overlay: Overlay; error: number } {
  let best = { overlay: { scale: 1, dy: 0 }, error: Infinity };
  for (let s = SCALE_RANGE.min; s <= SCALE_RANGE.max + 1e-9; s += SCALE_RANGE.step) {
    for (let dy = DY_RANGE.min; dy <= DY_RANGE.max + 1e-9; dy += DY_RANGE.step) {
      const error = meanError(skull, photo, { scale: s, dy });
      if (error < best.error) best = { overlay: { scale: s, dy }, error };
    }
  }
  return best;
}
