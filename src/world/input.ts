import type { MoveInput } from './motion';

/**
 * Teclado e mouse. As teclas ficam num mapa configurável (código físico da
 * tecla → ação), então o layout ABNT ou AZERTY não muda a posição do WASD.
 * O mouse usa pointer lock; se o navegador recusar, cai para "arrastar para
 * olhar".
 */
export type Action = 'forward' | 'back' | 'left' | 'right' | 'run' | 'pause' | 'interact';

export const DEFAULT_KEYS: Record<string, Action> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
  Escape: 'pause',
  KeyE: 'interact',
};

/** Ações de um toque só (não ficam "seguradas" como as de movimento). */
export interface InputHandlers {
  pause?(): void;
  interact?(): void;
}

export class Input {
  readonly move: MoveInput = { forward: false, back: false, left: false, right: false, run: false };
  /** Movimento do mouse acumulado desde a última leitura, em pixels. */
  private dx = 0;
  private dy = 0;
  private dragging = false;
  private readonly abort = new AbortController();
  sensitivity = 0.0025;

  constructor(
    private readonly surface: HTMLElement,
    private readonly handlers: InputHandlers = {},
    private readonly keys: Record<string, Action> = DEFAULT_KEYS,
  ) {
    const opts = { signal: this.abort.signal };
    window.addEventListener('keydown', (e) => this.key(e, true), opts);
    window.addEventListener('keyup', (e) => this.key(e, false), opts);
    // Ao perder o foco (Alt+Tab), solta tudo para o personagem não andar sozinho.
    window.addEventListener('blur', () => this.releaseAll(), opts);
    document.addEventListener('mousemove', (e) => this.mouse(e), opts);
    surface.addEventListener('mousedown', () => (this.dragging = true), opts);
    window.addEventListener('mouseup', () => (this.dragging = false), opts);
    document.addEventListener(
      'pointerlockchange',
      () => {
        if (!this.locked) this.releaseAll();
      },
      opts,
    );
  }

  get locked(): boolean {
    return document.pointerLockElement === this.surface;
  }

  /** Pede o pointer lock; precisa ser chamado dentro de um clique. */
  async lock(): Promise<boolean> {
    try {
      await this.surface.requestPointerLock();
      return true;
    } catch {
      return false; // segue com "arrastar para olhar"
    }
  }

  unlock(): void {
    if (this.locked) document.exitPointerLock();
  }

  /** Lê e zera o movimento do mouse acumulado (em radianos já escalados). */
  consumeLook(): { yaw: number; pitch: number } {
    const out = { yaw: -this.dx * this.sensitivity, pitch: this.dy * this.sensitivity };
    this.dx = this.dy = 0;
    return out;
  }

  private key(e: KeyboardEvent, down: boolean): void {
    const action = this.keys[e.code];
    if (!action) return;
    if (action === 'pause' || action === 'interact') {
      // Segurar a tecla gera repetições; a ação dispara uma vez por toque.
      if (down && !e.repeat) this.handlers[action]?.();
      return;
    }
    e.preventDefault();
    this.move[action] = down;
  }

  private mouse(e: MouseEvent): void {
    if (!this.locked && !this.dragging) return;
    this.dx += e.movementX;
    this.dy += e.movementY;
  }

  private releaseAll(): void {
    this.move.forward = this.move.back = this.move.left = this.move.right = this.move.run = false;
    this.dragging = false;
  }

  dispose(): void {
    this.abort.abort();
    this.unlock();
  }
}
