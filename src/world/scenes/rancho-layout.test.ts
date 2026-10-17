import { describe, expect, it } from 'vitest';
import { rojas1892 } from '../../cases/rojas1892';
import { INNER, QUARTO, SEARCH_SPOTS } from './rancho-layout';

const targets = rojas1892.locations.find((l) => l.id === 'rancho')!.search!.targets;

describe('layout do rancho 3D', () => {
  it('cada um dos 8 objetos da busca tem um lugar no 3D', () => {
    expect(targets).toHaveLength(8);
    for (const id of targets) expect(SEARCH_SPOTS[id], id).toBeDefined();
  });

  it('não há objetos sobrando que não sejam alvos da busca', () => {
    expect(Object.keys(SEARCH_SPOTS).sort()).toEqual([...targets].sort());
  });

  it('o quarto fica vazio: nenhum objeto da busca dentro dele', () => {
    for (const [id, s] of Object.entries(SEARCH_SPOTS)) {
      const inQuarto = s!.x > QUARTO.x && s!.x < INNER.x1 && s!.z > INNER.z0 && s!.z < INNER.z1;
      expect(inQuarto, id).toBe(false);
    }
  });

  it('a passagem do quarto cabe o jogador (0,6 m) com folga', () => {
    expect(QUARTO.z1 - QUARTO.z0 - QUARTO.jamb * 2).toBeGreaterThan(0.8);
  });
});
