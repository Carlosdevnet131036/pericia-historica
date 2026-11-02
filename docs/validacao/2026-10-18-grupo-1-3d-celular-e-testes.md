# Grupo 1 — 3D no celular (P0-1) e testes de navegador (P1-5)

Branch: `melhorias/p0-3d-movel` · Data: 18/10/2026

## Problema original

Em aparelho de toque, o link "Explorar este lugar em 3D" aparecia. Ao tocar em "Explorar", o jogo entrava no modo de jogo sem nenhum botão visível e sem controles de toque: só o "voltar" do navegador tirava o jogador dali. Reproduzido com Pixel 7 emulado (`visibleButtons: []`, o toque não movia o personagem).

Além disso, os testes de navegador existiam só fora do repositório e um deles estava desatualizado.

## O que mudou

| Arquivo | Mudança | Por quê |
|---|---|---|
| `src/ui/device.ts` (novo) | `isTouchOnly()` com `(hover: none) and (pointer: coarse)` | Detecta quando o toque é a entrada **principal**; notebooks com tela de toque continuam com o 3D |
| `src/ui/screens/investigacao.ts` | Em toque, o link do 3D vira um aviso | O jogador entende por que não há 3D e segue na busca 2D |
| `src/world/index.ts` | Abertura em toque só oferece "Voltar à versão 2D"; HUD com "Pausa (Esc)" e "Sair do 3D" | Fim da tela sem saída; saída visível durante o jogo |
| `src/styles.css` | Estilo dos botões do HUD e do aviso; título do HUD não invade o contador em telas estreitas | Sobreposição vista na captura do celular |
| `package.json`, `package-lock.json` | `@playwright/test` 1.56.1 (dev, versão fixa); scripts `e2e` e `typecheck` (inclui os testes) | Autorizado; mesma versão do Chromium do ambiente |
| `playwright.config.ts` (novo) | Servidor Vite na porta 5174, SwiftShader, 1 worker, sem retries, perfis computador e celular | Determinismo e WebGL sem GPU |
| `tests/e2e/*` (novo) | 13 testes, fixture sem rede e com reprovação por exceção | Ver abaixo |
| `vite.config.ts` | Vitest restrito a `src/**/*.test.ts` | Para não executar os `.spec.ts` do Playwright |
| `.gitignore` | `test-results/`, `playwright-report/` | Saídas dos testes |
| `.github/workflows/ci.yml` | Job `e2e` (instala o Chromium com `--with-deps`, roda `npm run e2e`, guarda relatório em falha); `publicar` depende dele | Testes de navegador no CI, sem repetir typecheck, testes unitários e build |
| `README.md`, `docs/` | Comandos, tabela do CI, relatórios | Documentação |

### Decisão de design descoberta pelos testes

Com o mouse capturado (pointer lock), o navegador entrega **todo** clique ao canvas e o cursor fica invisível: botões na tela não podem ser usados. Comprovado com uma sonda: com captura, `pointerLockElement = world-canvas` e o clique em "Sair do 3D" não chega; com a captura recusada, o clique funciona. Por isso os botões do HUD aparecem **só durante o jogo e só sem o mouse capturado**; com captura, a saída é o Esc (indicado na linha de ajuda).

## Testes criados

| Arquivo | Teste |
|---|---|
| `modo3d.spec.ts` | Entra pela investigação e, sem o mouse capturado, sai por "Sair do 3D" de volta ao 2D (mundo desmontado) |
| | Sem o mouse capturado, "Pausa" abre o menu e "Continuar" volta ao jogo |
| | Com o mouse capturado, os botões somem, o Esc pausa e "Voltar ao caso" volta ao 2D |
| | Objeto achado no 3D aparece achado no 2D, inclusive depois de recarregar |
| | Objetos achados na busca 2D aparecem como achados no 3D |
| `celular.spec.ts` (Pixel 7) | A investigação não oferece o 3D e mostra o aviso |
| | Aberto por link direto, o 3D só oferece a volta ao 2D, e ela funciona |
| `casos.spec.ts` | A tela inicial lista os cinco casos; cada caso abre no expediente (6 testes) |

Garantias da fixture: nenhuma requisição sai para a internet (Google Fonts recebe CSS vazio); qualquer exceção na página reprova o teste.

## Comandos executados e resultados

| Comando | Resultado |
|---|---|
| `npm run typecheck` | Sem erros (jogo e testes de navegador) |
| `npm test` | 12 arquivos, **91/91** |
| `npm run e2e` | **13/13** (57,7 s) |
| `npx playwright test --repeat-each=3` | **39/39**, sem instabilidade |
| `npm run build` | OK: 2D 55,48 KB gz; 3D 163,98 KB gz |
| CI na branch (execução 39093673628, `workflow_dispatch`) | `verificar` (Node 22 e 24), `auditoria` e `e2e` aprovados; `publicar` pulado (não é push na main) |

### Falhas encontradas durante o trabalho e causa

1. **Clique em "Sair do 3D" e "Pausa" interceptado pelo canvas** (3 testes). Causa: o Chromium de teste concede o pointer lock. Não era defeito do jogo; levou à decisão de design acima e a testes separados para "com" e "sem" captura.
2. **Lista de lugares não encontrada após sair do 3D** (1 teste). Causa: erro do teste. O 3D foi aberto por link direto, então o caso estava (corretamente) no expediente. O teste passou a avançar até a investigação.

## Limitações da validação

- WebGL por software (SwiftShader): os testes medem comportamento, não desempenho.
- Toque emulado pelo Playwright (Pixel 7), não um aparelho real.
- O log completo do job no CI não pôde ser baixado daqui (o armazenamento de logs do GitHub fica fora da rede liberada); o resultado foi conferido pela API de etapas do job (etapa "Testes de navegador": sucesso).
- Os botões do HUD só aparecem sem pointer lock; em navegadores que concedem a captura, a saída depende do Esc.

## Riscos e próximos passos

- O job `e2e` acrescenta ~1 min 45 s ao CI (rodando em paralelo aos demais).
- Próximo grupo proposto: relógio justo da busca e retorno visual de achado e erro (P1-1, P1-3), aguardando autorização.
