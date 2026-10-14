export type SectionId =
  | 'brasil'
  | 'estado'
  | 'economia'
  | 'politicas'
  | 'sociedade'
  | 'relacoes'
  | 'historico'

export type MetricTone = 'positive' | 'warning' | 'critical' | 'neutral'

export interface DashboardMetric {
  id: string
  label: string
  value: string
  detail: string
  change: string
  tone: MetricTone
  progress: number
}

export interface NewsItem {
  id: string
  category: string
  time: string
  title: string
  summary: string
  tone: MetricTone
}

export interface WorkItem {
  id: string
  title: string
  description: string
  meta: string
  tone: MetricTone
}