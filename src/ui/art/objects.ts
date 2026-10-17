import type { ObjectId } from '../../engine/types';
import { accent, ink, paper, s, shade } from './svg';

/**
 * Objetos do cotidiano para as cenas de busca, desenhados em coordenadas
 * locais centradas em (0, 0), cabendo num quadrado de cerca de 40 × 40.
 */
type Draw = (hatch: string) => SVGElement[];

const OBJECTS: Record<ObjectId, Draw> = {
  lamparina: (h) => [
    paper('path', { d: 'M -12 14 H 12 L 8 4 H -8 Z' }),
    ink('path', { d: 'M -12 14 H 12 L 8 4 H -8 Z M -6 4 Q -10 -8 0 -12 Q 10 -8 6 4' }),
    shade('path', h, { d: 'M -6 4 Q -10 -8 0 -12 Q 10 -8 6 4 Z' }),
    accent('path', { d: 'M 0 -12 Q -3 -17 0 -20 Q 3 -17 0 -12' }),
    ink('path', { d: 'M 12 8 Q 18 8 18 2' }),
  ],
  chave: () => [ink('circle', { cx: -10, cy: 0, r: 6 }), ink('path', { d: 'M -4 0 H 16 M 10 0 V 6 M 15 0 V 5' })],
  livro: (h) => [
    paper('path', { d: 'M -16 -10 H 14 V 12 H -16 Z' }),
    ink('path', { d: 'M -16 -10 H 14 V 12 H -16 Z M -12 -10 V 12' }),
    shade('rect', h, { x: -16, y: -10, width: 4, height: 22 }),
    ink('path', { d: 'M -6 -3 H 8 M -6 2 H 8' }),
  ],
  xicara: (h) => [
    paper('path', { d: 'M -12 -6 H 8 Q 8 10 -2 10 Q -12 10 -12 -6 Z' }),
    ink('path', { d: 'M -12 -6 H 8 Q 8 10 -2 10 Q -12 10 -12 -6 Z M 8 -2 Q 15 -2 14 4 Q 13 8 7 7 M -16 12 H 12' }),
    shade('path', h, { d: 'M -10 0 H 6 Q 5 8 -2 8 Q -9 8 -10 0 Z' }),
  ],
  relogio: (h) => [
    paper('circle', { cx: 0, cy: 3, r: 12 }),
    ink('circle', { cx: 0, cy: 3, r: 12 }),
    ink('path', { d: 'M 0 -9 V -13 M -3 -15 H 3 M 0 3 V -4 M 0 3 L 5 6' }),
    shade('circle', h, { cx: 0, cy: 3, r: 4 }),
  ],
  tesoura: () => [
    ink('circle', { cx: -9, cy: 8, r: 5 }),
    ink('circle', { cx: 9, cy: 8, r: 5 }),
    ink('path', { d: 'M -6 4 L 8 -16 M 6 4 L -8 -16' }),
  ],
  garrafa: (h) => [
    paper('path', { d: 'M -4 -18 H 4 V -10 Q 9 -6 9 2 V 16 H -9 V 2 Q -9 -6 -4 -10 Z' }),
    ink('path', { d: 'M -4 -18 H 4 V -10 Q 9 -6 9 2 V 16 H -9 V 2 Q -9 -6 -4 -10 Z' }),
    shade('rect', h, { x: -9, y: 4, width: 18, height: 12 }),
    ink('path', { d: 'M -9 4 H 9' }),
  ],
  chapeu: (h) => [
    paper('path', { d: 'M -10 4 V -10 Q 0 -14 10 -10 V 4 Z' }),
    shade('path', h, { d: 'M -10 4 V -10 Q 0 -14 10 -10 V 4 Z' }),
    ink('path', { d: 'M -10 4 V -10 Q 0 -14 10 -10 V 4 M -18 6 Q 0 0 18 6 Q 0 10 -18 6 Z' }),
    accent('path', { d: 'M -10 -1 H 10' }),
  ],
  vela: (h) => [
    paper('rect', { x: -5, y: -8, width: 10, height: 20 }),
    ink('rect', { x: -5, y: -8, width: 10, height: 20 }),
    shade('rect', h, { x: 1, y: -8, width: 4, height: 20 }),
    ink('path', { d: 'M -12 14 H 12 M 0 -8 V -11' }),
    accent('path', { d: 'M 0 -11 Q -3 -15 0 -19 Q 3 -15 0 -11' }),
  ],
  oculos: () => [ink('circle', { cx: -9, cy: 0, r: 7 }), ink('circle', { cx: 9, cy: 0, r: 7 }), ink('path', { d: 'M -2 -1 Q 0 -4 2 -1 M -16 -1 L -20 -6 M 16 -1 L 20 -6' })],
  moeda: (h) => [paper('circle', { cx: 0, cy: 0, r: 10 }), ink('circle', { cx: 0, cy: 0, r: 10 }), ink('circle', { cx: 0, cy: 0, r: 7 }), shade('circle', h, { cx: 0, cy: 0, r: 4 })],
  carta: () => [
    paper('rect', { x: -16, y: -10, width: 32, height: 20 }),
    ink('rect', { x: -16, y: -10, width: 32, height: 20 }),
    ink('path', { d: 'M -16 -10 L 0 3 L 16 -10' }),
    accent('circle', { cx: 0, cy: 3, r: 3 }),
  ],
  ferradura: () => [ink('path', { d: 'M -10 14 V 0 A 10 10 0 0 1 10 0 V 14 M -14 14 H -6 M 6 14 H 14' }), ink('path', { d: 'M -10 4 H -7 M 7 4 H 10 M -8 -6 L -6 -4 M 8 -6 L 6 -4' })],
  pena: (h) => [
    paper('path', { d: 'M -12 16 H 2 V 6 H -12 Z' }),
    ink('path', { d: 'M -12 16 H 2 V 6 H -12 Z' }),
    shade('rect', h, { x: -12, y: 10, width: 14, height: 6 }),
    ink('path', { d: 'M -5 6 L 12 -18 M 12 -18 Q 18 -8 4 0 M 12 -18 Q 2 -14 0 -4' }),
  ],
  botao: () => [ink('circle', { cx: 0, cy: 0, r: 8 }), ink('circle', { cx: -3, cy: -3, r: 1.3 }), ink('circle', { cx: 3, cy: -3, r: 1.3 }), ink('circle', { cx: -3, cy: 3, r: 1.3 }), ink('circle', { cx: 3, cy: 3, r: 1.3 })],
  fosforos: (h) => [
    paper('rect', { x: -14, y: -6, width: 28, height: 14 }),
    ink('rect', { x: -14, y: -6, width: 28, height: 14 }),
    shade('rect', h, { x: -14, y: -6, width: 6, height: 14 }),
    ink('path', { d: 'M 4 -6 L 12 -16' }),
    accent('circle', { cx: 12, cy: -17, r: 2 }),
  ],
  cachimbo: (h) => [
    paper('path', { d: 'M 2 -8 H 14 V 4 Q 14 10 8 10 Q 2 10 2 4 Z' }),
    shade('path', h, { d: 'M 2 -8 H 14 V 4 Q 14 10 8 10 Q 2 10 2 4 Z' }),
    ink('path', { d: 'M 2 -8 H 14 V 4 Q 14 10 8 10 Q 2 10 2 4 Z M 2 2 L -18 -4' }),
  ],
  luva: () => [
    paper('path', { d: 'M -8 14 V -2 L -12 -10 Q -11 -13 -8 -11 L -6 -6 V -16 Q -3 -18 -2 -16 V -8 V -18 Q 1 -20 2 -18 V -8 V -16 Q 5 -17 6 -15 V -6 L 10 -10 Q 13 -9 11 -6 L 8 2 V 14 Z' }),
    ink('path', { d: 'M -8 14 V -2 L -12 -10 Q -11 -13 -8 -11 L -6 -6 V -16 Q -3 -18 -2 -16 V -8 V -18 Q 1 -20 2 -18 V -8 V -16 Q 5 -17 6 -15 V -6 L 10 -10 Q 13 -9 11 -6 L 8 2 V 14 Z M -8 10 H 8' }),
  ],
  pente: () => [ink('path', { d: 'M -16 -4 H 16 V 2 H -16 Z' }), ink('path', { d: 'M -13 2 V 10 M -9 2 V 10 M -5 2 V 10 M -1 2 V 10 M 3 2 V 10 M 7 2 V 10 M 11 2 V 10 M 15 2 V 10' })],
  colher: () => [ink('ellipse', { cx: -9, cy: 0, rx: 7, ry: 5 }), ink('path', { d: 'M -2 0 H 18' })],
  lupa: (h) => [paper('circle', { cx: -4, cy: -4, r: 10 }), shade('circle', h, { cx: -4, cy: -4, r: 10 }), ink('circle', { cx: -4, cy: -4, r: 10 }), ink('path', { d: 'M 3 3 L 16 16' })],
  cadeado: (h) => [
    paper('rect', { x: -10, y: -2, width: 20, height: 16 }),
    ink('rect', { x: -10, y: -2, width: 20, height: 16 }),
    shade('rect', h, { x: -10, y: 8, width: 20, height: 6 }),
    ink('path', { d: 'M -6 -2 V -8 A 6 6 0 0 1 6 -8 V -2 M 0 4 V 8' }),
  ],
};

export const OBJECT_NAMES: Record<ObjectId, string> = {
  lamparina: 'Lamparina',
  chave: 'Chave',
  livro: 'Livro',
  xicara: 'Xícara',
  relogio: 'Relógio de bolso',
  tesoura: 'Tesoura',
  garrafa: 'Garrafa',
  chapeu: 'Chapéu',
  vela: 'Vela',
  oculos: 'Óculos',
  moeda: 'Moeda',
  carta: 'Carta',
  ferradura: 'Ferradura',
  pena: 'Pena e tinteiro',
  botao: 'Botão',
  fosforos: 'Caixa de fósforos',
  cachimbo: 'Cachimbo',
  luva: 'Luva',
  pente: 'Pente',
  colher: 'Colher',
  lupa: 'Lupa',
  cadeado: 'Cadeado',
};

export const ALL_OBJECTS = Object.keys(OBJECTS) as ObjectId[];

/** Grupo SVG com o objeto já posicionado, girado e escalado. */
export function placedObject(id: ObjectId, hatch: string, x: number, y: number, rotation: number, scale: number): SVGGElement {
  return s('g', { class: 'obj', transform: `translate(${x} ${y}) rotate(${rotation}) scale(${scale})`, 'data-obj': id }, ...OBJECTS[id](hatch));
}
