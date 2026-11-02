# Grupo 2 — Relógio de tempo ativo (P1-1) e retorno de achado e erro (P1-3)

Branch: `melhorias/busca-relogio-e-retorno` (criada a partir de `melhorias/p0-3d-movel`, porque o PR #5 ainda não estava mesclado na `main`) · Data: 02/11/2026

## Problemas originais

**P1-1.** O tempo da busca era `agora − início` (`busca.ts`). Uma busca começada à noite e terminada de manhã contava a noite inteira, e a nota caía para 1 estrela. O mesmo valia para trocar de lugar, esconder a aba ou sair do 3D.

**P1-3.** Achar um objeto só o deixava transparente (`opacity: .18`); errar mostrava um X por 0,7 s, sem dizer quanto custava. Não havia anúncio para leitores de tela.

## O que mudou

| Arquivo | Mudança | Por quê |
|---|---|---|
| `src/engine/search.ts` | Relógio com pausa: `searchElapsed`, `beginSearch`, `pauseSearch`, `resumeSearch`, `finishSearch`, `isRunning`; conclusão pelo tempo ativo; `MISS_PENALTY` e `HINT_PENALTY` exportados | Regra pura, testável e única para 2D e 3D; a interface mostra os mesmos valores da pontuação |
| `src/engine/types.ts` | `activeMs` e `runningSince` opcionais em `SearchProgress` | Saves antigos continuam válidos |
| `src/engine/state.ts` | `dropOrphanClocks` ao carregar | Página fechada à força deixa o relógio "rodando"; o trecho órfão é descartado, a favor do jogador |
| `src/ui/modules/busca.ts` | Só roda o relógio da cena visível com a aba à mostra (sincronizado após cada renderização); retorno visual de achado e erro; região `aria-live`; conclusão numa gravação só | Ver abaixo |
| `src/main.ts` | Sincroniza após renderizar; pausa na troca de rota e em `pagehide`; retoma em `visibilitychange` e `pageshow` | Ponto único de controle, sem espalhar "pausar" pelos botões |
| `src/world/session.ts`, `src/world/index.ts` | `pause()`; o 3D roda o relógio no jogo, no exame e no diário; pausa na abertura, na pausa, com a aba escondida e ao sair; pulso do contador ao voltar do exame | O painel de exame cobre a cena na hora do registro |
| `src/world/scenes/rancho.ts` | `celebrate(id)`: brilho que se expande e some | Retorno no próprio objeto |
| `src/styles.css` | Animações de achado, erro, lista e contador; `.sr-only`; versões estáticas com `prefers-reduced-motion` | — |

Decisões:
- **Busca antiga em andamento** (save sem os campos novos) fica pausada com tempo zero: o tempo gravado nela incluía as horas com o jogo fechado.
- **Exame e diário contam tempo no 3D**: ler o que se achou faz parte da busca; a pausa (Esc) não conta.
- **Conclusão numa gravação só**: antes eram duas (resultado e "lugar visitado"), e a segunda renderização apagaria a animação do último achado.

## Testes

Unitários novos (Vitest): 6 do relógio em `search.test.ts`, 2 de carregamento em `state.test.ts`.

De navegador novos (Playwright):

| Arquivo | Teste |
|---|---|
| `relogio.spec.ts` | Trocar de lugar pausa; ao voltar, continua de onde parou (relógio falso: 10 min fora não contam) |
| | Aba escondida pausa (1 h escondida não conta) |
| | Recarregar a página não conta o tempo fora |
| | 3D: pausar para o relógio e continuar o retoma |
| | 3D: sair do 3D pausa e grava |
| `retorno.spec.ts` | Achar: círculo, nome, item da lista e anúncio |
| | Errar: "−60", contador de erros e anúncio |
| | Botão de dica com a penalidade do motor |
| | Último achado e resultado animam juntos (gravação única) |
| | Reduzir movimento: destaque estático |
| | 3D: contador pulsa ao fechar o exame de um objeto novo |

Teste alterado: "o recorde de estrelas nunca diminui" montava uma busca em andamento só com `startedAt`, o que agora é um save antigo pausado; passou a usar `beginSearch`, com a mesma verificação.

## Comandos executados e resultados

| Comando | Resultado |
|---|---|
| `npm run typecheck` | Sem erros |
| `npm test` | 13 arquivos, **99/99** |
| `npm run e2e` | **24/24** |
| `npx playwright test --repeat-each=3` | **72/72**, sem instabilidade |
| `npm run build` | OK: 2D 56,42 KB gz (+0,9); 3D 164,30 KB gz (+0,3) |

### Falhas encontradas durante o trabalho e causa

1. **Teste do recorde de estrelas** (unitário): montagem antiga incompatível com a regra nova (acima).
2. **"Sair do 3D pausa e grava"**: primeiro, corrida no teste (`toHaveURL` passa antes do `hashchange` desmontar o 3D); depois, erro meu no teste (`?? 'ausente'` transformava o `null` esperado). O jogo estava certo (save conferido: `runningSince: null`, `activeMs` > 0).
3. **Clique no pente** (teste): o centro do desenho cai num vão entre os dentes. O jogo decide o acerto pela distância (ouvinte no `<svg>` inteiro, conferido no código); o teste passou a clicar na posição, como o jogador.
4. **Ponto vazio na cena** (teste): margem de 40 px grande demais para 28 objetos; reduzida para 14 px (o raio de acerto fica dentro da caixa + 12 px).
5. **Texto "Chave ✓" cortado** na borda de cima (captura de tela): textos flutuantes passaram a se ajustar às bordas.

## Limitações da validação

- O relógio falso do Playwright não pode ser usado no 3D (congelaria o laço de renderização); lá o teste confere o estado gravado (pausado ou rodando) e que o tempo acumulado não cresce na pausa.
- Aba escondida simulada (`visibilityState` + evento), não uma troca de aba real.
- Se o navegador encerrar a página sem `pagehide`, o trecho em andamento é descartado (testado na unidade, não no navegador).
- Leitor de tela: conferido o conteúdo da região `aria-live`, não a leitura num leitor real.

## Riscos e próximos passos

- Calibração das estrelas (2D e 3D) continua pedindo partidas reais.
- Próximo grupo proposto: áudio gerado em código (P1-2), aguardando autorização.
