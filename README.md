# Perícia Histórica

[![CI](https://github.com/Carlosdevnet131036/pericia-historica/actions/workflows/ci.yml/badge.svg)](https://github.com/Carlosdevnet131036/pericia-historica/actions/workflows/ci.yml)

Jogo de investigação no navegador baseado em **casos criminais reais resolvidos pela perícia**. Cada caso apresenta uma técnica forense que nasceu ou se firmou naquele caso. O jogador aprende a técnica, investiga, faz o confronto no laboratório e só depois vê o que realmente aconteceu, com as fontes.

## Casos

| # | Caso | Ano | Técnica | Status |
|---|------|-----|---------|--------|
| 1 | Francisca Rojas, Necochea (Argentina) | 1892 | Datiloscopia (Vucetich) | Jogável |
| 2 | "Brides in the Bath", G. J. Smith (Inglaterra) | 1915 | Patologia forense | Planejado |
| 3 | Sequestro Lindbergh (EUA) | 1932 | Madeira e rastreio de dinheiro | Planejado |
| 4 | Buck Ruxton (Escócia) | 1935 | Antropologia forense | Planejado |
| 5 | Unabomber (EUA) | 1996 | Linguística forense | Planejado |

## Critérios de fidelidade

- Só entram casos **encerrados**, com condenação ou confissão, e **bem documentados**.
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

O build do Node 22 fica disponível por 7 dias como artefato `dist` na página da execução. O Dependabot (`.github/dependabot.yml`) abre PRs semanais com atualizações, e cada PR passa pelo mesmo pipeline antes do merge.

## Arquitetura

```
src/
├── cases/            dados de cada caso (texto, suspeitos, fontes)
│   └── rojas1892.ts
├── engine/           regras independentes de UI
│   ├── types.ts      contrato de um caso (CaseFile) e do estado (GameState)
│   ├── state.ts      store imutável + persistência em localStorage
│   └── scoring.ts    pontuação
├── forensics/        "ciência" do jogo, funções puras e testadas
│   ├── fingerprint.ts gerador procedural de digitais
│   └── match.ts      confronto de minúcias
├── ui/
│   ├── dom.ts        helper h() para criar elementos
│   ├── prints.ts     cache de renderização das digitais
│   └── screens/      uma tela por etapa do caso
├── main.ts           roteamento entre etapas
└── styles.css
```

Decisões principais:

- **Sem framework.** Com seis telas e estado pequeno, React ou Vue trariam mais complexidade que benefício (YAGNI). O padrão "estado → render" é o mesmo, então migrar depois é simples.
- **Casos como dados.** Um caso novo é um arquivo em `src/cases/` que segue `CaseFile`. O motor não conhece nenhum caso específico.
- **Ciência isolada da UI.** `forensics/` não toca no DOM, exceto na função de render, por isso dá para testar com Vitest.
- **Digitais procedurais.** Cada crista é uma curva de nível de um campo escalar; as minúcias são singularidades de fase (±atan2) que criam bifurcações e terminações reais. Um teste verifica que uma volta em torno de uma minúcia soma exatamente 2π à fase.

## Licença

A definir.
