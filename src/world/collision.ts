import type { Vec2 } from './motion';

/**
 * Colisões do modo 3D, sem Three.js, para poder ser testadas com Vitest.
 *
 * O jogador é um círculo no plano do chão (xz): numa cena térrea, sem
 * escadas nem pulo, isso equivale a uma cápsula vertical e é bem mais simples.
 * Os obstáculos são caixas alinhadas aos eixos ou cilindros verticais.
 *
 * A câmera usa os mesmos obstáculos em 3D: um segmento da cabeça do jogador
 * até a câmera; se ele cruza algo, a câmera se aproxima.
 */

export interface BoxCollider {
  kind: 'box';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
  /** Bloqueia o jogador (paredes, móveis). */
  solid: boolean;
  /** Bloqueia a câmera (paredes e telhado, mas não uma cerca vazada). */
  camera: boolean;
}

export interface CircleCollider {
  kind: 'circle';
  x: number;
  z: number;
  r: number;
  minY: number;
  maxY: number;
  solid: boolean;
  camera: boolean;
}

export type Collider = BoxCollider | CircleCollider;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

type Flags = { solid?: boolean; camera?: boolean };

/** Caixa a partir do centro e do tamanho, como uma BoxGeometry posicionada. */
export function box(cx: number, cy: number, cz: number, w: number, h: number, d: number, f: Flags = {}): BoxCollider {
  return {
    kind: 'box',
    minX: cx - w / 2,
    maxX: cx + w / 2,
    minY: cy - h / 2,
    maxY: cy + h / 2,
    minZ: cz - d / 2,
    maxZ: cz + d / 2,
    solid: f.solid ?? true,
    camera: f.camera ?? true,
  };
}

export function circle(x: number, z: number, r: number, height: number, f: Flags = {}): CircleCollider {
  return { kind: 'circle', x, z, r, minY: 0, maxY: height, solid: f.solid ?? true, camera: f.camera ?? true };
}

/**
 * Empurra um círculo de raio `radius` para fora de um obstáculo.
 * Devolve a nova posição, ou a mesma se não houver contato.
 */
function pushOut(p: Vec2, radius: number, c: Collider): Vec2 {
  if (c.kind === 'circle') {
    const dx = p.x - c.x;
    const dz = p.z - c.z;
    const d = Math.hypot(dx, dz);
    const min = radius + c.r;
    if (d >= min) return p;
    if (d < 1e-9) return { x: c.x + min, z: c.z }; // exatamente no centro: escolhe um lado
    return { x: c.x + (dx / d) * min, z: c.z + (dz / d) * min };
  }
  // Ponto da caixa mais próximo do centro do círculo.
  const qx = Math.min(Math.max(p.x, c.minX), c.maxX);
  const qz = Math.min(Math.max(p.z, c.minZ), c.maxZ);
  const dx = p.x - qx;
  const dz = p.z - qz;
  const d = Math.hypot(dx, dz);
  if (d >= radius) return p;
  if (d > 1e-9) return { x: qx + (dx / d) * radius, z: qz + (dz / d) * radius };
  // O centro entrou na caixa: sai pelo lado de menor penetração.
  const exits = [
    { x: c.minX - radius, z: p.z, cost: p.x - c.minX },
    { x: c.maxX + radius, z: p.z, cost: c.maxX - p.x },
    { x: p.x, z: c.minZ - radius, cost: p.z - c.minZ },
    { x: p.x, z: c.maxZ + radius, cost: c.maxZ - p.z },
  ];
  exits.sort((a, b) => a.cost - b.cost);
  return { x: exits[0]!.x, z: exits[0]!.z };
}

/**
 * Resolve a posição do jogador contra todos os obstáculos sólidos.
 * Algumas passadas resolvem cantos, onde sair de uma parede encosta na outra.
 * Como só a componente que penetra é removida, o jogador desliza ao longo da
 * parede em vez de parar seco.
 */
export function resolveCircle(p: Vec2, radius: number, colliders: readonly Collider[], passes = 4): Vec2 {
  let out = p;
  for (let i = 0; i < passes; i++) {
    let moved = false;
    for (const c of colliders) {
      if (!c.solid) continue;
      const next = pushOut(out, radius, c);
      if (next !== out) {
        out = next;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return out;
}

/** O círculo encosta (sobrepõe) em algum obstáculo sólido? */
export function overlaps(p: Vec2, radius: number, colliders: readonly Collider[]): boolean {
  return colliders.some((c) => c.solid && pushOut(p, radius, c) !== p);
}

/**
 * Fração t ∈ [0, 1] do segmento a→b em que ele entra na caixa (método dos
 * "slabs"), ou null se não cruza. Um segmento que já começa dentro da caixa
 * é ignorado: a cabeça do jogador nunca deve prender a câmera.
 */
function segmentBox(a: Vec3, b: Vec3, c: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }): number | null {
  let t0 = 0;
  let t1 = 1;
  const axes: [number, number, number, number][] = [
    [a.x, b.x - a.x, c.minX, c.maxX],
    [a.y, b.y - a.y, c.minY, c.maxY],
    [a.z, b.z - a.z, c.minZ, c.maxZ],
  ];
  let inside = true;
  for (const [o, d, lo, hi] of axes) {
    if (o < lo || o > hi) inside = false;
    if (Math.abs(d) < 1e-12) {
      if (o < lo || o > hi) return null;
      continue;
    }
    let ta = (lo - o) / d;
    let tb = (hi - o) / d;
    if (ta > tb) [ta, tb] = [tb, ta];
    t0 = Math.max(t0, ta);
    t1 = Math.min(t1, tb);
    if (t0 > t1) return null;
  }
  return inside ? null : t0;
}

/**
 * Distância máxima que a câmera pode ficar da cabeça do jogador, na direção
 * `to - from`, sem atravessar um obstáculo. `margin` afasta a câmera da
 * superfície para o plano de recorte não entrar na parede.
 */
export function cameraDistance(from: Vec3, to: Vec3, colliders: readonly Collider[], margin = 0.25): number {
  const full = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
  let best = 1;
  for (const c of colliders) {
    if (!c.camera) continue;
    // Para a câmera, um cilindro vira a caixa que o envolve: basta para troncos e postes.
    const bounds = c.kind === 'box' ? c : { minX: c.x - c.r, maxX: c.x + c.r, minZ: c.z - c.r, maxZ: c.z + c.r, minY: c.minY, maxY: c.maxY };
    const t = segmentBox(from, to, bounds);
    if (t !== null && t < best) best = t;
  }
  if (best >= 1) return full;
  return Math.max(0, best * full - margin);
}
