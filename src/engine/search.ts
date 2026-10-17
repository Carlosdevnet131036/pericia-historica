/**
 * Cenas de objetos escondidos: posições dos objetos e pontuação.
 *
 * O layout é determinístico (mesma semente, mesma cena), para que o jogador
 * possa repetir a cena e para que os testes possam conferir as regras:
 * cada alvo aparece uma vez, nada se sobrepõe e a bagunça nunca repete um
 * tipo de alvo (senão o clique seria ambíguo).
 */
import type { CaseFile, Evidence, GameState, ObjectId, SearchProgress } from './types';

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

/* ---------- Exploração 3D ---------- */

/**
 * Pontuação de uma cena concluída na exploração 3D. Andar pela casa leva
 * mais tempo que clicar numa imagem, e lá não há cliques errados nem dicas,
 * então o tempo pesa menos: 5 estrelas até 100 s, 4 até 175 s, 3 até 250 s.
 * Valores provisórios, a calibrar com partidas reais.
 */
export function exploreScore(elapsedSec: number): number {
  return Math.max(0, Math.round(1000 - elapsedSec * 2));
}

/** Pontuação de uma cena concluída, pela fórmula do modo em que terminou. */
export function progressScore(p: SearchProgress): number {
  const sec = (p.elapsedMs ?? 0) / 1000;
  return p.completedIn === '3d' ? exploreScore(sec) : searchScore(sec, p.misclicks, p.hints);
}

export const EMPTY_SEARCH: SearchProgress = { found: [], misclicks: 0, hints: 0, startedAt: null, elapsedMs: null, bestStars: 0 };

/** Liga o relógio da cena, se ainda não estiver ligado nem concluída. */
export function beginSearch(p: SearchProgress, now: number): SearchProgress {
  if (p.startedAt !== null || p.elapsedMs !== null) return p;
  return { ...p, startedAt: now };
}

export interface FindResult {
  progress: SearchProgress;
  /** O objeto ainda não tinha sido registrado. */
  isNew: boolean;
  /** Este registro concluiu a cena. */
  completed: boolean;
}

/**
 * Registra um objeto encontrado na exploração 3D. Objeto fora da lista ou já
 * registrado (inclusive na busca 2D) não muda nada: não há duplicação.
 */
export function registerFind(p: SearchProgress, targets: readonly ObjectId[], id: ObjectId, now: number): FindResult {
  if (!targets.includes(id) || p.found.includes(id)) return { progress: p, isNew: false, completed: false };
  const started = beginSearch(p, now);
  const found = [...started.found, id];
  if (found.length < targets.length) return { progress: { ...started, found }, isNew: true, completed: false };
  const elapsedMs = now - (started.startedAt ?? now);
  const done: SearchProgress = { ...started, found, elapsedMs, completedIn: '3d' };
  return { progress: { ...done, bestStars: Math.max(p.bestStars, searchStars(progressScore(done))) }, isNew: true, completed: true };
}

/**
 * Evidências já liberadas no caso, na ordem dos lugares: as de lugares com
 * busca aparecem quando a cena é concluída; as demais, quando o lugar é
 * visitado. É a mesma regra da tela de investigação.
 */
export function unlockedEvidence(c: CaseFile, s: GameState): Evidence[] {
  return c.locations
    .filter((l) => (l.search ? (s.search[l.id]?.elapsedMs ?? null) !== null : s.visited.includes(l.id)))
    .flatMap((l) => l.evidenceIds)
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => e !== undefined);
}
