import type { NewsItem, WorkItem } from '../state/types'

export const dashboardMetricLabels = {
  approval: 'Aprovação presidencial',
  congress: 'Apoio no Congresso',
  economy: 'Situação econômica',
  resources: 'Recursos globais',
  stability: 'Estabilidade institucional',
  trust: 'Polarização / confiança',
  integrity: 'Integridade pública',
  foreign: 'Relação externa',
} as const

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