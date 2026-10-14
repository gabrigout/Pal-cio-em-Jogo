export type SectionId =
  | 'brasil'
  | 'estado'
  | 'economia'
  | 'politicas'
  | 'sociedade'
  | 'relacoes'
  | 'historico'

export type PoliticalOrientation = 'left' | 'right'
export type PartyColorPair = [string, string]

export interface PartySelection {
  id: string
  fullName: string
  acronym: string
  description: string
  colors: PartyColorPair
  custom: boolean
}

export interface CampaignParty extends PartySelection {
  orientation: PoliticalOrientation
  popularity: number
  influence: number
  parliamentarySupport: number
  seats: number
  resources: number
}

export interface CampaignTheme {
  officialPrimary: string
  officialSecondary: string
  primary: string
  secondary: string
  buttonText: string
}

export interface CountryIndicators {
  presidentialApproval: number
  congressSupport: number
  economicOutlook: number
  budget: number
  politicalCapital: number
  administrativeCapacity: number
  institutionalStability: number
  polarization: number
  publicTrust: number
  publicIntegrity: number
  foreignRelations: number
}

export interface CampaignState {
  id: string
  orientation: PoliticalOrientation
  party: CampaignParty
  calendar: {
    month: string
    year: number
    week: number
    weeksPerMonth: number
  }
  country: CountryIndicators
  theme: CampaignTheme
}

export interface PartyDefinition {
  id: string
  acronym: string
  fullName: string
  ideology: PoliticalOrientation | 'center'
  description: string
  colors: readonly [string, string]
}

export type MetricTone = 'positive' | 'warning' | 'critical' | 'neutral'

export interface DashboardMetric {
  id: string
  label: string
  value: string
  detail: string
  change: string
  statusLabel: string
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