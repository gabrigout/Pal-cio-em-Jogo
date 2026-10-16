# Estado do projeto

Atualizado em: 2026-10-16

## Projeto

Palácio em Jogo é um simulador político de navegador, satírico e sistêmico, ambientado em um Brasil fictício a partir de janeiro de 2027. O jogador assume a Presidência e governa em turnos semanais. A aplicação é de navegador, sem backend ou banco de dados; as campanhas são salvas localmente, com backup JSON.

**Stack:** React 18, TypeScript 5, Vite 6 e `lucide-react`. Os testes usam `node:test` com `tsx`.

## Última entrega validada — Fase 3.1: Congresso e legislação

A branch `codex/phase-3a-congress` implementa uma área própria do Congresso e um motor legislativo serializável. A composição inicial soma 513 cadeiras na Câmara e 81 no Senado; as bancadas são ficcionais e distribuídas por pesos iniciais. Um partido personalizado com 3% de popularidade começa com uma bancada pequena. A representação é agregada por partido, sem criar deputados ou senadores individualmente.

A tramitação agora contempla PL, PLP, PEC, MP, PPA, LDO, LOA, crédito adicional e emenda de remanejamento. As etapas e votações avançam com as semanas do jogo; a negociação aumenta a margem de apoio, mas não garante aprovação. PL/PLP passam pelas duas Casas; PEC exige três quintos em dois turnos por Casa e não recebe sanção presidencial; MP exige declaração de relevância/urgência, tem prazo simulado e efeito fiscal provisório reversível; proposições orçamentárias vão à deliberação conjunta e, conforme o tipo, à sanção/veto. O veto volta às duas Casas para análise. As decisões fiscais integram o orçamento existente em R$ bilhões, sem transformar aprovação em caixa novo.

A reforma tributária já registrada pelo sistema econômico e a reorganização ministerial são recuperadas como proposições quando uma campanha anterior é migrada. O save atual é v8: a v7 já incluía o estado legislativo e a v8 atualiza a paleta/tema de partidos predefinidos nas campanhas salvas, preservando cores de partidos personalizados. Saves v6 mantêm os valores já convertidos para reais, sem nova multiplicação; saves v5 e anteriores ainda recebem a conversão histórica. Dados antigos de propostas pendentes são preservados na agenda legislativa.

**Validação automatizada:** GitHub Actions passou `npm run test` com **61 testes aprovados, 0 falhas**, e `npm run build` com sucesso no commit de código `601152eee8e9d17511a8ccb8d985516cddbef1a0` (execução [38947033246](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38947033246)). A revisão documental posterior foi validada no HEAD `b4f20af61d697fc5fc423e672349b823b29c9535`, com 61 testes e build aprovados no [workflow 38947525507](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38947525507). O resultado automatiza testes e build, mas não equivale a uma revisão visual no navegador. A branch de trabalho não foi mesclada à `main`.

## Funcionalidades implementadas

- **Criação de campanha e tema:** escolha entre esquerda/direita, seis partidos fictícios ou partido personalizado com nome, sigla e duas cores. A interface usa paletas pesquisadas para PT/PSOL/PDT/PL/PSDB/NOVO como referência das paródias; botões principais usam a cor primária pesquisada e texto com contraste calculado, enquanto indicadores e textos pequenos usam variantes legíveis. Fontes e limitações estão em `docs/CORES_DOS_PARTIDOS.md`.
- **Dashboard e turnos:** indicadores nacionais, calendário de quatro semanas por mês, escolhas semanais, eventos/reação, resumo de virada, notícias e histórico do estado da campanha.
- **Ações e recursos:** pontos de ação, caixa/orçamento, capital político e capacidade administrativa são recursos distintos. Ações validam custos antes de aplicar efeitos imediatos ou pendentes.
- **Múltiplas campanhas:** biblioteca local para criar, continuar e excluir campanhas; importação/exportação de backups JSON. Autosave local, sem serviço de nuvem.
- **Poder Executivo:** 17 ministérios de referência, ministros e candidatos fictícios, nomeação, negociação, exoneração, execução mensal, pendências, alertas e efeitos de coordenação.
- **Economia e finanças:** orçamento anual por oito setores, dotações ministeriais, execução mensal, tributos com ajustes limitados, propostas legislativas, caixa, empréstimos, dívida, juros e pagamentos adiados. Valores monetários usam R$ bilhões internamente e são formatados como reais na interface. A execução não ultrapassa a dotação anual nem paga despesas sem caixa.
- **Políticas públicas:** catálogo de programas e projetos por setor, investimento, duração, prioridade, avanço semanal, resultado mensal, histórico e riscos de execução.
- **Sociedade e grupos de pressão:** cinco classes econômicas e sete grupos organizados, com apoio, pressão, diálogo, compromissos, protestos/paralisações, histórico e revisão mensal.
- **Congresso e legislação — Fase 3.1:** composição bicameral agregada, protocolo de proposições, negociação, tramitação, votações, sanção/veto, revisão de veto e efeitos de orçamento legislativo. Detalhes e limites estão documentados abaixo.

## Regras centrais do Congresso implementadas

- **Cadeiras e quóruns:** números e regras são configurados em `src/data/legislature.ts`. A Câmara totaliza 513 e o Senado 81. A composição inicial é uma aproximação ficcional baseada nos pesos configurados; não é uma eleição real nem altera cadeiras conforme eventos semanais.
- **PL:** análise inicial → negociação → Câmara → Senado → sanção ou veto.
- **PLP:** fluxo equivalente ao PL, com maioria absoluta dos membros da Casa.
- **PEC:** duas votações em cada Casa; cada turno exige três quintos dos membros. Não vai à sanção presidencial.
- **MP:** só é registrada se o jogador declara relevância e urgência; começa na Câmara. O prazo é contado por semanas (7 dias por avanço), entra em urgência aos 45 dias e perde vigência ao atingir 120 dias se não tiver sido concluída. O impacto fiscal é provisório e revertido em caso de rejeição/perda de vigência.
- **PPA/LDO/LOA:** passam pela sessão conjunta simplificada; a LOA altera o total de orçamento anual e distribui a dotação setorial antes da sanção/veto.
- **Crédito adicional:** eleva o orçamento planejado e distribui aumento entre dotação setorial e compromissos fixos; não injeta caixa de imediato.
- **Emenda de remanejamento:** reduz dotação não executada na origem e aumenta a do destino; não eleva o total do orçamento.
- **Articulação:** cada negociação consome pontos de ação e capital político. A votação é calculada por bancada, orientação e indicadores de apoio, com resultado determinístico para a mesma campanha/proposição.
- **Efeitos fiscais de leis comuns:** o impacto anual estimado alimenta a pressão mensal de despesas/economias; caixa, endividamento e execução real continuam sujeitos ao fechamento econômico mensal.

## Documentação de continuidade

- `docs/MAPA_MENTAL.md`: mapa geral dos sistemas, dependências, recursos e regras contínuas de documentação.
- `docs/CORES_DOS_PARTIDOS.md`: pesquisa de cores e distinção entre códigos oficiais e aproximações.
- `docs/AVALIACAO_PRONTIDAO.md`: avaliação geral do que está e do que não está pronto.
- `docs/RELATORIO_FASE_3_1_CLAUDE.md`: relatório detalhado de Congresso, regras, testes e limitações.
- `docs/RELATORIO_CORES_E_PRONTIDAO.md`: o que mudou nas cores, avaliação de prontidão e próximos passos.

## Pastas e arquivos principais

- `src/App.tsx`: conecta navegação, componentes, ações do engine e persistência.
- `src/components/TopNavigation.tsx`: navegação superior, incluindo Congresso.
- `src/components/LegislaturePanel.tsx`: formulários e apresentação das Casas, proposições, votações, histórico, sanção/veto e remanejamento.
- `src/state/types.ts`: tipos serializáveis da campanha, proposições, bancadas, etapas e votações.
- `src/data/legislature.ts`: números de cadeiras, requisitos, custos de ação, limites e rótulos legislativos.
- `src/engine/legislature.ts`: distribuição inicial de cadeiras, validação e submissão de proposições, negociação, votos, tramitação, efeitos fiscais e sanção/veto.
- `src/engine/turn.ts`: avança a tramitação legislativa uma vez por semana.
- `src/engine/economy.ts` e `src/engine/executive.ts`: conectam reforma tributária e reorganização ministerial à agenda legislativa.
- `src/persistence/campaignRepository.ts`: valida, salva e migra campanhas; versão atual do save é 7.
- `src/styles.css`: estilo responsivo do painel legislativo e telas existentes.

## Rodar e testar

```bash
npm install
npm run dev
npm run test
npm run build
```

A suíte automatizada atual tem 61 testes. O workflow `.github/workflows/validate.yml` executa testes e build a cada push em `main` ou em branches `codex/**`, e em pull requests direcionados à `main`.

## Decisões de design

- O estado de campanha é serializável; as regras ficam em `engine/`, os catálogos/configurações em `data/`, a apresentação em `components/` e os saves/migrações em `persistence/`.
- Partidos, bancadas e resultados são ficcionais. O jogo não representa legisladores reais nem atribui declarações ou votos individuais a pessoas reais.
- O modelo legislativo é uma abstração jogável. Quóruns e números principais são parametrizados, mas o sistema não implementa todo o processo regimental, todas as comissões, pareceres, apensamentos, urgências específicas, períodos de recesso ou todas as exceções constitucionais.
- O resultado de uma votação não é decidido diretamente pelo jogador. Apoio no Congresso e articulação influenciam probabilidades, não substituem o voto.
- Aprovar uma lei não cria dinheiro disponível automaticamente. A LOA altera o planejamento anual; emendas redistribuem dotação; crédito adicional altera orçamento planejado; caixa e despesas continuam sujeitos ao motor econômico.
- A migração de v7 para v8 atualiza a paleta dos partidos predefinidos; a migração de v6 para v8 não reescala reais pela segunda vez. Valores v5 ou anteriores recebem a conversão histórica de unidades abstratas para a escala interna de R$ bilhões.
- LocalStorage é específico do navegador. Exporte backups para preservar campanhas fora da máquina.

## Pendências e limites conhecidos

- **Revisão visual manual pendente:** ainda não foi feita uma sessão real de navegador/screenshot para revisar layout, navegação e formulários do Congresso em desktop e celular. O build valida tipos e bundle, não usabilidade visual.
- **Simplificação parlamentar:** não há biografias, lideranças individuais, comissões funcionais, relatórios de parecer completos, emendas ao texto de uma proposição, substitutivos, pedidos de vista, obstrução ou negociação individual com cada parlamentar.
- **Processo orçamentário simplificado:** PPA/LDO/LOA são representados por votação conjunta agregada; o rito integral constitucional e regimental não está implementado. Crédito adicional e emenda seguem limites de simulação configurados, não substituem análise jurídica/orçamentária.
- **Medidas provisórias simplificadas:** o jogo simula 60+60 dias como prazo total de 120 dias, urgência após 45 dias e uma tramitação semanal. Não modela toda hipótese de suspensão de prazo, recesso, comissão mista ou restrições materiais constitucionais.
- **Composição inicial:** números totais de cadeiras conferem, mas a distribuição por partido é uma aproximação ficcional; atualização eleitoral de bancadas fica para a Fase 5, sem mudar cadeiras de modo semanal.
- **Efeitos fiscais:** o impacto financeiro de PL/PLP/PEC aprovado usa uma pressão mensal agregada; ele não cria automaticamente um programa público, contrato, arrecadação tributária detalhada ou obrigação plurianual individual.
- **Outras instituições:** o Judiciário, órgãos de controle, investigações e crises entre poderes ainda não têm o sistema previsto nas Fases 3.2 e 3.3. Relações e Notícias/Histórico ainda precisam de telas sistêmicas próprias.
- **Eleições e personagens:** continuam pendentes sistemas completos de candidatos, cálculo eleitoral, mudanças de cadeiras só após eleição, memória/autonomia de personagens e imprensa sistêmica.
- **Balanceamento legal e econômico:** as faixas e efeitos são valores ficcionais para jogo. Regras legais/eleitorais precisam de revisão atualizada antes de qualquer alegação de simulador juridicamente fiel.

## Plano de fases

- **Fase 1 — Fundação jogável:** concluída.
- **Fase 2 — Governo e execução:** primeira versão implementada; inclui Executivo, economia, políticas públicas, sociedade e revisão financeira em branches anteriores.
- **Fase 3.1 — Congresso e legislação:** implementada e validada na branch `codex/phase-3a-congress`.
- **Fase 3.2 — Judiciário:** próxima etapa.
- **Fase 3.3 — Órgãos de controle e crises institucionais:** pendente.
- **Fase 4 — Política viva:** parcial; reações/notícias existem, mas personagens autônomos, imprensa e interesses sistêmicos estão pendentes.
- **Fase 5 — Eleições e Maré Ideológica:** pendente.
- **Fase 6 — Conteúdo, balanceamento e revisão:** pendente.

## Próximo passo

Iniciar **Fase 3.2 — Judiciário**, lendo as seções 8 e 19 do Documento Mestre. Manter processos, decisões e indicações judiciais independentes do Executivo; testar o motor e build; depois atualizar este documento. A branch `codex/phase-3a-congress` ainda precisa de revisão/integração pelo responsável do projeto antes de entrar na `main`.
