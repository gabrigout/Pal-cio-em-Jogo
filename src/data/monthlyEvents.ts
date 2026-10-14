import type { MonthlyEvent } from '../state/types'

export const monthlyEvents: MonthlyEvent[] = [
  {
    id: 'tight-budget-review',
    title: 'Revisão de execução e contingenciamento',
    description: 'A equipe fecha o mês revendo prioridades para manter os compromissos dentro do orçamento disponível.',
    condition: { indicator: 'budget', operator: 'atMost', value: 76 },
    effects: { administrativeCapacity: -1, institutionalStability: 1 },
  },
  {
    id: 'economic-outlook-review',
    title: 'Balanço de atividade e previsibilidade',
    description: 'O fechamento mensal reúne sinais de atividade e ajusta expectativas para o próximo ciclo.',
    condition: { indicator: 'economicOutlook', operator: 'atLeast', value: 57 },
    effects: { economicOutlook: 1, publicTrust: 1 },
  },
  {
    id: 'federative-review',
    title: 'Rodada de coordenação federativa',
    description: 'Estados e governo federal consolidam prioridades e registram pendências para o mês seguinte.',
    condition: { indicator: 'institutionalStability', operator: 'atMost', value: 72 },
    effects: { institutionalStability: 1, executiveSupport: 1 },
  },
]