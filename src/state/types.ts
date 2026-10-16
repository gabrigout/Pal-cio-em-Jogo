export type SectionId =
  | 'brasil'
  | 'estado'
  | 'economia'
  | 'politicas'
  | 'sociedade'
  | 'congresso'
  | 'judiciario'
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
  projects: PublicProjectState[]
  society: SocietyState
  legislature: LegislatureState
  judiciary: JudiciaryState
  executiveProposals: string[]
  economy: EconomicState
  turn: CampaignTurnState
  news: NewsItem[]
  pendingEffects: PendingEffect[]
  weeklySummary: WeeklySummary | null
}

export type LegislativeBillType = 'ordinary' | 'complementary' | 'pec' | 'mp' | 'ppa' | 'ldo' | 'loa' | 'credit' | 'amendment'
export type LegislativeChamber = 'house' | 'senate' | 'joint'
export type LegislativeStage = 'committee' | 'negotiation' | 'voting' | 'sanction' | 'veto-review' | 'approved' | 'rejected' | 'expired'
export type LegislativeOrigin = 'executive' | 'parliamentary'

export interface LegislativeBloc {
  partyId: string
  partyName: string
  acronym: string
  orientation: PoliticalOrientation | 'center'
  seats: number
}

export interface LegislativeVote {
  id: string
  chamber: LegislativeChamber
  round: number
  dateLabel: string
  yes: number
  no: number
  abstain: number
  absent: number
  present: number
  totalSeats: number
  quorumNeeded: number
  requiredYes: number
  passed: boolean
  note: string
}

export interface LegislativeBill {
  id: string
  type: LegislativeBillType
  title: string
  summary: string
  origin: LegislativeOrigin
  authorPartyId: string
  authorPartyAcronym: string
  createdYear: number
  createdMonth: string
  createdWeek: number
  stage: LegislativeStage
  stageWeeks: number
  daysInProcess: number
  currentChamber: LegislativeChamber
  currentRound: number
  negotiatedSupport: number
  fiscalImpact: number
  targetSectorId: string | null
  sourceSectorId: string | null
  voteHistory: LegislativeVote[]
  history: string[]
  isUrgent: boolean
  provisionalFiscalImpactApplied: boolean
  vetoReason: string | null
  sourceKey: string | null
}

export interface LegislatureState {
  chamberOfDeputies: LegislativeBloc[]
  senate: LegislativeBloc[]
  bills: LegislativeBill[]
  history: string[]
  lastAdvancedKey: string | null
}

export type JudicialCourtId = 'stf' | 'stj' | 'trf' | 'tj' | 'tse' | 'tst' | 'stm' | 'cnj'
export type JudicialCaseType = 'constitutional-review' | 'administrative' | 'fiscal' | 'federal-dispute' | 'electoral' | 'labor' | 'disciplinary'
export type JudicialCaseStage = 'filed' | 'admissibility' | 'evidence' | 'awaiting-decision' | 'decision' | 'appeal' | 'final' | 'dismissed'
export type JudicialOutcome = 'plaintiff' | 'government' | 'partial' | 'inadmissible'
export type JudicialComplianceStatus = 'not-required' | 'pending' | 'complied' | 'overdue'
export type JudicialNominationStatus = 'awaiting-senate' | 'approved' | 'rejected' | 'appointed'

export interface JudicialJustice {
  id: string
  name: string
  seatNumber: number
  age: number
  legalKnowledge: number
  precedentReliance: number
  proceduralRigour: number
  independence: number
  publicReputation: number
  joinedYear: number
  monthsUntilRetirement: number | null
}

export interface JudicialNomineeCandidate {
  id: string
  name: string
  age: number
  legalKnowledge: number
  precedentReliance: number
  proceduralRigour: number
  independence: number
  publicReputation: number
  profile: string
}

export interface JudicialVacancy {
  id: string
  court: 'stf'
  seatNumber: number
  openedYear: number
  openedMonth: string
  reason: string
  candidates: JudicialNomineeCandidate[]
  nominatedCandidateIds: string[]
}

export interface JudicialSenateVote {
  id: string
  yes: number
  no: number
  abstain: number
  absent: number
  present: number
  totalSeats: number
  requiredYes: number
  approved: boolean
  dateLabel: string
  note: string
}

export interface JudicialNomination {
  id: string
  vacancyId: string
  candidate: JudicialNomineeCandidate
  status: JudicialNominationStatus
  createdYear: number
  createdMonth: string
  createdWeek: number
  weeksRemaining: number
  vote: JudicialSenateVote | null
  history: string[]
}

export interface JudicialDecisionRecord {
  id: string
  court: JudicialCourtId
  year: number
  month: string
  week: number
  outcome: JudicialOutcome
  score: number
  rationale: string
  panelNames: string[]
}

export interface JudicialCase {
  id: string
  title: string
  summary: string
  type: JudicialCaseType
  court: JudicialCourtId
  stage: JudicialCaseStage
  plaintiff: string
  defendant: string
  origin: string
  sourceKey: string | null
  governmentIsParty: boolean
  filedYear: number
  filedMonth: string
  filedWeek: number
  stageWeeks: number
  daysInProcess: number
  legalMerit: number
  evidenceStrength: number
  precedentFit: number
  proceduralRegularity: number
  publicImpact: number
  severity: 'routine' | 'important' | 'critical'
  appealTo: JudicialCourtId | null
  appealCount: number
  appealWindowWeeks: number
  outcome: JudicialOutcome | null
  decisions: JudicialDecisionRecord[]
  complianceStatus: JudicialComplianceStatus
  complianceWeeksRemaining: number
  publicReactionSummary: string | null
  closedReason: string | null
  history: string[]
}

export interface JudiciaryState {
  stfJustices: JudicialJustice[]
  vacancies: JudicialVacancy[]
  nominations: JudicialNomination[]
  cases: JudicialCase[]
  history: string[]
  processedSourceKeys: string[]
  lastAdvancedKey: string | null
  lastClosedMonthKey: string | null
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
  economicEffect?: EconomicDecisionEffect
}

export interface EconomicIndicators {
  publicRevenue: number
  publicExpenses: number
  fiscalBalance: number
  publicDebt: number
  growth: number
  inflation: number
  unemployment: number
  incomeInequality: number
}

export interface BudgetSector {
  id: string
  name: string
  share: number
  annualAllocation: number
  executedThisYear: number
  ministryIds: string[]
}

export interface AnnualBudget {
  year: number
  total: number
  fixedCommitments: number
  sectors: BudgetSector[]
  lastRevisionKey: string | null
}

export interface EconomicTax {
  id: string
  name: string
  rate: number
  minimumRate: number
  maximumRate: number
  adjustmentStep: number
  revenueSensitivity: number
  affectedGroups: string[]
}

export interface PublicLoan {
  id: string
  lender: string
  amount: number
  outstandingPrincipal: number
  annualInterestRate: number
  termMonths: number
  remainingMonths: number
  monthlyPayment: number
  conditions: string[]
  startYear: number
  startMonth: string
  emergency: boolean
}

export interface EconomicSnapshot {
  year: number
  month: string
  indicators: EconomicIndicators
}

export interface EconomicPressures {
  growth: number
  inflation: number
  unemployment: number
  inequality: number
  expenses: number
  revenue: number
  notes: string[]
}

export interface EconomicState {
  indicators: EconomicIndicators
  availableFunds: number
  projectExpensesPaidThisMonth: number
  annualBudget: AnnualBudget
  taxes: EconomicTax[]
  loans: PublicLoan[]
  congressProposals: string[]
  socialEffects: string[]
  pendingBudgetRequests: string[]
  history: EconomicSnapshot[]
  lastMonthlyReport: string[]
  pressures: EconomicPressures
  deferredPayments: number
}

export type SocialClassId = 'low-income' | 'middle-class' | 'wealthy-business' | 'millionaires' | 'billionaires'
export type PressureGroupId = 'unions' | 'business-entities' | 'students' | 'public-employees' | 'rural-producers' | 'environmental-movements' | 'health-communities'
export type SocietyActionType = 'dialogue' | 'agreement'

export interface SocialClassState {
  id: SocialClassId
  name: string
  approval: number
  economicSecurity: number
  priorities: string[]
  lastChange: number
  latestReason: string
}

export interface PressureGroupState {
  id: PressureGroupId
  name: string
  category: string
  approval: number
  influence: number
  pressure: number
  sectorIds: string[]
  beneficiaryClass: SocialClassId
  interests: string[]
  demand: string
  lastChange: number
  latestReason: string
}

export interface SocietyHistoryEntry {
  id: string
  dateLabel: string
  kind: 'review' | 'protest' | 'strike' | 'endorsement' | 'dialogue' | 'agreement'
  title: string
  summary: string
  tone: MetricTone
}

export interface SocietyState {
  classes: SocialClassState[]
  groups: PressureGroupState[]
  history: SocietyHistoryEntry[]
  lastReviewKey: string | null
}

export type ProjectPriority = 'low' | 'normal' | 'high'
export type PublicProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled'
export type ProjectRiskLevel = 'low' | 'medium' | 'high'
export interface PublicProgramDefinition {
  id: string; name: string; sectorId: string; ministryId: string; summary: string
  minInvestment: number; maxInvestment: number; defaultInvestment: number; durationWeeks: number
  politicalCapitalCost: number; administrativeCapacityCost: number; riskLevel: ProjectRiskLevel
  completionEffects: Partial<Record<keyof CountryIndicators, number>>
  economicEffects: Partial<Pick<EconomicIndicators, 'growth' | 'inflation' | 'unemployment' | 'incomeInequality'>>
}
export type ProjectHistoryType = 'launch' | 'milestone' | 'delay' | 'overrun' | 'protest' | 'investigation' | 'conflict' | 'early-success' | 'priority-change' | 'paused' | 'resumed' | 'completed'
export interface PublicProjectHistoryEntry {
  dateLabel: string; type: ProjectHistoryType; title: string; summary: string; tone: MetricTone
}
export interface PublicProjectState {
  id: string; programId: string; name: string; sectorId: string; sectorName: string; ministryId: string; ministryName: string
  summary: string; approvedInvestment: number; estimatedBudget: number; budgetSpent: number
  baseDurationWeeks: number; durationWeeks: number; weeksElapsed: number; progress: number
  priority: ProjectPriority; status: PublicProjectStatus; riskLevel: ProjectRiskLevel
  politicalCapitalInvested: number; administrativeCapacityInvested: number; delayWeeks: number
  launchYear: number; launchMonth: string; launchWeek: number; lastMonthlyReviewKey: string | null
  completedAt: string | null; outcomesApplied: boolean
  completionEffects: Partial<Record<keyof CountryIndicators, number>>
  economicEffects: Partial<Pick<EconomicIndicators, 'growth' | 'inflation' | 'unemployment' | 'incomeInequality'>>
  risks: string[]; history: PublicProjectHistoryEntry[]
}
export interface ProjectStartAvailability { allowed: boolean; reason: string | null; kickoffCost: number; estimatedBudget: number; durationWeeks: number }

export type EconomicDecisionEffect =
  | { kind: 'market-confidence'; growth: number; inflation: number; note: string }
  | { kind: 'budget-request'; sectorId: string; amount: number; note: string }
  | { kind: 'loan-offer'; amount: number; annualInterestRate: number; termMonths: number; lender: string }
  | { kind: 'public-service-strike'; months: number; note: string }
  | { kind: 'food-price-pressure'; inflation: number; inequality: number; note: string }
  | { kind: 'supply-chain'; growth: number; inflation: number; note: string }

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

export type EconomicIndicatorId = keyof EconomicIndicators

export interface IndicatorChange {
  indicator: keyof CountryIndicators | EconomicIndicatorId | 'budget'
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
  economicReport: string[]
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