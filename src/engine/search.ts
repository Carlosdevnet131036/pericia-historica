/**
 * Cenas de objetos escondidos: posições dos objetos e pontuação.
 *
 * O layout é determinístico (mesma semente, mesma cena), para que o jogador
 * possa repetir a cena e para que os testes possam conferir as regras:
 * cada alvo aparece uma vez, nada se sobrepõe e a bagunça nunca repete um
 * tipo de alvo (senão o clique seria ambíguo).
 */
import type { ObjectId } from './types';

export const SEARCH_W = 800;
export const SEARCH_H = 450;
const COLS = 8;
const ROWS = 4;
/** Raio de acerto de um objeto, em unidades da cena (antes da escala). */
export const HIT_RADIUS = 24;

export interface Placement {
  id: ObjectId;
  target: boolean;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function layoutSearch(seed: number, targets: ObjectId[], pool: ObjectId[], clutter: number): Placement[] {
  const r = rng(seed);
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => i);
  // Embaralha as células (Fisher–Yates) para espalhar os objetos.
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [cells[i], cells[j]] = [cells[j]!, cells[i]!];
  }
  const fillers = pool.filter((p) => !targets.includes(p));
  if (fillers.length === 0 && clutter > 0) throw new Error('não há objetos de enchimento');
  const ids: { id: ObjectId; target: boolean }[] = [
    ...targets.map((id) => ({ id, target: true })),
    ...Array.from({ length: clutter }, () => ({ id: fillers[Math.floor(r() * fillers.length)]!, target: false })),
  ];
  if (ids.length > cells.length) throw new Error('objetos demais para a cena');
  const cw = SEARCH_W / COLS;
  const ch = SEARCH_H / ROWS;
  return ids.map((o, i) => {
    const cell = cells[i]!;
    const col = cell % COLS;
    const row = Math.floor(cell / COLS);
    return {
      ...o,
      x: col * cw + cw / 2 + (r() - 0.5) * 20,
      y: row * ch + ch / 2 + (r() - 0.5) * 18,
      rotation: Math.round((r() - 0.5) * 60),
      scale: 1.1 + r() * 0.4,
    };
  });
}

/** Alvo ainda não encontrado mais próximo do clique, se estiver no raio de acerto. */
export function hitTarget(placements: Placement[], found: string[], x: number, y: number): Placement | null {
  let best: Placement | null = null;
  let bestD = Infinity;
  for (const p of placements) {
    if (!p.target || found.includes(p.id)) continue;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= HIT_RADIUS * p.scale && d < bestD) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

/** Pontuação da cena: tempo, erros e dicas descontam de 1000. */
export function searchScore(elapsedSec: number, misclicks: number, hints: number): number {
  return Math.max(0, Math.round(1000 - elapsedSec * 8 - misclicks * 60 - hints * 120));
}

export function searchStars(score: number): number {
  if (score >= 800) return 5;
  if (score >= 650) return 4;
  if (score >= 500) return 3;
  if (score >= 300) return 2;
  return 1;
}
