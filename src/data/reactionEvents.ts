import type { NarrativeDecision } from '../state/types'

export const reactionEvents: NarrativeDecision[] = [
  {
    id: 'low-approval-pulse', title: 'A pesquisa que chegou antes do café', category: 'reação', weight: 8,
    prompt: 'A aprovação ficou baixa e a equipe precisa escolher entre ouvir mais ou explicar o que já está fazendo.',
    condition: { indicator: 'presidentialApproval', operator: 'atMost', value: 42 },
    options: [
      { id: 'listen-groups', label: 'Ouvir grupos sociais', description: 'Fazer encontros curtos e registrar demandas sem prometer solução imediata.', icon: 'users', effects: { publicTrust: 2, presidentialApproval: 1, administrativeCapacity: -1 }, resultText: 'A escuta trouxe demandas concretas, mas consumiu tempo de execução.' },
      { id: 'explain-priorities', label: 'Explicar prioridades', description: 'Apresentar metas e prazos já existentes em linguagem direta.', icon: 'megaphone', effects: { presidentialApproval: 2, publicTrust: -1 }, uncertainConsequences: ['A recepção pública pode variar'], resultText: 'A mensagem foi mais clara, mas parte do público queria ouvir novas medidas.' },
    ],
  },
  {
    id: 'high-polarization-pulse', title: 'O debate que virou campeonato', category: 'reação', weight: 8,
    prompt: 'A polarização subiu e até a reunião de condomínio ganhou dois palanques e um mediador.',
    condition: { indicator: 'polarization', operator: 'atLeast', value: 58 },
    options: [
      { id: 'moderated-forum', label: 'Abrir fórum moderado', description: 'Reunir setores diferentes com regras claras de escuta.', icon: 'message', effects: { polarization: -2, publicTrust: 1, politicalCapital: -1 }, resultText: 'O fórum reduziu a temperatura e exigiu trabalho de mediação.' },
      { id: 'focus-shared-service', label: 'Focar em serviço comum', description: 'Priorizar uma entrega prática que atenda grupos diversos.', icon: 'users', effects: { publicTrust: 2, administrativeCapacity: -1, presidentialApproval: 1 }, resultText: 'A entrega comum trouxe resultado visível, com esforço adicional da administração.' },
    ],
  },
  {
    id: 'weak-congress-reaction', title: 'A pauta sem quórum de conversa', category: 'reação', weight: 9,
    prompt: 'O apoio legislativo está fraco e líderes adiaram a conversa pela segunda vez.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 40 },
    options: [
      { id: 'restart-negotiation', label: 'Reabrir negociação', description: 'Perguntar às lideranças quais pontos podem voltar à mesa.', icon: 'landmark', effects: { congressSupport: 2, politicalCapital: -1, executiveSupport: -1 }, resultText: 'A negociação recomeçou com margem menor para a coordenação interna.' },
      { id: 'reduce-agenda', label: 'Reduzir a pauta', description: 'Separar temas urgentes de assuntos que podem esperar.', icon: 'clipboard', effects: { congressSupport: 1, administrativeCapacity: 1, presidentialApproval: -1 }, resultText: 'A pauta ficou menor e mais executável, com menos impacto de comunicação.' },
    ],
  },
  {
    id: 'low-budget-reaction', title: 'O orçamento no modo econômico', category: 'reação', weight: 8,
    prompt: 'A reserva ficou baixa e as áreas trouxeram três prioridades para cada recurso disponível.',
    condition: { indicator: 'budget', operator: 'atMost', value: 240 },
    options: [
      { id: 'resequence-delivery', label: 'Reordenar entregas', description: 'Ajustar prazos e preservar serviços em andamento.', icon: 'briefcase', effects: { budget: 10, publicTrust: -1, administrativeCapacity: 1 }, resultText: 'O calendário ficou mais realista e algumas entregas foram adiadas.' },
      { id: 'publish-tradeoffs', label: 'Publicar escolhas', description: 'Explicar quais compromissos serão mantidos e quais ficarão para depois.', icon: 'newspaper', effects: { publicTrust: 2, presidentialApproval: -1, politicalCapital: -1 }, resultText: 'A transparência reduziu dúvidas, mas tornou explícitas as perdas de prioridade.' },
    ],
  },
  {
    id: 'weak-executive-reaction', title: 'A coordenação pediu uma pausa', category: 'reação', weight: 6,
    prompt: 'O apoio interno do Executivo caiu e as áreas não chegaram com a mesma versão do cronograma.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 40 },
    options: [
      { id: 'align-ministers', label: 'Alinhar ministros', description: 'Definir responsáveis e prazos comuns em reunião de coordenação.', icon: 'briefcase', effects: { executiveSupport: 2, administrativeCapacity: -1 }, resultText: 'Os responsáveis alinharam o cronograma, consumindo capacidade administrativa.' },
      { id: 'delegate-priorities', label: 'Delegar prioridades', description: 'Deixar cada área propor etapas dentro de limites comuns.', icon: 'users', effects: { executiveSupport: 1, administrativeCapacity: 1, publicTrust: -1 }, resultText: 'As áreas ganharam autonomia e a comunicação ficou menos uniforme.' },
    ],
  },
  {
    id: 'low-administration-reaction', title: 'O sistema pediu mais um prazo', category: 'reação', weight: 7,
    prompt: 'A capacidade administrativa está baixa e os formulários começaram a pedir o número do protocolo do formulário.',
    condition: { indicator: 'administrativeCapacity', operator: 'atMost', value: 38 },
    options: [
      { id: 'pause-new-requests', label: 'Pausar novas frentes', description: 'Concentrar equipes em concluir processos já iniciados.', icon: 'clipboard', effects: { administrativeCapacity: 2, presidentialApproval: -1 }, resultText: 'A fila de processos ativos avançou; novas demandas esperarão.' },
      { id: 'simplify-workflow', label: 'Simplificar fluxo', description: 'Remover etapas internas sem alterar requisitos legais.', icon: 'briefcase', effects: { administrativeCapacity: 2, publicIntegrity: -1, publicTrust: 1 }, uncertainConsequences: ['A revisão pode encontrar etapas que exigem controle'], resultText: 'O fluxo ficou menor e será acompanhado para preservar os controles necessários.' },
    ],
  },
  {
    id: 'low-trust-reaction', title: 'A pergunta repetida', category: 'reação', weight: 6,
    prompt: 'A confiança pública caiu e a mesma pergunta apareceu em todos os canais oficiais.',
    condition: { indicator: 'publicTrust', operator: 'atMost', value: 39 },
    options: [
      { id: 'answer-publicly', label: 'Responder com dados', description: 'Publicar resposta verificável e indicar quando haverá atualização.', icon: 'newspaper', effects: { publicTrust: 2, administrativeCapacity: -1 }, resultText: 'A resposta melhorou a rastreabilidade e definiu um próximo prazo.' },
      { id: 'open-ombudsman', label: 'Abrir escuta pública', description: 'Reunir perguntas e encaminhar temas às áreas responsáveis.', icon: 'message', effects: { publicTrust: 1, politicalCapital: -1, polarization: -1 }, resultText: 'A escuta organizou perguntas e reduziu parte da tensão.' },
    ],
  },
  {
    id: 'low-judiciary-reaction', title: 'O rito sob os holofotes', category: 'reação', weight: 5,
    prompt: 'A relação institucional está tensa e surgiram comentários confundindo diálogo com controle de decisões.',
    condition: { indicator: 'judiciaryRelation', operator: 'atMost', value: 39 },
    options: [
      { id: 'affirm-independence', label: 'Reafirmar independência', description: 'Explicar as competências e manter interlocução pelos canais formais.', icon: 'scale', effects: { judiciaryRelation: 2, institutionalStability: 1, presidentialApproval: -1 }, resultText: 'A posição reforçou os limites institucionais sem prever o resultado de processos.' },
      { id: 'limit-public-comments', label: 'Limitar comentários oficiais', description: 'Orientar a comunicação a falar apenas de atos do Executivo.', icon: 'message', effects: { judiciaryRelation: 1, publicTrust: -1, institutionalStability: 1 }, resultText: 'A comunicação ficou mais cautelosa e a confiança sentiu a falta de explicações.' },
    ],
  },
]

export const scheduledNarrativeEvents: NarrativeDecision[] = [
  {
    id: 'rain-follow-up', title: 'O segundo boletim das chuvas', category: 'encadeado', weight: 10,
    prompt: 'Duas semanas depois, estados trazem um novo boletim e pedem continuidade da coordenação.',
    condition: { indicator: 'institutionalStability', operator: 'atLeast', value: 0 },
    options: [
      { id: 'continue-federative-table', label: 'Manter mesa federativa', description: 'Continuar reuniões com responsabilidades e prazos publicados.', icon: 'users', effects: { institutionalStability: 1, publicTrust: 1, budget: -10 }, resultText: 'A coordenação continuou e consumiu uma pequena parte da reserva.' },
      { id: 'transfer-to-local-teams', label: 'Apoiar equipes locais', description: 'Direcionar apoio técnico e deixar a operação com os órgãos competentes.', icon: 'briefcase', effects: { administrativeCapacity: -1, publicTrust: 2, politicalCapital: 1 }, resultText: 'Equipes locais receberam apoio e conduziram as próprias operações.' },
    ],
  },
  {
    id: 'water-monitoring-review', title: 'A revisão dos medidores', category: 'encadeado', weight: 9,
    prompt: 'A revisão dos dados de água encontrou calendários incompatíveis entre regiões.',
    condition: { indicator: 'publicTrust', operator: 'atLeast', value: 0 },
    options: [
      { id: 'publish-regional-series', label: 'Publicar séries regionais', description: 'Mostrar diferenças entre regiões sem resumir tudo num único número.', icon: 'newspaper', effects: { publicTrust: 1, administrativeCapacity: -1, institutionalStability: 1 }, resultText: 'As séries ficaram comparáveis e a equipe assumiu um calendário de atualização.' },
      { id: 'reconcile-sources', label: 'Conciliar fontes', description: 'Adiar o boletim consolidado até alinhar critérios técnicos.', icon: 'clipboard', effects: { publicIntegrity: 1, publicTrust: -1, administrativeCapacity: 1 }, resultText: 'A conciliação melhorou a qualidade dos dados, com uma espera pública maior.' },
    ],
  },

  ,{
    id: 'viral-amendment-followup', title: 'A resposta virou outro vídeo', category: 'reação', weight: 5,
    prompt: 'Depois da resposta do Planalto, Nico Gadelha publica uma nova montagem e líderes do Congresso pedem que a disputa não atrapalhe a liberação dos recursos.',
    condition: { indicator: 'polarization', operator: 'atLeast', value: 45 },
    publicFigure: { name: 'Nico Gadelha', role: 'Influenciador político fictício', description: 'O personagem retoma a crítica à emenda e cobra uma reação do governo.' },
    options: [
      { id: 'release-tracking-page', label: 'Criar página de acompanhamento', description: 'Exibir destino, cronograma, empenho e execução da emenda.', icon: 'clipboard', effects: { publicTrust: 2, publicIntegrity: 1, politicalCapital: -1 }, resultText: 'A prestação de contas criou uma referência pública e reduziu parte da desconfiança.' },
      { id: 'negotiate-quietly', label: 'Negociar com líderes', description: 'Separar a disputa digital da negociação institucional e preservar a execução.', icon: 'landmark', effects: { congressSupport: 2, politicalCapital: -2, publicTrust: -1 }, resultText: 'A articulação preservou o acordo no Congresso, mas a falta de comunicação manteve dúvidas entre parte do público.' },
    ],
  },
  {
    id: 'workweek-cost-followup', title: 'A conta da mudança chegou às empresas', category: 'reação', weight: 5,
    prompt: 'Entidades empresariais pedem prazo para reorganizar turnos e estimam alta de custos em setores intensivos em mão de obra. Sindicatos dizem que o bem-estar não pode ficar para depois.',
    condition: { indicator: 'economicOutlook', operator: 'atMost', value: 58 },
    publicFigure: { name: 'Rui do Comércio', role: 'Representante empresarial fictício', description: 'Personagem satírico que representa pequenos e médios negócios preocupados com custos de adaptação.' },
    options: [
      { id: 'pilot-and-measure', label: 'Testar por setor e medir resultados', description: 'Criar transição com metas de emprego, produtividade, preços e qualidade de vida.', icon: 'clipboard', effects: { economicOutlook: 1, publicTrust: 1, administrativeCapacity: -2, politicalCapital: -1 }, resultText: 'O piloto abriu espaço para ajustar a regra com dados, mas exigiu tempo e capacidade administrativa.' },
      { id: 'offer-small-business-credit', label: 'Oferecer crédito temporário a pequenos negócios', description: 'Amortecer custos iniciais, aceitando mais despesa pública e cobrança por resultados.', icon: 'coins', effects: { economicOutlook: 1, budget: -12, politicalCapital: -1, presidentialApproval: -1 }, resultText: 'O crédito deu fôlego a parte das empresas, mas pressionou o caixa e não resolveu todas as diferenças entre setores.' },
    ],
  },

]