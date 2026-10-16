# Relatório de continuidade — Palácio em Jogo — Fase 3.1 (Congresso e legislação)

**Data:** 16 de outubro de 2026  
**Branch de trabalho:** [`codex/phase-3a-congress`](https://github.com/gabrigout/Pal-cio-em-Jogo/tree/codex/phase-3a-congress)  
**Base:** `codex/phase-2b-society-finance`  
**Escopo concluído nesta etapa:** Fase 3.1 — Congresso, propostas legislativas, tramitação, votações e orçamento legislativo simplificado.  
**Atenção:** a branch ainda não foi mesclada à `main`. Testes automatizados e build não substituem a revisão visual manual em navegador.

**Atualização posterior (16/10/2026):** este relatório começou documentando a entrega original da Fase 3.1, quando o save foi elevado de v6 para v7. Na continuidade, foi implementada a tarefa de cores partidárias e a versão atual do save passou para **v8**, com migração de tema/paleta para campanhas existentes e preservação das cores personalizadas. O código de cores foi validado com 61 testes e build aprovados no [workflow 38947033246](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38947033246). Leia também `docs/CORES_DOS_PARTIDOS.md`, `docs/AVALIACAO_PRONTIDAO.md`, `docs/MAPA_MENTAL.md` e `docs/RELATORIO_CORES_E_PRONTIDAO.md`. Referências a v7 e a 58 testes nas seções históricas abaixo descrevem a primeira entrega legislativa, não substituem esse estado mais recente.

---

## 1. Resumo executivo

O Palácio em Jogo é um simulador político de navegador, satírico, sem backend e sem banco de dados. O jogador já inicia como presidente, avança por semanas (quatro semanas por mês) e toma decisões que alteram a situação política, a administração, a economia e a sociedade. O código usa React, TypeScript e Vite; o estado da campanha é serializado no navegador e pode ser exportado/importado como JSON.

Esta entrega implementa a **primeira versão jogável do Congresso Nacional**, com Câmara dos Deputados e Senado representados separadamente, bancadas agregadas por partido, cadastro de proposições, tramitação, articulação política, votos determinísticos para uma mesma campanha, registros de sanção/veto e conexão com partes do orçamento. Ela busca respeitar a separação de Poderes: o presidente pode propor, negociar, sancionar ou vetar nos casos previstos pelo modelo, mas não escolhe diretamente os votos e não decide processos judiciais.

A interface está ligada ao ciclo semanal e à persistência. A estrutura do save subiu de v6 para v7 para incluir o estado legislativo sem reescalar pela segunda vez o dinheiro de campanhas v6 que já estava em reais. Saves mais antigos ainda passam pela conversão monetária legada. Propostas antigas de reforma tributária e reorganização ministerial são restauradas no novo diário legislativo durante a migração.

A implementação é **uma abstração de jogo**, não uma reconstrução completa de todos os regimentos, comissões, prazos excepcionais, recursos regimentais e particularidades do processo orçamentário brasileiro. As simplificações são intencionais e estão detalhadas neste relatório para que o próximo revisor saiba o que não deve tratar como fidelidade jurídica completa.

## 2. Contexto recente: o que existia antes desta fase

A branch-base já continha os trabalhos anteriores, que foram mantidos:

### Fase 2A — Políticas públicas e projetos
- Catálogo de programas por setor.
- Projetos com investimento, duração, prioridade, progresso semanal e avaliação/relato mensal.
- Custos e limites de recursos, eventos e histórico de execução.
- Integração com orçamento, ministérios e indicadores do governo.

### Fase 2B — Sociedade, grupos organizados e moeda
- Cinco classes socioeconômicas representadas separadamente.
- Sete grupos organizados de pressão, com apoio, pressão, diálogo e acordos.
- Eventos sociais como pressão pública, protestos ou paralisações e revisão mensal de relações.
- Correção do modelo financeiro: os valores internos monetários representam **R$ bilhões**; a interface formata valores em reais, milhões, bilhões e trilhões.
- Caixa, receitas, despesas, dívida, empréstimos, juros, dotações anuais e execução mensal conectados.
- Save v6: conversão dos valores monetários antigos e criação determinística do estado social.

Na etapa 2B, a validação registrada foi de 45 testes e build aprovado. A presente branch incorpora essa base e adiciona a camada legislativa.

## 3. O que foi construído nesta etapa

### 3.1. Estado serializável do Congresso

Foi adicionada a propriedade `legislature` ao estado de campanha. Ela contém:
- Bancadas da Câmara e do Senado, com sigla, partido, orientação e quantidade de cadeiras.
- Lista de proposições e sua etapa atual.
- Datas simuladas de apresentação e tempo acumulado na tramitação.
- Casa e turno atuais.
- Margem de articulação/apoio negociado.
- Impacto fiscal e setor orçamentário, quando aplicáveis.
- Histórico de tramitação por proposição.
- Votos realizados por Casa/turno, incluindo votos a favor, contra, abstenções, ausências, presença, quórum mínimo, votos necessários e resultado.
- Histórico institucional e chave que evita avançar a mesma semana duas vezes.

Os dados ficam no estado e no engine, não no componente visual, de forma que salvamento, migração e testes conseguem examinar o resultado das regras.

### 3.2. Composição inicial das Casas

As configurações usam 513 cadeiras para a Câmara e 81 para o Senado (594 na soma aritmética das duas Casas para o modo simplificado de sessão conjunta). Os números ficam parametrizados em `src/data/legislature.ts`.

A distribuição inicial é ficcional e usa pesos configurados para os partidos e a popularidade do partido do jogador. A distribuição inteira usa um método de maiores restos para preencher exatamente o número de cadeiras de cada Casa. Um teste confirma o total de 513 e 81; outro verifica que o partido personalizado que começa com 3% de popularidade tem uma bancada inicial pequena, em vez de receber automaticamente uma maioria.

**Limite importante:** essa composição não pretende reproduzir a Câmara ou o Senado reais, nem calcula cadeiras por votação proporcional de cada estado. Ela é uma composição inicial para o jogo. Mudanças de cadeiras e resultado de eleição continuam fora do escopo da Fase 3.1: a intenção é que cadeiras não mudem por eventos semanais; o ciclo eleitoral será abordado na Fase 5.

### 3.3. Proposições disponíveis

O painel suporta:
- **PL — Projeto de lei ordinária.**
- **PLP — Projeto de lei complementar.**
- **PEC — Proposta de emenda à Constituição.**
- **MP — Medida provisória.**
- **PPA — Plano Plurianual.**
- **LDO — Lei de Diretrizes Orçamentárias.**
- **LOA — Lei Orçamentária Anual.**
- **Crédito adicional.**
- **Emenda parlamentar de remanejamento orçamentário.**

O formulário exige título e justificativa em limites de tamanho definidos. O impacto fiscal é informado em R$ bilhões e validado antes do protocolo. As regras de custo em pontos de ação e capital político, os limites de impacto e os requisitos de tramitação ficam parametrizados.

A UI tem duas frentes: apresentação de proposições do Executivo e um formulário próprio para emenda de remanejamento com setor de origem, setor de destino e bancada autora.

### 3.4. Articulação e tramitação semanal

O fluxo padrão das leis comuns é:

1. Protocolo e análise inicial.
2. Negociação parlamentar.
3. Deliberação na Câmara.
4. Deliberação no Senado.
5. Sanção ou veto presidencial, quando aplicável.
6. Se houver veto, análise do Congresso nas duas Casas.

A cada semana do jogo, `advanceLegislatureWeek` processa as proposições em andamento uma vez para a chave de calendário correspondente. A transição produz eventos/histórico e, quando há fatos, acrescenta notícias de Congresso ao feed.

A negociação consome pontos de ação e capital político e aumenta a margem de apoio modelada. O aumento de apoio não é promessa de resultado nem comando aos parlamentares. Votos continuam sujeitos a uma regra probabilística determinística, influenciada por apoio no Congresso, aprovação, orientação do partido, bancada do governo e negociação.

**Por que o resultado é determinístico?** Para que a mesma campanha e a mesma proposição produzam o mesmo resultado se a simulação for repetida, facilitando reprodutibilidade e testes. Não se trata de previsão política real nem de um modelo empiricamente calibrado.

### 3.5. Regras de votação modeladas

As regras e limites configuráveis estão em `src/data/legislature.ts`.

- **PL ordinário:** maioria dos votos válidos da simulação, com quórum mínimo de presença parametrizado, em cada uma das Casas.
- **PLP:** maioria absoluta dos membros da Casa.
- **PEC:** três quintos do total de membros de cada Casa, em dois turnos na Câmara e em dois turnos no Senado. Uma PEC aprovada não segue para sanção presidencial.
- **MP:** precisa ter sido registrada com declaração de relevância e urgência; começa pela Câmara e passa pelo Senado. O impacto fiscal provisório é revertido se a MP for rejeitada ou perder vigência no modelo.
- **PPA/LDO/LOA/crédito/emenda:** usam uma etapa de deliberação conjunta agregada, definida como 594 cadeiras na configuração simplificada.
- **Veto:** ao vetar uma proposição que chegou à etapa de sanção, ela volta ao fluxo para revisão do Congresso. O modelo exige maioria absoluta em cada Casa para derrubar o veto.

O painel mostra o histórico de tramitação e resultados anteriores. O registro de uma votação é separado do status final da proposição, para que uma PEC, por exemplo, possa passar por mais de um turno sem ser considerada concluída antes do último.

### 3.6. Medida provisória e prazo

A configuração simula:
- 7 dias por avanço semanal.
- Entrada em urgência após 45 dias, se ainda em tramitação.
- Prazo inicial de 60 dias, com extensão simplificada de mais 60.
- Perda de vigência após 120 dias simulados se a tramitação não chegar à conclusão.

O efeito fiscal de MP é provisório e explicitamente marcado no estado. Se rejeitada ou expirada, o efeito sobre a pressão de despesa é revertido; isso é testado.

**Limitação legal:** este cronômetro é uma abstração de jogo. Ele não implementa todas as suspensões e extensões aplicáveis, hipóteses de recesso, detalhes de comissão mista, bloqueio de pauta com todo o regimento, restrições materiais, nem todas as regras constitucionais e regimentais. Não deve ser descrito como cronômetro jurídico exato.

### 3.7. Integração com orçamento e finanças

A camada legislativa utiliza os valores monetários internos em R$ bilhões da fase anterior.

- **LOA:** representa o orçamento anual proposto. Ao ser aprovada e sancionada no fluxo simplificado, atualiza o valor total planejado, compromissos fixos e alocações setoriais dentro de limites configurados. Não altera automaticamente o caixa disponível.
- **Crédito adicional:** aumenta o valor planejado do orçamento e a alocação do setor de destino, mantendo a parte de compromissos fixos; recalcula as participações setoriais e verifica os limites mínimos e máximos configurados. Não deposita dinheiro no caixa.
- **Emenda de remanejamento:** move a dotação ainda não executada de um setor para outro; reduz a origem e aumenta o destino. O valor total do orçamento não aumenta, e não há criação de caixa.
- **PL/PLP/PEC e leis com impacto fiscal:** o impacto anual aproximado alimenta uma pressão mensal de despesas/economias no modelo. Isso não cria automaticamente projetos, receitas tributárias detalhadas, contratos ou obrigações plurianuais individualizadas.
- **Caixa, dívida e execução mensal:** seguem sob responsabilidade do motor econômico existente. Aprovação política não significa que o governo já tenha dinheiro em caixa nem que o gasto foi executado.

Também foram acrescentados guardrails ao crédito adicional para evitar que ele deixe a participação setorial fora dos limites configurados. Um teste cobre os cálculos de participação e confirma que o caixa permanece igual.

### 3.8. Integração com propostas preexistentes

Antes desta entrega, a reforma tributária e a reorganização ministerial podiam ser registradas como strings de proposta, sem um processo completo de tramitação. O sistema agora as encaminha para o diário legislativo:
- Reforma tributária estrutural → PLP.
- Reorganização ministerial → PL.

Na migração de campanhas salvas, essas propostas antigas são reconstituídas como proposições em tramitação, com indicação de que foram recuperadas de um save anterior. Isso evita que a atualização para v7 perca registros antigos que o jogador já havia feito.

### 3.9. Interface

A aba **Congresso** foi adicionada à navegação superior, mantendo o padrão da aplicação.

Ela exibe:
- Distribuição agregada das bancadas na Câmara e no Senado.
- Indicador de apoio no Congresso, capital político e caixa disponível.
- Formulário de proposição executiva.
- Formulário de emenda orçamentária parlamentar.
- Filtro de proposições (todas, em tramitação ou concluídas).
- Etapa/status, Casa, autor, articulação, impacto fiscal e prazo de MP.
- Último resultado de votação.
- Histórico expandível por proposição.
- Botões de negociação e decisão de sanção/veto, habilitados conforme a etapa e os recursos disponíveis.
- Histórico institucional e últimos resultados de votação.
- Nota visível informando que se trata de modelo institucional simplificado.

## 4. Arquivos alterados/adicionados

| Arquivo | Papel |
|---|---|
| `src/data/legislature.ts` | Cadeiras, regras, custos, limites, rótulos e explicações dos tipos legislativos. |
| `src/state/types.ts` | Estado serializável do Legislativo, bancadas, proposições, etapas e votos; nova área de navegação Congresso. |
| `src/engine/legislature.ts` | Validação de propostas, distribuição das bancadas, negociação, votação, tramitação semanal, veto e efeitos fiscais/orçamentários. |
| `src/engine/legislature.test.ts` | Testes de composição, protocolo, custo, votação, PEC, emenda, cronômetro de MP, veto, avanço semanal, LOA e crédito. |
| `src/components/LegislaturePanel.tsx` | Interface funcional do Congresso. |
| `src/components/TopNavigation.tsx` | Adiciona navegação para Congresso. |
| `src/App.tsx` | Liga a aba e as callbacks ao engine. |
| `src/engine/campaign.ts` | Inicializa composição e estado legislativo em novas campanhas. |
| `src/engine/turn.ts` | Integra tramitação ao avanço de semana. |
| `src/engine/economy.ts` | Conecta reforma tributária à agenda legislativa. |
| `src/engine/executive.ts` | Conecta reorganização ministerial à agenda legislativa. |
| `src/persistence/campaignRepository.ts` | Save v7, validação de estado legislativo e migração de dados antigos. |
| `src/persistence/campaignRepository.test.ts` | Testa migração v6→v7 sem reescalar moeda, números das Casas e recuperação de propostas legadas. |
| `src/styles.css` | Estilos responsivos do painel e formulários do Congresso. |
| `package.json` | Inclui os testes legislativos no script principal. |
| `docs/STATUS.md` | Estado técnico atualizado e limitações conhecidas. |
| `docs/PROXIMOS_PASSOS.md` | Roteiro marcado com a Fase 3.1 concluída e Fase 3.2 como próxima. |

## 5. Persistência e compatibilidade

A versão do save foi elevada de `versaoDoSave: 6` para `versaoDoSave: 7`.

- Saves v7 são validados com a presença e estrutura do estado legislativo.
- Saves v6 que não tinham Legislativo recebem uma composição legislativa determinística.
- Saves v6 já estavam na escala de reais: os valores são mantidos como estão e **não são multiplicados de novo**.
- Saves v5 ou anteriores passam pela conversão monetária legada de unidades abstratas para bilhões de reais, conforme a regra histórica.
- Propostas tributárias e executivas pendentes que existiam como strings são recuperadas em forma de proposições, caso ainda não exista estado legislativo salvo.
- O estado legislativo e os resultados das votações ficam serializados na campanha.

O teste de migração v6 verifica explicitamente que caixa/receitas/dívida não são reescalados pela segunda vez. Outro teste verifica a inicialização exata das cadeiras e a restauração de propostas antigas.

**Limite da persistência:** os dados do usuário continuam no LocalStorage do navegador. Não há sincronização em nuvem, conta, backend ou banco de dados.

## 6. Validação automatizada

A execução GitHub Actions mais recente com o núcleo legislativo e os testes originais foi configurada para executar:
1. `npm ci`
2. `npm run test`
3. `npm run build`

O commit de código `0ba015153f9ce0b1318c35ae8bf6157a0737ecbf` passou **58 testes, 0 falhas**, e build de produção com sucesso no [workflow 38942516918](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38942516918), já incluindo a revisão de crédito adicional que recalcula as participações setoriais e não cria caixa. Os commits documentais posteriores registram o mesmo estado já validado; a execução também é repetida automaticamente pela branch. Esta evidência cobre testes automatizados e compilação/build, não uma revisão visual manual.

Coberturas relevantes em `src/engine/legislature.test.ts`:
- Totais exatos de 513 e 81 cadeiras.
- Bancada inicial pequena de partido personalizado.
- Campos, custo de ação e capital político para apresentar propostas.
- Exigência de declaração de urgência e impacto fiscal provisório de MP.
- Custo de negociação e aumento de apoio modelado sem garantia de aprovação.
- Transição semanal e votação por Casa.
- Dois turnos por Casa e quórum de três quintos para PEC.
- Remanejamento orçamentário sem alterar o total.
- MP expirada com reversão do efeito fiscal provisório.
- Veto com deliberação em ambas as Casas.
- LOA que altera planejamento anual sem alterar caixa.
- Crédito adicional que recalcula participações sem alterar o caixa.
- Migração do save v6 para v7 sem reescalar reais e com propostas antigas preservadas.

### Histórico das validações e das correções

A implementação foi feita em incrementos pequenos na branch, e as falhas encontradas foram corrigidas antes de concluir a etapa:

1. **Primeira compilação:** a suíte então existente passou, mas o TypeScript apontou inferência excessivamente restrita de tipos em bancadas/estado de voto, um parâmetro/helper não usado e um acumulador de validação não tipado. As tipagens foram ajustadas sem afrouxar a validação do estado.
2. **Testes de tramitação:** três testes de votação revelaram que a contagem de cadeiras era chamada com o argumento antigo após uma refatoração. A assinatura/chamadas foram alinhadas, e os testes de voto passaram.
3. **Composição parlamentar:** a revisão evidenciou que o algoritmo inicial não expressava tão diretamente quanto desejado a popularidade muito baixa do partido personalizado. A distribuição foi simplificada para ratear as cadeiras de cada Casa de forma proporcional pelos pesos, com maiores restos, e foram adicionadas asserções para um partido personalizado com 3% de popularidade.
4. **Migração:** foram adicionados testes para garantir que um save v6 não receba a conversão monetária pela segunda vez e que propostas antigas registradas como texto sejam restauradas no diário legislativo ao migrar.
5. **Revisão financeira adicional:** foi identificado que um crédito adicional podia deixar as participações setoriais desatualizadas em relação ao novo orçamento total. O engine passou a validar a participação resultante, recomputar as participações setoriais e corrigir arredondamento sem criar caixa. Foi acrescentado um teste de regressão dessa conta.
6. **Validação final do código:** o commit `0ba015153f9ce0b1318c35ae8bf6157a0737ecbf` passou 58 testes e build no workflow [38942516918](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38942516918). A cabeça da branch antes desta atualização documental, `43b508565392e33cd85b35f688a1128e9a32978e`, também passou os 58 testes e o build no workflow [38942785736](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38942785736). A atualização deste relatório é documental; a branch tem validação automática configurada para executar novamente testes/build.

Essa sequência é importante para uma auditoria: houve falhas temporárias no CI durante o desenvolvimento, mas elas foram corrigidas e uma execução posterior completa passou. Os erros intermediários não devem ser confundidos com o estado validado registrado acima. A lacuna ainda aberta é **a revisão visual manual** e a avaliação aprofundada da fidelidade jurídico-regimental do modelo simplificado.

## 7. Limitações e pontos a revisar com cuidado

### Limitações institucionais deliberadas
- As bancadas são agregadas por partido. Não existem legisladores individuais, lideranças pessoais, dissidências narrativas por personagem, comissões completas ou pareceres detalhados.
- A composição inicial usa pesos ficcionais e popularidade do partido do jogador; não corresponde à atual composição oficial do Congresso nem a uma eleição real.
- O modelo de sessão conjunta orçamentária é simplificado: não reproduz todo o processo de PPA/LDO/LOA, comissões, pareceres, emendas de texto, tramitação completa, veto parcial, promulgação em todos os casos ou todas as exceções constitucionais.
- As regras e quóruns estão configurados no código como valores de jogo. Não há um motor regimental genérico completo e juridicamente auditado.
- A MP usa relógio simplificado e não reproduz todas as exceções e suspensões legais.
- Apoio parlamentar é um indicador abstrato; não equivale a contar apoio real nem deve ser interpretado como probabilidade calibrada.
- O efeito fiscal das leis comuns é agregado. A criação concreta de programas, arrecadação, despesa plurianual, contrato e cronograma de execução pode exigir subsistemas em etapas futuras.
- A derrubada de veto é simulada com votações separadas nas duas Casas, mas não cobre todos os detalhes de deliberação e promulgação.

### Pendências de validação manual
- Ainda é necessária uma sessão real em navegador para conferir navegação, responsividade, leitura dos formulários, botões e histórico em desktop/celular.
- Testes automatizados validam regras TypeScript e estado; não são testes de interação visual (E2E).
- Testar manualmente uma campanha recém-criada, uma campanha migrada de v6, uma MP, uma PEC, uma LOA, um crédito adicional, uma emenda, uma lei comum sancionada e um veto.
- Conferir visualmente a legenda das bancadas quando o número de siglas cresce e garantir que o painel não fique excessivamente comprido em celular.
- Testar fluxos extremos: falta de pontos/capital político, impacto financeiro fora do limite, dotação setorial quase totalmente executada, crédito que violaria limite de participação, save corrompido ou com dados legislativos inválidos.
- As cores finais de algumas legendas partidárias ainda são provisórias nas fases anteriores.

### Trabalho de fases futuras
- Fase 3.2: Judiciário, processos, decisões, recursos e indicações com independência institucional.
- Fase 3.3: órgãos de controle, fiscalização, investigações e crises institucionais; separar suspeita, indício, acusação e conclusão.
- Fase 4: personagens com memória/autonomia, relações, imprensa independente e interesses sistêmicos.
- Fase 5: Maré Ideológica, pesquisas, eleições e atualização de cadeiras somente no ciclo eleitoral pertinente.
- Fase 6: ampliação de conteúdo e catálogo, balanceamento de campanhas longas e revisão visual/legal.

## 8. Fontes oficiais para revisão institucional

Estas fontes ajudam a verificar as regras gerais; não são evidência de que o motor de jogo implemente o processo legal completo:

- [Constituição Federal — texto consolidado na Câmara dos Deputados](https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html)
- [Congresso Nacional — procedimento e prazos gerais de medidas provisórias](https://www.congressonacional.leg.br/materias/medidas-provisorias/-/mpv/votacao/2524616)

Ao fazer correções, verifique a norma oficial vigente e documente exatamente qual dispositivo/regra está sendo modelado; evite afirmar fidelidade jurídica baseada apenas em semelhança de nomes ou quóruns.

## 9. Roteiro de revisão recomendado para Claude

**Não reimplementar a Fase 3.1 do zero.** O trabalho mais útil agora é uma revisão por gaps, apontando problemas concretos antes de iniciar a próxima fase.

1. Ler `AGENTS.md`, `docs/STATUS.md`, este relatório, `docs/PROXIMOS_PASSOS.md` e as seções 7 e 19 do Documento Mestre.
2. Comparar o engine com a Constituição consolidada e as fontes oficiais sobre orçamento e medidas provisórias.
3. Categorizar cada achado em:
   - **P0 — bloqueador:** pode corromper save, criar caixa indevidamente, quebrar tramitação ou violar competência básica de um Poder.
   - **P1 — importante:** regra de quórum, sequência procedimental, prazo ou orçamento materialmente inconsistente.
   - **P2 — melhoria:** interface, redação, balanceamento ou simplificação bem documentada.
4. Para cada achado, informar o arquivo/função, cenário de reprodução, resultado atual, resultado esperado e proposta de correção. Não afirmar bug sem confirmar o fluxo no código.
5. Corrigir somente achados confirmados; adicionar testes automatizados e repetir `npm run test` e `npm run build`.
6. Fazer revisão visual real em desktop e celular, caso seja possível executar a aplicação, e descrever quais cenários foram efetivamente verificados.
7. Somente depois da revisão estável, iniciar a **Fase 3.2 — Judiciário**, em nova branch. Manter a independência do Judiciário; não mesclar a nova fase em `main` sem revisão do responsável.

### Prompt de continuidade para colar no Claude

> Você está continuando o projeto Palácio em Jogo. Leia `AGENTS.md`, `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, `docs/RELATORIO_FASE_3_1_CLAUDE.md` e as seções 7 e 19 do Documento Mestre. A Fase 3.1 — Congresso e legislação já foi implementada na branch `codex/phase-3a-congress`; não a recrie. Faça primeiro uma auditoria de gaps do código existente, com foco em quóruns, sequência por Casa, veto, MP/prazos, PPA/LDO/LOA, créditos/emendas, efeito no caixa e migração v7→v8 (sem perder a preservação monetária de versões mais antigas). Use as fontes oficiais indicadas no relatório e não assuma que a abstração de jogo é uma implementação legal completa. Liste achados confirmados em P0/P1/P2 com arquivo/função, cenário, efeito e correção sugerida. Corrija apenas os problemas confirmados, escreva testes de regressão, execute `npm run test` e `npm run build`, e atualize a documentação com o resultado real. Faça/relate a revisão visual em desktop e celular se a ferramenta permitir. Depois, e apenas depois de estabilizar a Fase 3.1, prepare a Fase 3.2 — Judiciário numa branch separada, respeitando a separação dos Poderes. Não faça push nem merge sem autorização explícita do responsável.

---

## 10. Estado de integração

- **Branch de trabalho:** `codex/phase-3a-congress`
- **Branch-base:** `codex/phase-2b-society-finance`
- **Main:** não mesclada com a nova etapa.
- **Próximo passo de produto:** auditoria de gaps e testes manuais; depois Fase 3.2 — Judiciário.
