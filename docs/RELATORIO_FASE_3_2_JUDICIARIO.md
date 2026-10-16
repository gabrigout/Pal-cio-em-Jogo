# Relatório de continuidade — Palácio em Jogo — Fase 3.2 (Judiciário)

**Data:** 16 de outubro de 2026  
**Branch:** https://github.com/gabrigout/Pal-cio-em-Jogo/tree/codex/phase-3b-judiciary  
**Branch-base:** codex/phase-3a-congress  
**Save atual:** v9  
**Validação:** 73 testes aprovados, zero falhas, build TypeScript/Vite aprovado no workflow https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38950949874  
**Integração:** a main não foi mesclada. Revisão visual manual em navegador continua pendente.

## 1. Contexto

Palácio em Jogo é um simulador político de navegador, satírico, construído com React, TypeScript e Vite. O jogador inicia a Presidência em janeiro de 2027, avança quatro semanas por mês e governa através de escolhas, recursos, projetos e acontecimentos sistêmicos. As campanhas são salvas em LocalStorage e podem ser importadas/exportadas em JSON. Não há backend, banco de dados nem dependência obrigatória de API externa de IA.

A branch atual inclui os sistemas previamente implementados:
- Fase 2A: catálogo de políticas e projetos com investimento, progresso, custos, resultados mensais e eventos.
- Fase 2B: cinco classes socioeconômicas, sete grupos de pressão, diálogo/acordos/manifestações e economia em R$ bilhões com caixa e dotação setorial.
- Fase 3.1: Congresso, proposições, negociação, votação por Casa, sanção/veto e orçamento legislativo simplificado.
- Identidade visual: seis paletas satíricas configuradas com referência em identidades partidárias reais, testes e migração de tema em save v8.
- Fase 3.2, implementada nesta branch: processos judiciais, decisões, recursos, cumprimento de decisões, vagas e indicações ao STF.

O jogo ainda é um protótipo/alpha, não uma experiência completa pronta para lançamento. Os processos jurídicos e legislativos são abstrações de gameplay e não reproduzem todo o rito brasileiro.

## 2. O que entrou na Fase 3.2

### 2.1. Estado judicial serializável
Foi adicionada a propriedade judiciary ao estado da campanha. Ela guarda o roster fictício do STF, vagas, candidatos, indicações, votos do Senado, processos, fases processuais, elementos do caso, decisões, recursos, obrigações de cumprimento, repercussão pública e históricos. O estado inclui chaves idempotentes para não avançar duas vezes a mesma semana nem processar duas vezes a mesma fonte legislativa.

Arquivos principais: src/state/types.ts, src/data/judiciary.ts, src/engine/judiciary.ts, src/components/JudiciaryPanel.tsx e src/engine/judiciary.test.ts.

### 2.2. Composição fictícia inicial
A campanha começa com dez ministros ficcionais e uma vaga ficcional na cadeira 11 para apresentar a mecânica de indicação e confirmação. Essa vaga inicial é uma decisão de gameplay e não afirma que havia uma vaga real no STF em janeiro de 2027. Os nomes são inventados; não representam magistrados atuais.

Cada ministro tem atributos abstratos de conhecimento jurídico, uso de precedentes, rigor processual, independência e reputação. Todos os ministros têm contagem regressiva de aposentadoria. O tempo avança no fechamento mensal; a idade aumenta com o passar dos meses; quando o limite simulado chega a 75 anos, abre-se uma vaga e é preciso realizar novo processo de indicação. A mesma vaga não é aberta duas vezes no mesmo mês.

### 2.3. Indicação e aprovação pelo Senado
O jogador indica um candidato para uma vaga aberta. O sistema valida idade entre 36 e 69 anos, conhecimento jurídico e reputação, vaga disponível, indicação ainda não ativa e disponibilidade de pontos de ação/capital político. A indicação consome 1 ponto de ação e 3 de capital político, mas não dá posse imediata.

Na semana seguinte, o jogo simula a deliberação do Senado por bancadas. A indicação precisa de no mínimo 41 votos favoráveis de 81 senadores. O resultado registra votos favoráveis, contrários, abstenções, ausências, presença e votos mínimos necessários. A rejeição mantém a vaga aberta; o presidente pode indicar outra pessoa. Se aprovada, ainda precisa formalizar a nomeação, que consome 1 ponto de ação.

O voto é determinístico para a mesma campanha/indicação. Indicadores políticos e perfil do candidato alteram a probabilidade simulada, mas não garantem resultado. Isso é um modelo de gameplay, não uma previsão da política real.

### 2.4. Processos judiciais
A campanha começa com um processo fictício de natureza administrativa em tramitação na Justiça Federal, relacionado a critérios de execução de repasses. O texto explicita que ajuizamento não prova irregularidade.

Algumas normas aprovadas no Congresso podem gerar ações de questionamento judicial conforme um risco de simulação configurado por tipo de proposição, impacto fiscal e indicadores sistêmicos. Nem toda lei gera ação e a existência de ação não significa que a lei seja inválida.

O processo avança por estas etapas: distribuído, admissibilidade, instrução, conclusos para decisão, decisão publicada, prazo recursal quando cabível, decisão final, obrigação de cumprimento ou encerramento sem julgamento do mérito. O histórico registra a evolução processual em turnos semanais.

### 2.5. Decisão e independência judicial
A decisão simulada leva em conta fundamentos jurídicos abstratos, força dos elementos, adequação a precedentes e regularidade processual. No STF, atributos médios do roster fictício também influenciam a avaliação. Cada decisão registra resultado e fundamentação.

**A aprovação presidencial, a relação política do presidente com o Judiciário, o apoio no Congresso e o capital político não alteram o mérito da mesma decisão.** Um teste compara o mesmo processo após modificar esses indicadores, e exige o mesmo resultado. O presidente não pode escolher quem vence um caso.

A repercussão pública é registrada em campo separado. Ela pode indicar debate intenso por impacto social ou polarização, mas não substitui o fundamento jurídico nem vira prova de legalidade/ilegalidade.

### 2.6. Recursos e cumprimento
Em um resultado adverso ao governo, quando existe instância revisora e prazo recursal configurados, o Executivo pode interpor recurso. Isso custa 1 ponto de ação e 2 de capital político. O caso muda para a instância revisora, percorre nova etapa de tramitação e pode receber novo resultado, sem garantia de reversão.

O modelo permite uma etapa de recurso por caso. Quando a decisão se torna final e exige providência do governo, o jogador pode registrar o cumprimento por 1 ponto de ação. Cumprimento dentro do prazo aumenta confiança pública e estabilidade institucional em 2 pontos no modelo; se houve atraso, cumprir não apaga os custos institucionais já aplicados. Não existe botão para cancelar decisão judicial por vontade unilateral do presidente.

### 2.7. Competência do CNJ e demais instituições
O painel lista STF, STJ, Justiça Federal/TRFs, Justiça estadual/TJs, TSE, TST, STM e CNJ com descrições de competência. O CNJ é explicitamente descrito como órgão de controle administrativo, financeiro e disciplinar, não como instância recursal comum do mérito judicial.

Somente o roster do STF e um fluxo inicial de Justiça Federal têm regras de motor nesta entrega. As outras instituições têm descrição de competência; isso não significa que todos os procedimentos de suas cortes estejam simulados.

### 2.8. Interface e integração
A aba Judiciário foi adicionada à navegação. O painel exibe composição do STF, idade e atributos ficcionais, vagas, lista de candidatos, estágio de indicação, resultado da votação do Senado, formalização de nomeação, processos, tipo, instância, fase, partes, tempo decorrido, fundamentação, repercussão pública, recurso, cumprimento e histórico. Botões ficam bloqueados quando faltam recursos ou quando a fase não permite a ação.

O motor judicial avança semanalmente junto ao sistema de turnos. A contagem de aposentadoria é processada no fechamento mensal. Notícias de decisões, indicações e prazos institucionais usam o feed existente.

## 3. Regras verificadas em fontes oficiais

As regras básicas foram confrontadas com referências oficiais atuais:
- **Composição e requisitos do STF:** o art. 101 da Constituição define onze ministros, idade acima de 35 e abaixo de 70, notável saber jurídico e reputação ilibada, com nomeação presidencial após aprovação por maioria absoluta do Senado. Constituição Federal consolidada — Planalto: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
- **Quórum do Senado:** a maioria absoluta corresponde a 41 de 81 senadores. Agência Senado, publicação de 10 de abril de 2026 sobre o processo de indicação e confirmação: https://www12.senado.leg.br/noticias/infomaterias/2026/04/conheca-os-indicados-para-o-stf-desde-a-constituicao
- **Aposentadoria compulsória aos 75 anos:** a Lei Complementar nº 152/2015 abrange membros do Poder Judiciário. Planalto: https://planalto.gov.br/ccivil_03/leis/lcp/lcp152.htm
- **Competência do CNJ:** o CNJ esclarece que não cabe ao órgão revisar o mérito das decisões judiciais; sua atuação inclui controle administrativo/financeiro e deveres funcionais. https://www.cnj.jus.br/ouvidoria-cnj/perguntas-frequentes/

Essas referências validam os requisitos institucionais básicos configurados, mas não provam fidelidade integral do motor. O jogo reduz sabatina, prazos, recursos, prova e composição judicial a um sistema de turnos.

## 4. Arquivos alterados/adicionados

| Arquivo | Função |
|---|---|
| src/data/judiciary.ts | Idades, quóruns, custos, prazos e descrições de competências. |
| src/state/types.ts | Estado persistente de processos, decisões, votos, recursos, cumprimento e nomeações. |
| src/engine/judiciary.ts | Estado inicial, elegibilidade, nomeação, voto do Senado, tramitação, decisão, recurso, cumprimento e aposentadoria. |
| src/engine/judiciary.test.ts | Testes de estado inicial, elegibilidade, indicação, voto, nomeação, independência, tramitação, recurso, cumprimento, aposentadoria e idempotência. |
| src/components/JudiciaryPanel.tsx | Interface da área Judiciário. |
| src/components/TopNavigation.tsx | Adiciona a aba Judiciário. |
| src/App.tsx | Conecta callbacks ao engine. |
| src/engine/campaign.ts | Inicializa o estado judicial em campanhas novas. |
| src/engine/turn.ts | Avança processos/indicações por semana e aposentadorias no fechamento mensal. |
| src/persistence/campaignRepository.ts | Valida estado judicial e migra saves à versão 9. |
| src/persistence/campaignRepository.test.ts | Verifica migração v8→v9 sem alterar os valores em reais. |
| src/styles.css | Estilos responsivos. |
| package.json | Adiciona testes judiciais ao comando principal. |

## 5. Persistência — save v9

A versão mudou de v8 para v9 para armazenar o subsistema judicial. Saves v8 sem esse estado recebem roster, vaga e processo inicial de maneira determinística, preservando caixa, receita, dívida e valores já expressos em reais. Saves v6 e anteriores continuam seguindo a antiga regra de conversão monetária; a migração v8→v9 não multiplica montantes pela segunda vez.

O validador de save examina roster, vagas, candidatos, votos, processos, decisões, fases, campos numéricos e históricos. Há um teste de migração v8→v9 que também reabre um save já migrado e confirma que ele não é migrado outra vez.

## 6. Validação automatizada

O commit de código 303045f8a13fc523edef3ef5911553a25b5d0976 passou **73 testes, 0 falhas**, e o build TypeScript/Vite no workflow 38950949874: https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38950949874

A cobertura inclui:
- roster ficcional do STF, vaga e processo de abertura;
- idade, conhecimento jurídico e reputação;
- custo de indicação, requisito de aprovação e formalização da nomeação;
- voto com 81 cadeiras e 41 votos necessários;
- mesma decisão após alteração de aprovação presidencial, relação com o Judiciário e apoio político;
- evolução processual com fundamentação;
- recurso limitado à fase e à instância configuradas;
- cumprimento final, efeitos sobre confiança/estabilidade e aposentadoria idempotente;
- migração v8→v9 sem alterar o caixa;
- testes anteriores de Congresso, economia, sociedade, projetos, moeda, turnos e saves.

**A suíte não cobre:** clique visual real, navegação E2E, leitor de tela, contrastes em navegador nem equilíbrio de campanhas longas. Revisão visual manual permanece pendente.

## 7. Limitações deliberadas

- A vaga inicial na cadeira 11 é ficcional e foi incluída para introduzir a mecânica; não afirma vaga real em janeiro de 2027.
- Indicação e confirmação são condensadas; a sabatina da CCJ, pareceres, fila e calendário regimental próprios não estão modelados como etapa separada.
- A votação utiliza bancadas agregadas, sem voto de cada senador nem debate individual.
- Decisões vêm de atributos abstratos do caso e dos ministros fictícios; não analisam jurisprudência real nem preveem decisões de magistrados reais.
- Fases e prazos contam semanas. Liminares, embargos, recursos de várias espécies, prazos por classe de ação, incidentes e todas as hipóteses processuais reais não estão implementados.
- A rota recursal TRF→STJ é ilustrativa e não implica que todo recurso contra decisão de TRF caiba no STJ.
- Questionamentos de leis aprovadas são probabilísticos; não reproduzem todos os legitimados ou tipos de ação.
- TST, STM, TSE, STJ, TRFs/TJs e CNJ não têm motores completos nesta etapa; o painel descreve suas competências em vez de simular cada rito.
- A repercussão pública é separada do mérito jurídico, mas o cálculo do mérito é uma abstração de jogo.
- Não há revisão visual manual em navegador nesta entrega.

## 8. Próximas etapas antes de considerar o jogo completo

- **Fase 3.3:** MP/PGR, PF, CGU, TCU, AGU, Justiça Eleitoral, fiscalização, investigações, impeachment e crises entre Poderes, sem confundir suspeita, evidência, acusação e conclusão.
- **Fase 4:** memória/autonomia de personagens, alianças e promessas persistentes, imprensa independente, rumores/evidências, crises de imagem e interesses sistêmicos.
- **Fase 5:** Maré Ideológica, pesquisas, candidaturas, campanhas, segundo turno, cálculo de resultados e atualização de cadeiras somente nas eleições.
- **Fase 6:** catálogo, balanceamento de campanhas longas, revisão visual, acessibilidade e auditoria final de consistência.

O status geral do produto continua **protótipo/alpha**. Não declarar o jogo finalizado só porque os testes e o build passam.

## 9. Prompt de continuidade para Claude

> Continue o projeto Palácio em Jogo na branch codex/phase-3b-judiciary. Leia AGENTS.md, docs/STATUS.md, docs/PROXIMOS_PASSOS.md, docs/RELATORIO_FASE_3_2_JUDICIARIO.md e as seções 7.4, 8.3 e 9 do Documento Mestre. A Fase 3.2 já está implementada e passou 73 testes e build no workflow 38950949874. Não a reimplemente do zero. Audite primeiro o fluxo judicial existente e implemente somente a Fase 3.3: órgãos de controle e crises institucionais, com MP/PGR, PF, CGU, TCU, AGU e Justiça Eleitoral em suas competências, fiscalização, investigações, evidências, encaminhamentos, impeachment e crises entre Poderes. Separe suspeita, indício, acusação, decisão e conclusão; não deixe o presidente controlar investigações ou julgamentos. Integre com estado serializável, notícias, orçamento/projetos e personagens ficcionais. Se mudar o estado, eleve o save para nova versão e teste a migração v9. Rode npm run test e npm run build, atualize a documentação e faça revisão visual real se o ambiente permitir. Não faça push nem merge sem autorização explícita.

## 10. Estado de integração

- Branch atual: codex/phase-3b-judiciary
- Base: codex/phase-3a-congress
- Save: v9
- Validação automatizada: 73 testes aprovados e build verde no workflow 38950949874.
- Main: não mesclada.
- Próxima etapa recomendada: Fase 3.3 — órgãos de controle e crises institucionais.
