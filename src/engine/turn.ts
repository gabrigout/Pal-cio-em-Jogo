import { sampleActions } from '../data/actions'
import { actionPointRules, economyRules, indicatorLabels } from '../data/campaignConfig'
import { weeklyDecisions } from '../data/decisions'
import { monthlyEvents } from '../data/monthlyEvents'
import { calendarMonths } from '../state/initialState'
import type {
  ActionAvailability,
  ActionPointCalculation,
  CampaignState,
  CountryIndicators,
  DecisionCondition,
  EconomyBalance,
  GameAction,
  IndicatorChange,
  IndicatorEffects,
  MonthlyEvent,
  NewsItem,
  TurnDashboardData,
  WeeklySummary,
} from '../state/types'

const MAX_NEWS_ENTRIES = 8

export function calculateActionPoints(
  indicators: Pick<CountryIndicators, 'executiveSupport' | 'congressSupport' | 'judiciaryRelation' | 'presidentialApproval'>,
): ActionPointCalculation {
  const executiveSupportBonus = indicators.executiveSupport > actionPointRules.supportThreshold ? 1 : 0
  const legislativeSupportBonus = indicators.congressSupport > actionPointRules.supportThreshold ? 1 : 0
  const judiciaryRelationBonus = indicators.judiciaryRelation > actionPointRules.supportThreshold ? 1 : 0
  const publicApprovalBonus = indicators.presidentialApproval > actionPointRules.supportThreshold ? 1 : 0
  const total = actionPointRules.weeklyBase
    + executiveSupportBonus
    + legislativeSupportBonus
    + judiciaryRelationBonus
    + publicApprovalBonus

  return {
    base: actionPointRules.weeklyBase,
    executiveSupportBonus,
    legislativeSupportBonus,
    judiciaryRelationBonus,
    publicApprovalBonus,
    newPoints: Math.min(actionPointRules.maximumNewPerWeek, total),
  }
}

function conditionMatches(campaign: CampaignState, condition: DecisionCondition): boolean {
  const value = campaign.country[condition.indicator]
  return condition.operator === 'atMost' ? value <= condition.value : value >= condition.value
}

function conditionDistance(campaign: CampaignState, condition: DecisionCondition): number {
  const value = campaign.country[condition.indicator]
  return condition.operator === 'atMost'
    ? Math.max(0, value - condition.value)
    : Math.max(0, condition.value - value)
}

export function getWeeklyDecision(campaign: CampaignState) {
  const matching = weeklyDecisions.find((decision) => conditionMatches(campaign, decision.condition))
  if (matching) return matching
  return [...weeklyDecisions].sort((first, second) =>
    conditionDistance(campaign, first.condition) - conditionDistance(campaign, second.condition),
  )[0]
}

export function getMonthlyEvent(campaign: CampaignState): MonthlyEvent | null {
  if (campaign.calendar.week !== campaign.calendar.weeksPerMonth) return null
  const matching = monthlyEvents.find((event) => conditionMatches(campaign, event.condition))
  if (matching) return matching
  return [...monthlyEvents].sort((first, second) =>
    conditionDistance(campaign, first.condition) - conditionDistance(campaign, second.condition),
  )[0] ?? null
}

export function getActionAvailability(campaign: CampaignState): ActionAvailability[] {
  return sampleActions.map((action) => ({
    action,
    blockedReason: getActionBlockedReason(campaign, action),
    costSummary: [
      `${action.costs.actionPoints} PA`,
      action.costs.budget ? `${action.costs.budget} orçamento` : null,
      action.costs.politicalCapital ? `${action.costs.politicalCapital} capital político` : null,
      action.costs.administrativeCapacity ? `${action.costs.administrativeCapacity} capacidade administrativa` : null,
    ].filter((cost): cost is string => cost !== null).join(' · '),
  }))
}

export function getActionPointExplanation(campaign: CampaignState): string {
  const calculation = calculateActionPoints(campaign.country)
  const conditions = [
    ['apoio interno do Executivo', campaign.country.executiveSupport, calculation.executiveSupportBonus],
    ['apoio legislativo', campaign.country.congressSupport, calculation.legislativeSupportBonus],
    ['relação institucional com o Judiciário', campaign.country.judiciaryRelation, calculation.judiciaryRelationBonus],
    ['aprovação popular geral', campaign.country.presidentialApproval, calculation.publicApprovalBonus],
  ] as const
  const details = conditions.map(([label, value]) =>
    `${label}: ${value}% ${value > actionPointRules.supportThreshold ? '> 49% (+1)' : '≤ 49% (+0)'}`,
  )
  return `Base semanal: ${actionPointRules.weeklyBase}. ${details.join('. ')}. Novos pontos: ${calculation.newPoints} (máximo ${actionPointRules.maximumNewPerWeek}); carregados: ${campaign.turn.carriedActionPoints}; disponíveis agora: ${campaign.turn.availableActionPoints} (máximo possível ${actionPointRules.maximumNewPerWeek + actionPointRules.maximumCarryOver}).`
}

export function getActionBlockedReason(campaign: CampaignState, action: GameAction): string | null {
  if (campaign.turn.availableActionPoints < action.costs.actionPoints) {
    return `Faltam ${action.costs.actionPoints - campaign.turn.availableActionPoints} ponto(s) de ação.`
  }
  if (campaign.country.budget < action.costs.budget) return 'Orçamento insuficiente para esta ação.'
  if (campaign.country.politicalCapital < action.costs.politicalCapital) return 'Capital político insuficiente para esta ação.'
  if (campaign.country.administrativeCapacity < action.costs.administrativeCapacity) {
    return 'Capacidade administrativa insuficiente para executar esta ação.'
  }
  return null
}

function clampIndicator(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function applyIndicatorEffects(
  campaign: CampaignState,
  effects: IndicatorEffects,
  reason: string,
): { campaign: CampaignState; changes: IndicatorChange[] } {
  const country = { ...campaign.country }
  const changes: IndicatorChange[] = []

  for (const [indicator, amount] of Object.entries(effects) as Array<[keyof CountryIndicators, number]>) {
    if (!amount) continue
    const before = country[indicator]
    const after = clampIndicator(before + amount)
    if (after === before) continue
    country[indicator] = after
    changes.push({ indicator, label: indicatorLabels[indicator], amount: after - before, reason })
  }

  return { campaign: { ...campaign, country }, changes }
}

function addChanges(campaign: CampaignState, changes: IndicatorChange[]): CampaignState {
  return {
    ...campaign,
    turn: {
      ...campaign.turn,
      weeklyChanges: [...campaign.turn.weeklyChanges, ...changes],
    },
  }
}

function appendNews(campaign: CampaignState, item: NewsItem): CampaignState {
  return { ...campaign, news: [...campaign.news, item].slice(-MAX_NEWS_ENTRIES) }
}

function createNewsItem(id: string, category: string, title: string, summary: string): NewsItem {
  return { id, category, time: 'SEMANA', title, summary, tone: 'neutral' }
}

export function initializeCampaignTurn(campaign: CampaignState): CampaignState {
  const calculation = calculateActionPoints(campaign.country)
  const decision = getWeeklyDecision(campaign)
  return {
    ...campaign,
    turn: {
      ...campaign.turn,
      availableActionPoints: calculation.newPoints,
      newActionPoints: calculation.newPoints,
      carriedActionPoints: 0,
      activeDecisionId: decision.id,
    },
  }
}

export function executeAction(campaign: CampaignState, actionId: string): CampaignState | null {
  const action = sampleActions.find((candidate) => candidate.id === actionId)
  if (!action || getActionBlockedReason(campaign, action)) return null

  const paidCampaign: CampaignState = {
    ...campaign,
    country: {
      ...campaign.country,
      budget: campaign.country.budget - action.costs.budget,
      politicalCapital: campaign.country.politicalCapital - action.costs.politicalCapital,
      administrativeCapacity: campaign.country.administrativeCapacity - action.costs.administrativeCapacity,
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - action.costs.actionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, action.title],
    },
    pendingEffects: [
      ...campaign.pendingEffects,
      ...(action.pendingEffects ?? []),
    ],
  }
  const { campaign: effectedCampaign, changes } = applyIndicatorEffects(paidCampaign, action.effects, action.title)
  const resourceCosts: IndicatorChange[] = []
  const costs: Array<{ indicator: keyof CountryIndicators; amount: number }> = [
    { indicator: 'budget', amount: action.costs.budget },
    { indicator: 'politicalCapital', amount: action.costs.politicalCapital },
    { indicator: 'administrativeCapacity', amount: action.costs.administrativeCapacity },
  ]
  for (const { indicator, amount } of costs) {
    if (amount > 0) resourceCosts.push({
      indicator,
      label: indicatorLabels[indicator],
      amount: -amount,
      reason: `Custo de ${action.title}.`,
    })
  }
  const updatedCampaign = addChanges(effectedCampaign, [...resourceCosts, ...changes])
  return appendNews(updatedCampaign, createNewsItem(
    `action-${action.id}-${campaign.calendar.year}-${campaign.calendar.week}`,
    'GOVERNO',
    action.title,
    action.description,
  ))
}

export function chooseWeeklyDecision(campaign: CampaignState, optionId: string): CampaignState | null {
  if (campaign.turn.chosenDecisionOptionId) return null
  const decision = weeklyDecisions.find((candidate) => candidate.id === campaign.turn.activeDecisionId)
  const option = decision?.options.find((candidate) => candidate.id === optionId)
  if (!decision || !option) return null

  const { campaign: effectedCampaign, changes } = applyIndicatorEffects(campaign, option.effects, `Decisão: ${option.label}`)
  const updatedCampaign = addChanges({
    ...effectedCampaign,
    turn: { ...effectedCampaign.turn, chosenDecisionOptionId: option.id },
  }, changes)
  return appendNews(updatedCampaign, createNewsItem(
    `decision-${decision.id}-${campaign.calendar.year}-${campaign.calendar.week}`,
    'DECISÃO',
    `${decision.title}: ${option.label}`,
    option.description,
  ))
}

export function advanceCalendar(calendar: CampaignState['calendar']): CampaignState['calendar'] {
  if (calendar.week < calendar.weeksPerMonth) return { ...calendar, week: calendar.week + 1 }

  const monthIndex = calendarMonths.indexOf(calendar.month as typeof calendarMonths[number])
  const nextMonthIndex = monthIndex < 0 ? 0 : (monthIndex + 1) % calendarMonths.length
  const year = monthIndex === calendarMonths.length - 1 ? calendar.year + 1 : calendar.year
  return { ...calendar, month: calendarMonths[nextMonthIndex], year, week: 1 }
}

function applyContextualVariations(campaign: CampaignState): { campaign: CampaignState; changes: IndicatorChange[] } {
  const { country } = campaign
  const effects: IndicatorEffects = {}
  const reasons: Partial<Record<keyof CountryIndicators, string>> = {}

  if (country.economicOutlook >= 58) {
    effects.economicOutlook = 1
    reasons.economicOutlook = 'Atividade econômica sustentada favoreceu o indicador.'
  } else if (country.economicOutlook <= 49) {
    effects.economicOutlook = -1
    reasons.economicOutlook = 'Atividade econômica fraca pressionou o indicador.'
  }
  if (country.executiveSupport >= 54) {
    effects.executiveSupport = 1
    reasons.executiveSupport = 'Coordenação interna consistente reforçou o apoio do Executivo.'
  } else if (country.executiveSupport <= 46) {
    effects.executiveSupport = -1
    reasons.executiveSupport = 'Desalinhamento interno reduziu o apoio do Executivo.'
  }
  if (country.congressSupport >= 53) {
    effects.congressSupport = 1
    reasons.congressSupport = 'A articulação legislativa sustentou o apoio no Congresso.'
  } else if (country.congressSupport <= 43) {
    effects.congressSupport = -1
    reasons.congressSupport = 'A articulação legislativa frágil reduziu o apoio no Congresso.'
  }
  if (country.judiciaryRelation >= 54) {
    effects.institutionalStability = 1
    reasons.institutionalStability = 'Canais institucionais respeitosos contribuíram para a estabilidade.'
  } else if (country.judiciaryRelation <= 46) {
    effects.institutionalStability = -1
    reasons.institutionalStability = 'Atritos institucionais pressionaram a estabilidade.'
  }
  if (country.polarization <= 42) {
    effects.publicTrust = 1
    reasons.publicTrust = 'O ambiente público menos polarizado favoreceu a confiança.'
  } else if (country.polarization >= 53) {
    effects.publicTrust = -1
    reasons.publicTrust = 'A polarização elevada pressionou a confiança pública.'
  }

  const { campaign: variedCampaign, changes } = applyIndicatorEffects(campaign, effects, 'Variação contextual semanal')
  const explainedChanges = changes.map((change) => ({
    ...change,
    reason: reasons[change.indicator] ?? change.reason,
  }))
  return { campaign: variedCampaign, changes: explainedChanges }
}

export function calculateMonthlyEconomyBalance(campaign: CampaignState): EconomyBalance {
  const revenue = economyRules.regularRevenue
    + Math.floor(campaign.country.economicOutlook / economyRules.revenuePerEconomicBand)
  const expenses = economyRules.operatingExpense
    + Math.floor(campaign.country.administrativeCapacity / economyRules.expensePerCapacityBand)
  const closingBudget = clampIndicator(
    campaign.country.budget + revenue - expenses,
  )

  return {
    openingBudget: campaign.country.budget,
    revenue,
    expenses,
    closingBudget,
  }
}

export function getTurnDashboardData(campaign: CampaignState): TurnDashboardData {
  const decision = weeklyDecisions.find((candidate) => candidate.id === campaign.turn.activeDecisionId)
    ?? getWeeklyDecision(campaign)
  const selectedOption = decision.options.find((option) => option.id === campaign.turn.chosenDecisionOptionId)
  const monthlyEvent = getMonthlyEvent(campaign)
  return {
    actionPointExplanation: getActionPointExplanation(campaign),
    actions: getActionAvailability(campaign),
    decision,
    selectedDecisionOptionLabel: selectedOption?.label ?? null,
    monthlyEvent,
    monthlyEconomyPreview: monthlyEvent ? calculateMonthlyEconomyBalance(campaign) : null,
  }
}

function appendSummaryNews(campaign: CampaignState, summary: WeeklySummary): CampaignState {
  const totalChanges = summary.changes.length
  const shortDescription = totalChanges
    ? summary.changes.map((change) => `${change.label} ${change.amount > 0 ? '+' : ''}${change.amount}`).join(' · ')
    : 'Indicadores sem alterações nesta semana.'
  return appendNews(campaign, createNewsItem(
    `week-${summary.year}-${summary.month}-${summary.week}`,
    summary.monthlyEvent ? 'BALANÇO MENSAL' : 'HISTÓRICO',
    `Semana ${summary.week} encerrada`,
    shortDescription,
  ))
}

export function advanceWeek(campaign: CampaignState): CampaignState {
  const endingCalendar = campaign.calendar
  let workingCampaign = campaign
  const changes = [...campaign.turn.weeklyChanges]
  const events: string[] = []
  const endingDecision = weeklyDecisions.find((decision) => decision.id === campaign.turn.activeDecisionId)
  const chosenOption = endingDecision?.options.find((option) => option.id === campaign.turn.chosenDecisionOptionId)
  events.push(chosenOption
    ? `Decisão gratuita registrada: ${chosenOption.label}.`
    : 'A decisão narrativa gratuita da semana não foi selecionada.')

  if (campaign.pendingEffects.length > 0) {
    for (const pending of campaign.pendingEffects) {
      const result = applyIndicatorEffects(workingCampaign, pending.effects, pending.reason)
      workingCampaign = result.campaign
      changes.push(...result.changes)
      events.push(pending.reason)
    }
    workingCampaign = { ...workingCampaign, pendingEffects: [] }
  }

  const contextual = applyContextualVariations(workingCampaign)
  workingCampaign = contextual.campaign
  changes.push(...contextual.changes)
  events.push(...contextual.changes.map((change) => change.reason))

  const isMonthEnd = endingCalendar.week === endingCalendar.weeksPerMonth
  const monthEndEvent = isMonthEnd ? getMonthlyEvent(workingCampaign) : null
  if (monthEndEvent) {
    const result = applyIndicatorEffects(workingCampaign, monthEndEvent.effects, monthEndEvent.title)
    workingCampaign = result.campaign
    changes.push(...result.changes)
    events.push(monthEndEvent.description)
  }

  let economyBalance: EconomyBalance | null = null
  if (isMonthEnd) {
    economyBalance = calculateMonthlyEconomyBalance(workingCampaign)
    const budgetChange = economyBalance.closingBudget - economyBalance.openingBudget
    workingCampaign = {
      ...workingCampaign,
      country: { ...workingCampaign.country, budget: economyBalance.closingBudget },
    }
    if (budgetChange !== 0) {
      changes.push({
        indicator: 'budget',
        label: indicatorLabels.budget,
        amount: budgetChange,
        reason: `Receitas ordinárias +${economyBalance.revenue}; despesas operacionais -${economyBalance.expenses}.`,
      })
    }
    events.push(`Balanço mensal: receitas ${economyBalance.revenue}, despesas ${economyBalance.expenses}.`)
  }

  const carriedActionPoints = Math.min(
    workingCampaign.turn.availableActionPoints,
    actionPointRules.maximumCarryOver,
  )
  const expiredActionPoints = workingCampaign.turn.availableActionPoints - carriedActionPoints
  const nextCalendar = advanceCalendar(endingCalendar)
  const nextCalculation = calculateActionPoints(workingCampaign.country)
  const newTotal = nextCalculation.newPoints + carriedActionPoints
  const nextCampaign: CampaignState = {
    ...workingCampaign,
    calendar: nextCalendar,
    turn: {
      ...workingCampaign.turn,
      availableActionPoints: Math.min(actionPointRules.maximumNewPerWeek + actionPointRules.maximumCarryOver, newTotal),
      newActionPoints: nextCalculation.newPoints,
      carriedActionPoints,
      activeDecisionId: '',
      chosenDecisionOptionId: null,
      actionsTaken: [],
      weeklyChanges: [],
    },
    pendingEffects: [],
  }
  const nextDecision = getWeeklyDecision(nextCampaign)
  const completedCampaign = {
    ...nextCampaign,
    turn: { ...nextCampaign.turn, activeDecisionId: nextDecision.id },
  }

  const summary: WeeklySummary = {
    month: endingCalendar.month,
    year: endingCalendar.year,
    week: endingCalendar.week,
    changes,
    events,
    actions: [...campaign.turn.actionsTaken],
    carriedActionPoints,
    expiredActionPoints,
    newActionPoints: nextCalculation.newPoints,
    totalActionPoints: completedCampaign.turn.availableActionPoints,
    monthlyEvent: monthEndEvent?.title ?? null,
    economyBalance,
  }
  const withNews = appendSummaryNews({ ...completedCampaign, weeklySummary: summary }, summary)

  return withNews
}

export function dismissWeeklySummary(campaign: CampaignState): CampaignState {
  return { ...campaign, weeklySummary: null }
}
