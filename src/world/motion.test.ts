import { describe, expect, it } from 'vitest';
import { clampPitch, clampToRadius, headingOf, moveDelta, orbitPosition, PITCH_MAX, RUN_SPEED, turnTowards, WALK_SPEED } from './motion';

const idle = { forward: false, back: false, left: false, right: false, run: false };

describe('movimento relativo à câmera', () => {
  it('parado não se move', () => {
    expect(moveDelta(idle, 0, 1).moving).toBe(false);
  });

  it('com a câmera atrás (yaw 0), W anda para −z', () => {
    const d = moveDelta({ ...idle, forward: true }, 0, 1);
    expect(d.x).toBeCloseTo(0);
    expect(d.z).toBeCloseTo(-WALK_SPEED);
  });

  it('a câmera girada 90° muda o "à frente"', () => {
    const d = moveDelta({ ...idle, forward: true }, Math.PI / 2, 1);
    expect(d.x).toBeCloseTo(-WALK_SPEED);
    expect(d.z).toBeCloseTo(0);
  });

  it('na diagonal a velocidade é a mesma, e correr é mais rápido', () => {
    const diag = moveDelta({ ...idle, forward: true, right: true }, 0, 1);
    expect(Math.hypot(diag.x, diag.z)).toBeCloseTo(WALK_SPEED);
    const run = moveDelta({ ...idle, forward: true, run: true }, 0, 1);
    expect(Math.hypot(run.x, run.z)).toBeCloseTo(RUN_SPEED);
  });
});

describe('limites e giros', () => {
  it('quem sai do círculo volta para a borda', () => {
    const p = clampToRadius({ x: 30, z: 40 }, 25);
    expect(Math.hypot(p.x, p.z)).toBeCloseTo(25);
    expect(clampToRadius({ x: 1, z: 1 }, 25)).toEqual({ x: 1, z: 1 });
  });

  it('o personagem gira pelo caminho mais curto', () => {
    expect(turnTowards(3, -3, 10)).toBe(-3);
    // de 170° para −170° são 20°, não 340°
    const deg = Math.PI / 180;
    expect(turnTowards(170 * deg, -170 * deg, 5 * deg)).toBeCloseTo(175 * deg);
    expect(headingOf({ x: 0, z: 1 })).toBeCloseTo(0);
  });

  it('a câmera não passa por baixo do chão nem fica de cabeça para baixo', () => {
    expect(clampPitch(5)).toBe(PITCH_MAX);
    const cam = orbitPosition({ x: 0, y: 1.6, z: 0 }, 0, 0.3, 5);
    expect(cam.z).toBeGreaterThan(0);
    expect(cam.y).toBeGreaterThan(1.6);
  });
});
