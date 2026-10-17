import type { CoverId } from '../../engine/types';
import { printCanvas, INK_BLOOD } from '../prints';
import { accent, canvas, ink, paper, shade } from './svg';

/** Capas dos casos, viewBox 200 × 130: o objeto que resume cada caso. */

type Builder = (hatch: string) => SVGElement[];

const BUILDERS: Record<Exclude<CoverId, 'digital'>, Builder> = {
  banheira: (hatch) => [
    ink('path', { d: 'M 14 116 H 186' }),
    paper('path', { d: 'M 30 56 H 170 Q 172 96 140 102 H 60 Q 28 96 30 56 Z' }),
    shade('path', hatch, { d: 'M 34 72 H 166 Q 162 96 140 100 H 60 Q 38 96 34 72 Z' }),
    ink('path', { d: 'M 24 56 H 176 M 30 56 Q 28 96 60 102 H 140 Q 172 96 170 56' }),
    accent('path', { d: 'M 36 66 H 164' }),
    ink('path', { d: 'M 58 102 L 52 116 M 142 102 L 148 116 M 48 116 h 8 M 144 116 h 8' }),
    ink('path', { d: 'M 158 56 V 34 Q 158 26 150 26 H 140 V 32' }),
    ink('path', { d: 'M 136 32 H 144' }),
  ],
  escada: (hatch) => [
    ink('path', { d: 'M 10 120 H 190' }),
    paper('rect', { x: 110, y: 8, width: 80, height: 112 }),
    shade('rect', hatch, { x: 110, y: 8, width: 80, height: 112 }),
    ink('path', { d: 'M 110 8 V 120' }),
    paper('rect', { x: 128, y: 22, width: 36, height: 30 }),
    ink('rect', { x: 128, y: 22, width: 36, height: 30 }),
    ink('path', { d: 'M 146 22 V 52 M 128 37 H 164' }),
    ink('path', { d: 'M 52 120 L 118 40 M 72 120 L 132 48' }),
    ...[0, 1, 2, 3, 4, 5].map((i) => {
      const t = 0.12 + i * 0.15;
      const x1 = 52 + (118 - 52) * t;
      const y1 = 120 - 80 * t;
      const x2 = 72 + (132 - 72) * t;
      const y2 = 120 - 72 * t;
      return i === 3 ? accent('path', { d: `M ${x1} ${y1} L ${(x1 + x2) / 2 - 2} ${(y1 + y2) / 2 + 3}` }) : ink('path', { d: `M ${x1} ${y1} L ${x2} ${y2}` });
    }),
  ],
  cranio: (hatch) => [
    paper('path', { d: 'M 100 14 C 140 14 156 42 152 70 C 150 82 142 86 140 96 V 108 H 60 V 96 C 58 86 50 82 48 70 C 44 42 60 14 100 14 Z' }),
    shade('path', hatch, { d: 'M 100 14 C 140 14 156 42 152 70 C 150 82 142 86 140 96 V 104 Q 128 70 100 18 Z' }),
    ink('path', { d: 'M 100 14 C 140 14 156 42 152 70 C 150 82 142 86 140 96 V 108 H 60 V 96 C 58 86 50 82 48 70 C 44 42 60 14 100 14 Z' }),
    ink('ellipse', { cx: 78, cy: 66, rx: 14, ry: 12 }),
    ink('ellipse', { cx: 122, cy: 66, rx: 14, ry: 12 }),
    ink('path', { d: 'M 100 76 L 92 92 H 108 Z' }),
    ink('path', { d: 'M 68 108 V 98 M 80 108 V 98 M 92 108 V 98 M 104 108 V 98 M 116 108 V 98 M 128 108 V 98' }),
    accent('path', { d: 'M 166 30 L 176 100 M 160 30 H 172 M 170 100 H 182 M 166 30 L 140 34' }),
  ],
  larva: (hatch) => [
    paper('path', { d: 'M 18 112 L 24 40 L 120 34 L 128 106 Z' }),
    ink('path', { d: 'M 18 112 L 24 40 L 120 34 L 128 106 Z' }),
    ink('path', { d: 'M 32 50 H 112 M 32 58 H 112' }),
    ...[68, 74, 80, 86, 92].map((y) => ink('path', { d: `M 34 ${y} H 70 M 78 ${y} H 114` })),
    shade('path', hatch, { d: 'M 120 34 L 128 106 L 134 102 L 126 38 Z' }),
    paper('ellipse', { cx: 154, cy: 52, rx: 22, ry: 10, transform: 'rotate(-28 154 52)' }),
    ink('ellipse', { cx: 154, cy: 52, rx: 22, ry: 10, transform: 'rotate(-28 154 52)' }),
    paper('ellipse', { cx: 168, cy: 56, rx: 22, ry: 10, transform: 'rotate(24 168 56)' }),
    ink('ellipse', { cx: 168, cy: 56, rx: 22, ry: 10, transform: 'rotate(24 168 56)' }),
    shade('ellipse', hatch, { cx: 160, cy: 72, rx: 9, ry: 14 }),
    ink('ellipse', { cx: 160, cy: 72, rx: 9, ry: 14 }),
    accent('circle', { cx: 160, cy: 54, r: 6 }),
    ink('path', { d: 'M 152 82 L 144 94 M 168 82 L 176 94 M 154 70 L 142 76 M 166 70 L 178 76' }),
    ink('path', { d: 'M 150 112 q 4 -6 8 0 q 4 -6 8 0 q 4 -6 8 0 q 4 -6 8 0' }),
  ],
};

export function cover(id: CoverId, label: string): Element {
  if (id === 'digital') {
    // O caso 1 usa o próprio gerador de digitais, em tinta cor de sangue seco.
    const print = printCanvas(
      { pattern: 'presilla-externa', core: { x: 0.02, y: -0.08 }, seed: 1892, minutiae: [{ id: 'a', x: 0.24, y: 0.16, polarity: 1 }] },
      { scale: 52, ink: INK_BLOOD },
    );
    print.classList.add('cover-print');
    print.setAttribute('role', 'img');
    print.setAttribute('aria-label', label);
    return print;
  }
  const { root, hatch } = canvas('0 0 200 130', label);
  root.classList.add('cover');
  root.append(...BUILDERS[id](hatch));
  return root;
}
