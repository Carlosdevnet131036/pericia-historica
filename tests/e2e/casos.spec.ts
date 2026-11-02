import { expect, test } from './fixtures';

// Fumaça da versão 2D: cada caso abre sem erro. As regras de cada perícia já
// são cobertas pelos testes unitários (Vitest); aqui não se repete isso.
const CASES = [
  ['rojas-1892', 'A marca na porta'],
  ['smith-1915', 'As noivas da banheira'],
  ['lindbergh-1932', 'A escada e o dinheiro'],
  ['mengele-1985', 'A ossada de Embu'],
  ['ruxton-1935', 'Os embrulhos de Moffat'],
] as const;

test('a tela inicial lista os cinco casos', async ({ page }) => {
  await page.goto('/');
  for (const [, title] of CASES) await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
});

for (const [id, title] of CASES) {
  test(`o caso "${title}" abre no expediente`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await expect(page.locator('.step.is-current')).toContainText('Expediente');
    await expect(page.getByRole('button', { name: 'Diário' })).toBeVisible();
  });
}
