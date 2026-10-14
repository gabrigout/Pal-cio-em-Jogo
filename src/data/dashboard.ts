import type { DashboardMetric, NewsItem, WorkItem } from '../state/types'

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: 'approval',
    label: 'Aprovação presidencial',
    value: '54%',
    detail: 'Opinião pública',
    change: '+2 pts',
    tone: 'positive',
    progress: 54,
  },
  {
    id: 'congress',
    label: 'Apoio no Congresso',
    value: '47%',
    detail: 'Base em construção',
    change: '−1 pt',
    tone: 'warning',
    progress: 47,
  },
  {
    id: 'economy',
    label: 'Situação econômica',
    value: 'Estável',
    detail: 'Atividade moderada',
    change: 'sem alteração',
    tone: 'positive',
    progress: 68,
  },
  {
    id: 'resources',
    label: 'Recursos globais',
    value: 'Equilibrados',
    detail: 'Orçamento · capital · gestão',
    change: '3 recursos',
    tone: 'neutral',
    progress: 61,
  },
  {
    id: 'stability',
    label: 'Estabilidade institucional',
    value: '72%',
    detail: 'Instituições em funcionamento',
    change: 'estável',
    tone: 'positive',
    progress: 72,
  },
  {
    id: 'trust',
    label: 'Polarização / confiança',
    value: 'Alta / 51%',
    detail: 'Ambiente público dividido',
    change: 'atenção',
    tone: 'warning',
    progress: 51,
  },
  {
    id: 'integrity',
    label: 'Integridade pública',
    value: 'Regular',
    detail: 'Sem alertas confirmados',
    change: 'monitorada',
    tone: 'warning',
    progress: 58,
  },
  {
    id: 'foreign',
    label: 'Relação externa',
    value: 'Cooperativa',
    detail: 'Agenda diplomática ativa',
    change: '+1 parceria',
    tone: 'positive',
    progress: 76,
  },
]

export const dashboardNews: NewsItem[] = [
  {
    id: 'budget',
    category: 'ECONOMIA',
    time: '08:42',
    title: 'Equipe econômica promete previsibilidade no primeiro trimestre',
    summary: 'O anúncio foi bem recebido pelo mercado, mas líderes cobram detalhes sobre a execução do orçamento.',
    tone: 'positive',
  },
  {
    id: 'congress',
    category: 'CONGRESSO',
    time: '09:16',
    title: 'Lideranças pedem reunião antes de votar a pauta prioritária',
    summary: 'A articulação política terá uma janela curta para alinhar expectativas e construir apoio.',
    tone: 'warning',
  },
  {
    id: 'climate',
    category: 'SOCIEDADE',
    time: '10:03',
    title: 'Governadores cobram coordenação para resposta às chuvas',
    summary: 'Estados aguardam definição de recursos e um plano integrado de atendimento às áreas afetadas.',
    tone: 'critical',
  },
]

export const activeWork: WorkItem[] = [
  {
    id: 'coordination',
    title: 'Pacto de coordenação federativa',
    description: 'Articulação com governos estaduais para resposta conjunta.',
    meta: 'Execução · 2 de 4 etapas',
    tone: 'positive',
  },
]

export const waitingWork: WorkItem[] = [
  {
    id: 'agenda',
    title: 'Pauta de prioridades legislativas',
    description: 'Lideranças ainda não confirmaram a reunião de alinhamento.',
    meta: 'Congresso · resposta pendente',
    tone: 'warning',
  },
]

export const closedWork: WorkItem[] = [
  {
    id: 'briefing',
    title: 'Briefing de abertura de governo',
    description: 'Diagnóstico inicial entregue à equipe ministerial.',
    meta: 'Concluído · hoje, 08:00',
    tone: 'neutral',
  },
]