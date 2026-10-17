import type { ObjectId } from '../../engine/types';

/**
 * Medidas e pontos do rancho, sem Three.js, para os testes conferirem o
 * layout. Metros; a frente da casa olha para +z.
 */
export const HOUSE_Z = -6;
export const HOUSE_W = 9;
export const HOUSE_D = 5;
export const WALL_H = 2.6;
export const WALL_T = 0.4;
export const RIDGE = 1.7;
export const DOOR_X0 = 0.1;
export const DOOR_X1 = 1.1;
export const DOOR_H = 2;

export const FRONT = HOUSE_Z + HOUSE_D / 2;
export const BACK = HOUSE_Z - HOUSE_D / 2;
/** Faces internas das paredes. */
export const INNER = { x0: -HOUSE_W / 2 + WALL_T, x1: HOUSE_W / 2 - WALL_T, z0: BACK + WALL_T, z1: FRONT - WALL_T };

/**
 * Parede interna que separa o quarto (à direita, com a janela da direita) da
 * sala. O cartão documentado "Mancha no marco da porta" fala do marco da
 * porta do quarto; a planta em si é dramatizada.
 */
export const QUARTO = { x: 1.6, t: 0.2, z0: -6.7, z1: -5.6, jamb: 0.08 };

export const TABLE = { x: -2.5, z: HOUSE_Z - 0.9, top: 0.79 };
export const BENCH = { x: TABLE.x, z: TABLE.z + 0.8, top: 0.48 };
export const TRUNK = { x: -0.4, z: INNER.z0 + 0.35, top: 0.6 };
export const WINDOWS = [-2.8, 3] as const;

export interface Spot {
  x: number;
  y: number;
  z: number;
  /** Giro em torno de y, em radianos. */
  rot: number;
  /** Onde está, para a descrição do exame. */
  where: string;
}

/**
 * Onde cada objeto da busca do rancho fica no 3D. Posições dramatizadas:
 * o processo não descreve a casa. Metade fica dentro, metade no terreiro,
 * para a exploração usar o cenário todo. O quarto fica vazio.
 */
export const SEARCH_SPOTS: Partial<Record<ObjectId, Spot>> = {
  lamparina: { x: TABLE.x + 0.35, y: TABLE.top, z: TABLE.z - 0.05, rot: 0, where: 'sobre a mesa' },
  xicara: { x: TABLE.x - 0.35, y: TABLE.top, z: TABLE.z + 0.15, rot: 0.6, where: 'sobre a mesa' },
  chapeu: { x: BENCH.x + 0.2, y: BENCH.top, z: BENCH.z, rot: 0.4, where: 'sobre o banco' },
  vela: { x: TRUNK.x + 0.25, y: TRUNK.top, z: TRUNK.z, rot: 0, where: 'sobre o baú' },
  chave: { x: -0.5, y: 0.02, z: INNER.z1 - 0.6, rot: 0.8, where: 'no chão, perto da porta' },
  pente: { x: WINDOWS[0], y: 1.25, z: INNER.z1 - 0.08, rot: 0, where: 'no peitoril da janela' },
  moeda: { x: -2, y: 0.015, z: -0.6, rot: 0, where: 'na terra do terreiro' },
  botao: { x: 8.8, y: 0.015, z: -2.2, rot: 0, where: 'no chão do curral' },
};
