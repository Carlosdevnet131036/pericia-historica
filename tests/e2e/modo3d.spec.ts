import { CASE, denyPointerLock, expect, explore, hook, open3d, seedSave, test } from './fixtures';

const RANCHO = 'O rancho de Francisca Rojas';

test.describe('modo 3D no computador', () => {
  test('entra pela investigação e, sem o mouse capturado, sai pelo botão "Sair do 3D"', async ({ page }) => {
    await denyPointerLock(page);
    await page.goto(`/#${CASE}`);
    await page.getByRole('button', { name: 'Seguir com Álvarez para Necochea' }).click();
    await page.locator('.location', { hasText: RANCHO }).click();
    await page.getByRole('link', { name: /Explorar este lugar em 3D/ }).click();

    await expect(page).toHaveURL(new RegExp(`#${CASE}/3d$`));
    await expect(page.locator('.world-canvas')).toBeVisible({ timeout: 60_000 });
    // Na abertura, os botões do HUD ficam escondidos (o cartão já tem as saídas).
    await expect(page.locator('.world-controls')).toBeHidden();
    await explore(page);

    const exit = page.getByRole('link', { name: 'Sair do 3D' });
    await expect(exit).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pausa (Esc)' })).toBeVisible();
    await exit.click();

    await expect(page).toHaveURL(new RegExp(`#${CASE}$`));
    await expect(page.locator('.world')).toHaveCount(0);
    await expect.poll(() => hook(page, 'mode')).toBeNull(); // o mundo foi desmontado
    await expect(page.getByRole('heading', { name: 'Investigação em Necochea' })).toBeVisible();
  });

  test('sem o mouse capturado, o botão "Pausa" abre o menu e "Continuar" volta ao jogo', async ({ page }) => {
    await denyPointerLock(page);
    await open3d(page);
    await explore(page);

    await page.getByRole('button', { name: 'Pausa (Esc)' }).click();
    await expect.poll(() => hook(page, 'mode')).toBe('paused');
    await expect(page.locator('.world-card h2')).toHaveText('Pausa');
    await expect(page.locator('.world-controls')).toBeHidden();

    await page.locator('.world-card').getByRole('button', { name: 'Continuar' }).click();
    await expect.poll(() => hook(page, 'mode')).toBe('playing');
    await expect(page.locator('.world-controls')).toBeVisible();
  });

  test('com o mouse capturado, os botões somem, o Esc pausa e "Voltar ao caso" volta ao 2D', async ({ page }) => {
    await open3d(page);
    await explore(page);
    // O cursor está capturado: botões na tela não poderiam ser clicados.
    await expect.poll(() => page.evaluate(() => document.pointerLockElement?.className ?? null)).toBe('world-canvas');
    await expect(page.locator('.world-controls')).toBeHidden();

    await page.keyboard.press('Escape');
    await expect.poll(() => hook(page, 'mode')).toBe('paused');
    await page.locator('.world-card').getByRole('link', { name: 'Voltar ao caso' }).click();

    await expect(page).toHaveURL(new RegExp(`#${CASE}$`));
    await expect(page.locator('.world')).toHaveCount(0);
  });

  test('objeto achado no 3D continua achado no 2D, inclusive depois de recarregar', async ({ page }) => {
    await denyPointerLock(page);
    await open3d(page);
    await explore(page);
    await expect(page.locator('.world-counter')).toHaveText('Objetos 0/8 · J diário');

    // Diante do banco, olhando para a lamparina na mesa (medidas de rancho-layout.ts).
    await page.evaluate(() =>
      (window as unknown as { __pericia3d: { place(x: number, z: number, yaw: number, pitch: number): void } }).__pericia3d.place(-2.15, -5.55, 0, 0.35),
    );
    await expect.poll(() => hook(page, 'focused')).toBe('lamparina');
    await page.keyboard.press('KeyE');
    await expect.poll(() => hook(page, 'mode')).toBe('examine');
    await expect(page.locator('.world-status')).toHaveText('Registrado no diário · 1 de 8');
    await expect(page.locator('.world-counter')).toHaveText('Objetos 1/8 · J diário');

    await page.keyboard.press('KeyE'); // fecha o exame
    await expect.poll(() => hook(page, 'mode')).toBe('playing');
    await page.getByRole('link', { name: 'Sair do 3D' }).click();

    await expect(page).toHaveURL(new RegExp(`#${CASE}$`));
    // O 3D foi aberto por link direto, então o caso ainda está no expediente.
    await page.getByRole('button', { name: 'Seguir com Álvarez para Necochea' }).click();
    await page.locator('.location', { hasText: RANCHO }).click();
    await expect(page.locator('.search-list li.is-found')).toHaveText(['Lamparina']);

    await page.reload();
    await page.locator('.location', { hasText: RANCHO }).click();
    await expect(page.locator('.search-list li.is-found')).toHaveText(['Lamparina']);
  });

  test('objetos achados na busca 2D aparecem como achados no 3D', async ({ page }) => {
    await seedSave(page, {
      rancho: { found: ['moeda', 'pente'], misclicks: 1, hints: 0, startedAt: 1, elapsedMs: null, bestStars: 0 },
    });
    await open3d(page);
    await expect(page.locator('.world-counter')).toHaveText('Objetos 2/8 · J diário');
  });
});
