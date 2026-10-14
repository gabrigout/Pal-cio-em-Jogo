import type { NarrativeDecision } from '../state/types'

export const weeklyDecisions: NarrativeDecision[] = [
  {
    id: 'economic-priority',
    title: 'O primeiro recado da economia',
    prompt: 'A equipe pede uma prioridade clara para a semana: previsibilidade ou alívio imediato?',
    condition: { indicator: 'economicOutlook', operator: 'atMost', value: 54 },
    options: [
      { id: 'predictability', label: 'Priorizar previsibilidade', description: 'Segurar mudanças e publicar um calendário de execução.', effects: { economicOutlook: 2, publicTrust: 1, politicalCapital: -1 } },
      { id: 'relief', label: 'Anunciar alívio direcionado', description: 'Concentrar a comunicação em medidas de impacto rápido.', effects: { presidentialApproval: 2, economicOutlook: -1 } },
      { id: 'technical', label: 'Deixar a equipe técnica detalhar', description: 'Dar espaço para os técnicos alinharem cenários antes do anúncio.', effects: { administrativeCapacity: 2, presidentialApproval: -1 } },
    ],
  },
  {
    id: 'congressional-coffee',
    title: 'Café com pauta, sem pauta e com ata',
    prompt: 'Lideranças querem saber o que entra na conversa antes de confirmar presença.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 49 },
    options: [
      { id: 'small-agenda', label: 'Começar por uma pauta curta', description: 'Buscar acordo em dois pontos de baixa resistência.', effects: { congressSupport: 2, politicalCapital: 1 } },
      { id: 'public-pressure', label: 'Apresentar prioridades em público', description: 'Mobilizar apoio público para dar contexto à negociação.', effects: { presidentialApproval: 2, polarization: 1, congressSupport: -1 } },
    ],
  },
  {
    id: 'trust-response',
    title: 'A nota oficial que ninguém pediu',
    prompt: 'A confiança está oscilando e três versões da nota circulam pelos corredores.',
    condition: { indicator: 'publicTrust', operator: 'atMost', value: 52 },
    options: [
      { id: 'publish-data', label: 'Publicar dados e responsáveis', description: 'Abrir informações verificáveis e indicar quem responde por cada prazo.', effects: { publicTrust: 3, administrativeCapacity: -1 } },
      { id: 'single-voice', label: 'Centralizar a comunicação', description: 'Reduzir desencontros com uma única porta-voz.', effects: { executiveSupport: 1, publicTrust: 1 } },
      { id: 'wait-review', label: 'Esperar revisão completa', description: 'Evitar contradições, mesmo que a resposta demore.', effects: { publicTrust: -1, institutionalStability: 1 } },
    ],
  },
  {
    id: 'administrative-queue',
    title: 'A fila da fila prioritária',
    prompt: 'A administração relata que os pedidos urgentes também estão aguardando triagem.',
    condition: { indicator: 'administrativeCapacity', operator: 'atMost', value: 55 },
    options: [
      { id: 'clear-backlog', label: 'Realocar equipes para a fila', description: 'Resolver demandas represadas antes de abrir novas frentes.', effects: { administrativeCapacity: 3, publicTrust: 1 } },
      { id: 'protect-projects', label: 'Manter equipes nos projetos atuais', description: 'Evitar interrupções e aceitar uma espera maior no atendimento.', effects: { administrativeCapacity: -1, economicOutlook: 1 } },
    ],
  },
  {
    id: 'institutional-channel',
    title: 'Um canal, várias competências',
    prompt: 'O diálogo institucional pede clareza de limites e ninguém quer ser confundido com o outro poder.',
    condition: { indicator: 'judiciaryRelation', operator: 'atMost', value: 55 },
    options: [
      { id: 'technical-dialogue', label: 'Reforçar interlocução técnica', description: 'Manter canais formais sem antecipar decisões que cabem ao Judiciário.', effects: { judiciaryRelation: 2, institutionalStability: 1 } },
      { id: 'public-boundaries', label: 'Explicar competências em público', description: 'Reafirmar os limites institucionais com linguagem acessível.', effects: { publicTrust: 1, judiciaryRelation: 1, polarization: -1 } },
    ],
  },
  {
    id: 'cabinet-alignment',
    title: 'A reunião que virou reunião preparatória',
    prompt: 'A coordenação interna precisa decidir entre fechar prioridades ou ampliar a mesa.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 55 },
    options: [
      { id: 'set-priorities', label: 'Fechar três prioridades comuns', description: 'Criar uma agenda curta para orientar a equipe de governo.', effects: { executiveSupport: 2, administrativeCapacity: 1 } },
      { id: 'expand-table', label: 'Convidar mais áreas para a mesa', description: 'Ampliar a escuta e aceitar uma decisão mais lenta.', effects: { executiveSupport: 1, publicTrust: 1, administrativeCapacity: -1 } },
    ],
  },
]