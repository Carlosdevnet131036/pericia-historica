import type { SceneId } from '../../engine/types';
import { accent, canvas, ground, ink, paper, shade } from './svg';

/** Cenas dos lugares da investigação, viewBox 320 × 150, chão em y = 130. */

type Builder = (hatch: string) => SVGElement[];

const window4 = (x: number, y: number, w = 22, h = 18) => [
  ink('rect', { x, y, width: w, height: h }),
  ink('path', { d: `M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w}` }),
];

const tree = (hatch: string, x: number, r = 18, top = 82) => [
  ink('path', { d: `M ${x} 130 V ${top + r - 4}` }),
  shade('circle', hatch, { cx: x, cy: top, r }),
  ink('circle', { cx: x, cy: top, r }),
];

const pine = (hatch: string, x: number, base: number, h: number) => [
  shade('path', hatch, { d: `M ${x} ${base - h} L ${x - h * 0.32} ${base} L ${x + h * 0.32} ${base} Z` }),
  ink('path', { d: `M ${x} ${base - h} L ${x - h * 0.32} ${base} L ${x + h * 0.32} ${base} Z M ${x} ${base} V ${base + 6}` }),
];

const BUILDERS: Record<SceneId, Builder> = {
  casa: (hatch) => [
    ground(),
    ...tree(hatch, 44),
    paper('rect', { x: 92, y: 60, width: 136, height: 70 }),
    shade('path', hatch, { d: 'M 82 62 L 160 22 L 238 62 Z' }),
    ink('path', { d: 'M 82 62 L 160 22 L 238 62 Z' }),
    ink('rect', { x: 92, y: 62, width: 136, height: 68 }),
    ink('rect', { x: 200, y: 30, width: 12, height: 20 }),
    ...window4(106, 74),
    ...window4(192, 74),
    ink('rect', { x: 150, y: 96, width: 22, height: 34 }),
    ink('circle', { cx: 167, cy: 114, r: 1.2 }),
    accent('path', { d: 'M 276 22 A 12 12 0 1 0 288 38 A 9 9 0 1 1 276 22 Z' }),
  ],
  delegacia: (hatch) => [
    ground(),
    paper('rect', { x: 70, y: 56, width: 180, height: 74 }),
    shade('path', hatch, { d: 'M 62 58 L 160 26 L 258 58 Z' }),
    ink('path', { d: 'M 62 58 L 160 26 L 258 58 Z M 62 58 H 258' }),
    ink('rect', { x: 70, y: 58, width: 180, height: 72 }),
    ...[88, 116, 204, 232].map((x) => ink('path', { d: `M ${x} 64 V 130 M ${x - 5} 64 H ${x + 5} M ${x - 5} 130 H ${x + 5}` })),
    ink('rect', { x: 146, y: 88, width: 28, height: 42 }),
    shade('rect', hatch, { x: 146, y: 88, width: 28, height: 42 }),
    ink('path', { d: 'M 120 40 H 200' }),
    ink('path', { d: 'M 286 130 V 70 M 280 70 H 292' }),
    accent('circle', { cx: 286, cy: 64, r: 6 }),
  ],
  campo: (hatch) => [
    ink('path', { d: 'M 8 112 Q 80 88 160 106 T 312 98' }),
    shade('path', hatch, { d: 'M 8 112 Q 80 88 160 106 T 312 98 V 130 H 8 Z' }),
    ground(),
    paper('rect', { x: 60, y: 82, width: 46, height: 30 }),
    ink('path', { d: 'M 54 84 L 83 64 L 112 84 M 60 84 V 112 H 106 V 84 M 78 112 V 98 H 88 V 112' }),
    paper('rect', { x: 206, y: 78, width: 40, height: 26 }),
    ink('path', { d: 'M 200 80 L 226 62 L 252 80 M 206 80 V 104 H 246 V 80' }),
    ink('path', { d: 'M 130 120 H 190 M 136 114 V 126 M 152 114 V 126 M 168 114 V 126 M 184 114 V 126' }),
    ink('path', { d: 'M 150 34 q 5 -5 10 0 q 5 -5 10 0 M 186 44 q 4 -4 8 0 q 4 -4 8 0' }),
    accent('circle', { cx: 270, cy: 30, r: 9 }),
  ],
  cidade: (hatch) => {
    const out: SVGElement[] = [ground()];
    const blocks = [
      [20, 70, 50],
      [74, 46, 44],
      [122, 60, 56],
      [182, 38, 48],
      [234, 66, 60],
    ] as const;
    for (const [x, y, w] of blocks) {
      out.push(paper('rect', { x, y, width: w, height: 130 - y }), ink('rect', { x, y, width: w, height: 130 - y }));
      for (let wy = y + 8; wy < 120; wy += 14) {
        for (let wx = x + 7; wx < x + w - 8; wx += 13) out.push(ink('rect', { x: wx, y: wy, width: 6, height: 8 }));
      }
    }
    out.push(shade('rect', hatch, { x: 182, y: 38, width: 48, height: 92 }), ink('path', { d: 'M 300 130 V 84 M 292 84 H 308' }), accent('circle', { cx: 300, cy: 79, r: 5 }));
    return out;
  },
  litoral: (hatch) => [
    ink('path', { d: 'M 8 82 H 312' }),
    accent('path', { d: 'M 236 82 A 22 22 0 0 1 280 82' }),
    ...[94, 106, 118].map((y, i) => ink('path', { d: `M ${16 + i * 10} ${y} q 10 -6 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0` })),
    shade('path', hatch, { d: 'M 8 130 Q 120 118 312 126 V 140 H 8 Z' }),
    ink('path', { d: 'M 8 130 Q 120 118 312 126' }),
    ink('path', { d: 'M 40 124 V 100 H 120 V 122 M 56 100 V 124 M 72 100 V 124 M 88 100 V 124 M 104 100 V 123' }),
    ink('path', { d: 'M 180 92 H 216 L 210 100 H 186 Z M 198 92 V 70 L 214 88 H 198' }),
  ],
  cemiterio: (hatch) => [
    ground(),
    ink('path', { d: 'M 16 106 H 304 M 16 100 H 304' }),
    ...[24, 40, 56, 72, 248, 264, 280, 296].map((x) => ink('path', { d: `M ${x} 96 V 130` })),
    ...pine(hatch, 280, 122, 70),
    paper('path', { d: 'M 100 130 V 96 A 12 12 0 0 1 124 96 V 130 Z' }),
    ink('path', { d: 'M 100 130 V 96 A 12 12 0 0 1 124 96 V 130' }),
    paper('path', { d: 'M 140 130 V 90 A 14 14 0 0 1 168 90 V 130 Z' }),
    ink('path', { d: 'M 140 130 V 90 A 14 14 0 0 1 168 90 V 130 M 148 100 H 160 M 148 108 H 160' }),
    ink('path', { d: 'M 200 130 V 82 M 188 94 H 212' }),
    shade('rect', hatch, { x: 96, y: 126, width: 120, height: 4 }),
    accent('path', { d: 'M 194 130 q 3 -8 6 0 q 3 -8 6 0' }),
  ],
  laboratorio: (hatch) => [
    ink('path', { d: 'M 20 108 H 300 M 32 108 V 130 M 288 108 V 130' }),
    shade('rect', hatch, { x: 20, y: 108, width: 280, height: 6 }),
    // Microscópio: base, coluna, braço, tubo inclinado com ocular e platina.
    ink('rect', { x: 70, y: 100, width: 40, height: 8 }),
    ink('path', { d: 'M 102 100 V 64 Q 102 52 92 50' }),
    shade('path', hatch, { d: 'M 78 34 L 88 31 L 99 74 L 89 77 Z' }),
    ink('path', { d: 'M 78 34 L 88 31 L 99 74 L 89 77 Z M 75 28 L 89 24' }),
    ink('path', { d: 'M 80 84 H 110 M 92 77 V 84' }),
    ink('circle', { cx: 104, cy: 70, r: 3.5 }),
    ink('path', { d: 'M 160 72 V 84 L 146 108 H 182 L 168 84 V 72 Z M 156 72 H 172' }),
    accent('path', { d: 'M 151 100 H 177' }),
    ink('path', { d: 'M 200 80 V 106 A 6 6 0 0 0 212 106 V 80 M 222 80 V 106 A 6 6 0 0 0 234 106 V 80 M 194 80 H 240' }),
    ink('rect', { x: 250, y: 30, width: 50, height: 60 }),
    ink('path', { d: 'M 250 50 H 300 M 250 70 H 300 M 256 30 V 50 M 264 30 V 50 M 272 30 V 50 M 260 50 V 70 M 270 50 V 70 M 286 50 V 70' }),
    ink('path', { d: 'M 30 30 H 70 V 70 H 30 Z M 30 50 H 70' }),
  ],
  ravina: (hatch) => [
    shade('path', hatch, { d: 'M 8 40 Q 60 60 110 126 L 8 130 Z' }),
    ink('path', { d: 'M 8 40 Q 60 60 110 126' }),
    shade('path', hatch, { d: 'M 312 34 Q 250 64 206 126 L 312 130 Z' }),
    ink('path', { d: 'M 312 34 Q 250 64 206 126' }),
    ink('path', { d: 'M 100 128 q 10 -4 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0' }),
    ink('path', { d: 'M 40 66 Q 160 30 282 60 M 40 72 Q 160 38 282 66 M 80 58 V 64 M 120 48 V 55 M 160 44 V 50 M 200 46 V 53 M 240 52 V 58' }),
    ...pine(hatch, 34, 54, 26),
    ...pine(hatch, 292, 50, 28),
    paper('ellipse', { cx: 150, cy: 124, rx: 14, ry: 7 }),
    ink('ellipse', { cx: 150, cy: 124, rx: 14, ry: 7 }),
    accent('path', { d: 'M 178 120 q 6 -6 12 0' }),
  ],
  posto: (hatch) => [
    ground(),
    ink('path', { d: 'M 30 40 H 170 M 40 40 V 130 M 160 40 V 130' }),
    shade('rect', hatch, { x: 30, y: 34, width: 140, height: 6 }),
    paper('rect', { x: 88, y: 66, width: 26, height: 64 }),
    ink('rect', { x: 88, y: 66, width: 26, height: 64 }),
    accent('circle', { cx: 101, cy: 56, r: 10 }),
    ink('path', { d: 'M 94 80 H 108 M 94 88 H 108 M 114 90 q 14 4 12 24' }),
    paper('path', { d: 'M 190 116 V 104 Q 196 88 222 86 L 236 74 H 270 L 286 92 Q 306 94 306 108 V 116 Z' }),
    ink('path', { d: 'M 190 116 V 104 Q 196 88 222 86 L 236 74 H 270 L 286 92 Q 306 94 306 108 V 116 H 190 M 238 86 H 282 M 256 76 V 86' }),
    ink('circle', { cx: 214, cy: 118, r: 10 }),
    ink('circle', { cx: 284, cy: 118, r: 10 }),
  ],
  arquivo: (hatch) => [
    ground(),
    paper('rect', { x: 40, y: 40, width: 70, height: 90 }),
    ink('rect', { x: 40, y: 40, width: 70, height: 90 }),
    ...[48, 70, 92, 114].map((y) => ink('path', { d: `M 46 ${y} H 104 V ${y + 16} H 46 Z M 68 ${y + 8} H 82` })),
    ink('path', { d: 'M 140 96 H 290 M 150 96 V 130 M 280 96 V 130' }),
    shade('rect', hatch, { x: 140, y: 96, width: 150, height: 5 }),
    ink('path', { d: 'M 170 96 L 168 90 L 196 86 L 200 92 M 176 89 L 192 87' }),
    ink('path', { d: 'M 250 96 V 70 L 236 56 M 226 50 L 246 46 L 248 62 Z' }),
    accent('path', { d: 'M 228 62 L 220 80 M 240 62 L 246 80' }),
  ],
  jornais: (hatch) => [
    ink('path', { d: 'M 20 130 H 300' }),
    paper('path', { d: 'M 70 128 L 66 96 L 236 90 L 244 124 Z' }),
    ink('path', { d: 'M 70 128 L 66 96 L 236 90 L 244 124 Z' }),
    paper('path', { d: 'M 84 110 L 80 66 L 232 60 L 240 104 Z' }),
    shade('path', hatch, { d: 'M 84 110 L 80 66 L 232 60 L 240 104 Z' }),
    paper('path', { d: 'M 96 96 L 98 40 L 226 40 L 230 96 Z' }),
    ink('path', { d: 'M 96 96 L 98 40 L 226 40 L 230 96 Z' }),
    ink('path', { d: 'M 108 52 H 214 M 108 60 H 214' }),
    ...[70, 76, 82, 88].map((y) => ink('path', { d: `M 110 ${y} H 156 M 166 ${y} H 214` })),
    accent('path', { d: 'M 150 40 V 96 M 102 68 Q 160 74 224 66' }),
  ],
};

export function scene(id: SceneId, label: string): SVGSVGElement {
  const { root, hatch } = canvas('0 0 320 150', label);
  root.classList.add('scene');
  root.append(...BUILDERS[id](hatch));
  return root;
}
