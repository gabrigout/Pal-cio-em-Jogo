import type { NarrativeDecision } from '../state/types'

export const weeklyDecisions: NarrativeDecision[] = [
  {
    id: 'economic-priority',
    title: 'O primeiro recado da economia',
    prompt: 'A equipe pede uma prioridade clara para a semana: previsibilidade ou alívio imediato?',
    condition: { indicator: 'economicOutlook', operator: 'atMost', value: 54 },
    weight: 5,
    category: 'economia',
    options: [
      { id: 'predictability', label: 'Publicar calendário', description: 'Segurar mudanças e publicar um calendário de execução.', icon: 'clipboard', effects: { economicOutlook: 2, publicTrust: 1, politicalCapital: -1 }, resultText: 'O calendário reduziu dúvidas, mas exigiu capital político para alinhar a equipe.' },
      { id: 'relief', label: 'Anunciar alívio', description: 'Concentrar a comunicação em medidas de impacto rápido.', icon: 'coins', effects: { presidentialApproval: 2, economicOutlook: -1 }, uncertainConsequences: ['Pode gerar reação do mercado'], resultText: 'O anúncio teve retorno popular rápido e deixou menos espaço para previsibilidade.' },
      { id: 'technical', label: 'Ouvir a equipe técnica', description: 'Dar espaço para os técnicos alinharem cenários antes do anúncio.', icon: 'briefcase', effects: { administrativeCapacity: 2, presidentialApproval: -1 }, resultText: 'A equipe alinhou cenários e ganhou capacidade de execução; o anúncio demorou.' },
    ],
  },
  {
    id: 'congressional-coffee',
    title: 'Café com pauta, sem pauta e com ata',
    prompt: 'Lideranças querem saber o que entra na conversa antes de confirmar presença.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 49 },
    weight: 6,
    category: 'Congresso',
    options: [
      { id: 'small-agenda', label: 'Pauta curta', description: 'Buscar acordo em dois pontos de baixa resistência.', icon: 'landmark', effects: { congressSupport: 2, politicalCapital: -1 }, resultText: 'A conversa curta melhorou a disposição de negociar, com custo de capital político.' },
      { id: 'public-pressure', label: 'Prioridades em público', description: 'Mobilizar apoio público para dar contexto à negociação.', icon: 'megaphone', effects: { presidentialApproval: 2, polarization: 1, congressSupport: -1 }, uncertainConsequences: ['Pode gerar reação de lideranças'], resultText: 'A base respondeu ao chamado, mas parte das lideranças se afastou.' },
    ],
  },
  {
    id: 'trust-response',
    title: 'A nota oficial que ninguém pediu',
    prompt: 'A confiança está oscilando e três versões da nota circulam pelos corredores.',
    condition: { indicator: 'publicTrust', operator: 'atMost', value: 52 },
    weight: 5,
    category: 'imprensa',
    options: [
      { id: 'publish-data', label: 'Abrir os dados', description: 'Publicar informações verificáveis e indicar responsáveis por cada prazo.', icon: 'newspaper', effects: { publicTrust: 3, administrativeCapacity: -1 }, resultText: 'Os dados deram transparência, consumindo tempo de execução da equipe.' },
      { id: 'single-voice', label: 'Unificar a comunicação', description: 'Reduzir desencontros com uma única porta-voz.', icon: 'message', effects: { executiveSupport: 1, publicTrust: 1 }, resultText: 'A mensagem ficou mais consistente e a coordenação interna melhorou.' },
      { id: 'wait-review', label: 'Revisar antes de publicar', description: 'Evitar contradições, mesmo que a resposta demore.', icon: 'clipboard', effects: { publicTrust: -1, institutionalStability: 1 }, resultText: 'A revisão evitou ruído institucional, mas a espera reduziu a confiança.' },
    ],
  },
  {
    id: 'administrative-queue',
    title: 'A fila da fila prioritária',
    prompt: 'A administração relata que os pedidos urgentes também estão aguardando triagem.',
    condition: { indicator: 'administrativeCapacity', operator: 'atMost', value: 55 },
    weight: 4,
    category: 'administração',
    options: [
      { id: 'clear-backlog', label: 'Reforçar o atendimento', description: 'Realocar equipes para resolver demandas represadas antes de abrir novas frentes.', icon: 'users', effects: { administrativeCapacity: 3, publicTrust: 1 }, resultText: 'A fila andou e a confiança melhorou; outras frentes ficaram com menos equipe.' },
      { id: 'protect-projects', label: 'Manter os projetos', description: 'Evitar interrupções e aceitar uma espera maior no atendimento.', icon: 'briefcase', effects: { administrativeCapacity: -1, economicOutlook: 1 }, resultText: 'Os projetos preservaram ritmo, mas o atendimento perdeu capacidade no curto prazo.' },
    ],
  },
  {
    id: 'institutional-channel',
    title: 'Um canal, várias competências',
    prompt: 'O diálogo institucional pede clareza de limites e ninguém quer ser confundido com o outro poder.',
    condition: { indicator: 'judiciaryRelation', operator: 'atMost', value: 55 },
    weight: 4,
    category: 'Judiciário',
    options: [
      { id: 'technical-dialogue', label: 'Abrir diálogo técnico', description: 'Manter canais formais sem antecipar decisões que cabem ao Judiciário.', icon: 'scale', effects: { judiciaryRelation: 2, institutionalStability: 1 }, resultText: 'A interlocução institucional melhorou sem interferir na autonomia judicial.' },
      { id: 'public-boundaries', label: 'Explicar os limites', description: 'Reafirmar as competências institucionais com linguagem acessível.', icon: 'megaphone', effects: { publicTrust: 1, judiciaryRelation: 1, polarization: -1 }, resultText: 'A explicação reduziu ruído público e abriu espaço para diálogo respeitoso.' },
    ],
  },
  {
    id: 'cabinet-alignment',
    title: 'A reunião que virou reunião preparatória',
    prompt: 'A coordenação interna precisa decidir entre fechar prioridades ou ampliar a mesa.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 55 },
    weight: 4,
    category: 'ministros',
    options: [
      { id: 'set-priorities', label: 'Fechar três prioridades', description: 'Criar uma agenda curta para orientar a equipe de governo.', icon: 'clipboard', effects: { executiveSupport: 2, administrativeCapacity: 1 }, resultText: 'A equipe saiu com prioridades comuns e maior capacidade de coordenação.' },
      { id: 'expand-table', label: 'Ampliar a mesa', description: 'Convidar mais áreas para escuta, aceitando uma decisão mais lenta.', icon: 'users', effects: { executiveSupport: 1, publicTrust: 1, administrativeCapacity: -1 }, resultText: 'Mais áreas participaram; a escuta cresceu e o ritmo administrativo caiu.' },
    ],
  },
]