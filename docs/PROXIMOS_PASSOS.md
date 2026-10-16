# Próximos passos do Palácio em Jogo

Este documento permite que outra IA continue o projeto sem depender do histórico de uma conversa. Leia-o junto com `AGENTS.md`, `docs/STATUS.md` e as seções do documento mestre indicadas para cada etapa. O documento mestre é a referência de escopo e regras do jogo; o código e o status registram o que já existe.

## Como trabalhar

- Trabalhe em **um pedido por vez** e implemente partes pequenas, completas e verificáveis. Não tente concluir uma fase inteira em uma única mudança.
- Ao terminar cada parte, execute os testes pertinentes e `npm run build`; corrija falhas antes de encerrar. Atualize `docs/STATUS.md` com o que foi feito, o resultado dos testes e o próximo passo; então crie um commit.
- O estado da campanha é serializado e salvo automaticamente. A versão atual é `versaoDoSave: 8`, definida em `src/persistence/campaignRepository.ts`. Sempre que mudar o formato do estado salvo, aumente a versão e implemente/teste a migração de saves antigos. Preserve campanhas e dados existentes; migrações devem ser determinísticas quando gerarem valores.
- Siga a arquitetura existente: estado e tipos em `src/state/`, regras e simulação em `src/engine/`, catálogos e configuração em `src/data/`, apresentação em `src/components/` e persistência/migrações em `src/persistence/`. Componentes exibem estado e encaminham ações; não contêm lógica política.
- Use somente as cores oficiais do partido ativo e tons neutros na interface. Não introduza cores fixas para sucesso/alerta/erro; comunique estados também por rótulos e ícones. Mantenha contraste e legibilidade.
- Preserve as regras institucionais e a separação entre pontos de ação, dinheiro, capital político e capacidade administrativa; aprovação, Maré Ideológica e força eleitoral também são indicadores diferentes. Partidos, eventos e acusações são ficcionais e satíricos.
- A IA não tem autenticação para publicar no GitHub. Faça o commit local da etapa e informe o hash. **O usuário é quem executa `git push`**; não tente fazer push.

Comandos disponíveis: `npm run test` executa os testes automatizados (`node:test` via `tsx`); `npm run build` verifica TypeScript e gera a versão de produção. Não encerre uma etapa com testes ou build falhando.

## Estado atual

Atualizado conforme `docs/STATUS.md` em 2026-10-16. A Fase 1 está concluída e a primeira versão da Fase 2 está implementada. A Fase 3.1 (Congresso e legislação) foi concluída e validada na base `codex/phase-3a-congress`. A branch atual `codex/party-brand-palettes` aplica paletas partidárias pesquisadas e migra campanhas salvas para save v8.

- **Executivo e ministérios: implementados.** Há 17 ministérios de referência, ministros e candidatos ficcionais, nomeação, negociação e exoneração, decisões executivas, desempenho e fechamento mensal, além de proposta de reorganização sujeita ao Congresso. Implementação principal em `src/engine/executive.ts`, `src/data/ministries.ts`, `src/data/executiveDecisions.ts` e `src/components/ExecutivePanel.tsx`.
- **Economia e orçamento base: implementados.** Há indicadores e histórico, orçamento anual por setor e dotações ministeriais, execução mensal, ajustes tributários limitados, propostas legislativas, empréstimos e pagamentos adiados. Implementação principal em `src/engine/economy.ts`, `src/data/economy.ts`, `src/data/economicDecisions.ts` e `src/components/EconomyPanel.tsx`. Isso ainda não equivale ao sistema econômico completo previsto no documento mestre.
- **Políticas públicas e projetos: implementados e validados na base da branch `codex/phase-2a-public-projects`.**
- **Sociedade e grupos de pressão: primeira versão implementada e validada** na branch `codex/phase-2b-society-finance`. O sistema acompanha cinco classes, sete grupos, diálogo/acordos, apoio, pressão, manifestação e paralisação.

Brasil, Estado/Executivo, Economia, Políticas Públicas, Sociedade e Congresso têm telas funcionais na branch atual. Relações e Notícias/Histórico continuam pendentes. Save v8 inclui a migração de paletas para partidos predefinidos e preserva cores customizadas; saves v6/v7 continuam na escala monetária em reais. GitHub Actions passou 62 testes e build no commit `26612c65d62000a45b71cba31e2b421955d92258`; a validação está registrada em `docs/STATUS.md`.

## Histórico das entregas anteriores — Fase 2

A Fase 2A (projetos) e a Fase 2B (sociedade/finanças) foram incorporadas à base desta branch. Os registros históricos abaixo explicam o escopo implementado; não são tarefas a repetir. A `main` ainda não foi mesclada com esta sequência de trabalho.

### 2A. Políticas públicas e projetos — implementação inicial na branch de trabalho

Referência: seção 11 do Documento Mestre. Catálogo com 15 programas por setor, investimentos e prioridade, estado serializável, execução semanal, avaliação mensal, histórico, riscos contextuais, custos finitos e migração de save. A Fase 2A passou 37 testes e build no commit `319dae2`.

### 2B. Sociedade e grupos de pressão — implementada e validada

Referência: seção 12 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Validação da Fase 2B: 45 testes e build aprovados no commit `bffec5e`.

- Representar separadamente as classes econômicas (baixa renda, classe média, ricos/empresários, milionários e bilionários) e grupos organizados (por exemplo, sindicatos, entidades empresariais, estudantes, servidores e grupos rurais).
- Dar aos grupos interesses e reações contextualizados: pressão, apoio a propostas, negociação e manifestações. Não reduzir classes a categorias morais nem fazer eventos sem causa compreensível.
- Acompanhar aprovação por grupo sem confundi-la com aprovação presidencial geral, Maré Ideológica ou força eleitoral.
- Integrar efeitos de políticas/projetos e acontecimentos aos grupos; mostrar no dashboard apenas alertas relevantes e reservar detalhes para a área Sociedade.
- Cobrir evolução temporal, persistência/migração e testes no engine. Deixar a aba Sociedade funcional, sem lógica de simulação no componente.

## Fases seguintes

A sequência abaixo segue as Fases 3 a 6 da seção 19 do documento mestre. A Fase 3.1 foi concluída; não repita seu escopo. As subdivisões restantes são entregas menores: faça cada uma em um pedido separado e na ordem indicada. Releia também as regras específicas das seções citadas antes de implementar.

### Fase 3 — Instituições e crises

1. **Congresso, legislação e orçamento legislativo — concluída** na branch `codex/phase-3a-congress`. Inclui as Casas, proposições, tramitação, negociação, votações, sanção/veto, remanejamento e migração de saves v7. Os limites do modelo estão descritos em `docs/STATUS.md`.
2. **Judiciário e indicações — próxima entrega** (seção 8). Modelar processos, decisões, recursos e nomeações aplicáveis sem permitir controle presidencial sobre julgamentos.
3. **Órgãos de controle e crises institucionais** — seções 7.4, 8.3 e 9. Representar MP/PGR, PF, CGU, TCU, AGU e Justiça Eleitoral dentro de suas competências; conectar fiscalização, investigações, impeachment e crises entre poderes sem equiparar suspeita a culpa.

Critério de aceite da Fase 3 (seção 19): propostas seguem procedimentos coerentes e nenhum poder pode ser controlado pelo jogador fora de suas competências.

### Fase 4 — Política viva

1. **Personagens, memória e relações** — seção 15. Implementar atributos por função, histórico, promessas, alianças, autonomia e geração procedural contextual.
2. **Imprensa, comunicação e crises de imagem** — seção 16. Veículos e jornalistas ficcionais, cobertura independente, rumores e crises com etapas, evidências e respostas.
3. **Interesses, corrupção e polarização sistêmicos** — seções 2.3, 14 e 20, integrados aos sistemas existentes. Diferenciar suspeita, evidência, percepção pública e conclusão; jamais atribuir crimes como fatos a pessoas reais.

Critério de aceite da Fase 4 (seção 19): sistemas conectados geram consequências compreensíveis e explicáveis.

### Fase 5 — Eleições e Maré Ideológica

1. **Maré Ideológica e pesquisas** — seção 14. Separar tendência ideológica, aprovação e força eleitoral; permitir variação nacional, regional e social.
2. **Ciclo eleitoral e resultados** — seção 17. Implementar candidaturas, alianças permitidas, financiamento, Justiça Eleitoral e cálculo eleitoral configurável; atualizar cadeiras e cargos apenas nas eleições correspondentes.
3. **Continuidade e ciclo político** — seção 17.4. Respeitar calendário, limites de reeleição, sucessão partidária e continuidade definidos no documento mestre.

Critério de aceite da Fase 5 (seção 19): tendências influenciam, mas não determinam resultados; cadeiras não mudam fora de eleições.

### Fase 6 — Conteúdo, balanceamento e revisão

1. **Catálogo e conteúdo** — seções 15.1, 20 e 21. Validar e integrar os 150 personagens do catálogo, manter o conteúdo ficcional e ampliar programas, eventos e narrativas.
2. **Balanceamento e campanhas longas** — seções 19.6 e 22. Testar campanhas extensas, efeitos entre sistemas, economia, saves e migrações; corrigir desequilíbrios sem quebrar as regras institucionais.
3. **Revisão visual e institucional** — seções 20, 22 e 23. Completar identidade visual, revisar usabilidade e conferir regras legais/eleitorais vigentes antes da publicação.

Critério de aceite da Fase 6 (seção 19): campanhas variadas, sem contradições sistêmicas óbvias e sem violar regras institucionais ou de factualidade.

## Modelos de pedido

Copie um modelo por vez e ajuste somente o nome da entrega quando necessário. Antes de implementar, compare o pedido com o estado atual do código; não refaça o que já estiver pronto.

**Fase 2A — Políticas públicas e projetos**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md` e a seção 11 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente a parte 2A: catálogo de programas por setor e ciclo de projetos com investimento, duração, prioridade, avanço semanal, resultados mensais e eventos de execução, conectado a dinheiro, capital político e capacidade administrativa. Siga as regras de trabalho e arquitetura do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 2B — Sociedade e grupos de pressão**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md` e a seção 12 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente a parte 2B: classes sociais, grupos organizados, pressão/manifestações e aprovação por grupo, integrados ao estado, à simulação e às políticas públicas existentes. Siga as regras de trabalho e arquitetura do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 3.1 — Congresso e legislação (concluída; não repetir)**

Implementada e validada na branch `codex/phase-3a-congress`. Leia `docs/STATUS.md` e `docs/RELATORIO_FASE_3_1_CLAUDE.md` para entender as regras, testes e simplificações. A próxima entrega é a Fase 3.2 — Judiciário.

**Fase 3.2 — Judiciário**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, a seção 8 e a parte da Fase 3 na seção 19 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente somente processos, decisões, recursos e indicações judiciais desta parte; preserve a independência do Judiciário. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 3.3 — Controle e crises institucionais**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, as seções 7.4, 8.3 e 9 e a parte da Fase 3 na seção 19 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente somente órgãos de controle, fiscalização, investigações e crises institucionais desta parte, com competências próprias e distinção entre suspeita e culpa. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 4.1 — Personagens e relações**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, a seção 15 e a parte da Fase 4 na seção 19 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente somente personagens, memória, relações e autonomia desta parte, com regras no engine e estado serializável versionado. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 4.2 — Imprensa e crises de imagem**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, a seção 16 e a parte da Fase 4 na seção 19 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente somente imprensa, comunicação, rumores e crises de imagem desta parte, preservando a independência da imprensa e a distinção entre rumor e evidência. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 4.3 — Interesses sistêmicos**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, as seções 2.3, 14 e 20 e a parte da Fase 4 na seção 19 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente somente a integração sistêmica de interesses, corrupção e polarização desta parte, sem confundir atributos ficcionais com alegações sobre pessoas reais. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 5.1 — Maré Ideológica e pesquisas**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, a seção 14 e a parte da Fase 5 na seção 19 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente somente Maré Ideológica e pesquisas desta parte, mantendo aprovação, tendência ideológica e força eleitoral como conceitos separados. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 5.2 — Eleições e continuidade**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, a seção 17 e a parte da Fase 5 na seção 19 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente o ciclo eleitoral, cálculo de resultados e continuidade desta parte com regras configuráveis e requisitos eleitorais vigentes; não altere cadeiras fora das eleições. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 6.1 — Catálogo e conteúdo**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, as seções 15.1, 20 e 21 e a parte da Fase 6 na seção 19 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Implemente a integração/validação do catálogo e ampliação de conteúdo desta parte, preservando personagens e eventos ficcionais. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

**Fase 6.2 — Balanceamento e revisão final**

> Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, as seções 19.6, 20, 22 e 23 de `docs/Palacio_em_Jogo_Documento_Mestre.md`. Faça a parte de balanceamento, testes de campanhas longas e revisão visual/institucional prevista para a Fase 6. Não amplie o escopo sem necessidade; corrija apenas problemas relacionados a esses critérios. Siga as regras do item “Como trabalhar”. Ao terminar, rode testes e build, atualize `docs/STATUS.md` e faça commit. Não faça push.

## Pendências visuais e de conteúdo conhecidas

- As paletas de quatro partidos ainda estão pendentes de definição final no documento mestre: PTP, PDTT, PLIM e PSSDB. Os valores atuais em `src/data/campaignConfig.ts` são escolhas iniciais/provisórias; confirmar as cores oficiais e revisar contraste antes de considerar a identidade visual concluída. PSÓ e NOVA têm combinações de referência registradas no documento mestre.
- Há textos demonstrativos e conteúdo estático no dashboard, incluindo alertas, frentes de trabalho e contadores/títulos de atualizações. O conteúdo de ações, decisões e eventos também é inicial e precisa de expansão e balanceamento.
- Relações e Notícias/Histórico ainda são placeholders; Políticas Públicas, Sociedade e Congresso têm telas e regras próprias na branch de trabalho.
- Não há testes automatizados de interação visual nem screenshots desktop/celular. Revisar contraste, responsividade e telas densas ao avançar a interface.
