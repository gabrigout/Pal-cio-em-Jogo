# Estado do projeto

Atualizado em: 2026-10-16

## Projeto

Palácio em Jogo é um simulador político de navegador, satírico, ambientado em um Brasil fictício a partir de janeiro de 2027. O jogador já começa na Presidência e governa por turnos de quatro semanas por mês. A stack é React 18, TypeScript 5, Vite 6 e lucide-react. Não há backend, banco de dados nem API obrigatória de IA; campanhas ficam no LocalStorage com importação/exportação JSON.

## Última etapa implementada — Fase 3.2: Judiciário

A branch de trabalho é **codex/phase-3b-judiciary**, baseada em **codex/phase-3a-congress**. O subsistema judicial agora inclui estado serializável, roster fictício do STF, vaga de indicação, candidatos, indicação presidencial, votação pelo Senado por maioria absoluta, nomeação posterior, processos em fases, decisões fundamentadas, recursos, cumprimento e aposentadoria mensal.

A campanha abre com dez ministros fictícios e uma vaga fictícia criada para introduzir o procedimento de nomeação; isso não representa afirmação histórica sobre uma vaga real em janeiro de 2027. O processo administrativo de abertura também é ficcional. Alguns atos legislativos aprovados podem gerar questionamentos judiciais conforme um risco configurado, mas ação judicial não significa ilegalidade comprovada.

As decisões são calculadas por fundamentos abstratos do caso e atributos dos julgadores ficcionais. Aprovação presidencial, apoio no Congresso, relação política com o Judiciário e capital político não podem escolher nem alterar o mérito da mesma decisão. Repercussão pública fica separada do mérito. O CNJ é apresentado como órgão administrativo/financeiro/disciplinar, não como recurso comum de mérito.

### Validação automatizada

O commit de código **303045f8a13fc523edef3ef5911553a25b5d0976** passou **73 testes, 0 falhas**, e build de produção no [workflow 38950949874](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38950949874). A suíte inclui testes judiciais, legislativos, econômicos, sociais, de projetos, turnos, moeda e migração. O código validado inclui regras de duração de etapas configuráveis.

O build e os testes não substituem revisão visual manual. Ainda não houve uma sessão real de navegador com screenshots desktop/celular nem testes E2E. A branch não foi mesclada à main.

## Funcionalidades existentes na base

- **Fundação jogável:** criação de campanhas, orientação política, seis partidos satíricos ou partido personalizado, tema partidário, dashboard, calendário, escolhas semanais, eventos, notícias, resumo e recursos.
- **Economia e moeda:** valores internos em R$ bilhões; formatação em reais, orçamento anual/setorial, receitas, despesas, dívida, empréstimos, juros, compromissos e execução mensal. Aprovação de orçamento não cria caixa automaticamente.
- **Poder Executivo:** ministérios e ministros fictícios, nomeação/exoneração, recursos, desempenho, execução mensal e proposta de reorganização sujeita ao Congresso.
- **Políticas públicas:** programas e projetos por setor, investimento, progresso semanal, resultados mensais, custos, riscos e histórico.
- **Sociedade:** cinco classes socioeconômicas, sete grupos organizados, diálogo, compromissos, apoio, pressão, protestos/paralisações e revisão mensal.
- **Congresso (Fase 3.1):** bancadas agregadas, proposições PL/PLP/PEC/MP/PPA/LDO/LOA, crédito e remanejamento, negociação, votos por Casa, sanção/veto e efeitos financeiros planejados.
- **Judiciário (Fase 3.2):** indicações ao STF e voto do Senado, processos e decisões em fases, recurso, cumprimento, aposentadoria simulada, histórico e integração às notícias.

## Regras judiciais básicas conferidas

- Constituição, art. 101: onze ministros; cidadão com mais de 35 e menos de 70 anos, notável saber jurídico e reputação ilibada; nomeação presidencial após aprovação por maioria absoluta do Senado.
- Maioria absoluta do Senado: 41 de 81 votos favoráveis para confirmar a indicação.
- Aposentadoria compulsória aos 75 anos conforme LC 152/2015.
- CNJ exerce controle administrativo, financeiro e disciplinar dentro da sua competência e não funciona como instância recursal comum de mérito.

Fontes oficiais consultadas e registradas no relatório:
- Constituição consolidada — Planalto: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
- Processo de indicação ao STF — Agência Senado, 10/04/2026: https://www12.senado.leg.br/noticias/infomaterias/2026/04/conheca-os-indicados-para-o-stf-desde-a-constituicao
- LC 152/2015 — Planalto: https://planalto.gov.br/ccivil_03/leis/lcp/lcp152.htm
- Competência do CNJ — perguntas frequentes: https://www.cnj.jus.br/ouvidoria-cnj/perguntas-frequentes/

## Arquivos e documentação principais

- src/components/JudiciaryPanel.tsx: interface de composição, processos, decisões, indicações, recursos e cumprimento.
- src/engine/judiciary.ts: regras judiciais e avanço semanal/mensal.
- src/data/judiciary.ts: parâmetros de idade, voto, custo, prazo e descrições de competência.
- src/engine/judiciary.test.ts: testes do subsistema judicial.
- src/state/types.ts: estado serializável.
- src/persistence/campaignRepository.ts: validação e migração dos saves.
- src/engine/turn.ts: integração com avanço semanal e fechamento mensal.
- docs/RELATORIO_FASE_3_2_JUDICIARIO.md: relatório técnico detalhado e prompt de continuidade para Claude.
- docs/AVALIACAO_PRONTIDAO.md: diagnóstico honesto do quanto falta para o jogo ser considerado completo.
- docs/PROXIMOS_PASSOS.md e docs/MAPA_MENTAL.md: roteiro para novas fases.

## Persistência

Save atual: **v9**. A migração v8→v9 inicializa o Judiciário em saves antigos preservando caixa, receita, dívida e os valores já convertidos para reais. Saves v6 e anteriores continuam usando a regra histórica de conversão, sem reaplicá-la a saves v8. A inicialização judicial usa valores derivados do identificador da campanha e é reproduzível. Múltiplas campanhas permanecem isoladas no navegador.

## Limitações conhecidas

- O fluxo de indicação não implementa sabatina da CCJ como etapa separada nem o calendário/regimento completo do Senado.
- Votações são agregadas por bancada, não por legislador real/individual.
- O motor judicial não interpreta jurisprudência; fundamentação e resultado são modelados por atributos abstratos do caso e julgadores fictícios.
- Processos têm prazos por semanas, não um modelo de cada classe processual. Liminares, embargos, todos os tipos de recursos e instâncias com procedimentos próprios ainda não existem.
- A rota de recurso TRF→STJ é ilustrativa; não presume que todo recurso contra decisão federal tenha esse cabimento.
- STF tem roster inicial; os outros órgãos têm competência descrita mas não motores completos.
- A vaga inicial do STF é fictícia e apresentada como recurso de gameplay, não como afirmação factual.
- A Justiça Eleitoral aparece nas descrições de competência, mas o sistema completo de eleições pertence à Fase 5.
- Não há revisão visual manual nem testes E2E.
- Fase 3.3 ainda precisa dos órgãos de controle, fiscalização, investigações, impeachment e crises institucionais.
- Fase 4 ainda precisa de personagens com memória/autonomia, alianças persistentes, imprensa independente e interesses sistêmicos.
- Fase 5 ainda precisa de Maré Ideológica, pesquisas e ciclo eleitoral completo.
- Fase 6 ainda precisa de expansão do catálogo, balanceamento de campanhas longas e revisão visual/institucional final.

## Plano de fases

- **Fase 1 — Fundação jogável:** concluída como base de protótipo.
- **Fase 2 — Governo e execução:** primeira versão implementada na base.
- **Fase 3.1 — Congresso e legislação:** primeira versão implementada e validada na branch-base.
- **Fase 3.2 — Judiciário:** primeira versão implementada e validada na branch atual.
- **Fase 3.3 — Órgãos de controle e crises institucionais:** próxima etapa.
- **Fase 4 — Política viva:** parcial.
- **Fase 5 — Eleições e Maré Ideológica:** pendente.
- **Fase 6 — Conteúdo, balanceamento e revisão:** pendente.

## Próximo passo

Implementar a **Fase 3.3 — Órgãos de controle e crises institucionais** em uma entrega delimitada, mantendo a independência dos Poderes e distinguindo suspeita, evidência, acusação e conclusão. Não declarar o jogo completo até que as fases 3.3, 4, 5 e 6 e a revisão visual tenham sido tratadas.

