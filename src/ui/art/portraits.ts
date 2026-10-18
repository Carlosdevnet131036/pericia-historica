import type { PortraitKind } from '../../engine/types';
import { canvas, ink, paper, shade } from './svg';

/**
 * Retratos em gravura para o diário. São tipos genéricos de época (mulher do
 * campo, homem de chapéu, desconhecido), não tentativas de semelhança: não há
 * retratos confiáveis de todos os envolvidos, e um rosto inventado pareceria
 * documento. Por isso o diário os identifica como ilustração.
 */
const BUILDERS: Record<PortraitKind, (hatch: string) => SVGElement[]> = {
  mulher: (h) => [
    // Xale sobre os ombros, cabelo repartido ao meio e preso num coque.
    paper('path', { d: 'M 14 120 Q 16 86 50 82 Q 84 86 86 120 Z' }),
    shade('path', h, { d: 'M 14 120 Q 16 86 50 82 Q 84 86 86 120 L 66 120 L 50 96 L 34 120 Z' }),
    ink('path', { d: 'M 14 120 Q 16 86 50 82 Q 84 86 86 120 M 34 120 L 50 96 L 66 120' }),
    paper('path', { d: 'M 44 70 V 84 H 56 V 70 Z' }),
    ink('path', { d: 'M 44 72 V 84 M 56 72 V 84' }),
    shade('ellipse', h, { cx: 50, cy: 24, rx: 10, ry: 7 }),
    ink('ellipse', { cx: 50, cy: 24, rx: 10, ry: 7 }),
    paper('ellipse', { cx: 50, cy: 52, rx: 15, ry: 20 }),
    ink('ellipse', { cx: 50, cy: 52, rx: 15, ry: 20 }),
    shade('path', h, { d: 'M 35 50 Q 34 30 50 31 Q 66 30 65 50 Q 60 38 50 37 Q 40 38 35 50 Z' }),
    ink('path', { d: 'M 35 50 Q 34 30 50 31 Q 66 30 65 50 M 50 31 V 37' }),
    ink('path', { d: 'M 42 51 h 5 M 53 51 h 5 M 50 54 v 7 M 45 64 Q 50 66 55 64' }),
  ],
  homem: (h) => [
    // Paletó com lapelas, bigode e chapéu de aba larga.
    paper('path', { d: 'M 12 120 Q 14 88 50 84 Q 86 88 88 120 Z' }),
    shade('path', h, { d: 'M 12 120 Q 14 88 50 84 Q 86 88 88 120 L 62 120 L 50 92 L 38 120 Z' }),
    ink('path', { d: 'M 12 120 Q 14 88 50 84 Q 86 88 88 120 M 38 120 L 50 92 L 62 120 M 44 98 L 50 92 L 56 98' }),
    paper('path', { d: 'M 44 72 V 86 H 56 V 72 Z' }),
    ink('path', { d: 'M 44 74 V 86 M 56 74 V 86' }),
    paper('ellipse', { cx: 50, cy: 54, rx: 15, ry: 19 }),
    ink('ellipse', { cx: 50, cy: 54, rx: 15, ry: 19 }),
    ink('path', { d: 'M 42 53 h 5 M 53 53 h 5 M 50 56 v 6' }),
    shade('path', h, { d: 'M 41 66 Q 50 62 59 66 Q 50 69 41 66 Z' }),
    ink('path', { d: 'M 41 66 Q 50 62 59 66' }),
    paper('path', { d: 'M 22 42 Q 50 36 78 42 Q 50 46 22 42 Z M 36 41 Q 36 22 50 22 Q 64 22 64 41 Z' }),
    shade('path', h, { d: 'M 36 41 Q 36 22 50 22 Q 64 22 64 41 Z' }),
    ink('path', { d: 'M 22 42 Q 50 36 78 42 Q 50 46 22 42 M 36 41 Q 36 22 50 22 Q 64 22 64 41' }),
  ],
  desconhecido: (h) => [
    // Silhueta escura com um ponto de interrogação: identidade não documentada.
    shade('path', h, { d: 'M 12 120 Q 14 88 50 84 Q 86 88 88 120 Z' }),
    shade('ellipse', h, { cx: 50, cy: 54, rx: 15, ry: 19 }),
    shade('path', h, { d: 'M 22 42 Q 50 36 78 42 Q 50 46 22 42 Z M 36 41 Q 36 22 50 22 Q 64 22 64 41 Z' }),
    ink('path', { d: 'M 12 120 Q 14 88 50 84 Q 86 88 88 120' }),
    ink('ellipse', { cx: 50, cy: 54, rx: 15, ry: 19 }),
    ink('path', { d: 'M 22 42 Q 50 36 78 42 Q 50 46 22 42 M 36 41 Q 36 22 50 22 Q 64 22 64 41' }),
    ink('path', { d: 'M 45 50 Q 45 44 50 44 Q 56 44 56 50 Q 56 54 50 56 V 60 M 50 65 v 1', class: 'portrait-q' }),
  ],
};

export function portrait(kind: PortraitKind, label: string): SVGSVGElement {
  const { root, hatch } = canvas('0 0 100 120', label);
  root.classList.add('portrait');
  root.append(paper('rect', { x: 0, y: 0, width: 100, height: 120 }), ...BUILDERS[kind](hatch));
  return root;
}
