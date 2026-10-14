import type { GameAction } from '../state/types'

export const sampleActions: GameAction[] = [
  {
    id: 'coordinate-ministers',
    title: 'Alinhar prioridades ministeriais',
    description: 'Reunião de coordenação para reduzir ruído entre as equipes.',
    costs: { actionPoints: 1, budget: 0, politicalCapital: 1, administrativeCapacity: 0 },
    effects: { executiveSupport: 2, administrativeCapacity: 1 },
  },
  {
    id: 'negotiate-agenda',
    title: 'Negociar pauta com lideranças',
    description: 'Abrir uma rodada de conversa com bancadas e líderes do Congresso.',
    costs: { actionPoints: 2, budget: 0, politicalCapital: 3, administrativeCapacity: 0 },
    effects: { congressSupport: 2, executiveSupport: 1 },
  },
  {
    id: 'service-mutirao',
    title: 'Mutirão de serviços públicos',
    description: 'Concentrar equipes para destravar atendimentos prioritários.',
    costs: { actionPoints: 1, budget: 3, politicalCapital: 0, administrativeCapacity: 2 },
    effects: { publicTrust: 2, administrativeCapacity: 1 },
  },
  {
    id: 'institutional-dialogue',
    title: 'Abrir diálogo institucional',
    description: 'Reforçar canais de interlocução respeitando a independência judicial.',
    costs: { actionPoints: 1, budget: 0, politicalCapital: 2, administrativeCapacity: 0 },
    effects: { judiciaryRelation: 2, institutionalStability: 1 },
  },
  {
    id: 'economic-coordination',
    title: 'Coordenar agenda econômica',
    description: 'Alinhar execução e previsibilidade com a equipe econômica.',
    costs: { actionPoints: 2, budget: 4, politicalCapital: 1, administrativeCapacity: 1 },
    effects: { economicOutlook: 2, presidentialApproval: 1 },
    pendingEffects: [{ effects: { economicOutlook: 1 }, reason: 'A coordenação econômica começou a produzir efeitos nesta semana.' }],
  },
]