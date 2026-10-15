# Palácio em Jogo: instruções para a IA

Antes de qualquer tarefa, leia docs/STATUS.md.
Antes de qualquer tarefa, leia docs/Palacio_em_Jogo_Documento_Mestre.md.
O catálogo de personagens está em docs/ (md, csv e json). Não é necessário importá-lo agora.

## Stack
- React + TypeScript + Vite
- Sem banco de dados e sem API externa de IA
- Salvamento automático no LocalStorage, versionado, com várias campanhas

## Regras de arquitetura
- Separar: estado serializável do jogo, regras de simulação, catálogos de dados (JSON/TS), componentes de interface e persistência.
- Nenhuma lógica política dentro de componentes visuais.
- Números de cadeiras, quóruns e regras eleitorais ficam em arquivos de configuração, nunca fixos no código.

## Regras do jogo que nunca podem ser quebradas
- Os três poderes são independentes. O presidente não controla o Judiciário nem o Congresso.
- Pontos de ação, dinheiro, capital político e capacidade administrativa são recursos diferentes.
- Aprovação, Maré Ideológica e força eleitoral são indicadores diferentes.
- Todos os partidos e eventos são ficcionais e satíricos. Não afirmar crimes como fatos sobre pessoas reais.

## Como trabalhar
- Faça só o que o prompt pedir, completo e funcionando.
- Não deixe placeholders nem "TODO" no código entregue.
- No final, liste o que foi feito e o que ainda falta.
- Faça commit no GitHub ao terminar cada etapa.
