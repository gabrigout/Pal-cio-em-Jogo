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
  executiveSupport: number
  judiciaryRelation: number
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
  turn: CampaignTurnState
  news: NewsItem[]
  pendingEffects: PendingEffect[]
  weeklySummary: WeeklySummary | null
}

export interface CampaignTurnState {
  availableActionPoints: number
  newActionPoints: number
  carriedActionPoints: number
  activeDecisionId: string
  chosenDecisionOptionId: string | null
  actionsTaken: string[]
  weeklyChanges: IndicatorChange[]
}

export interface ActionPointCalculation {
  base: number
  executiveSupportBonus: number
  legislativeSupportBonus: number
  judiciaryRelationBonus: number
  publicApprovalBonus: number
  newPoints: number
}

export interface ResourceCosts {
  actionPoints: number
  budget: number
  politicalCapital: number
  administrativeCapacity: number
}

export type IndicatorEffects = Partial<Record<keyof CountryIndicators, number>>

export interface GameAction {
  id: string
  title: string
  description: string
  costs: ResourceCosts
  effects: IndicatorEffects
  pendingEffects?: Array<{ effects: IndicatorEffects; reason: string }>
}

export interface PendingEffect {
  effects: IndicatorEffects
  reason: string
}

export interface ActionAvailability {
  action: GameAction
  blockedReason: string | null
  costSummary: string
}

export interface TurnDashboardData {
  actionPointExplanation: string
  actions: ActionAvailability[]
  decision: NarrativeDecision
  selectedDecisionOptionLabel: string | null
  monthlyEvent: MonthlyEvent | null
  monthlyEconomyPreview: EconomyBalance | null
}

export interface DecisionOption {
  id: string
  label: string
  description: string
  effects: IndicatorEffects
}

export interface DecisionCondition {
  indicator: keyof CountryIndicators
  operator: 'atMost' | 'atLeast'
  value: number
}

export interface NarrativeDecision {
  id: string
  title: string
  prompt: string
  condition: DecisionCondition
  options: DecisionOption[]
}

export interface MonthlyEvent {
  id: string
  title: string
  description: string
  condition: DecisionCondition
  effects: IndicatorEffects
}

export interface IndicatorChange {
  indicator: keyof CountryIndicators | 'budget'
  label: string
  amount: number
  reason: string
}

export interface EconomyBalance {
  openingBudget: number
  revenue: number
  expenses: number
  closingBudget: number
}

export interface WeeklySummary {
  month: string
  year: number
  week: number
  changes: IndicatorChange[]
  events: string[]
  actions: string[]
  carriedActionPoints: number
  expiredActionPoints: number
  newActionPoints: number
  totalActionPoints: number
  monthlyEvent: string | null
  economyBalance: EconomyBalance | null
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