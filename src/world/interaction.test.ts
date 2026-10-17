import { describe, expect, it } from 'vitest';
import { pickInteractable, type Interactable } from './interaction';

const item = (id: string, x: number, z: number, extra: Partial<Interactable> = {}): Interactable => ({
  id,
  at: { x, z },
  reach: 1.8,
  label: () => id,
  ...extra,
});

// yaw = 0: a câmera olha para −z.
describe('escolha do objeto para a tecla E', () => {
  it('oferece o objeto à frente e ao alcance', () => {
    expect(pickInteractable({ x: 0, z: 0 }, 0, [item('lamparina', 0, -1)])?.id).toBe('lamparina');
  });

  it('não oferece o que está longe', () => {
    expect(pickInteractable({ x: 0, z: 0 }, 0, [item('lamparina', 0, -3)])).toBeNull();
  });

  it('não oferece o que está às costas', () => {
    expect(pickInteractable({ x: 0, z: 0 }, 0, [item('lamparina', 0, 1)])).toBeNull();
  });

  it('girar a câmera muda o que está "à frente"', () => {
    expect(pickInteractable({ x: 0, z: 0 }, Math.PI, [item('lamparina', 0, 1)])?.id).toBe('lamparina');
  });

  it('entre dois, vence o que está na mira, mesmo um pouco mais longe', () => {
    const items = [item('porta', 1, -0.6), item('lamparina', 0, -1.3)];
    expect(pickInteractable({ x: 0, z: 0 }, 0, items)?.id).toBe('lamparina');
  });

  it('objetos desabilitados são ignorados', () => {
    const items = [item('porta', 0, -1, { enabled: () => false })];
    expect(pickInteractable({ x: 0, z: 0 }, 0, items)).toBeNull();
  });

  it('colado no objeto, qualquer direção serve', () => {
    expect(pickInteractable({ x: 0, z: 0 }, 0, [item('porta', 0, 0.2)])?.id).toBe('porta');
  });
});
