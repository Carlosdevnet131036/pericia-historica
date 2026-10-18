import { CASE, expect, hook, test } from './fixtures';

// Projeto "celular" (Pixel 7, toque): o modo 3D ainda não tem controles de toque.
test.describe('modo 3D em aparelho de toque', () => {
  test('a investigação não oferece o 3D e explica por quê', async ({ page }) => {
    await page.goto(`/#${CASE}`);
    await page.getByRole('button', { name: 'Seguir com Álvarez para Necochea' }).tap();
    await page.locator('.location', { hasText: 'O rancho de Francisca Rojas' }).tap();
    await expect(page.locator('.explore3d-note')).toBeVisible();
    await expect(page.getByRole('link', { name: /Explorar este lugar em 3D/ })).toHaveCount(0);
  });

  test('aberto por link direto, o 3D não prende o jogador: só oferece a volta ao 2D', async ({ page }) => {
    await page.goto(`/#${CASE}/3d`);
    await expect(page.locator('.world-card.world-touch')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('.world-card').getByRole('button', { name: 'Explorar' })).toHaveCount(0);
    await expect.poll(() => hook(page, 'mode')).toBe('intro');

    await page.getByRole('link', { name: 'Voltar à versão 2D' }).tap();
    await expect(page).toHaveURL(new RegExp(`#${CASE}$`));
    await expect(page.locator('.world')).toHaveCount(0);
  });
});
