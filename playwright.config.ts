import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de navegador (Playwright). Os testes unitários continuam no Vitest
 * (`npm test`); estes cobrem fluxos de ponta a ponta: entrar e sair do modo
 * 3D, botões de saída, volta ao 2D e preservação do progresso.
 *
 * O servidor é o Vite de desenvolvimento: o 3D só expõe o gancho de teste
 * (`window.__pericia3d`, que posiciona o personagem) em modo dev. O build de
 * produção continua verificado pelo job "verificar" do CI.
 */
declare const process: { env: Record<string, string | undefined> };

const PORT = 5174;
const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'tests/e2e',
  // WebGL por software (SwiftShader) é lento: poucos quadros por segundo.
  timeout: 120_000,
  expect: { timeout: 30_000 },
  // Um teste por vez: o 3D por software usa a CPU inteira.
  workers: 1,
  fullyParallel: false,
  forbidOnly: CI,
  // Sem novas tentativas: um teste instável deve aparecer, não ser escondido.
  retries: 0,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      // WebGL sem placa de vídeo (CI e contêineres).
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  projects: [
    { name: 'computador', testIgnore: /celular\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 960, height: 540 } } },
    { name: 'celular', testMatch: /celular\.spec\.ts/, use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 60_000,
  },
});
