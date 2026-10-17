import { describe, expect, it } from 'vitest';
import { box, cameraDistance, circle, overlaps, resolveCircle } from './collision';
import { moveDelta } from './motion';

// Uma parede de 4 m em x, com 0,4 m de espessura, centrada em z = 0.
const wall = box(0, 1.3, 0, 4, 2.6, 0.4);
const R = 0.3;

describe('jogador contra obstáculos', () => {
  it('longe de tudo, a posição não muda', () => {
    const p = { x: 0, z: 3 };
    expect(resolveCircle(p, R, [wall])).toBe(p);
  });

  it('encostar na parede empurra para fora pela face mais próxima', () => {
    const p = resolveCircle({ x: 0.5, z: 0.35 }, R, [wall]);
    expect(p.x).toBeCloseTo(0.5);
    expect(p.z).toBeCloseTo(0.2 + R);
  });

  it('andando na diagonal contra a parede, desliza ao longo dela', () => {
    let p = { x: 0, z: 1 };
    const input = { forward: true, back: false, left: false, right: true, run: false };
    for (let i = 0; i < 60; i++) { // 1 s: chega à parede antes de alcançar a ponta dela
      const d = moveDelta(input, 0, 1 / 60);
      p = resolveCircle({ x: p.x + d.x, z: p.z + d.z }, R, [wall]);
    }
    expect(p.z).toBeCloseTo(0.2 + R); // parou na face da parede
    expect(p.x).toBeGreaterThan(1); // mas continuou indo para a direita
  });

  it('nem correndo com o quadro travado (passo máximo) atravessa a parede', () => {
    let p = { x: 0, z: 1 };
    const input = { forward: true, back: false, left: false, right: false, run: true };
    for (let i = 0; i < 200; i++) {
      const d = moveDelta(input, 0, 0.05);
      p = resolveCircle({ x: p.x + d.x, z: p.z + d.z }, R, [wall]);
      expect(p.z).toBeGreaterThan(0);
    }
  });

  it('no canto entre duas paredes, sai das duas', () => {
    const other = box(-2.2, 1.3, -2, 0.4, 2.6, 4);
    const p = resolveCircle({ x: -1.9, z: 0.25 }, R, [wall, other]);
    expect(overlaps(p, R, [wall, other])).toBe(false);
  });

  it('cilindros (troncos, postes) também bloqueiam', () => {
    const trunk = circle(5, 5, 0.9, 3);
    const p = resolveCircle({ x: 5.5, z: 5 }, R, [trunk]);
    expect(Math.hypot(p.x - 5, p.z - 5)).toBeCloseTo(0.9 + R);
  });

  it('obstáculos só de câmera não bloqueiam o jogador', () => {
    const roof = box(0, 3, 0, 4, 1, 4, { solid: false });
    const p = { x: 0, z: 0 };
    expect(resolveCircle(p, R, [roof])).toBe(p);
  });
});

describe('câmera contra obstáculos', () => {
  const head = { x: 0, y: 1.65, z: 1 };

  it('sem nada no caminho, a câmera fica na distância cheia', () => {
    expect(cameraDistance(head, { x: 0, y: 2.5, z: 5 }, [wall])).toBeCloseTo(Math.hypot(0.85, 4));
  });

  it('com uma parede atrás do jogador, a câmera para antes dela', () => {
    const d = cameraDistance(head, { x: 0, y: 1.65, z: -3 }, [wall]);
    // A face da parede está a 0,8 m da cabeça; com a margem, 0,55 m.
    expect(d).toBeCloseTo(0.55);
  });

  it('obstáculos marcados como vazados (cerca) não puxam a câmera', () => {
    const fence = box(0, 0.7, -1, 4, 1.4, 0.15, { camera: false });
    expect(cameraDistance(head, { x: 0, y: 1.2, z: -3 }, [fence])).toBeCloseTo(Math.hypot(0.45, 4));
  });

  it('um segmento que começa dentro de um volume é ignorado', () => {
    const big = box(0, 1.5, 1, 2, 3, 2);
    expect(cameraDistance(head, { x: 0, y: 1.65, z: 5 }, [big])).toBeCloseTo(4);
  });
});
