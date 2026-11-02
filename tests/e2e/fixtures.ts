import { expect, test as base, type Page } from '@playwright/test';

/** O gancho de desenvolvimento do modo 3D (src/world/index.ts). */
export interface WorldHook {
  player: { x: number; z: number };
  mode: 'intro' | 'playing' | 'paused' | 'examine' | 'journal';
  focused: string | null;
  found: number;
  place(x: number, z: number, yaw?: number, pitch?: number): void;
}

export const CASE = 'rojas-1892';
export const SAVE_KEY = `pericia-historica:v2:${CASE}`;

/**
 * Teste com duas garantias:
 * - nada sai para a internet (o Google Fonts recebe um CSS vazio e o jogo usa
 *   as fontes de reserva), então o resultado não depende de serviço externo;
 * - qualquer exceção na página reprova o teste, mesmo que as asserções passem.
 */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.route(/^https?:\/\/(?!localhost)/, (route) =>
        route.request().url().includes('fonts.googleapis.com')
          ? route.fulfill({ status: 200, contentType: 'text/css', body: '' })
          : route.abort(),
      );
      await use(errors);
      expect(errors, 'exceções na página').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Lê um campo do gancho do 3D (null se o 3D não estiver montado). */
export function hook<K extends keyof WorldHook>(page: Page, key: K): Promise<WorldHook[K] | null> {
  return page.evaluate((k) => {
    const h = (window as unknown as { __pericia3d?: Record<string, unknown> }).__pericia3d;
    return h ? (h[k] as never) : null;
  }, key);
}

/** Abre o 3D do rancho e espera o cenário (texturas incluídas) carregar. */
export async function open3d(page: Page): Promise<void> {
  await page.goto(`/#${CASE}/3d`);
  await expect(page.locator('.world-canvas')).toBeVisible({ timeout: 60_000 });
  await expect.poll(() => hook(page, 'mode')).toBe('intro');
}

/** Clica em "Explorar" e espera o modo de jogo. */
export async function explore(page: Page): Promise<void> {
  await page.locator('.world-card').getByRole('button', { name: 'Explorar' }).click();
  await expect.poll(() => hook(page, 'mode')).toBe('playing');
}

/**
 * Simula um navegador que recusa a captura do mouse (pointer lock), situação
 * em que o jogo cai para "arrastar para olhar" e mostra os botões do HUD.
 * Precisa ser chamado antes de abrir a página.
 */
export async function denyPointerLock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    HTMLElement.prototype.requestPointerLock = function () {
      return Promise.reject(new DOMException('recusado no teste', 'NotAllowedError'));
    };
  });
}

/** Grava um save antes de o jogo carregar (para testar progresso vindo do 2D). */
export async function seedSave(page: Page, search: Record<string, unknown>): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ([key, state]) => localStorage.setItem(key, JSON.stringify(state)),
    [
      SAVE_KEY,
      {
        version: 2,
        caseId: CASE,
        step: 'investigacao',
        reached: ['expediente', 'investigacao'],
        visited: [],
        training: { answers: {}, firstTry: {} },
        lab: {},
        accusation: { answers: {}, submitted: false },
        search,
      },
    ] as const,
  );
}
