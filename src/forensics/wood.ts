/**
 * Confronto de madeira, no espírito do trabalho de Arthur Koehler (1933–35).
 *
 * Uma tábua tem veios (anéis de crescimento cortados) que variam ao longo do
 * comprimento de um jeito único. Se uma peça foi serrada de uma tábua, os
 * veios da peça continuam exatamente nos veios do resto da tábua, e os furos
 * dos pregos que a prendiam caem sobre as vigas do piso.
 *
 * Unidades em cm. x cresce ao longo da tábua; y vai de 0 a `boardWidth`.
 * A peça da escada (o "trilho") pode ser girada 180° no plano (`flip`).
 */

export interface WoodSetup {
  boardWidth: number;
  /** Comprimento do vão no piso, da parede até o início da tábua restante. */
  gapLength: number;
  /** Comprimento total do piso desenhado. */
  floorLength: number;
  railLength: number;
  /** Madeira perdida no corte (serra), entre o trilho e a tábua restante. */
  kerf: number;
  joistStart: number;
  joistSpacing: number;
  /** Semente dos veios da tábua de onde o trilho realmente saiu. */
  railSourceSeed: number;
  grainLines: number;
}

export interface Placement {
  offset: number;
  flip: boolean;
}

/** Tolerâncias do confronto, em cm. */
export const HOLE_TOLERANCE = 1.5;
export const GRAIN_TOLERANCE = 0.6;
export const ABUT_TOLERANCE = 1.2;

/** Gerador determinístico simples (mulberry32) para os parâmetros dos veios. */
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

interface GrainParams {
  base: number;
  a1: number;
  l1: number;
  p1: number;
  a2: number;
  l2: number;
  p2: number;
}

const grainCache = new Map<string, GrainParams[]>();

function grainParams(seed: number, lines: number, width: number): GrainParams[] {
  const key = `${seed}:${lines}:${width}`;
  const cached = grainCache.get(key);
  if (cached) return cached;
  const r = rng(seed);
  const params = Array.from({ length: lines }, (_, i) => ({
    base: ((i + 0.5 + (r() - 0.5) * 0.5) * width) / lines,
    a1: 0.5 + r() * 0.9,
    l1: 18 + r() * 30,
    p1: r() * Math.PI * 2,
    a2: 0.2 + r() * 0.4,
    l2: 5 + r() * 7,
    p2: r() * Math.PI * 2,
  }));
  grainCache.set(key, params);
  return params;
}

/** Posição y do veio `line` no ponto x de uma tábua com a semente dada. */
export function grainY(seed: number, line: number, x: number, setup: Pick<WoodSetup, 'grainLines' | 'boardWidth'>): number {
  const p = grainParams(seed, setup.grainLines, setup.boardWidth)[line];
  if (!p) throw new Error(`veio ${line} não existe`);
  return p.base + p.a1 * Math.sin(x / p.l1 + p.p1) + p.a2 * Math.sin(x / p.l2 + p.p2);
}

/** Onde o trilho estava na tábua original: logo antes do corte. */
export function trueOffset(s: WoodSetup): number {
  return s.gapLength - s.kerf - s.railLength;
}

export function joistPositions(s: WoodSetup): number[] {
  const out: number[] = [];
  for (let x = s.joistStart; x < s.floorLength; x += s.joistSpacing) out.push(x);
  return out;
}

/** Furos do trilho, medidos a partir da ponta esquerda do trilho sem girar. */
export function railHoles(s: WoodSetup): number[] {
  const start = trueOffset(s);
  return joistPositions(s)
    .filter((x) => x > start && x < start + s.railLength)
    .map((x) => x - start);
}

/** Furos do trilho em coordenadas do piso, para uma posição e orientação. */
export function placedHoles(s: WoodSetup, p: Placement): number[] {
  return railHoles(s).map((h) => p.offset + (p.flip ? s.railLength - h : h));
}

/** Veio do trilho na posição u (0 = ponta esquerda como está desenhado). */
export function railGrainY(s: WoodSetup, line: number, u: number, flip: boolean): number {
  const start = trueOffset(s);
  if (!flip) return grainY(s.railSourceSeed, line, start + u, s);
  // Girar 180° no plano inverte o comprimento e a largura, e a ordem dos veios.
  const mirrored = s.grainLines - 1 - line;
  return s.boardWidth - grainY(s.railSourceSeed, mirrored, start + s.railLength - u, s);
}

export interface Comparison {
  holesAligned: number;
  holesTotal: number;
  /** O trilho encosta na tábua restante (com a folga do corte)? */
  abuts: boolean;
  /** Os veios do trilho continuam nos veios da tábua candidata? */
  grainContinuous: boolean;
}

export function compare(s: WoodSetup, candidateSeed: number, hasJoists: boolean, p: Placement): Comparison {
  const holes = placedHoles(s, p);
  const joists = joistPositions(s);
  const holesAligned = hasJoists ? holes.filter((h) => joists.some((j) => Math.abs(j - h) <= HOLE_TOLERANCE)).length : 0;
  const end = p.offset + s.railLength;
  const abuts = Math.abs(s.gapLength - s.kerf - end) <= ABUT_TOLERANCE;
  let grainContinuous = false;
  if (abuts) {
    grainContinuous = true;
    for (let i = 0; i < s.grainLines; i++) {
      const railY = railGrainY(s, i, s.railLength, p.flip);
      const boardY = grainY(candidateSeed, i, s.gapLength, s);
      if (Math.abs(railY - boardY) > GRAIN_TOLERANCE) grainContinuous = false;
    }
  }
  return { holesAligned, holesTotal: holes.length, abuts, grainContinuous };
}

/** O encaixe é perfeito: furos todos alinhados e veios contínuos. */
export function isFullMatch(c: Comparison): boolean {
  return c.holesTotal > 0 && c.holesAligned === c.holesTotal && c.grainContinuous;
}

export function maxOffset(s: WoodSetup): number {
  return s.gapLength - s.kerf - s.railLength + 2;
}
