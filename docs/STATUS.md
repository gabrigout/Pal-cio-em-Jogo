# Estado do projeto

Atualizado em: 2026-10-15

## Projeto
Palácio em Jogo é um simulador político de navegador, satírico e sistêmico, ambientado em um Brasil fictício a partir de janeiro de 2027.
O jogador inicia na Presidência e governa em turnos semanais, tomando decisões que alteram indicadores, recursos e acontecimentos.

**Stack:** React 18, TypeScript 5, Vite 6 e `lucide-react`. Persistência local versionada em LocalStorage; não há backend, banco de dados nem API externa de IA. Os testes usam `node:test` com `tsx`.

## Última etapa validada — Fase 2B e revisão financeira

A aba Sociedade já representa cinco classes econômicas e sete grupos organizados, com apoio, pressão pública, diálogo, compromissos setoriais, protestos/paralisações e revisão mensal. As políticas públicas integram esses resultados à simulação. A economia usa R$ bilhões como unidade interna, formata a interface em reais, vincula caixa e dívida ao fechamento mensal e impede ultrapassar a dotação anual setorial. Saves avançam para v6 com migração dos dados legados.

Validação no GitHub Actions, commit `bffec5e`: **45 testes passaram e `npm run build` foi concluído com sucesso**. A branch não foi mesclada à `main`.

## Implementado

- **Criação de campanha:** escolha entre esquerda/direita, seleção entre seis partidos ficcionais compatíveis ou criação de partido personalizado com nome, sigla e exatamente duas cores. A abertura satírica varia conforme a orientação. Indicadores e atributos iniciais são sorteados em faixas configuradas.
- **Tema visual:** primária e secundária derivadas do partido, com variantes calculadas por contraste; a aplicação usa tema e neutros. Texto de botão é escolhido conforme contraste. Os hexadecimais fixos da interface são neutros.
- **Estados do dashboard:** todos os indicadores usam faixas configuradas: abaixo de 35 = Crítico, 35–49 = Atenção e 50 ou mais = Estável. Recursos globais e Polarização/Confiança calculam um score agregado coerente com o valor exibido.
- **Calendário:** quatro semanas por mês, virada de mês/ano, avanço semanal, resumo semanal e balanço econômico simplificado no fechamento do mês.
- **Pontos e recursos:** 2 pontos de ação base, bônus para os quatro apoios acima de 49%, teto de 6 novos pontos, até 2 carregados e máximo de 8 disponíveis. Dinheiro/orçamento, capital político e capacidade administrativa são recursos separados.
- **Ações:** cinco ações de exemplo em `data/actions.ts`, com custos, efeitos imediatos ou pendentes, bloqueio por falta de recurso e motivo apresentado ao jogador.
- **Decisões e eventos:** 32 decisões semanais gerais, seis cartões executivos sobre ministros e seis cartões econômicos, com opções, efeitos e justificativas; oito reações condicionais com pesos e histórico antirrepetição; dois eventos encadeáveis; três eventos mensais com opções.
- **Feed e resumo:** ações, escolhas e encerramentos atualizam o feed. O resumo registra indicadores alterados, motivos, eventos, ações e pontos carregados/expirados.
- **Múltiplas campanhas:** biblioteca local para continuar, criar, excluir com confirmação, importar e exportar backups JSON. Cada campanha tem chave e identificador próprios.
- **Persistência:** autosave após criação, ação, decisão, resultado/fechamento e avanço semanal. Save atual em `versaoDoSave: 6`; migração de saves sem versão e das versões 1 a 5 inicializa projetos e sociedade, e converte valores monetários legados para a nova escala de R$ bilhões. Valores sociais gerados para campanhas antigas são determinísticos.
- **Poder Executivo:** 17 ministérios de referência para janeiro de 2027, ministros ficcionais com sete atributos e candidatos gerados por afinidade partidária; nomeação, negociação e exoneração custam recursos e atualizam o apoio político. A ficha mostra competências, orçamento, execução anterior, desempenho, pendências, riscos e alertas. A virada mensal recalcula desempenho e inclui execução e riscos no resumo. Reorganização ministerial só pode ser registrada como proposta dependente do Congresso, sem tramitação nesta fase.
- **Economia:** indicadores serializáveis e histórico mensal; orçamento anual distribuído por oito setores e integrado às dotações dos ministérios, com revisões limitadas ao início do ano e às janelas trimestrais. Tributos permitem ajustes administrativos limitados e reformas ficam como propostas ao Congresso. Caixa, empréstimos, juros, dívida e pagamentos adiados são finitos; a execução mensal considera ministérios, confiança, integridade, polarização, estabilidade, desempenho e decisões, explica os resultados e reduz a execução quando falta dinheiro. A tela apresenta indicadores, tendências, gráficos SVG, execução setorial, tributos, empréstimos, riscos e alternativas emergenciais.
- **Instituições:** opções modelam negociação e interlocução; não permitem ao presidente comandar o Congresso ou o Judiciário.

## Pastas e arquivos principais

- `src/App.tsx`: alterna biblioteca, criação e jogo; conecta ações da UI ao engine e persiste alterações.
- `src/main.tsx`: inicializa React e importa estilos.
- `src/styles.css`: tema neutro/partidário, layout responsivo e estilos das telas.
- `src/components/`: inclui `PolicyProjectsPanel.tsx` para catálogo, carteira e histórico de projetos, além da biblioteca, configuração de campanha, dashboard, controles de turno, painéis executivo/econômico e componentes de resultado.
- `src/state/`: `types.ts` define o estado serializável e os contratos; `initialState.ts` define calendário inicial e meses.
- `src/engine/`: `campaign.ts` cria campanhas; `executive.ts` implementa ministérios; `economy.ts` implementa orçamento, tributos, empréstimos e fechamento fiscal; `projects.ts` implementa custos, progresso e avaliação de projetos; `turn.ts` integra calendário, decisões e fechamentos. Testes incluem `projects.test.ts`.
- `src/data/`: inclui `publicPrograms.ts`, catálogo de programas públicos por setor, junto aos catálogos de partidos, ministérios, orçamento, ações, decisões e eventos.
- `src/components/`: `EconomyPanel.tsx` apresenta os indicadores, gráficos SVG, orçamento, tributos, dívida e explicações econômicas.
- `src/persistence/`: `campaignRepository.ts` valida, salva, lista, carrega, exclui e migra saves; `backup.ts` exporta JSON; `campaignRepository.test.ts` cobre persistência, migração determinística, backup e falhas.
- Raiz: `package.json` define comandos e dependências; `vite.config.ts` e `tsconfig*.json` configuram build; `index.html` é a entrada Vite.
- `docs/`: documento mestre e catálogos de personagens em Markdown/CSV/JSON.

## Rodar e testar

```bash
npm install
npm run dev
npm run test
npm run build
```

`npm run test` executa testes do turno, executivo, economia, dashboard, projetos, sociedade, moeda e persistência. A validação da Fase 2B registrou 45 testes aprovados. `npm run build` valida TypeScript e gera a versão de produção. O LocalStorage é específico do navegador; exporte um backup JSON para cópia externa.

## Decisões de design

- Estado da campanha é serializável; regras ficam em `engine/`, conteúdo em `data/`, componentes em `components/` e saves em `persistence/`.
- Tema oficial fica no estado da campanha e é reaplicado ao reabrir/importar. Cores de interface vêm das duas cores partidárias ou de neutros; estados positivos/negativos usam rótulo e ícone, não verde/vermelho fixos.
- Status dos indicadores usa faixas comuns definidas em `src/data/campaignConfig.ts`: `<35` Crítico, `35–49` Atenção e `>=50` Estável. Métricas inversas ou compostas, como polarização/confiança, são normalizadas antes da classificação.
- Os pontos de ação não são dinheiro, capital político ou capacidade administrativa. Navegação e consulta não custam pontos; a decisão narrativa semanal é gratuita.
- Caixa disponível acompanha o recurso orçamentário usado pelas ações comuns. Receitas, despesas financiadas, amortizações e juros são contabilizados no fechamento mensal; compromissos sem caixa são adiados, não pagos com saldo negativo. O endividamento acima do limite aumenta riscos institucionais e econômicos.
- Seleção de eventos combina condições, pesos e desempate estável por campanha/semana; reações recentes são evitadas. Eventos futuros são dados serializados no estado.
- Os conteúdos, ações e indicadores atuais são demonstrativos e equilibrados para a fundação, não uma simulação política completa.

## Pendências e retoques conhecidos

- Políticas Públicas e Sociedade têm telas funcionais na branch `codex/phase-2b-society-finance`; Relações e Notícias/Histórico seguem como placeholders.
- Alertas e cartões “Em andamento”, “Aguardando resposta” e “Encerrado” ainda usam conteúdo demonstrativo. Há textos/contadores estáticos no dashboard, como o total anunciado de atualizações.
- As ações, decisões, reações e eventos são conteúdo inicial, sujeito a balanceamento. A economia agora é expressa em reais, com caixa realista em R$ bi, orçamento anual, dívida, empréstimos e custos de projetos; ainda falta aprofundar o sistema tributário e macroeconômico.
- Personagens ainda não têm memória/autonomia real, relações persistentes ou efeitos de promessas; imprensa, investigações, crises entre poderes e eleições também não têm sistemas completos.
- Não há testes automatizados de interação visual nem screenshots em desktop/celular. O tema calcula contraste em código, mas merece revisão visual nas telas densas e com cores extremas. O resumo semanal agora recebe foco sem scroll ao abrir e devolve o foco ao título do dashboard ao fechar.
- A folha importa Manrope e DM Mono do Google Fonts; sem rede, o fallback local é usado.

## Plano de fases

- **Fase 1 — Fundação jogável: completa.** Criação de campanha, dashboard, calendário, recursos/pontos, decisões, avanço semanal, notícias e saves múltiplos estão implementados. As ações e os conteúdos seguem como exemplos.
- **Fase 2 — Governo e execução: primeira versão concluída e validada.** Executivo, economia, políticas públicas e sociedade têm telas e regras funcionais; a branch de trabalho passou 45 testes e build.
- **Fase 3 — Instituições e crises: não iniciada como sistema completo.** Criar procedimentos próprios do Congresso, Judiciário e demais órgãos, respeitando competências.
- **Fase 4 — Política viva: parcial.** Há cartões de reação, notícias e encadeamentos; faltam personagens autônomos, alianças, memória, imprensa sistêmica e modelos globais de corrupção/interesses.
- **Fase 5 — Eleições e Maré Ideológica: não iniciada.** Pesquisas, candidatos, regras eleitorais, composição pós-eleição e ciclo de oito anos.
- **Fase 6 — Conteúdo, balanceamento e revisão: não iniciada.** Importar/validar o catálogo de 150 personagens, ampliar conteúdo, testar campanhas longas e revisar regras legais/eleitorais.

## Próximo passo

Próximo passo: revisar o balanceamento em campanhas longas e iniciar a Fase 3 — Congresso, legislação e orçamento legislativo, em outra branch.


## Entrega — Fase 2B e revisão financeira

Branch: `codex/phase-2b-society-finance`. O sistema social cobre cinco classes econômicas e sete grupos de pressão; diálogo e acordos custam recursos, os grupos evoluem com emprego, inflação, crescimento e entregas, e manifestações/paralisações podem aparecer no fechamento mensal. A economia guarda valores em R$ bilhões, usa `R# Estado do projeto

Atualizado em: 2026-10-15

## Projeto
Palácio em Jogo é um simulador político de navegador, satírico e sistêmico, ambientado em um Brasil fictício a partir de janeiro de 2027.
O jogador inicia na Presidência e governa em turnos semanais, tomando decisões que alteram indicadores, recursos e acontecimentos.

**Stack:** React 18, TypeScript 5, Vite 6 e `lucide-react`. Persistência local versionada em LocalStorage; não há backend, banco de dados nem API externa de IA. Os testes usam `node:test` com `tsx`.

## Última etapa validada — Fase 2B e revisão financeira

A aba Sociedade já representa cinco classes econômicas e sete grupos organizados, com apoio, pressão pública, diálogo, compromissos setoriais, protestos/paralisações e revisão mensal. As políticas públicas integram esses resultados à simulação. A economia usa R$ bilhões como unidade interna, formata a interface em reais, vincula caixa e dívida ao fechamento mensal e impede ultrapassar a dotação anual setorial. Saves avançam para v6 com migração dos dados legados.

Validação no GitHub Actions, commit `bffec5e`: **45 testes passaram e `npm run build` foi concluído com sucesso**. A branch não foi mesclada à `main`.

## Implementado

- **Criação de campanha:** escolha entre esquerda/direita, seleção entre seis partidos ficcionais compatíveis ou criação de partido personalizado com nome, sigla e exatamente duas cores. A abertura satírica varia conforme a orientação. Indicadores e atributos iniciais são sorteados em faixas configuradas.
- **Tema visual:** primária e secundária derivadas do partido, com variantes calculadas por contraste; a aplicação usa tema e neutros. Texto de botão é escolhido conforme contraste. Os hexadecimais fixos da interface são neutros.
- **Estados do dashboard:** todos os indicadores usam faixas configuradas: abaixo de 35 = Crítico, 35–49 = Atenção e 50 ou mais = Estável. Recursos globais e Polarização/Confiança calculam um score agregado coerente com o valor exibido.
- **Calendário:** quatro semanas por mês, virada de mês/ano, avanço semanal, resumo semanal e balanço econômico simplificado no fechamento do mês.
- **Pontos e recursos:** 2 pontos de ação base, bônus para os quatro apoios acima de 49%, teto de 6 novos pontos, até 2 carregados e máximo de 8 disponíveis. Dinheiro/orçamento, capital político e capacidade administrativa são recursos separados.
- **Ações:** cinco ações de exemplo em `data/actions.ts`, com custos, efeitos imediatos ou pendentes, bloqueio por falta de recurso e motivo apresentado ao jogador.
- **Decisões e eventos:** 32 decisões semanais gerais, seis cartões executivos sobre ministros e seis cartões econômicos, com opções, efeitos e justificativas; oito reações condicionais com pesos e histórico antirrepetição; dois eventos encadeáveis; três eventos mensais com opções.
- **Feed e resumo:** ações, escolhas e encerramentos atualizam o feed. O resumo registra indicadores alterados, motivos, eventos, ações e pontos carregados/expirados.
- **Múltiplas campanhas:** biblioteca local para continuar, criar, excluir com confirmação, importar e exportar backups JSON. Cada campanha tem chave e identificador próprios.
- **Persistência:** autosave após criação, ação, decisão, resultado/fechamento e avanço semanal. Save atual em `versaoDoSave: 6`; migração de saves sem versão e das versões 1 a 5 inicializa projetos e sociedade, e converte valores monetários legados para a nova escala de R$ bilhões. Valores sociais gerados para campanhas antigas são determinísticos.
- **Poder Executivo:** 17 ministérios de referência para janeiro de 2027, ministros ficcionais com sete atributos e candidatos gerados por afinidade partidária; nomeação, negociação e exoneração custam recursos e atualizam o apoio político. A ficha mostra competências, orçamento, execução anterior, desempenho, pendências, riscos e alertas. A virada mensal recalcula desempenho e inclui execução e riscos no resumo. Reorganização ministerial só pode ser registrada como proposta dependente do Congresso, sem tramitação nesta fase.
- **Economia:** indicadores serializáveis e histórico mensal; orçamento anual distribuído por oito setores e integrado às dotações dos ministérios, com revisões limitadas ao início do ano e às janelas trimestrais. Tributos permitem ajustes administrativos limitados e reformas ficam como propostas ao Congresso. Caixa, empréstimos, juros, dívida e pagamentos adiados são finitos; a execução mensal considera ministérios, confiança, integridade, polarização, estabilidade, desempenho e decisões, explica os resultados e reduz a execução quando falta dinheiro. A tela apresenta indicadores, tendências, gráficos SVG, execução setorial, tributos, empréstimos, riscos e alternativas emergenciais.
- **Instituições:** opções modelam negociação e interlocução; não permitem ao presidente comandar o Congresso ou o Judiciário.

## Pastas e arquivos principais

- `src/App.tsx`: alterna biblioteca, criação e jogo; conecta ações da UI ao engine e persiste alterações.
- `src/main.tsx`: inicializa React e importa estilos.
- `src/styles.css`: tema neutro/partidário, layout responsivo e estilos das telas.
- `src/components/`: inclui `PolicyProjectsPanel.tsx` para catálogo, carteira e histórico de projetos, além da biblioteca, configuração de campanha, dashboard, controles de turno, painéis executivo/econômico e componentes de resultado.
- `src/state/`: `types.ts` define o estado serializável e os contratos; `initialState.ts` define calendário inicial e meses.
- `src/engine/`: `campaign.ts` cria campanhas; `executive.ts` implementa ministérios; `economy.ts` implementa orçamento, tributos, empréstimos e fechamento fiscal; `projects.ts` implementa custos, progresso e avaliação de projetos; `turn.ts` integra calendário, decisões e fechamentos. Testes incluem `projects.test.ts`.
- `src/data/`: inclui `publicPrograms.ts`, catálogo de programas públicos por setor, junto aos catálogos de partidos, ministérios, orçamento, ações, decisões e eventos.
- `src/components/`: `EconomyPanel.tsx` apresenta os indicadores, gráficos SVG, orçamento, tributos, dívida e explicações econômicas.
- `src/persistence/`: `campaignRepository.ts` valida, salva, lista, carrega, exclui e migra saves; `backup.ts` exporta JSON; `campaignRepository.test.ts` cobre persistência, migração determinística, backup e falhas.
- Raiz: `package.json` define comandos e dependências; `vite.config.ts` e `tsconfig*.json` configuram build; `index.html` é a entrada Vite.
- `docs/`: documento mestre e catálogos de personagens em Markdown/CSV/JSON.

## Rodar e testar

```bash
npm install
npm run dev
npm run test
npm run build
```

`npm run test` executa testes do turno, executivo, economia, dashboard, projetos, sociedade, moeda e persistência. A validação da Fase 2B registrou 45 testes aprovados. `npm run build` valida TypeScript e gera a versão de produção. O LocalStorage é específico do navegador; exporte um backup JSON para cópia externa.

## Decisões de design

- Estado da campanha é serializável; regras ficam em `engine/`, conteúdo em `data/`, componentes em `components/` e saves em `persistence/`.
- Tema oficial fica no estado da campanha e é reaplicado ao reabrir/importar. Cores de interface vêm das duas cores partidárias ou de neutros; estados positivos/negativos usam rótulo e ícone, não verde/vermelho fixos.
- Status dos indicadores usa faixas comuns definidas em `src/data/campaignConfig.ts`: `<35` Crítico, `35–49` Atenção e `>=50` Estável. Métricas inversas ou compostas, como polarização/confiança, são normalizadas antes da classificação.
- Os pontos de ação não são dinheiro, capital político ou capacidade administrativa. Navegação e consulta não custam pontos; a decisão narrativa semanal é gratuita.
- Caixa disponível acompanha o recurso orçamentário usado pelas ações comuns. Receitas, despesas financiadas, amortizações e juros são contabilizados no fechamento mensal; compromissos sem caixa são adiados, não pagos com saldo negativo. O endividamento acima do limite aumenta riscos institucionais e econômicos.
- Seleção de eventos combina condições, pesos e desempate estável por campanha/semana; reações recentes são evitadas. Eventos futuros são dados serializados no estado.
- Os conteúdos, ações e indicadores atuais são demonstrativos e equilibrados para a fundação, não uma simulação política completa.

## Pendências e retoques conhecidos

- Políticas Públicas e Sociedade têm telas funcionais na branch `codex/phase-2b-society-finance`; Relações e Notícias/Histórico seguem como placeholders.
- Alertas e cartões “Em andamento”, “Aguardando resposta” e “Encerrado” ainda usam conteúdo demonstrativo. Há textos/contadores estáticos no dashboard, como o total anunciado de atualizações.
- As ações, decisões, reações e eventos são conteúdo inicial, sujeito a balanceamento. A economia agora é expressa em reais, com caixa realista em R$ bi, orçamento anual, dívida, empréstimos e custos de projetos; ainda falta aprofundar o sistema tributário e macroeconômico.
- Personagens ainda não têm memória/autonomia real, relações persistentes ou efeitos de promessas; imprensa, investigações, crises entre poderes e eleições também não têm sistemas completos.
- Não há testes automatizados de interação visual nem screenshots em desktop/celular. O tema calcula contraste em código, mas merece revisão visual nas telas densas e com cores extremas. O resumo semanal agora recebe foco sem scroll ao abrir e devolve o foco ao título do dashboard ao fechar.
- A folha importa Manrope e DM Mono do Google Fonts; sem rede, o fallback local é usado.

## Plano de fases

- **Fase 1 — Fundação jogável: completa.** Criação de campanha, dashboard, calendário, recursos/pontos, decisões, avanço semanal, notícias e saves múltiplos estão implementados. As ações e os conteúdos seguem como exemplos.
- **Fase 2 — Governo e execução: primeira versão concluída e validada.** Executivo, economia, políticas públicas e sociedade têm telas e regras funcionais; a branch de trabalho passou 45 testes e build.
- **Fase 3 — Instituições e crises: não iniciada como sistema completo.** Criar procedimentos próprios do Congresso, Judiciário e demais órgãos, respeitando competências.
- **Fase 4 — Política viva: parcial.** Há cartões de reação, notícias e encadeamentos; faltam personagens autônomos, alianças, memória, imprensa sistêmica e modelos globais de corrupção/interesses.
- **Fase 5 — Eleições e Maré Ideológica: não iniciada.** Pesquisas, candidatos, regras eleitorais, composição pós-eleição e ciclo de oito anos.
- **Fase 6 — Conteúdo, balanceamento e revisão: não iniciada.** Importar/validar o catálogo de 150 personagens, ampliar conteúdo, testar campanhas longas e revisar regras legais/eleitorais.

## Próximo passo

Próximo passo: revisar o balanceamento em campanhas longas e iniciar a Fase 3 — Congresso, legislação e orçamento legislativo, em outra branch.


 na interface, mede a reserva em meses de cobertura, limita os gastos ao caixa e à dotação setorial anual, e formata relatórios ministeriais e fiscais em reais. O save v6 converte os montantes financeiros antigos e inicializa o estado social de modo determinístico. GitHub Actions: 45 testes e build aprovados no commit `bffec5e`.
