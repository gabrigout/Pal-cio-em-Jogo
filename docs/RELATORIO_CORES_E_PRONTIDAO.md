# Relatório de atualização — cores partidárias, prontidão e continuidade

**Data:** 16/10/2026  
**Branch:** `codex/phase-3a-congress`  
**Versão do save atual:** v8  
**Objetivo:** pesquisar e aplicar as cores de cada legenda satírica no tema principal, avaliar a prontidão real do jogo e registrar o que precisa acontecer a seguir.

## 1. Resumo do que mudou

- Pesquisa de cores feita usando manuais/estatutos e páginas de identidade partidária quando disponíveis.
- Atualizada a paleta das seis legendas satíricas em `src/data/campaignConfig.ts`; o PTP agora usa **vermelho e branco**, como foi pedido.
- PDTT foi ajustado para vermelho e azul, em vez de vermelho/verde, com base na tradição cromática documentada do PDT e na cartela digital publicada pelo PDT-RS.
- O tema do jogo aplica os pares em novas campanhas. A lógica existente deriva variantes contrastantes para a interface escura, sem remover os valores oficiais armazenados.
- Saves de campanha existentes são migrados de v7 para v8: partidos predefinidos recebem as novas cores e o tema é recalculado; campanhas de partido personalizado conservam suas cores.
- Adicionados testes de regressão para os seis pares e aplicação do tema em campanhas novas, além de testes de migração que confirmam que v7→v8 preserva partido personalizado.
- Criados/atualizados documentos de continuidade: pesquisa de cores, mapa mental, avaliação de prontidão, status, próximos passos e relatório de handoff.

## 2. Paleta escolhida

| Partido no jogo | Referência satírica | Primária | Secundária | Grau de certeza da referência |
|---|---|---|---|---|
| PTP — Partido da Taxa e da Picanha | PT | #E4142C — vermelho | #FFFFFF — branco | O manual PT Digital publicado em cópia pública identifica vermelho e branco e fornece o HEX vermelho. O manual não está hospedado no domínio oficial, por isso a origem do valor HEX está sinalizada no documento de fontes. |
| PSÓ — Partido Socialista Óbvio | PSOL | #D71920 — vermelho | #FFD52B — amarelo | O estatuto oficial descreve bandeira vermelha com sol amarelo. Os HEX do jogo são aproximações visuais, não valores oficiais publicados no estatuto. |
| PDTT — Partido do Discurso, da Tese e do Trabalhismo | PDT | #E4002B — vermelho | #005AB2 — azul | O PDT identifica o símbolo com rosa vermelha e a tradição partidária inclui vermelho, branco e azul. Os códigos selecionados aparecem na cartela digital PDT-RS 2025. |
| PLIM — Partido da Live, Influência e Mobilização | PL | #004F9F — azul | #009640 — verde | Valores RGB publicados no manual de marca do PL (azul 0/79/159; verde 0/150/64); o manual também usa amarelo. |
| PSSDB — Partido dos Senhores, Slides e Debates de Brasília | PSDB | #004C94 — azul | #FFD600 — amarelo | Valores RGB publicados no manual oficial do PSDB de 2012; a marca renovada em 2023 manteve a família azul/amarelo. Os códigos exatos de 2012 não são apresentados como novos HEX oficiais da marca de 2023. |
| NOVA — Núcleo de Otimização, Valor e Austeridade | NOVO | #F17021 — laranja | #1A2948 — azul-marinho | Códigos HEX publicados no manual de marca do NOVO de 2021. |

As cores servem para reconhecer as **paródias** e não reproduzem necessariamente todos os tons oficiais, os gradientes, os logotipos ou a proporção entre cores de cada partido real. Fontes e observações detalhadas: `docs/CORES_DOS_PARTIDOS.md`.

## 3. Arquivos afetados

- `src/data/campaignConfig.ts`: catálogo central das seis paletas e URLs de referência.
- `src/data/partyColors.test.ts`: teste para os pares e tema de novas campanhas.
- `src/persistence/campaignRepository.ts`: atualização do save para v8, troca de paleta/tema apenas nos partidos predefinidos.
- `src/persistence/campaignRepository.test.ts`: migração de v7 para v8 e preservação do partido personalizado.
- `src/components/CampaignSetup.tsx`: explicação de como as cores são usadas no tema.
- `docs/CORES_DOS_PARTIDOS.md`: fontes, paletas, limites de certeza e aplicação no jogo.
- `docs/MAPA_MENTAL.md`: visão sistêmica e regra de documentação de cada etapa.
- `docs/AVALIACAO_PRONTIDAO.md`: diagnóstico geral e sistemas ainda faltantes.
- `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md` e `docs/RELATORIO_FASE_3_1_CLAUDE.md`: atualização da situação atual e continuidade.

## 4. Compatibilidade de saves

A versão atual é `CURRENT_SAVE_VERSION = 8`.

- Novas campanhas já recebem a paleta selecionada.
- Saves v7 migram para v8 e atualizam o tema dos seis partidos predefinidos.
- Saves de partidos personalizados não recebem a paleta predefinida, mesmo se uma sigla/ID coincidir; sua escolha original é preservada.
- Migrações v6 continuam mantendo a escala em R$ bilhões sem uma segunda multiplicação; v5 e anteriores seguem a conversão histórica original.
- O tema oficial da campanha e as variantes de contraste são recalculados na migração.

## 5. Validação

O código de paletas/save v8 e a integração das cores institucionais no tema principal foram validados no commit `e526778ccf2cec88aaba2b723c21f4d08481759d`: **62 testes passaram e o build de produção concluiu com sucesso** no [workflow 38992792373](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38992792373).

O workflow que cobre a atualização documental posterior também executa testes/build. A validação automatizada comprova testes e compilação, mas não substitui revisão visual. Ainda não foi realizada uma sessão real de navegação visual desktop/celular para medir contraste, hierarquia e consistência do tema em todos os painéis.

## 6. O jogo está pronto?

**Não como produto final.** É uma base jogável de simulador político — já há turnos, criação de campanha, decisões, indicadores, dinheiro/orçamento, ministérios, projetos, sociedade, saves e uma primeira versão do Congresso. Porém, há sistemas importantes que ainda não estão implementados por completo.

### Já é possível jogar e testar
- Criar um presidente/partido e iniciar a campanha no Brasil fictício de janeiro de 2027.
- Avançar semanas e meses, escolher decisões, acompanhar recursos e indicadores, e receber consequências/eventos.
- Nomear e exonerar ministros; gerir projetos e prioridades; ajustar algumas alavancas econômicas.
- Dialogar com grupos sociais, firmar compromissos, observar pressão e acompanhar os resultados de políticas.
- Protocolar proposições, negociar, votar e sancionar/vetar dentro do modelo simplificado do Congresso.
- Salvar múltiplas campanhas no navegador e exportar/importar backup JSON.

### O que ainda impede chamar de versão completa
- Judiciário independente com processos/decisões/recursos.
- Órgãos de controle, investigações e crises entre poderes com etapas e evidências.
- Personagens autônomos com memória, alianças, promessas e efeitos relacionais persistentes.
- Imprensa com cobertura independente, rumor/evidência e crise de imagem.
- Maré Ideológica, pesquisas, campanha eleitoral, cálculo de resultados e atualização de cadeiras no ciclo eleitoral.
- Revisão aprofundada do equilíbrio econômico, dos efeitos legais e de campanhas longas.
- Transformação de Relações e Notícias/Histórico de placeholders em sistemas completos.
- Testes reais de usabilidade visual em desktop/celular.

O projeto deve ser descrito como **protótipo/alpha em desenvolvimento**, não como simulador completo nem como reprodução fiel de todo o sistema jurídico brasileiro. A documentação detalha o grau de implementação de cada mecânica em `docs/AVALIACAO_PRONTIDAO.md`.

## 7. Próximos passos recomendados

1. Conferir o GitHub Actions no HEAD atual; repetir testes e build se houver mudança de código.
2. Abrir manualmente a campanha no navegador em desktop e celular e revisar: tela de entrada, seleção de partido, dashboard, Economia, Executivo, Políticas Públicas, Sociedade e Congresso.
3. Testar campanhas novas, saves v7, saves v6/v5, partido personalizado e as seis paletas; garantir que os saves não percam dados nem cores próprias.
4. Fazer uma auditoria de gaps da Fase 3.1 (quóruns, sequência por Casa, MP/prazo, orçamento, crédito, veto e efeitos financeiros) com fontes jurídicas oficiais, sem reimplementar do zero.
5. Só depois estabilizar o motor legislativo, seguir para a Fase 3.2 — Judiciário, numa branch separada, com regras próprias e independência do Executivo.
6. A cada mudança relevante, atualizar `docs/STATUS.md`, `docs/PROXIMOS_PASSOS.md`, `docs/MAPA_MENTAL.md` quando a arquitetura mudar e o relatório temático correspondente.

## 8. Fontes principais da pesquisa cromática

- PT Digital: [cópia pública do manual de marca](https://pt.scribd.com/document/829898441/Partido-Dos-Trabalhadores-Pt-Seeklogo); a cópia identifica o vermelho #E4142C e o uso de vermelho/branco. O código HEX não foi retirado de um arquivo hospedado no domínio oficial do PT.
- PSOL: [estatuto oficial, art. 3º](https://psol50.org.br/partido/estatuto/).
- PDT: [renovação da identidade pelo PDT Nacional em 2026](https://pdt.org.br/index.php/pdt-renova-sua-identidade-visual/), [estatuto de 2024](https://pdt.org.br/wp-content/uploads/2024/07/estatuto-2024.pdf) e [cartela de cores PDT-RS 2025](https://www.pdtrs.org.br/_files/ugd/835f28_4968db375c5046f58519fbea1642ab8c.pdf).
- PL: [manual de marca oficial de 2023](https://partidoliberal.org.br/wp-content/uploads/2023/03/manual-da-marca-pl-2023.pdf).
- PSDB: [comunicado oficial da marca nova de 2023](https://www.psdb.org.br/acompanhe/noticias/psdb-moderniza-sua-marca/) e [manual de cores hospedado pelo PSDB (2012)](https://www.psdb.org.br/sc/files/2016/04/Manual-da-Marca-PSDB-Como-Usar.pdf).
- NOVO: [guia de marca do NOVO, 2021](https://novo.org.br/wp-content/uploads/2021/07/NOVO_Manual-de-marca-2021-2.pdf).
