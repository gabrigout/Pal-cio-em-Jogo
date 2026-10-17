import { sampleActions } from '../data/actions'
import { additionalDecisions } from '../data/additionalDecisions'
import { executiveDecisions } from '../data/executiveDecisions'
import { economicDecisions } from '../data/economicDecisions'
import { actionPointRules, indicatorLabels } from '../data/campaignConfig'
import { weeklyDecisions } from '../data/decisions'
import { monthlyEvents } from '../data/monthlyEvents'
import { reactionEvents, scheduledNarrativeEvents } from '../data/reactionEvents'
import { calendarMonths } from '../state/initialState'
import { applyExecutiveDecision, closeExecutiveMonth, proposeMinistryReorganization } from './executive'
import { applyEconomicDecision, closeEconomicMonth, prepareEconomicYear } from './economy'
import { advancePublicProjectsWeek, closePublicProjectsMonth } from './projects'
import { closeSocietyMonth } from './society'
import { advanceLegislatureWeek } from './legislature'
import { formatBRLMoney } from '../utils/money'
import type {
  ActionAvailability,
  ActionPointCalculation,
  CampaignState,
  CountryIndicators,
  ConsequencePreview,
  DecisionOption,
  DecisionResult,
  DecisionCondition,
  EconomyBalance,
  GameAction,
  IndicatorChange,
  IndicatorEffects,
  MonthlyEvent,
  NarrativeDecision,
  NewsItem,
  TurnDashboardData,
  WeeklySummary,
} from '../state/types'

const MAX_NEWS_ENTRIES = 8
const RECENT_DECISION_LIMIT = 3
const RECENT_EVENT_LIMIT = 3
const allWeeklyDecisions = [...weeklyDecisions, ...additionalDecisions, ...executiveDecisions, ...economicDecisions]
const allReactionEvents = [...reactionEvents, ...scheduledNarrativeEvents]

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

function executiveDecisionAvailable(campaign: CampaignState, decision: NarrativeDecision): boolean {
  const targetMinistryId = decision.options.find((option) => option.executiveEffect)?.executiveEffect?.ministryId
  return !targetMinistryId || campaign.ministries.some((ministry) => ministry.id === targetMinistryId && ministry.minister)
}

function stableWeightedChoice<T extends { id: string; weight: number }>(
  campaign: CampaignState,
  choices: T[],
  salt: string,
): T | null {
  if (choices.length === 0) return null
  const totalWeight = choices.reduce((total, choice) => total + Math.max(1, choice.weight), 0)
  const seed = `${campaign.id}:${campaign.calendar.year}:${campaign.calendar.month}:${campaign.calendar.week}:${salt}:${choices.map((choice) => choice.id).join(',')}`
  let hash = 2166136261
  for (const character of seed) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
  let ticket = hash % totalWeight
  for (const choice of choices) {
    ticket -= Math.max(1, choice.weight)
    if (ticket < 0) return choice
  }
  return choices[choices.length - 1]
}

function keepRecent(previous: string[], addedId: string, limit: number): string[] {
  return [...previous.filter((id) => id !== addedId), addedId].slice(-limit)
}

export function getWeeklyDecision(campaign: CampaignState) {
  const availableDecisions = allWeeklyDecisions.filter((decision) => executiveDecisionAvailable(campaign, decision))
  let candidates = availableDecisions.filter((decision) => conditionMatches(campaign, decision.condition))
  if (candidates.length === 0) {
    const nearest = [...availableDecisions].sort((first, second) =>
      conditionDistance(campaign, first.condition) - conditionDistance(campaign, second.condition),
    )[0]
    candidates = nearest ? [nearest] : []
  }
  const notRecent = candidates.filter((decision) => !campaign.turn.recentDecisionIds.slice(-RECENT_DECISION_LIMIT).includes(decision.id))
  if (notRecent.length) return stableWeightedChoice(campaign, notRecent, 'decisao-semanal')
  const lastDecisionId = campaign.turn.recentDecisionIds[campaign.turn.recentDecisionIds.length - 1]
  const alternatives = availableDecisions.filter((decision) => decision.id !== lastDecisionId)
  const nearestDistance = Math.min(...alternatives.map((decision) => conditionDistance(campaign, decision.condition)))
  const nearest = alternatives.filter((decision) => conditionDistance(campaign, decision.condition) === nearestDistance)
  return stableWeightedChoice(campaign, nearest.length ? nearest : alternatives, 'decisao-semanal')
}

export function getReactionEvent(campaign: CampaignState): NarrativeDecision | null {
  const scheduled = campaign.turn.scheduledNarrativeEvents.find((event) => event.weeksRemaining <= 0)
  if (scheduled) return allReactionEvents.find((event) => event.id === scheduled.eventId) ?? null

  const candidates = reactionEvents.filter((event) => conditionMatches(campaign, event.condition))
  const notRecent = candidates.filter((event) => !campaign.turn.recentReactionEventIds.slice(-RECENT_EVENT_LIMIT).includes(event.id))
  return stableWeightedChoice(campaign, notRecent, 'reacao')
}

export function getMonthlyEvent(campaign: CampaignState): MonthlyEvent | null {
  if (campaign.calendar.week !== campaign.calendar.weeksPerMonth) return null
  let candidates = monthlyEvents.filter((event) => conditionMatches(campaign, event.condition))
  if (candidates.length === 0) candidates = [...monthlyEvents].sort((first, second) =>
    conditionDistance(campaign, first.condition) - conditionDistance(campaign, second.condition),
  ).slice(0, 1)
  const notRecent = candidates.filter((event) => !campaign.turn.recentMonthlyEventIds.slice(-RECENT_EVENT_LIMIT).includes(event.id))
  if (notRecent.length) return stableWeightedChoice(campaign, notRecent, 'evento-mensal')
  const lastMonthlyEventId = campaign.turn.recentMonthlyEventIds[campaign.turn.recentMonthlyEventIds.length - 1]
  const alternatives = monthlyEvents.filter((event) => event.id !== lastMonthlyEventId)
  return stableWeightedChoice(campaign, alternatives, 'evento-mensal')
}

export function getActionAvailability(campaign: CampaignState): ActionAvailability[] {
  return sampleActions.map((action) => ({
    action,
    blockedReason: getActionBlockedReason(campaign, action),
    costSummary: [
      `${action.costs.actionPoints} PA`,
      action.costs.budget ? formatBRLMoney(action.costs.budget) : null,
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
  if (action.id === 'propose-ministry-reorganization'
    && campaign.executiveProposals.includes('Reorganização da estrutura ministerial')) {
    return 'A proposta já foi registrada e aguarda a fase do Legislativo.'
  }
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
    const after = indicator === 'budget' ? Math.max(0, before + amount) : clampIndicator(before + amount)
    if (after === before) continue
    country[indicator] = after
    changes.push({ indicator, label: indicatorLabels[indicator], amount: after - before, reason })
  }

  const synchronizedCampaign = country.budget === campaign.economy.availableFunds
    ? { ...campaign, country }
    : { ...campaign, country, economy: { ...campaign.economy, availableFunds: country.budget } }
  return { campaign: synchronizedCampaign, changes }
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
  const decision = getWeeklyDecision(campaign) ?? allWeeklyDecisions[0]
  const activeReactionEvent = campaign.turn.activeReactionEventId
    ? allReactionEvents.find((event) => event.id === campaign.turn.activeReactionEventId) ?? null
    : getReactionEvent(campaign)
  const monthlyEvent = campaign.calendar.week === campaign.calendar.weeksPerMonth
    ? getMonthlyEvent(campaign)
    : null
  const alreadyInitialized = Boolean(campaign.turn.activeDecisionId)
  return {
    ...campaign,
    turn: {
      ...campaign.turn,
      availableActionPoints: alreadyInitialized ? campaign.turn.availableActionPoints : calculation.newPoints,
      newActionPoints: alreadyInitialized ? campaign.turn.newActionPoints : calculation.newPoints,
      carriedActionPoints: alreadyInitialized ? campaign.turn.carriedActionPoints : 0,
      activeDecisionId: campaign.turn.activeDecisionId || decision.id,
      activeReactionEventId: campaign.turn.activeReactionEventId ?? activeReactionEvent?.id ?? null,
      activeMonthlyEventId: campaign.turn.activeMonthlyEventId ?? monthlyEvent?.id ?? null,
    },
  }
}

export function executeAction(campaign: CampaignState, actionId: string): CampaignState | null {
  const action = sampleActions.find((candidate) => candidate.id === actionId)
  if (!action || getActionBlockedReason(campaign, action)) return null
  if (action.id === 'propose-ministry-reorganization') return proposeMinistryReorganization(campaign)

  const paidCampaign: CampaignState = {
    ...campaign,
    economy: {
      ...campaign.economy,
      availableFunds: campaign.economy.availableFunds - action.costs.budget,
    },
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

export function getOptionConsequences(option: DecisionOption): ConsequencePreview[] {
  return Object.entries(option.effects)
    .filter((entry): entry is [keyof CountryIndicators, number] => typeof entry[1] === 'number' && entry[1] !== 0)
    .map(([indicator, amount]) => ({
      label: indicatorLabels[indicator],
      amount,
      direction: amount > 0 ? 'up' as const : 'down' as const,
    }))
    .slice(0, 3)
}

function findDecisionForCategory(campaign: CampaignState, category: DecisionResult['category']): NarrativeDecision | MonthlyEvent | undefined {
  if (category === 'decisão') return allWeeklyDecisions.find((decision) => decision.id === campaign.turn.activeDecisionId)
  if (category === 'reação') return allReactionEvents.find((event) => event.id === campaign.turn.activeReactionEventId)
  return monthlyEvents.find((event) => event.id === campaign.turn.activeMonthlyEventId)
}

export function chooseNarrativeOption(
  campaign: CampaignState,
  category: DecisionResult['category'],
  optionId: string,
): CampaignState | null {
  const alreadyChosen = category === 'decisão'
    ? campaign.turn.chosenDecisionOptionId
    : category === 'reação'
      ? campaign.turn.chosenReactionOptionId
      : campaign.turn.chosenMonthlyOptionId
  if (alreadyChosen) return null

  const decision = findDecisionForCategory(campaign, category)
  const option = decision?.options.find((candidate) => candidate.id === optionId)
  if (!decision || !option) return null

  const executiveCampaign = option.executiveEffect
    ? applyExecutiveDecision(campaign, option.executiveEffect)
    : campaign
  if (!executiveCampaign) return null
  const economicCampaign = option.economicEffect
    ? applyEconomicDecision(executiveCampaign, option.economicEffect)
    : executiveCampaign
  if (!economicCampaign) return null
  const { campaign: effectedCampaign, changes } = applyIndicatorEffects(
    economicCampaign,
    option.effects,
    `${decision.title}: ${option.label}`,
  )
  let scheduledEventTitle: string | null = null
  let scheduledNarrativeEvents = [...effectedCampaign.turn.scheduledNarrativeEvents]
  if (option.schedule && option.schedule.delayWeeks > 0) {
    const scheduledEventId = option.schedule.eventId
    const scheduledIndex = scheduledNarrativeEvents.findIndex((event) => event.eventId === scheduledEventId)
    if (scheduledIndex >= 0) {
      scheduledNarrativeEvents = scheduledNarrativeEvents.map((event, index) => index === scheduledIndex
        ? { ...event, weeksRemaining: Math.min(event.weeksRemaining, option.schedule?.delayWeeks ?? event.weeksRemaining) }
        : event)
    } else {
      scheduledNarrativeEvents = [...scheduledNarrativeEvents, {
        eventId: scheduledEventId,
        weeksRemaining: option.schedule.delayWeeks,
        scheduledBy: decision.title,
      }]
    }
    scheduledEventTitle = allReactionEvents.find((event) => event.id === scheduledEventId)?.title ?? null
  }

  const decisionResult: DecisionResult = {
    category,
    title: decision.title,
    choice: option.label,
    message: option.resultText ?? option.description,
    reasons: changes.map((change) => `${change.label}: ${change.amount > 0 ? '+' : ''}${change.amount}. ${change.reason}`),
    changes,
    scheduledEventTitle,
  }
  const turn = { ...effectedCampaign.turn, scheduledNarrativeEvents, decisionResult }
  if (category === 'decisão') {
    turn.chosenDecisionOptionId = option.id
    turn.recentDecisionIds = keepRecent(turn.recentDecisionIds, decision.id, RECENT_DECISION_LIMIT)
  } else if (category === 'reação') {
    turn.chosenReactionOptionId = option.id
    turn.recentReactionEventIds = keepRecent(turn.recentReactionEventIds, decision.id, RECENT_EVENT_LIMIT)
    const scheduled = turn.scheduledNarrativeEvents.find((event) => event.eventId === decision.id && event.weeksRemaining <= 0)
    if (scheduled) turn.scheduledNarrativeEvents = turn.scheduledNarrativeEvents.filter((event) => event !== scheduled)
  } else {
    turn.chosenMonthlyOptionId = option.id
    turn.recentMonthlyEventIds = keepRecent(turn.recentMonthlyEventIds, decision.id, RECENT_EVENT_LIMIT)
  }

  const updatedCampaign = addChanges({ ...effectedCampaign, turn }, changes)
  return appendNews(updatedCampaign, createNewsItem(
    `card-${category}-${decision.id}-${campaign.calendar.year}-${campaign.calendar.week}`,
    category === 'decisão' ? 'DECISÃO' : category === 'reação' ? 'REAÇÃO' : 'EVENTO MENSAL',
    `${decision.title}: ${option.label}`,
    option.description,
  ))
}

export function chooseWeeklyDecision(campaign: CampaignState, optionId: string): CampaignState | null {
  return chooseNarrativeOption(campaign, 'decisão', optionId)
}

export function dismissDecisionResult(campaign: CampaignState): CampaignState {
  return { ...campaign, turn: { ...campaign.turn, decisionResult: null } }
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
    reason: change.indicator in reasons
      ? reasons[change.indicator as keyof CountryIndicators] ?? change.reason
      : change.reason,
  }))
  return { campaign: variedCampaign, changes: explainedChanges }
}

export function calculateMonthlyEconomyBalance(campaign: CampaignState): EconomyBalance {
  const executiveCampaign = closeExecutiveMonth(campaign).campaign
  const economicClosure = closeEconomicMonth(executiveCampaign).campaign
  return {
    openingBudget: campaign.country.budget,
    revenue: economicClosure.economy.indicators.publicRevenue,
    expenses: economicClosure.economy.indicators.publicExpenses,
    closingBudget: economicClosure.economy.availableFunds,
  }
}

export function getTurnDashboardData(campaign: CampaignState): TurnDashboardData {
  const decision = allWeeklyDecisions.find((candidate) => candidate.id === campaign.turn.activeDecisionId)
    ?? getWeeklyDecision(campaign)
    ?? allWeeklyDecisions[0]
  const selectedOption = decision.options.find((option) => option.id === campaign.turn.chosenDecisionOptionId)
  const reactionEvent = allReactionEvents.find((event) => event.id === campaign.turn.activeReactionEventId) ?? null
  const selectedReactionOption = reactionEvent?.options.find((option) => option.id === campaign.turn.chosenReactionOptionId)
  const monthlyEvent = monthlyEvents.find((event) => event.id === campaign.turn.activeMonthlyEventId) ?? null
  const selectedMonthlyOption = monthlyEvent?.options.find((option) => option.id === campaign.turn.chosenMonthlyOptionId)
  return {
    actionPointExplanation: getActionPointExplanation(campaign),
    actions: getActionAvailability(campaign),
    decision,
    selectedDecisionOptionLabel: selectedOption?.label ?? null,
    reactionEvent,
    selectedReactionOptionLabel: selectedReactionOption?.label ?? null,
    monthlyEvent,
    selectedMonthlyOptionLabel: selectedMonthlyOption?.label ?? null,
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
  const endingDecision = allWeeklyDecisions.find((decision) => decision.id === campaign.turn.activeDecisionId)
  const chosenOption = endingDecision?.options.find((option) => option.id === campaign.turn.chosenDecisionOptionId)
  events.push(chosenOption
    ? `Decisão gratuita registrada: ${chosenOption.label}.`
    : 'A decisão narrativa gratuita da semana não foi selecionada.')

  const endingReaction = allReactionEvents.find((event) => event.id === campaign.turn.activeReactionEventId)
  if (endingReaction && !campaign.turn.chosenReactionOptionId) {
    events.push(`A reação “${endingReaction.title}” não foi respondida nesta semana.`)
  }
  const endingMonthlyEvent = monthlyEvents.find((event) => event.id === campaign.turn.activeMonthlyEventId)
  if (endingMonthlyEvent && !campaign.turn.chosenMonthlyOptionId) {
    events.push(`O evento mensal “${endingMonthlyEvent.title}” não foi escolhido.`)
  }

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
  const projectWeek = advancePublicProjectsWeek(workingCampaign)
  workingCampaign = projectWeek.campaign
  changes.push(...projectWeek.changes)
  events.push(...projectWeek.events)

  const legislatureWeek = advanceLegislatureWeek(workingCampaign, endingCalendar)
  workingCampaign = legislatureWeek.campaign
  events.push(...legislatureWeek.events)

  const isMonthEnd = endingCalendar.week === endingCalendar.weeksPerMonth
  const monthEndEvent = isMonthEnd ? endingMonthlyEvent ?? null : null
  if (monthEndEvent && campaign.turn.chosenMonthlyOptionId) events.push(monthEndEvent.description)

  let economyBalance: EconomyBalance | null = null
  let executiveReport: string[] = []
  let economicReport: string[] = []
  if (isMonthEnd) {
    const openingBudget = workingCampaign.country.budget
    const executiveClose = closeExecutiveMonth(workingCampaign)
    workingCampaign = executiveClose.campaign
    executiveReport = executiveClose.report
    changes.push(...executiveClose.changes)
    const projectClose = closePublicProjectsMonth(workingCampaign)
    workingCampaign = projectClose.campaign
    changes.push(...projectClose.changes)
    events.push(...projectClose.events)
    const economicClose = closeEconomicMonth(workingCampaign)
    workingCampaign = economicClose.campaign
    changes.push(...economicClose.changes)
    const societyClose = closeSocietyMonth(workingCampaign)
    workingCampaign = societyClose.campaign
    changes.push(...societyClose.changes)
    events.push(...societyClose.events)
    economicReport = [...projectClose.report, ...economicClose.report, ...societyClose.report]
    const nextMonthIndex = calendarMonths.findIndex((month) => month === endingCalendar.month) + 1
    const nextYear = nextMonthIndex >= calendarMonths.length ? endingCalendar.year + 1 : endingCalendar.year
    if (nextMonthIndex >= calendarMonths.length) {
      workingCampaign = prepareEconomicYear(workingCampaign, nextYear)
    }
    economyBalance = {
      openingBudget,
      revenue: economicClose.campaign.economy.indicators.publicRevenue,
      expenses: economicClose.campaign.economy.indicators.publicExpenses,
      closingBudget: economicClose.campaign.economy.availableFunds,
    }
    const budgetChange = economyBalance.closingBudget - openingBudget
    if (budgetChange !== 0) {
      changes.push({
        indicator: 'budget',
        label: indicatorLabels.budget,
        amount: budgetChange,
        reason: `Receitas públicas +${economyBalance.revenue}; despesas, juros e execução ministerial -${economyBalance.expenses}.`,
      })
    }
    events.push(`Balanço mensal: receitas ${formatBRLMoney(economyBalance.revenue)}, despesas ${formatBRLMoney(economyBalance.expenses)}.`)
  }

  const carriedActionPoints = Math.min(
    workingCampaign.turn.availableActionPoints,
    actionPointRules.maximumCarryOver,
  )
  const expiredActionPoints = workingCampaign.turn.availableActionPoints - carriedActionPoints
  const nextCalendar = advanceCalendar(endingCalendar)
  const nextCalculation = calculateActionPoints(workingCampaign.country)
  const newTotal = nextCalculation.newPoints + carriedActionPoints
  const advancedSchedules = workingCampaign.turn.scheduledNarrativeEvents.map((event) => ({
    ...event,
    weeksRemaining: event.weeksRemaining - 1,
  }))
  const dueSchedule = advancedSchedules.find((event) => event.weeksRemaining <= 0)
  let remainingSchedules = advancedSchedules.filter((event) => event !== dueSchedule)
  const currentDecisionHistory = endingDecision
    ? keepRecent(workingCampaign.turn.recentDecisionIds, endingDecision.id, RECENT_DECISION_LIMIT)
    : workingCampaign.turn.recentDecisionIds
  const currentReactionHistory = endingReaction
    ? keepRecent(workingCampaign.turn.recentReactionEventIds, endingReaction.id, RECENT_EVENT_LIMIT)
    : [...workingCampaign.turn.recentReactionEventIds]
  const currentMonthlyHistory = endingMonthlyEvent
    ? keepRecent(workingCampaign.turn.recentMonthlyEventIds, endingMonthlyEvent.id, RECENT_EVENT_LIMIT)
    : workingCampaign.turn.recentMonthlyEventIds
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
      activeReactionEventId: null,
      chosenReactionOptionId: null,
      activeMonthlyEventId: null,
      chosenMonthlyOptionId: null,
      recentDecisionIds: currentDecisionHistory,
      recentReactionEventIds: currentReactionHistory,
      recentMonthlyEventIds: currentMonthlyHistory,
      scheduledNarrativeEvents: remainingSchedules,
      decisionResult: null,
      actionsTaken: [],
      weeklyChanges: [],
    },
    pendingEffects: [],
  }
  const nextDecision = getWeeklyDecision(nextCampaign) ?? allWeeklyDecisions[0]
  const nextReactionEvent = dueSchedule
    ? allReactionEvents.find((event) => event.id === dueSchedule.eventId) ?? null
    : getReactionEvent(nextCampaign)
  if (dueSchedule && nextReactionEvent) {
    currentReactionHistory.splice(0, currentReactionHistory.length, ...keepRecent(currentReactionHistory, nextReactionEvent.id, RECENT_EVENT_LIMIT))
    remainingSchedules = remainingSchedules.map((event) => event.weeksRemaining <= 0
      ? { ...event, weeksRemaining: 1 }
      : event)
  }
  const nextMonthlyEvent = nextCalendar.week === nextCalendar.weeksPerMonth
    ? getMonthlyEvent(nextCampaign)
    : null
  const completedCampaign = {
    ...nextCampaign,
    turn: {
      ...nextCampaign.turn,
      activeDecisionId: nextDecision.id,
      activeReactionEventId: nextReactionEvent?.id ?? null,
      activeMonthlyEventId: nextMonthlyEvent?.id ?? null,
      recentReactionEventIds: currentReactionHistory,
      recentMonthlyEventIds: nextMonthlyEvent
        ? keepRecent(currentMonthlyHistory, nextMonthlyEvent.id, RECENT_EVENT_LIMIT)
        : currentMonthlyHistory,
      scheduledNarrativeEvents: remainingSchedules,
    },
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
    executiveReport,
    economicReport,
  }
  const withNews = appendSummaryNews({ ...completedCampaign, weeklySummary: summary }, summary)

  return withNews
}

export function dismissWeeklySummary(campaign: CampaignState): CampaignState {
  return { ...campaign, weeklySummary: null }
}
