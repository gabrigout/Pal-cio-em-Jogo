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
  ministries: MinistryState[]
  executiveProposals: string[]
  turn: CampaignTurnState
  news: NewsItem[]
  pendingEffects: PendingEffect[]
  weeklySummary: WeeklySummary | null
}

export type ExecutiveActionType =
  | 'administrative'
  | 'decree'
  | 'congress'
  | 'institutional-approval'
  | 'legal-budgetary-review'

export interface MinisterAttributes {
  competence: number
  loyalty: number
  popularity: number
  integrity: number
  influence: number
  ambition: number
  relations: number
}

export interface MinisterCandidate {
  id: string
  name: string
  partyId: string
  partyName: string
  partyAcronym: string
  profile: string
  attributes: MinisterAttributes
}

export interface MinistryState {
  id: string
  name: string
  area: string
  competences: string[]
  annualBudget: number
  monthlyAllocation: number
  budgetAvailable: number
  budgetExecuted: number
  administrativePerformance: number
  minister: MinisterCandidate | null
  candidates: MinisterCandidate[]
  negotiatedCandidateIds: string[]
  pendingItems: string[]
  risks: string[]
  alerts: string[]
}

export type ExecutiveDecisionEffect =
  | { kind: 'dismiss'; ministryId: string }
  | { kind: 'defend'; ministryId: string }
  | { kind: 'wait'; ministryId: string }
  | { kind: 'investigate'; ministryId: string }
  | { kind: 'negotiate-budget'; ministryId: string }
  | { kind: 'mediate'; ministryId: string }

export interface CampaignTurnState {
  availableActionPoints: number
  newActionPoints: number
  carriedActionPoints: number
  activeDecisionId: string
  chosenDecisionOptionId: string | null
  activeReactionEventId: string | null
  chosenReactionOptionId: string | null
  activeMonthlyEventId: string | null
  chosenMonthlyOptionId: string | null
  recentDecisionIds: string[]
  recentReactionEventIds: string[]
  recentMonthlyEventIds: string[]
  scheduledNarrativeEvents: ScheduledNarrativeEvent[]
  decisionResult: DecisionResult | null
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
  actionType: ExecutiveActionType
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
  reactionEvent: NarrativeDecision | null
  selectedReactionOptionLabel: string | null
  monthlyEvent: MonthlyEvent | null
  selectedMonthlyOptionLabel: string | null
  monthlyEconomyPreview: EconomyBalance | null
}

export type DecisionIcon = 'briefcase' | 'landmark' | 'scale' | 'megaphone' | 'users' | 'newspaper' | 'coins' | 'shield' | 'message' | 'clipboard' | 'cloud'

export interface ScheduledNarrativeEvent {
  eventId: string
  weeksRemaining: number
  scheduledBy: string
}

export interface DecisionResult {
  category: 'decisão' | 'reação' | 'mensal'
  title: string
  choice: string
  message: string
  reasons: string[]
  changes: IndicatorChange[]
  scheduledEventTitle: string | null
}

export interface ConsequencePreview {
  label: string
  amount: number
  direction: 'up' | 'down'
}

export interface DecisionOption {
  id: string
  label: string
  description: string
  effects: IndicatorEffects
  icon?: DecisionIcon
  uncertainConsequences?: string[]
  resultText?: string
  schedule?: { eventId: string; delayWeeks: number }
  executiveEffect?: ExecutiveDecisionEffect
}

export interface DecisionCondition {
  indicator: keyof CountryIndicators
  operator: 'atMost' | 'atLeast'
  value: number
}

export interface DecisionConditions {
  all?: DecisionCondition[]
  any?: DecisionCondition[]
}

export interface NarrativeDecision {
  id: string
  title: string
  prompt: string
  condition: DecisionCondition
  weight: number
  category?: string
  options: DecisionOption[]
}

export interface MonthlyEvent {
  id: string
  title: string
  prompt: string
  description: string
  condition: DecisionCondition
  weight: number
  options: DecisionOption[]
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
  executiveReport: string[]
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