import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Input } from './input';

let surface: HTMLElement;
let input: Input;
const key = (code: string) => {
  const event = new Event('keydown', { cancelable: true });
  Object.assign(event, { code, repeat: false });
  window.dispatchEvent(event);
  return event;
};

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('document', Object.assign(new EventTarget(), { pointerLockElement: null }));
  surface = new EventTarget() as HTMLElement;
  input = new Input(surface);
});

afterEach(() => {
  input.dispose();
  vi.unstubAllGlobals();
});

describe('teclado durante o exame de pistas', () => {
  it('solta movimento ao abrir o painel mesmo sem pointer lock', () => {
    key('KeyW');
    expect(input.move.forward).toBe(true);
    input.unlock();
    expect(input.move.forward).toBe(false);
  });

  it('deixa as setas controlarem a ampliação e não acumula movimento', () => {
    input.setMovementEnabled(false);
    expect(key('ArrowRight').defaultPrevented).toBe(false);
    expect(input.move.right).toBe(false);
    key('KeyW');
    input.setMovementEnabled(true);
    expect(input.move.forward).toBe(false);
    expect(key('ArrowRight').defaultPrevented).toBe(true);
    expect(input.move.right).toBe(true);
  });

  it('mantém Esc disponível enquanto o painel está aberto', () => {
    input.dispose();
    const pause = vi.fn();
    input = new Input(surface, { pause });
    input.setMovementEnabled(false);
    key('Escape');
    expect(pause).toHaveBeenCalledOnce();
  });
});
