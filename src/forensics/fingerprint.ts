/**
 * Gerador procedural de impressões digitais.
 *
 * Modelo: cada crista é uma curva de nível de um campo escalar f(x, y),
 * e a imagem é cos(2π·f/λ + φ). As minúcias (bifurcações e terminações)
 * surgem como singularidades de fase: somar ±atan2 em torno de um ponto
 * cria ali exatamente uma crista a mais ou a menos. É o mesmo princípio dos
 * modelos de "phase portrait" usados em pesquisa de biometria.
 *
 * Coordenadas normalizadas do dedo: x ∈ [-1, 1], y ∈ [-1.3, 1.3], y cresce
 * para baixo (como no canvas). A ponta do dedo fica em y negativo.
 */

/** Os quatro tipos fundamentais do sistema de Vucetich. */
export type PatternType = 'arco' | 'presilla-interna' | 'presilla-externa' | 'verticilo';

export interface Point {
  x: number;
  y: number;
}

export interface Minutia extends Point {
  id: string;
  /** +1 ou -1: sentido da singularidade (bifurcação vs. terminação visual). */
  polarity: 1 | -1;
}

export interface FingerprintSpec {
  pattern: PatternType;
  core: Point;
  minutiae: Minutia[];
  seed: number;
  /** Distância entre cristas, em unidades normalizadas. */
  ridgePeriod?: number;
}

/** Retângulo visível, em coordenadas do dedo. */
export interface View {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface RenderOptions {
  view: View;
  ink: [number, number, number];
  /** 0 = impressão limpa de ficha; 1 = latente muito degradada. */
  degradation: number;
  /** Recorta no formato da polpa digital. */
  fingerMask: boolean;
}

export const FULL_VIEW: View = { x0: -1, y0: -1.3, x1: 1, y1: 1.3 };

const TAU = Math.PI * 2;

function baseField(spec: FingerprintSpec, x: number, y: number): number {
  const dx = x - spec.core.x;
  const dy = y - spec.core.y;
  switch (spec.pattern) {
    case 'arco': {
      // Cristas sobem no centro e achatam em direção à base do dedo.
      const lift = 0.42 * Math.exp(-2.2 * dx * dx) * Math.min(1, Math.max(0.15, 0.9 - dy * 0.6));
      return y + lift;
    }
    case 'verticilo': {
      return Math.hypot(dx, dy * 0.82);
    }
    case 'presilla-interna':
    case 'presilla-externa': {
      // Distância a uma semirreta que sai do núcleo: as curvas de nível
      // formam o "grampo" típico da presilha, aberto para um dos lados.
      const side = spec.pattern === 'presilla-interna' ? -1 : 1;
      const len = Math.hypot(0.75, 1);
      const ux = (side * 0.75) / len;
      const uy = 1 / len;
      const t = Math.max(0, dx * ux + dy * uy);
      return Math.hypot(dx - t * ux, dy - t * uy);
    }
  }
}

/** Fase da crista no ponto (x, y). Função pura: usada no render e nos testes. */
export function ridgePhase(spec: FingerprintSpec, x: number, y: number): number {
  const period = spec.ridgePeriod ?? 0.075;
  let phase = (TAU * baseField(spec, x, y)) / period;
  if (spec.pattern === 'verticilo') {
    // Uma volta de espiral no núcleo, como nos verticilos reais.
    phase += Math.atan2(y - spec.core.y, x - spec.core.x);
  }
  for (const m of spec.minutiae) {
    phase += m.polarity * Math.atan2(y - m.y, x - m.x);
  }
  return phase;
}

/** Ruído determinístico (value noise) para simular pressão e falhas de tinta. */
function makeNoise(seed: number) {
  const hash = (ix: number, iy: number) => {
    let h = (ix * 374761393 + iy * 668265263 + seed * 2246822519) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = smooth(x - ix);
    const fy = smooth(y - iy);
    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

function smoothstep(e0: number, e1: number, v: number): number {
  const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function renderFingerprint(
  canvas: HTMLCanvasElement,
  spec: FingerprintSpec,
  opts: RenderOptions,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  const img = ctx.createImageData(width, height);
  const noise = makeNoise(spec.seed);
  const { view, ink, degradation } = opts;
  const sx = (view.x1 - view.x0) / width;
  const sy = (view.y1 - view.y0) / height;

  for (let py = 0; py < height; py++) {
    const y = view.y0 + py * sy;
    for (let px = 0; px < width; px++) {
      const x = view.x0 + px * sx;
      let mask = 1;
      if (opts.fingerMask) {
        const e = (x / 0.88) ** 2 + ((y + 0.05) / 1.18) ** 2;
        mask = 1 - smoothstep(0.82, 1, e);
        if (mask <= 0) continue;
      }
      const ridge = smoothstep(-0.15, 0.45, Math.cos(ridgePhase(spec, x, y)));
      const pressure = 0.55 + 0.45 * noise(x * 3 + 7, y * 3 + 3);
      const pores = noise(x * 60, y * 60) > 0.86 ? 0.35 : 1;
      const gaps = smoothstep(degradation * 0.7, degradation * 0.7 + 0.2, noise(x * 9 + 11, y * 9 + 5));
      const a = ridge * mask * pressure * pores * (degradation > 0 ? gaps : 1);
      const i = (py * width + px) * 4;
      img.data[i] = ink[0];
      img.data[i + 1] = ink[1];
      img.data[i + 2] = ink[2];
      img.data[i + 3] = Math.round(Math.min(1, a * 1.25) * 255);
    }
  }
  ctx.clearRect(0, 0, width, height);
  ctx.putImageData(img, 0, 0);
}

/** Converte um clique no canvas (px CSS) para coordenadas do dedo. */
export function canvasToFinger(canvas: HTMLCanvasElement, view: View, clientX: number, clientY: number): Point {
  const r = canvas.getBoundingClientRect();
  const u = (clientX - r.left) / r.width;
  const v = (clientY - r.top) / r.height;
  return { x: view.x0 + u * (view.x1 - view.x0), y: view.y0 + v * (view.y1 - view.y0) };
}

/** Converte coordenadas do dedo para fração (0–1) do canvas, para posicionar marcadores. */
export function fingerToFraction(view: View, p: Point): Point {
  return { x: (p.x - view.x0) / (view.x1 - view.x0), y: (p.y - view.y0) / (view.y1 - view.y0) };
}
