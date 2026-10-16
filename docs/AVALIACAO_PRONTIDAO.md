# Avaliação de prontidão — Palácio em Jogo

Atualizado em: 2026-10-16  
Branch avaliada: codex/phase-3b-judiciary  
Versão atual do save: v9  
Validação do código: 73 testes aprovados, zero falhas, build concluído no workflow https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38950949874. A branch continua com CI para novos commits.

## Veredito

**O jogo ainda não está pronto como produto completo.** É uma base jogável de simulador político e já tem mais que um protótipo de telas: calendário, escolhas semanais, recursos, economia, projetos, sociedade, Congresso e uma primeira versão do Judiciário estão conectados ao estado persistente e ao avanço semanal/mensal. Ainda assim, continua na fase de protótipo/alpha. Os sistemas de controle e crises, personagens autônomos, imprensa, eleições, balanceamento de campanhas longas e revisão visual final continuam pendentes.

É adequado para desenvolvimento e testes internos. Ainda não deve ser descrito como jogo finalizado, simulação jurídica integral, simulação econômica oficial ou versão pronta para o público.

## O que já funciona na branch atual

| Sistema | Estado | Escopo real |
|---|---|---|
| Criação de campanha e identidade partidária | Primeira versão implementada | Escolha ideológica, seis partidos satíricos ou partido personalizado, duas cores, narrativa de abertura e tema. Paletas baseadas em referências reais; detalhes e fontes estão em docs/CORES_DOS_PARTIDOS.md. |
| Dashboard e calendário | Primeira versão implementada | Indicadores, quatro semanas por mês, avanço de turno, decisões/eventos, efeitos pendentes, feed e resumo semanal/mensal. Alguns elementos ainda são demonstrativos. |
| Recursos e ações | Primeira versão implementada | Pontos de ação, capital político, capacidade administrativa e caixa separados; regras de custo e bloqueios por falta de recurso. |
| Salvamento local | Implementado | Múltiplas campanhas, autosave em LocalStorage, importação/exportação JSON e migrações versionadas. Não há conta nem sincronização em nuvem. |
| Poder Executivo | Primeira versão | Ministérios e ministros fictícios, nomeação, negociação, exoneração, execução mensal, desempenho, riscos e decisões executivas. |
| Economia | Primeira versão | Caixa/fluxo mensal, orçamento anual por setor, dotações, tributos limitados, dívida, empréstimos, juros, pagamentos adiados e relatórios. É um modelo de jogo, não um espelho do orçamento federal real. |
| Políticas públicas | Primeira versão | Programas e projetos por setor, investimento, prioridade, prazo, avanço semanal, resultado mensal, histórico e riscos de execução. |
| Sociedade | Primeira versão | Cinco classes econômicas e sete grupos organizados; apoio, pressão, diálogo, acordos, manifestações/paralisações e revisão mensal. |
| Congresso | Primeira versão, Fase 3.1 | Bancadas agregadas das duas Casas, PL/PLP/PEC/MP e proposições orçamentárias, negociação, votações, sanção/veto e efeitos fiscais simplificados. |
| Judiciário | Primeira versão, Fase 3.2 | Roster ficcional, indicação ao STF, maioria absoluta de 41/81 no Senado, nomeação posterior, processos por fases, decisões explicadas, recurso, cumprimento, aposentadoria simulada e histórico. O mérito não é escolhido pelo presidente. |
| Testes automatizados e build | Aprovados | O workflow valida TypeScript, testes e build. Não substitui a revisão manual no navegador. |

## O que falta para o jogo ser considerado completo

### Fase 3 — Instituições e crises
- **Fase 3.1 — Congresso:** há uma primeira versão; ainda requer auditoria jurídico-regimental e mais testes de campanha longa.
- **Fase 3.2 — Judiciário:** há uma primeira versão; prazos, recursos e instâncias são abstrações para o jogo. O processo completo não está simulado.
- **Fase 3.3 — Órgãos de controle e crises:** Ministério Público/PGR, Polícia Federal, CGU, TCU, AGU e Justiça Eleitoral, investigações, fiscalização, impeachment e crises entre poderes. É a próxima entrega.

### Fase 4 — Política viva
- Personagens com memória/autonomia real, relações persistentes, promessas, alianças e consequências duradouras.
- Imprensa independente, rumores, evidências, comunicação e crises de imagem.
- Interesses, corrupção e polarização conectados de forma sistêmica. Personagens e eventos são ficcionais; sátira não deve virar alegação factual sobre pessoa real.

### Fase 5 — Eleições e continuidade
- Maré Ideológica e pesquisas que separem aprovação, tendência ideológica e força eleitoral.
- Candidaturas, campanha, debates, alianças permitidas, regras eleitorais e resultado por território.
- Atualização das cadeiras somente quando acontece a eleição correspondente; segundo turno e continuidade do mandato.

### Fase 6 — Conteúdo e qualidade
- Integrar e validar o catálogo amplo de personagens; ampliar decisões, eventos, programas e narrativas.
- Balancear campanhas longas, testar efeitos cruzados, custos, dívida, crises e caminhos alternativos.
- Revisar desktop e celular, contraste, formulários, navegação, acessibilidade e estados vazios/erro.
- Fazer revisão final dos limites institucionais/legais e documentar as simplificações.

## Critérios mínimos antes de chamar de versão pronta

1. Auditar regras de Congresso/Judiciário e corrigir bugs confirmados, incluindo as relações entre leis aprovadas, processos, recursos, cumprimento e orçamento.
2. Completar controle/crises institucionais, personagens/imprensa e ciclo eleitoral previsto no Documento Mestre.
3. Testar campanhas de vários meses e campanhas longas, com regressão automatizada para save/migração, economia, projetos, Congresso, Judiciário, crises e eleições.
4. Fazer testes reais em navegador em desktop e celular; registrar o que foi verificado, corrigir bloqueios e validar navegação, contraste, formulários e acessibilidade básica.
5. Substituir ou identificar claramente os avisos/contadores demonstrativos do dashboard; transformar Relações e Notícias/Histórico em sistemas reais ou assinalar explicitamente que não foram implementados.
6. Atualizar documentação, confirmar CI no HEAD e só então revisar a branch para eventual integração/publicação.

## Limitações técnicas que não são bugs por si só

- Sem backend é uma decisão de arquitetura atual: a campanha fica no navegador e não sincroniza entre dispositivos.
- Votos, eventos, indicadores e decisões judiciais são abstrações determinísticas/ficcionais para gameplay, não previsões reais.
- Um build verde confirma compilação e geração do pacote; não prova que toda a interface funciona em uso real.
- “Fase concluída” significa que o escopo delimitado foi implementado e validado dentro das simplificações documentadas, não que o jogo inteiro está acabado.

## Próximo caminho sugerido

Continuar na branch isolada codex/phase-3b-judiciary. Depois da validação visual manual e uma auditoria de gaps das Fases 3.1/3.2, começar a Fase 3.3 — órgãos de controle e crises institucionais. Não implementar todas as fases de uma vez: cada parte deve ter escopo explícito, regras no engine, migração de save quando necessário, testes, build e documentação atualizada.
