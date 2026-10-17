# Perícia Histórica

[![CI](https://github.com/Carlosdevnet131036/pericia-historica/actions/workflows/ci.yml/badge.svg)](https://github.com/Carlosdevnet131036/pericia-historica/actions/workflows/ci.yml)

Jogo de investigação no navegador baseado em **casos criminais reais resolvidos pela perícia**. Cada caso apresenta uma técnica forense que nasceu ou se firmou naquele caso. O jogador aprende a técnica, investiga, faz o confronto no laboratório e só depois vê o que realmente aconteceu, com as fontes.

Inspirado na estrutura de jogos de investigação como Criminal Case: cenas de objetos escondidos com estrelas, um parceiro que comenta cada etapa e um quadro de suspeitos com o perfil do responsável. O Caso 1 é o piloto desse formato.

**Jogue agora:** https://carlosdevnet131036.github.io/pericia-historica/

## Casos

| # | Caso | Ano | Técnica | Status |
|---|------|-----|---------|--------|
| 1 | Francisca Rojas, Necochea (Argentina) | 1892 | Datiloscopia (Vucetich) | Jogável |
| 2 | "Brides in the Bath", G. J. Smith (Inglaterra) | 1915 | Patologia forense (Spilsbury) | Jogável |
| 3 | Sequestro Lindbergh (EUA) | 1932 | Rastreio de cédulas e madeira (Koehler) | Jogável |
| 4 | A ossada de Embu: Josef Mengele (Brasil) | 1985 | Antropologia forense (Muñoz, Snow, Helmer) | Jogável |
| 5 | Os embrulhos de Moffat: Buck Ruxton (Escócia/Inglaterra) | 1935 | Entomologia forense (Mearns) | Jogável |
| 6 | Os Romanov (Rússia) | 1991 | DNA mitocondrial | Planejado |
| 7 | As ossadas de Perus (Brasil) | 1990 | Antropologia forense e DNA | Planejado |
| 8 | Unabomber (EUA) | 1996 | Linguística forense | Planejado |

## Critérios de fidelidade

- Só entram casos **encerrados**, com condenação, confissão ou identificação confirmada, e **bem documentados**.
- Nada de detalhes gráficos nem de foco em violência sexual.
- Todo cartão de evidência é marcado como **Documentado** ou **Dramatizado**.
- A tela final separa o que é documentado, onde as fontes divergem e o que foi criado para o jogo.

## Como rodar

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes unitários (Vitest)
npm run build      # typecheck + build de produção em dist/
```

## Integração contínua

A cada push na `main` e em todo pull request, o GitHub Actions (`.github/workflows/ci.yml`) roda:

| Job | O que verifica | Falha quando |
|-----|----------------|--------------|
| `verificar` (Node 22 e 24) | `npm ci`, typecheck, testes e build | Erro de tipo, teste quebrado ou build com erro |
| `auditoria` | `npm audit --audit-level=high` | Vulnerabilidade alta ou crítica nas dependências |
| `publicar` (só na `main`) | Publica `dist/` no GitHub Pages | Roda apenas se os dois jobs acima passarem |

O build do Node 22 fica disponível por 7 dias como artefato `dist` na página da execução. O Dependabot (`.github/dependabot.yml`) abre PRs semanais com atualizações, e cada PR passa pelo mesmo pipeline antes do merge.

## Arquitetura

```
src/
├── cases/              dados de cada caso (texto, módulos de perícia, fontes)
│   ├── index.ts        lista de casos jogáveis e planejados
│   ├── rojas1892.ts
│   ├── smith1915.ts
│   ├── lindbergh1932.ts
│   ├── mengele1985.ts
│   └── ruxton1935.ts
├── engine/             regras independentes de UI
│   ├── types.ts        contrato de um caso (CaseFile) e do estado (GameState)
│   ├── state.ts        store imutável + persistência em localStorage
│   ├── scoring.ts      pontuação, despachada pelo tipo de cada módulo
│   └── search.ts       layout determinístico e estrelas das cenas de busca
├── forensics/          "ciência" do jogo, funções puras e testadas
│   ├── fingerprint.ts  gerador procedural de digitais
│   ├── match.ts        confronto de minúcias
│   ├── bath.ts         geometria do corpo na banheira
│   ├── wood.ts         veios, furos de prego e encaixe de tábuas
│   ├── superimposition.ts  superposição crânio-foto
│   └── entomology.ts   graus-dia acumulados e datação por larvas
├── ui/
│   ├── modules/        uma tela por técnica (datiloscopia, raciocínio, patologia, cédulas e madeira, antropologia, entomologia)
│   ├── screens/        etapas comuns a todo caso; treino e laboratório despacham por `kind`
│   ├── art/            ilustrações SVG em estilo de gravura (cenas, capas, ícones, objetos)
│   ├── components/     parceiro e quadro de suspeitos
│   ├── view-state.ts   estado de visualização e controle de animações de primeira vez
│   ├── dom.ts          helper h() para criar elementos
│   └── prints.ts       cache de renderização das digitais
├── main.ts             rotas por hash (#smith-1915) e render
└── styles.css
```

Decisões principais:

- **Sem framework.** Com seis telas e estado pequeno, React ou Vue trariam mais complexidade que benefício (YAGNI). O padrão "estado → render" é o mesmo, então migrar depois é simples.
- **Casos como dados.** Um caso novo é um arquivo em `src/cases/` que segue `CaseFile`. O motor não conhece nenhum caso específico.
- **Técnicas como módulos.** Treino e laboratório são *unions discriminadas* pelo campo `kind`. Uma técnica nova é um tipo novo em `types.ts`, uma tela em `ui/modules/` e um `case` a mais em cada `switch`; o TypeScript aponta os `switch` que ficaram sem tratar o tipo novo.
- **Ilustrações no código.** As cenas e capas são SVG desenhado à mão em `ui/art/`, com cores do tema (claro e escuro) e sem dependência de imagens externas ou de direitos autorais. A animação de traço usa `pathLength=1` e `stroke-dashoffset`, e roda só na primeira vez que cada elemento aparece; com `prefers-reduced-motion`, nada se move.
- **Ciência isolada da UI.** `forensics/` não toca no DOM, exceto na função de render, por isso dá para testar com Vitest.
- **Digitais procedurais.** Cada crista é uma curva de nível de um campo escalar; as minúcias são singularidades de fase (±atan2) que criam bifurcações e terminações reais. Um teste verifica que uma volta em torno de uma minúcia soma exatamente 2π à fase.

## Licença

A definir.
