import type { Page } from '@playwright/test';
import { CASE, denyPointerLock, expect, explore, hook, open3d, test } from './fixtures';

const RANCHO = 'O rancho de Francisca Rojas';
const TARGETS = ['Lamparina', 'Chave', 'Xícara', 'Vela', 'Chapéu', 'Moeda', 'Pente', 'Botão'];
const IDS = ['lamparina', 'chave', 'xicara', 'vela', 'chapeu', 'moeda', 'pente', 'botao'];

async function startRanchoSearch(page: Page) {
  await page.goto(`/#${CASE}`);
  await page.getByRole('button', { name: 'Seguir com Álvarez para Necochea' }).click();
  await page.locator('.location', { hasText: RANCHO }).click();
  await page.getByRole('button', { name: 'Iniciar busca' }).click();
}

/**
 * Clica na posição de um objeto, como o jogador. O jogo decide o acerto pela
 * distância ao objeto (ouvinte no <svg> inteiro), então o centro pode cair num
 * vão do desenho (entre os dentes do pente) e ainda assim acertar.
 */
async function clickObject(page: Page, id: string) {
  const box = await page.locator(`.search-svg g.obj[data-obj="${id}"]`).boundingBox();
  if (!box) throw new Error(`objeto ${id} fora da tela`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

/** Clica num ponto da cena longe de qualquer objeto. */
async function clickEmpty(page: Page) {
  const pt = await page.evaluate(() => {
    const svg = document.querySelector('.search-svg')!.getBoundingClientRect();
    const boxes = [...document.querySelectorAll('.search-svg g.obj')].map((g) => g.getBoundingClientRect());
    // Fora da caixa de cada objeto, com folga (o raio de acerto não passa da caixa + 12 px).
    for (let y = svg.top + 15; y < svg.bottom - 15; y += 5) {
      for (let x = svg.left + 15; x < svg.right - 15; x += 5) {
        const far = boxes.every((b) => x < b.left - 14 || x > b.right + 14 || y < b.top - 14 || y > b.bottom + 14);
        if (far) return { x, y };
      }
    }
    return null;
  });
  if (!pt) throw new Error('nenhum ponto vazio na cena');
  await page.mouse.click(pt.x, pt.y);
}

test.describe('retorno visual da busca 2D', () => {
  test('achar marca o objeto, risca a lista e anuncia para leitores de tela', async ({ page }) => {
    await startRanchoSearch(page);
    await clickObject(page, 'lamparina');

    await expect(page.locator('.found-ring')).toHaveCount(1);
    await expect(page.locator('.found-float')).toHaveText('Lamparina ✓');
    await expect(page.locator('.search-list li.just-found')).toHaveText('Lamparina');
    await expect(page.locator('.search-svg g.obj[data-obj="lamparina"]')).toHaveClass(/just-found/);
    await expect(page.locator('.search .sr-only[aria-live="polite"]')).toHaveText('Achou: Lamparina. 1 de 8.');
  });

  test('errar mostra o custo no lugar do clique e destaca o contador de erros', async ({ page }) => {
    await startRanchoSearch(page);
    await clickEmpty(page);

    await expect(page.locator('.miss-cost')).toHaveText('−60');
    await expect(page.locator('.search-misses')).toHaveText('Erros: 1');
    await expect(page.locator('.search-misses')).toHaveClass(/just-missed/);
    await expect(page.locator('.search .sr-only[aria-live="polite"]')).toHaveText('Nada aqui. Menos 60 pontos.');
  });

  test('o botão de dica mostra a penalidade definida no motor', async ({ page }) => {
    await startRanchoSearch(page);
    await expect(page.getByRole('button', { name: 'Dica (−120)' })).toBeVisible();
  });

  test('o último achado anima junto com o resultado, numa renderização só', async ({ page }) => {
    await startRanchoSearch(page);
    for (const id of IDS) await clickObject(page, id);

    await expect(page.locator('.search-summary')).toHaveClass(/rise/);
    await expect(page.locator('.found-float')).toHaveText('Botão ✓');
    await expect(page.locator('.search-list li.is-found')).toHaveText(TARGETS);
    await expect(page.locator('.search .sr-only[aria-live="polite"]')).toContainText('Busca concluída');
  });

  test('com "reduzir movimento", o destaque aparece pronto e sem animação', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await startRanchoSearch(page);
    await clickObject(page, 'chave');
    const ring = page.locator('.found-ring');
    await expect(ring).toHaveCSS('animation-name', 'none');
    await expect(ring).toHaveCSS('stroke-dashoffset', '0px');
  });
});

test('3D: ao fechar o exame de um objeto novo, o contador pulsa', async ({ page }) => {
  await denyPointerLock(page);
  await open3d(page);
  await explore(page);
  await page.evaluate(() =>
    (window as unknown as { __pericia3d: { place(x: number, z: number, yaw: number, pitch: number): void } }).__pericia3d.place(-2.15, -5.55, 0, 0.35),
  );
  await expect.poll(() => hook(page, 'focused')).toBe('lamparina');
  await page.keyboard.press('KeyE');
  await expect.poll(() => hook(page, 'mode')).toBe('examine');
  await expect(page.locator('.world-counter')).not.toHaveClass(/is-bumped/); // ainda coberto pelo painel

  await page.keyboard.press('KeyE');
  await expect.poll(() => hook(page, 'mode')).toBe('playing');
  await expect(page.locator('.world-counter')).toHaveClass(/is-bumped/);
});
