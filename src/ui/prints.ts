import { FULL_VIEW, renderFingerprint, type FingerprintSpec, type View } from '../forensics/fingerprint';

export const INK_CARD: [number, number, number] = [28, 30, 44];
export const INK_BLOOD: [number, number, number] = [112, 38, 28];

/** Pixels por unidade do dedo: a latente e as fichas usam a mesma escala. */
const SCALE = 150;

const cache = new Map<string, HTMLCanvasElement>();

interface PrintOpts {
  view?: View;
  ink?: [number, number, number];
  degradation?: number;
  scale?: number;
}

/**
 * Renderizar pixel a pixel custa caro; cada impressão é desenhada uma vez
 * e depois só copiada (drawImage) a cada re-render da tela.
 */
export function printCanvas(spec: FingerprintSpec, opts: PrintOpts = {}): HTMLCanvasElement {
  const view = opts.view ?? FULL_VIEW;
  const scale = opts.scale ?? SCALE;
  const ink = opts.ink ?? INK_CARD;
  const degradation = opts.degradation ?? 0;
  const key = JSON.stringify([spec, view, scale, ink, degradation]);
  let source = cache.get(key);
  if (!source) {
    source = document.createElement('canvas');
    source.width = Math.round((view.x1 - view.x0) * scale);
    source.height = Math.round((view.y1 - view.y0) * scale);
    renderFingerprint(source, spec, { view, ink, degradation, fingerMask: view === FULL_VIEW });
    cache.set(key, source);
  }
  const copy = document.createElement('canvas');
  copy.width = source.width;
  copy.height = source.height;
  copy.getContext('2d')?.drawImage(source, 0, 0);
  copy.className = 'print';
  return copy;
}
