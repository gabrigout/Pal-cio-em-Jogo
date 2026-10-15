import type { MonthlyEvent } from '../state/types'

export const monthlyEvents: MonthlyEvent[] = [
  {
    id: 'tight-budget-review',
    title: 'Revisão de execução e contingenciamento',
    prompt: 'O mês fecha com compromissos concorrendo pela mesma reserva.',
    description: 'A equipe fecha o mês revendo prioridades para manter os compromissos dentro do orçamento disponível.',
    condition: { indicator: 'budget', operator: 'atMost', value: 76 },
    weight: 6,
    options: [
      { id: 'focus-essential', label: 'Proteger serviços essenciais', description: 'Concentrar recursos em entregas prioritárias e adiar projetos menores.', icon: 'shield', effects: { budget: 2, administrativeCapacity: -1, publicTrust: 1 }, resultText: 'A reserva aumentou, mas a capacidade para frentes menores diminuiu.' },
      { id: 'publish-review', label: 'Abrir revisão de gastos', description: 'Publicar critérios e revisar compromissos com as áreas responsáveis.', icon: 'newspaper', effects: { publicIntegrity: 1, publicTrust: 1, politicalCapital: -1 }, resultText: 'Os critérios ficaram públicos e exigiram negociação com as áreas.' },
      { id: 'maintain-plan', label: 'Manter o plano atual', description: 'Preservar o calendário de entregas e acompanhar o orçamento de perto.', icon: 'clipboard', effects: { economicOutlook: 1, budget: -1, presidentialApproval: 1 }, resultText: 'As entregas mantiveram ritmo e consumiram parte da reserva.' },
    ],
  },
  {
    id: 'economic-outlook-review',
    title: 'Balanço de atividade e previsibilidade',
    prompt: 'Os sinais de atividade chegaram; cabe escolher entre previsibilidade e margem de segurança.',
    description: 'O fechamento mensal reúne sinais de atividade e ajusta expectativas para o próximo ciclo.',
    condition: { indicator: 'economicOutlook', operator: 'atLeast', value: 57 },
    weight: 4,
    options: [
      { id: 'share-outlook', label: 'Compartilhar cenário', description: 'Apresentar projeções e suas incertezas aos setores interessados.', icon: 'newspaper', effects: { economicOutlook: 1, publicTrust: 1, politicalCapital: -1 }, resultText: 'O cenário compartilhado aumentou previsibilidade, com custo de articulação.' },
      { id: 'hold-reserve', label: 'Preservar margem', description: 'Evitar compromissos adicionais antes do próximo balanço.', icon: 'coins', effects: { budget: 2, presidentialApproval: -1, economicOutlook: -1 }, resultText: 'A margem fiscal foi preservada, mas a expectativa perdeu impulso.' },
    ],
  },
  {
    id: 'federative-review',
    title: 'Rodada de coordenação federativa',
    prompt: 'Estados e governo federal precisam registrar prioridades e pendências para o próximo mês.',
    description: 'Estados e governo federal consolidam prioridades e registram pendências para o mês seguinte.',
    condition: { indicator: 'institutionalStability', operator: 'atMost', value: 72 },
    weight: 5,
    options: [
      { id: 'publish-responsibilities', label: 'Publicar responsabilidades', description: 'Registrar qual ente acompanha cada etapa, respeitando competências federativas.', icon: 'clipboard', effects: { institutionalStability: 2, publicTrust: 1, administrativeCapacity: -1 }, resultText: 'As responsabilidades ficaram claras e a coordenação ganhou previsibilidade.' },
      { id: 'small-joint-agenda', label: 'Fechar pauta conjunta', description: 'Escolher poucas prioridades para o mês seguinte e registrar divergências.', icon: 'users', effects: { executiveSupport: 1, institutionalStability: 1, politicalCapital: -1 }, resultText: 'A pauta comum avançou, exigindo negociação entre os entes.' },
    ],
  },
]