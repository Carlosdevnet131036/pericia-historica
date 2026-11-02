import type { Page } from '@playwright/test';
import { CASE, denyPointerLock, expect, explore, hook, open3d, SAVE_KEY, test } from './fixtures';

// O relógio da busca só conta tempo ativo. No 2D, o relógio falso do
// Playwright avança o tempo na hora, sem esperar de verdade.
const RANCHO = 'O rancho de Francisca Rojas';
const timer = (page: Page) => page.locator('.search-timer');

async function startRanchoSearch(page: Page) {
  await page.clock.install({ time: new Date('2026-11-02T20:00:00') });
  await page.goto(`/#${CASE}`);
  await page.getByRole('button', { name: 'Seguir com Álvarez para Necochea' }).click();
  await page.locator('.location', { hasText: RANCHO }).click();
  await page.getByRole('button', { name: 'Iniciar busca' }).click();
}

/** Simula a aba sendo escondida ou mostrada (troca de aba, minimizar). */
async function setPageVisible(page: Page, visible: boolean) {
  await page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (v ? 'visible' : 'hidden') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, visible);
}

const savedRancho = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').search?.rancho ?? null, SAVE_KEY);

test.describe('relógio da busca 2D', () => {
  test('trocar de lugar pausa o relógio; ao voltar, ele continua de onde parou', async ({ page }) => {
    await startRanchoSearch(page);
    await page.clock.fastForward(5_000);
    await expect(timer(page)).toHaveText('0:05');

    await page.locator('.location', { hasText: 'A delegacia de Necochea' }).click();
    await page.clock.fastForward(10 * 60_000); // dez minutos em outro lugar
    await page.locator('.location', { hasText: RANCHO }).click();
    await expect(timer(page)).toHaveText('0:05');

    await page.clock.fastForward(3_000);
    await expect(timer(page)).toHaveText('0:08');
  });

  test('aba escondida pausa o relógio', async ({ page }) => {
    await startRanchoSearch(page);
    await page.clock.fastForward(3_000);
    await setPageVisible(page, false);
    await expect.poll(async () => (await savedRancho(page))?.runningSince ?? null).toBeNull();
    await page.clock.fastForward(60 * 60_000); // uma hora com a aba escondida
    await setPageVisible(page, true);
    await page.clock.fastForward(2_000);
    await expect(timer(page)).toHaveText('0:05');
  });

  test('fechar ou recarregar a página não conta o tempo fora do jogo', async ({ page }) => {
    await startRanchoSearch(page);
    await page.clock.fastForward(4_000);
    await page.reload(); // a saída da página pausa e grava o tempo
    await page.clock.fastForward(60 * 60_000);
    await page.locator('.location', { hasText: RANCHO }).click();
    await expect(timer(page)).toHaveText('0:04');
    expect((await savedRancho(page)).activeMs).toBeGreaterThanOrEqual(4_000);
  });
});

test.describe('relógio da busca 3D', () => {
  test('pausar o jogo para o relógio; continuar o retoma', async ({ page }) => {
    await denyPointerLock(page);
    await open3d(page);
    await explore(page);
    await expect.poll(async () => typeof (await savedRancho(page))?.runningSince).toBe('number');

    await page.getByRole('button', { name: 'Pausa (Esc)' }).click();
    await expect.poll(() => hook(page, 'mode')).toBe('paused');
    const paused = await savedRancho(page);
    expect(paused.runningSince).toBeNull();
    await page.waitForTimeout(1_500);
    expect((await savedRancho(page)).activeMs).toBe(paused.activeMs); // parado na pausa

    await page.locator('.world-card').getByRole('button', { name: 'Continuar' }).click();
    await expect.poll(async () => typeof (await savedRancho(page))?.runningSince).toBe('number');
  });

  test('sair do 3D pausa e grava o relógio', async ({ page }) => {
    await denyPointerLock(page);
    await open3d(page);
    await explore(page);
    await page.getByRole('link', { name: 'Sair do 3D' }).click();
    await expect(page).toHaveURL(new RegExp(`#${CASE}$`));
    // A desmontagem do 3D acontece no evento hashchange, logo depois da troca de URL.
    await expect(page.locator('.world')).toHaveCount(0);
    await expect.poll(async () => { const p = await savedRancho(page); return p ? p.runningSince : 'sem save'; }).toBeNull();
    expect((await savedRancho(page)).activeMs).toBeGreaterThan(0);
  });
});
