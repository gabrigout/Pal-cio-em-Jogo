# Estado do projeto

Atualizado em: 2026-10-15

## Projeto
Palácio em Jogo é um simulador político de navegador, satírico e sistêmico, ambientado em um Brasil fictício a partir de janeiro de 2027.
O jogador inicia na Presidência e governa em turnos semanais, tomando decisões que alteram indicadores, recursos e acontecimentos.

**Stack:** React 18, TypeScript 5, Vite 6 e `lucide-react`. Persistência local versionada em LocalStorage; não há backend, banco de dados nem API externa de IA. Os testes usam `node:test` com `tsx`.

## Implementado

- **Criação de campanha:** escolha entre esquerda/direita, seleção entre seis partidos ficcionais compatíveis ou criação de partido personalizado com nome, sigla e exatamente duas cores. A abertura satírica varia conforme a orientação. Indicadores e atributos iniciais são sorteados em faixas configuradas.
- **Tema visual:** primária e secundária derivadas do partido, com variantes calculadas por contraste; a aplicação usa tema e neutros. Texto de botão é escolhido conforme contraste. Os hexadecimais fixos da interface são neutros.
- **Estados do dashboard:** todos os indicadores usam faixas configuradas: abaixo de 35 = Crítico, 35–49 = Atenção e 50 ou mais = Estável. Recursos globais e Polarização/Confiança calculam um score agregado coerente com o valor exibido.
- **Calendário:** quatro semanas por mês, virada de mês/ano, avanço semanal, resumo semanal e balanço econômico simplificado no fechamento do mês.
- **Pontos e recursos:** 2 pontos de ação base, bônus para os quatro apoios acima de 49%, teto de 6 novos pontos, até 2 carregados e máximo de 8 disponíveis. Dinheiro/orçamento, capital político e capacidade administrativa são recursos separados.
- **Ações:** cinco ações de exemplo em `data/actions.ts`, com custos, efeitos imediatos ou pendentes, bloqueio por falta de recurso e motivo apresentado ao jogador.
- **Decisões e eventos:** 32 decisões semanais gerais e seis cartões executivos sobre ministros, com opções, efeitos, ícones e prévias de consequência; oito reações condicionais com pesos e histórico antirrepetição; dois eventos encadeáveis; três eventos mensais com opções. Resultados aplicam mudanças e mostram justificativa antes de voltar ao dashboard.
- **Feed e resumo:** ações, escolhas e encerramentos atualizam o feed. O resumo registra indicadores alterados, motivos, eventos, ações e pontos carregados/expirados.
- **Múltiplas campanhas:** biblioteca local para continuar, criar, excluir com confirmação, importar e exportar backups JSON. Cada campanha tem chave e identificador próprios.
- **Persistência:** autosave após criação, ação, decisão, resultado/fechamento e avanço semanal. Save atual em `versaoDoSave: 3`; migração de saves sem versão e das versões 1 e 2. Campanhas antigas recebem um gabinete ficcional gerado de forma determinística. Saves inválidos são isolados, e erros de quota/armazenamento geram mensagens.
- **Poder Executivo:** 17 ministérios de referência para janeiro de 2027, ministros ficcionais com sete atributos e candidatos gerados por afinidade partidária; nomeação, negociação e exoneração custam recursos e atualizam o apoio político. A ficha mostra competências, orçamento, execução anterior, desempenho, pendências, riscos e alertas. A virada mensal recalcula desempenho e inclui execução e riscos no resumo. Reorganização ministerial só pode ser registrada como proposta dependente do Congresso, sem tramitação nesta fase.
- **Instituições:** opções modelam negociação e interlocução; não permitem ao presidente comandar o Congresso ou o Judiciário.

## Pastas e arquivos principais

- `src/App.tsx`: alterna biblioteca, criação e jogo; conecta ações da UI ao engine e persiste alterações.
- `src/main.tsx`: inicializa React e importa estilos.
- `src/styles.css`: tema neutro/partidário, layout responsivo e estilos das telas.
- `src/components/`: `CampaignLibrary.tsx` (saves e backups), `CampaignSetup.tsx` (nova campanha), `Dashboard.tsx` (painel), `TurnControls.tsx` (recursos, ações e cartões), `DecisionResultDialog.tsx` e `WeeklySummaryDialog.tsx` (resultados), além de `MetricCard.tsx` e `TopNavigation.tsx`.
- `src/state/`: `types.ts` define o estado serializável e os contratos; `initialState.ts` define calendário inicial e meses.
- `src/engine/`: `campaign.ts` cria e valida seleções de partido; `executive.ts` inicializa ministros, processa nomeações/exonerações e calcula o desempenho mensal; `theme.ts` calcula contraste e variantes; `dashboard.ts` deriva indicadores e estados; `turn.ts` implementa calendário, recursos, decisões, reações, encadeamentos, eventos mensais e resultados. Testes em `turn.test.ts`, `executive.test.ts` e `dashboard.test.ts`.
- `src/data/`: `campaignConfig.ts` contém paletas, faixas e regras; `parties.ts` contém partidos; `ministries.ts` é o catálogo de ministérios; `executiveDecisions.ts` contém os seis cartões de ministros; `actions.ts` contém ações presidenciais classificadas por instrumento; `decisions.ts` e `additionalDecisions.ts` decisões gerais; `reactionEvents.ts` reações e eventos encadeados; `monthlyEvents.ts` eventos mensais; `dashboard.ts` notícias e cards demonstrativos.
- `src/persistence/`: `campaignRepository.ts` valida, salva, lista, carrega, exclui e migra saves; `backup.ts` exporta JSON; `campaignRepository.test.ts` cobre persistência, migração, backup e falhas.
- Raiz: `package.json` define comandos e dependências; `vite.config.ts` e `tsconfig*.json` configuram build; `index.html` é a entrada Vite.
- `docs/`: documento mestre e catálogos de personagens em Markdown/CSV/JSON.

## Rodar e testar

```bash
npm install
npm run dev
npm run test
npm run build
```

`npm run test` executa os testes de `src/engine/turn.test.ts`, `src/engine/executive.test.ts`, `src/engine/dashboard.test.ts` e `src/persistence/campaignRepository.test.ts`. O build usa `npm run build`. O LocalStorage é específico do navegador; exporte um backup JSON para cópia externa.

## Decisões de design

- Estado da campanha é serializável; regras ficam em `engine/`, conteúdo em `data/`, componentes em `components/` e saves em `persistence/`.
- Tema oficial fica no estado da campanha e é reaplicado ao reabrir/importar. Cores de interface vêm das duas cores partidárias ou de neutros; estados positivos/negativos usam rótulo e ícone, não verde/vermelho fixos.
- Status dos indicadores usa faixas comuns definidas em `src/data/campaignConfig.ts`: `<35` Crítico, `35–49` Atenção e `>=50` Estável. Métricas inversas ou compostas, como polarização/confiança, são normalizadas antes da classificação.
- Os pontos de ação não são dinheiro, capital político ou capacidade administrativa. Navegação e consulta não custam pontos; a decisão narrativa semanal é gratuita.
- Seleção de eventos combina condições, pesos e desempate estável por campanha/semana; reações recentes são evitadas. Eventos futuros são dados serializados no estado.
- Os conteúdos, ações e indicadores atuais são demonstrativos e equilibrados para a fundação, não uma simulação política completa.

## Pendências e retoques conhecidos

- Economia, Políticas Públicas, Sociedade, Relações e Notícias/Histórico ainda mostram apenas o título da seção; sistemas orçamentários detalhados e programas/projetos ministeriais continuam para etapas posteriores.
- Alertas e cartões “Em andamento”, “Aguardando resposta” e “Encerrado” ainda usam conteúdo demonstrativo. Há textos/contadores estáticos no dashboard, como o total anunciado de atualizações.
- As cinco ações, 32 decisões, reações e eventos mensais são conteúdo inicial. A economia usa receita e despesa agregadas simples; não há orçamento anual completo, dívida ou execução detalhada.
- Personagens ainda não têm memória/autonomia real, relações persistentes ou efeitos de promessas; imprensa, investigações, crises entre poderes e eleições também não têm sistemas completos.
- Não há testes automatizados de interação visual nem screenshots em desktop/celular. O tema calcula contraste em código, mas merece revisão visual nas telas densas e com cores extremas. O resumo semanal agora recebe foco sem scroll ao abrir e devolve o foco ao título do dashboard ao fechar.
- A folha importa Manrope e DM Mono do Google Fonts; sem rede, o fallback local é usado.

## Plano de fases

- **Fase 1 — Fundação jogável: completa.** Criação de campanha, dashboard, calendário, recursos/pontos, decisões, avanço semanal, notícias e saves múltiplos estão implementados. As ações e os conteúdos seguem como exemplos.
- **Fase 2 — Governo e execução: parcial.** Executivo, ministérios/ministros, nomeações, decisões ministeriais e desempenho mensal estão implementados. Falta economia e orçamento anual detalhados, políticas/projetos e grupos sociais, conectados aos recursos e indicadores existentes.
- **Fase 3 — Instituições e crises: não iniciada como sistema completo.** Criar procedimentos próprios do Congresso, Judiciário e demais órgãos, respeitando competências.
- **Fase 4 — Política viva: parcial.** Há cartões de reação, notícias e encadeamentos; faltam personagens autônomos, alianças, memória, imprensa sistêmica e modelos globais de corrupção/interesses.
- **Fase 5 — Eleições e Maré Ideológica: não iniciada.** Pesquisas, candidatos, regras eleitorais, composição pós-eleição e ciclo de oito anos.
- **Fase 6 — Conteúdo, balanceamento e revisão: não iniciada.** Importar/validar o catálogo de 150 personagens, ampliar conteúdo, testar campanhas longas e revisar regras legais/eleitorais.
