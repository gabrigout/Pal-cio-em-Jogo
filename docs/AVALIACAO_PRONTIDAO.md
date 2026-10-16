# Avaliação de prontidão — Palácio em Jogo

Atualizado em: 2026-10-16  
Branch avaliada: codex/phase-3a-congress  
Versão atual do save: v9  
Validação do código de cores e dos botões principais: 61 testes aprovados e build concluído no [workflow 38960919871](https://github.com/gabrigout/Pal-cio-em-Jogo/actions/runs/38960919871); a branch continua com CI para o HEAD documental atual.

## Veredito

**O jogo ainda não está pronto como produto completo.** Ele já é uma base jogável de simulador político, com um ciclo semanal e vários sistemas conectados, mas continua em estágio de protótipo/alpha. As Fases 3.2 e 3.3, partes importantes da Fase 4, e o ciclo eleitoral da Fase 5 permanecem pendentes. Não há validação visual manual concluída, e as regras institucionais são simplificadas para gameplay.

É adequado para continuar o desenvolvimento e realizar testes internos; ainda não deve ser descrito como jogo finalizado, como simulação legal realista integral ou como versão publicada pronta para o público.

## O que já funciona na branch

| Sistema | Estado | Escopo real |
|---|---|---|
| Criação de campanha e identidade partidária | Implementado | Esquerda/direita, partidos satíricos, partido personalizado com duas cores, abertura narrativa e tema. |
| Dashboard e calendário | Implementado | Indicadores, 4 semanas por mês, avanço de turno, decisões/eventos, alterações pendentes, notícias e resumo semanal/mensal simplificado. |
| Recursos e ações | Implementado | Pontos de ação, capital político, capacidade administrativa e dinheiro são separados; ações verificam custo e disponibilidade. |
| Salvamento local | Implementado | Múltiplas campanhas, autosave em LocalStorage, importação/exportação JSON e migrações versionadas. Não há conta nem sincronização em nuvem. |
| Executivo | Primeira versão | Ministérios, ministros fictícios, nomeação, negociação, exoneração, execução mensal e efeitos administrativos. |
| Economia | Primeira versão | Caixa e fluxo mensal, orçamento anual por setores, dotações, tributos limitados, dívida, empréstimos, juros, pagamentos adiados e relatórios. É um modelo fictício de jogo, não um orçamento federal completo. |
| Políticas públicas | Primeira versão | Programas e projetos por setor, investimento, prioridade, prazo, avanço semanal, resultado mensal e riscos. |
| Sociedade | Primeira versão | Cinco classes econômicas e sete grupos de pressão; apoio, pressão, diálogo, acordos, manifestações/paralisações e revisão mensal. |
| Congresso | Primeira versão, Fase 3.1 | Composição agregada das duas Casas, PL/PLP/PEC/MP e proposições orçamentárias, negociação, votações, sanção/veto e efeitos fiscais simplificados. |
| Paletas partidárias | Implementado nesta atualização | Seis pares pesquisados para as paródias, aplicação no tema e migração de campanhas salvas v8 para v9. As fontes e as aproximações HEX estão em `docs/CORES_DOS_PARTIDOS.md`. |
| Testes automatizados e build | Verificar workflow atual | O CI executa testes e build. Isso não substitui o teste real no navegador. |

## O que ainda falta para o jogo ser considerado completo

Mapa de arquitetura e dependências: `docs/MAPA_MENTAL.md`. Relatório de implementação e próximas etapas: `docs/RELATORIO_CORES_E_PRONTIDAO.md`. Este diagnóstico não altera o escopo do projeto; só registra a prontidão real da branch.

### Fase 3 — Instituições e crises
- Judiciário: processos, decisões, recursos e indicações, sem controle presidencial de julgamentos.
- Órgãos de controle e crises: MP/PGR, PF, CGU, TCU, AGU, Justiça Eleitoral, investigações, impeachment e crises entre poderes, com separação clara entre suspeita, indício, acusação e conclusão.

### Fase 4 — Política viva
- Personagens com memória e autonomia real, relações persistentes, promessas, alianças e consequências duradouras.
- Imprensa independente, rumores, evidências, comunicação e crises de imagem.
- Interesses, corrupção e polarização conectados de forma sistêmica. Os personagens e eventos são fictícios; não se deve transformar sátira em alegação factual sobre pessoas reais.

### Fase 5 — Eleições e continuidade
- Maré Ideológica e pesquisas que separem aprovação, tendência ideológica e força eleitoral.
- Candidaturas, campanhas, debates, alianças permitidas, regras eleitorais e resultado por território.
- Atualização das cadeiras só quando ocorre a eleição correspondente; segundo turno e continuidade do mandato.

### Fase 6 — Conteúdo e qualidade
- Integrar e validar o catálogo amplo de personagens; ampliar decisões, eventos, programas e narrativas.
- Balancear campanhas longas para encontrar estados impossíveis, custos desproporcionais e ciclos de exploração.
- Revisar visualmente desktop e celular, contraste, formulários, navegação, acessibilidade e estados vazios/erro.
- Fazer uma revisão detalhada dos limites institucionais e legais do que o simulador pretende representar.

## Critérios mínimos antes de chamar de versão pronta

1. Revisão de gaps no motor legislativo e financeiro e correção de bugs confirmados.
2. Completar ao menos o Judiciário, controle/crises e o ciclo eleitoral prometido no escopo.
3. Testar uma campanha de vários meses e uma campanha longa, com testes automatizados para saves/migrações, economia, projetos, Congresso, crises e eleições.
4. Fazer teste real de navegação em desktop e celular, registrar problemas e corrigir os que bloqueiam jogar.
5. Verificar que cada aba funcional não depende de números/avisos falsos ou demonstrativos sem indicação clara; transformar Relações e Histórico em sistemas reais ou marcar explicitamente como não implementados.
6. Atualizar o status, confirmar o workflow no HEAD atual e só então fazer revisão final da branch e decisão de mesclar/publicar.

## Limitações técnicas que não são bugs por si só

- A falta de backend é uma decisão de escopo atual: o jogo funciona no navegador e guarda os dados localmente. Isso implica que saves não sincronizam entre dispositivos.
- As votações, eventos e balanços são modelos determinísticos/ficcionais para gameplay, não previsões reais de comportamento político.
- Um build com sucesso comprova que o TypeScript e o pacote de produção compilaram; não prova, por si só, que toda a interface funciona em uso real.
- “Fase concluída” significa que a entrega delimitada foi implementada e validada dentro das suas simplificações, não que todo o jogo esteja finalizado.

## Próximo caminho sugerido

Manter esta branch isolada, revisar a Fase 3.1 e os efeitos financeiros, testar visualmente as novas cores e depois começar a Fase 3.2 — Judiciário. Não tentar implementar de uma vez todas as fases restantes; cada etapa deve ter escopo, testes, build e atualização de documentação próprios.
