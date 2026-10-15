import { pressureGroupCatalog, socialClassCatalog, societyRules } from '../data/society'
import { indicatorLabels } from '../data/campaignConfig'
import { formatBRLMoney } from '../utils/money'
import type {
  CampaignState, CountryIndicators, IndicatorChange, NewsItem, PressureGroupId,
  SocietyActionType, SocietyHistoryEntry, SocietyState, SocialClassId,
} from '../state/types'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const round1 = (value: number) => Math.round(value * 10) / 10
const monthKey = (campaign: Pick<CampaignState, 'calendar'>) => campaign.calendar.year + '-' + campaign.calendar.month
const dateLabel = (campaign: Pick<CampaignState, 'calendar'>) => campaign.calendar.month + ' de ' + campaign.calendar.year

function stableRoll(seedText: string): number {
  let hash = 2166136261
  for (const character of seedText) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
  return hash % 100
}

function seededOffset(seedText: string, range: number): number {
  return stableRoll(seedText) % (range * 2 + 1) - range
}

export function createInitialSocietyState(campaign: Pick<CampaignState, 'id' | 'orientation' | 'country'>): SocietyState {
  const classes = socialClassCatalog.map((definition) => {
    const approval = clamp(campaign.country.presidentialApproval
      + definition.orientationAdjustment[campaign.orientation]
      + seededOffset(campaign.id + ':class:' + definition.id, 3), 25, 78)
    const economicSecurity = clamp(62 + (campaign.country.economicOutlook - 50) * 0.45
      - Math.max(0, campaign.country.polarization - 50) * 0.15
      + seededOffset(campaign.id + ':security:' + definition.id, 4), 20, 85)
    return {
      id: definition.id, name: definition.name, approval, economicSecurity,
      priorities: [...definition.priorities], lastChange: 0,
      latestReason: 'Ponto de partida da campanha; prioridades e aprovação variam por classe.',
    }
  })
  const groups = pressureGroupCatalog.map((definition) => {
    const approval = clamp(campaign.country.presidentialApproval
      + definition.orientationAdjustment[campaign.orientation]
      + seededOffset(campaign.id + ':group:' + definition.id, 4), 25, 80)
    const pressure = clamp(46 + (55 - approval) * 0.45 + (definition.influence - 55) * 0.18
      + seededOffset(campaign.id + ':pressure:' + definition.id, 5), 18, 65)
    return {
      id: definition.id, name: definition.name, category: definition.category, approval,
      influence: definition.influence, pressure, sectorIds: [...definition.sectorIds],
      beneficiaryClass: definition.beneficiaryClass, interests: [...definition.interests],
      demand: definition.demand, lastChange: 0,
      latestReason: 'O grupo acompanha a agenda e ainda não apresentou uma cobrança extraordinária.',
    }
  })
  return { classes, groups, history: [], lastReviewKey: null }
}

function addCountryEffects(
  country: CountryIndicators,
  requested: Partial<Record<keyof CountryIndicators, number>>,
  reason: string,
): { country: CountryIndicators; changes: IndicatorChange[] } {
  const next = { ...country }
  const changes: IndicatorChange[] = []
  for (const [indicator, amount] of Object.entries(requested) as Array<[keyof CountryIndicators, number]>) {
    if (!amount) continue
    const before = next[indicator]
    const after = indicator === 'budget' ? Math.max(0, before + amount) : clamp(before + amount, 0, 100)
    if (before === after) continue
    next[indicator] = after
    changes.push({ indicator, label: indicatorLabels[indicator], amount: round1(after - before), reason })
  }
  return { country: next, changes }
}

function appendNews(campaign: CampaignState, id: string, title: string, summary: string, tone: NewsItem['tone']): CampaignState {
  const news: NewsItem = {
    id, category: 'SOCIEDADE', time: campaign.calendar.month + ' ' + campaign.calendar.year, title, summary, tone,
  }
  return { ...campaign, news: [...campaign.news, news].slice(-8) }
}

function appendHistory(history: SocietyHistoryEntry[], entry: SocietyHistoryEntry): SocietyHistoryEntry[] {
  return [...history, entry].slice(-societyRules.monthlyHistoryLimit)
}

export function getSocietyActionAvailability(
  campaign: CampaignState,
  groupId: PressureGroupId,
  action: SocietyActionType,
): { allowed: boolean; reason: string | null } {
  const group = campaign.society.groups.find((item) => item.id === groupId)
  if (!group) return { allowed: false, reason: 'Grupo social não encontrado.' }
  const isAgreement = action === 'agreement'
  const points = isAgreement ? societyRules.agreementActionPoints : societyRules.dialogueActionPoints
  const capital = isAgreement ? societyRules.agreementPoliticalCapital : societyRules.dialoguePoliticalCapital
  const capacity = isAgreement ? societyRules.agreementAdministrativeCapacity : societyRules.dialogueAdministrativeCapacity
  if (campaign.turn.availableActionPoints < points) return { allowed: false, reason: 'Pontos de ação insuficientes.' }
  if (campaign.country.politicalCapital < capital) return { allowed: false, reason: 'Capital político insuficiente.' }
  if (campaign.country.administrativeCapacity < capacity) return { allowed: false, reason: 'Capacidade administrativa insuficiente.' }
  if (isAgreement) {
    if (campaign.economy.availableFunds < societyRules.agreementBudget) {
      return { allowed: false, reason: 'Caixa insuficiente para o compromisso de ' + formatBRLMoney(societyRules.agreementBudget) + '.' }
    }
    const sector = campaign.economy.annualBudget.sectors.find((item) => item.id === group.sectorIds[0])
    if (!sector || sector.annualAllocation - sector.executedThisYear < societyRules.agreementBudget) {
      return { allowed: false, reason: 'O saldo anual do setor não cobre o compromisso de ' + formatBRLMoney(societyRules.agreementBudget) + '.' }
    }
  }
  return { allowed: true, reason: null }
}

export function applySocietyAction(
  campaign: CampaignState,
  groupId: PressureGroupId,
  action: SocietyActionType,
): CampaignState | null {
  if (!getSocietyActionAvailability(campaign, groupId, action).allowed) return null
  const group = campaign.society.groups.find((item) => item.id === groupId)
  if (!group) return null

  const isAgreement = action === 'agreement'
  const moneyCost = isAgreement ? societyRules.agreementBudget : 0
  const sectorId = group.sectorIds[0]
  const economy = isAgreement ? {
    ...campaign.economy,
    availableFunds: round1(campaign.economy.availableFunds - moneyCost),
    projectExpensesPaidThisMonth: round1(campaign.economy.projectExpensesPaidThisMonth + moneyCost),
    annualBudget: {
      ...campaign.economy.annualBudget,
      sectors: campaign.economy.annualBudget.sectors.map((sector) => sector.id === sectorId
        ? { ...sector, executedThisYear: round1(sector.executedThisYear + moneyCost) }
        : sector),
    },
  } : campaign.economy

  const reason = isAgreement
    ? 'O governo assumiu um compromisso de ' + formatBRLMoney(moneyCost) + ' na área de ' + group.category.toLowerCase() + '. O compromisso consome caixa e dotação; a entrega ainda precisa acontecer.'
    : 'O governo abriu uma mesa de diálogo e registrou as prioridades do grupo. O diálogo não garante apoio permanente.'
  const title = isAgreement ? 'Compromisso setorial negociado' : 'Mesa de diálogo aberta'
  const nextGroup = {
    ...group,
    approval: clamp(group.approval + (isAgreement ? 8 : 4), 0, 100),
    pressure: clamp(group.pressure - (isAgreement ? 18 : 12), 0, 100),
    lastChange: isAgreement ? Math.min(8, 100 - group.approval) : Math.min(4, 100 - group.approval),
    latestReason: reason,
  }
  const society: SocietyState = {
    ...campaign.society,
    groups: campaign.society.groups.map((item) => item.id === groupId ? nextGroup : item),
    classes: campaign.society.classes.map((item) => item.id === group.beneficiaryClass && isAgreement
      ? { ...item, approval: clamp(item.approval + 2, 0, 100), lastChange: Math.min(2, 100 - item.approval), latestReason: 'O compromisso negociado atende a uma prioridade da classe.' }
      : item),
    history: appendHistory(campaign.society.history, {
      id: 'society-action-' + campaign.id + '-' + campaign.calendar.year + '-' + campaign.calendar.month + '-' + campaign.calendar.week + '-' + groupId + '-' + action,
      dateLabel: dateLabel(campaign), kind: isAgreement ? 'agreement' : 'dialogue',
      title: title + ': ' + group.name, summary: reason, tone: isAgreement ? 'positive' : 'neutral',
    }),
  }
  const countryResult = addCountryEffects(campaign.country, isAgreement
    ? { presidentialApproval: 1, publicTrust: 1 }
    : { publicTrust: 1, polarization: -1 }, title + ': ' + group.name + '.')
  const points = isAgreement ? societyRules.agreementActionPoints : societyRules.dialogueActionPoints
  const capital = isAgreement ? societyRules.agreementPoliticalCapital : societyRules.dialoguePoliticalCapital
  const capacity = isAgreement ? societyRules.agreementAdministrativeCapacity : societyRules.dialogueAdministrativeCapacity
  const next: CampaignState = {
    ...campaign, society, economy,
    country: { ...countryResult.country, budget: economy.availableFunds },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - points,
      actionsTaken: [...campaign.turn.actionsTaken, title + ': ' + group.name],
      weeklyChanges: [
        ...campaign.turn.weeklyChanges,
        ...(isAgreement ? [{ indicator: 'budget' as const, label: indicatorLabels.budget, amount: -moneyCost, reason }] : []),
        { indicator: 'politicalCapital', label: indicatorLabels.politicalCapital, amount: -capital, reason },
        { indicator: 'administrativeCapacity', label: indicatorLabels.administrativeCapacity, amount: -capacity, reason },
        ...countryResult.changes,
      ],
    },
  }
  return appendNews(next, 'society-' + campaign.calendar.year + '-' + campaign.calendar.month + '-' + campaign.calendar.week + '-' + groupId + '-' + action,
    title + ': ' + group.name, reason, isAgreement ? 'positive' : 'neutral')
}

function sectorIdsForClass(id: SocialClassId): string[] {
  return socialClassCatalog.find((item) => item.id === id)?.sectorIds ?? []
}

function projectBenefitsForSectors(campaign: CampaignState, sectorIds: string[], month: string, year: number): number {
  return campaign.projects.filter((project) => project.status === 'completed' && project.outcomesApplied
    && sectorIds.includes(project.sectorId) && typeof project.completedAt === 'string'
    && project.completedAt.includes('· ' + month + ' de ' + year)).length
}

export function closeSocietyMonth(campaign: CampaignState): {
  campaign: CampaignState; report: string[]; events: string[]; changes: IndicatorChange[]
} {
  const key = monthKey(campaign)
  if (campaign.society.lastReviewKey === key) return { campaign, report: [], events: [], changes: [] }

  const current = campaign.economy.indicators
  const snapshots = campaign.economy.history
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2].indicators : current
  const monthProjects = campaign.projects.filter((project) => project.status === 'completed' && project.outcomesApplied
    && typeof project.completedAt === 'string' && project.completedAt.includes('· ' + campaign.calendar.month + ' de ' + campaign.calendar.year))
  let country = { ...campaign.country }
  let economy = { ...campaign.economy, pressures: { ...campaign.economy.pressures, notes: [...campaign.economy.pressures.notes] } }
  const report: string[] = []
  const events: string[] = []
  const changes: IndicatorChange[] = []
  let history = [...campaign.society.history]
  const monthlyNews: Array<{ id: string; title: string; summary: string; tone: NewsItem['tone'] }> = []

  const classes = campaign.society.classes.map((socialClass) => {
    let approvalDelta = 0
    const reasons: string[] = []
    const benefits = projectBenefitsForSectors({ ...campaign, projects: monthProjects }, sectorIdsForClass(socialClass.id), campaign.calendar.month, campaign.calendar.year)
    if (current.inflation >= 6) {
      approvalDelta -= socialClass.id === 'low-income' ? 2 : 1
      reasons.push('inflação elevada pressiona o poder de compra')
    } else if (current.inflation <= 4) {
      approvalDelta += 1
      reasons.push('inflação mais baixa alivia parte da pressão')
    }
    if (current.unemployment >= 10) {
      approvalDelta -= socialClass.id === 'low-income' || socialClass.id === 'middle-class' ? 2 : 1
      reasons.push('desemprego elevado reduz segurança econômica')
    } else if (current.unemployment <= 7) {
      approvalDelta += 1
      reasons.push('mercado de trabalho mais favorável')
    }
    if (current.growth > 1.5 && ['wealthy-business', 'millionaires', 'billionaires'].includes(socialClass.id)) {
      approvalDelta += 1
      reasons.push('atividade econômica favorece perspectivas de investimento')
    }
    if (current.fiscalBalance < 0 && current.publicDebt / Math.max(1, current.publicRevenue * 12) > 3
      && ['millionaires', 'billionaires'].includes(socialClass.id)) {
      approvalDelta -= 1
      reasons.push('risco fiscal aumenta incerteza')
    }
    if (benefits > 0) {
      approvalDelta += Math.min(3, benefits)
      reasons.push('projetos de setores prioritários avançaram até a avaliação de resultados')
    }
    if (country.publicTrust < 40) {
      approvalDelta -= 1
      reasons.push('baixa confiança institucional aumenta insatisfação')
    }
    const approval = clamp(socialClass.approval + approvalDelta, 0, 100)
    const securityDelta = clamp((current.growth - previous.growth) * 1.8
      - Math.max(0, current.inflation - 4) * 0.7 - Math.max(0, current.unemployment - 7) * 0.6
      + benefits * 2, -6, 6)
    const economicSecurity = clamp(socialClass.economicSecurity + securityDelta, 0, 100)
    const latestReason = reasons.length ? reasons.slice(0, 2).join('; ') + '.' : 'A classe acompanha o cenário econômico e a entrega dos serviços.'
    const lastChange = approval - socialClass.approval
    if (lastChange !== 0) history = appendHistory(history, {
      id: 'class-' + key + '-' + socialClass.id, dateLabel: dateLabel(campaign), kind: 'review',
      title: socialClass.name + ': aprovação ' + (lastChange > 0 ? 'subiu' : 'caiu'),
      summary: latestReason + ' Variação de ' + lastChange + ' ponto(s).',
      tone: lastChange > 0 ? 'positive' : 'warning',
    })
    report.push(socialClass.name + ': aprovação ' + approval + '/100, segurança econômica ' + economicSecurity + '/100.')
    return { ...socialClass, approval, economicSecurity, lastChange, latestReason }
  })

  const groups = campaign.society.groups.map((group) => {
    const benefits = projectBenefitsForSectors({ ...campaign, projects: monthProjects }, group.sectorIds, campaign.calendar.month, campaign.calendar.year)
    let approvalDelta = 0
    let pressureDelta = 0
    const reasons: string[] = []
    if (current.unemployment >= 10 && ['unions', 'students', 'public-employees'].includes(group.id)) {
      approvalDelta -= 2; pressureDelta += 7; reasons.push('desemprego elevado aumenta cobrança por emprego e renda')
    }
    if (current.inflation >= 6 && ['unions', 'business-entities', 'rural-producers', 'health-communities'].includes(group.id)) {
      approvalDelta -= 1; pressureDelta += 4; reasons.push('inflação pressiona custos e orçamento')
    }
    if (current.growth < 0 && ['business-entities', 'rural-producers'].includes(group.id)) {
      approvalDelta -= 2; pressureDelta += 5; reasons.push('atividade econômica fraca afeta produção e investimento')
    }
    if (group.id === 'public-employees' && economy.deferredPayments > 0) {
      approvalDelta -= 4; pressureDelta += 12; reasons.push('há compromissos públicos adiados')
    }
    if (benefits > 0) {
      approvalDelta += Math.min(4, benefits * 2)
      pressureDelta -= Math.min(10, benefits * 4)
      reasons.push('entregas recentes atenderam prioridades do grupo')
    }
    if (group.id === 'business-entities' && economy.taxes.some((tax) => tax.id === 'corporate' && tax.rate > 14)) {
      approvalDelta -= 1; pressureDelta += 2; reasons.push('a contribuição setorial está elevada')
    }
    let approval = clamp(group.approval + approvalDelta, 0, 100)
    let pressure = clamp(group.pressure + pressureDelta + Math.max(0, -approvalDelta) * 1.2 - Math.max(0, approvalDelta) * 0.9, 0, 100)
    let latestReason = reasons.length ? reasons.slice(0, 2).join('; ') + '.' : 'Acompanhamento regular da agenda e dos indicadores.'
    let kind: SocietyHistoryEntry['kind'] = 'review'
    let title = group.name + ': revisão mensal'
    const roll = stableRoll(campaign.id + ':society:' + group.id + ':' + key)
    const protestChance = clamp(pressure - 55 + group.influence * 0.18, 0, 60)
    if (pressure >= societyRules.protestThreshold && roll < protestChance) {
      const isStrike = group.id === 'unions' || group.id === 'public-employees'
      pressure = clamp(pressure - (isStrike ? 17 : 14), 0, 100)
      approval = clamp(approval - 1, 0, 100)
      latestReason = isStrike
        ? 'A pressão virou paralisação parcial e negociação pública; isso não implica culpa individual.'
        : 'A pressão resultou em manifestação e cobrança pública; mobilização não determina culpa individual.'
      kind = isStrike ? 'strike' : 'protest'
      title = (isStrike ? 'Paralisação e negociação: ' : 'Manifestação: ') + group.name
      const effects = addCountryEffects(country, { presidentialApproval: -1, publicTrust: -1, polarization: 1 }, latestReason)
      country = effects.country
      changes.push(...effects.changes)
      if (isStrike) {
        economy = { ...economy, pressures: { ...economy.pressures, growth: economy.pressures.growth - 0.1,
          expenses: economy.pressures.expenses + 8,
          notes: [...economy.pressures.notes, 'Paralisação de ' + group.name + ' elevou custos previstos; execução segue limitada por caixa e orçamento.'].slice(-12) } }
      }
      events.push(title + '.')
      monthlyNews.push({ id: 'society-' + key + '-' + group.id, title, summary: latestReason, tone: 'warning' })
    } else if (approval >= 75 && pressure <= 28 && roll >= 92) {
      approval = clamp(approval + 1, 0, 100)
      pressure = clamp(pressure - 3, 0, 100)
      latestReason = 'A organização reconheceu avanços recentes; o apoio não representa compromisso permanente.'
      kind = 'endorsement'
      title = 'Manifestação favorável: ' + group.name
      const effects = addCountryEffects(country, { presidentialApproval: 1, publicTrust: 1 }, latestReason)
      country = effects.country
      changes.push(...effects.changes)
      events.push(title + '.')
      monthlyNews.push({ id: 'society-' + key + '-' + group.id + '-support', title, summary: latestReason, tone: 'positive' })
    }
    const lastChange = approval - group.approval
    if (lastChange !== 0 || pressureDelta !== 0 || kind !== 'review') history = appendHistory(history, {
      id: 'group-' + key + '-' + group.id, dateLabel: dateLabel(campaign), kind, title,
      summary: latestReason + ' Aprovação ' + (lastChange >= 0 ? '+' : '') + lastChange + '; pressão ' + Math.round(pressure) + '.',
      tone: kind === 'endorsement' ? 'positive' : kind === 'review' ? 'neutral' : 'warning',
    })
    report.push(group.name + ': aprovação ' + approval + '/100, pressão ' + Math.round(pressure) + '/100.')
    return { ...group, approval, pressure, lastChange, latestReason }
  })

  const averageClassChange = classes.reduce((total, item) => total + item.lastChange, 0) / Math.max(1, classes.length)
  const aggregateApproval = averageClassChange >= 1.5 ? 1 : averageClassChange <= -1.5 ? -1 : 0
  if (aggregateApproval !== 0) {
    const result = addCountryEffects(country, { presidentialApproval: aggregateApproval }, 'A aprovação agregada das classes sociais mudou após resultados econômicos e entregas públicas.')
    country = result.country
    changes.push(...result.changes)
    report.push('A aprovação agregada das classes alterou a aprovação presidencial em ' + (aggregateApproval > 0 ? '+' : '') + aggregateApproval + ' ponto.')
  }

  let next: CampaignState = {
    ...campaign,
    country: { ...country, budget: economy.availableFunds },
    economy,
    society: { classes, groups, history: history.slice(-societyRules.monthlyHistoryLimit), lastReviewKey: key },
  }
  for (const item of monthlyNews) next = appendNews(next, item.id, item.title, item.summary, item.tone)
  if (monthlyNews.length === 0) report.push('Classes e grupos atualizaram avaliações com base em preços, emprego e entregas do mês.')
  return { campaign: next, report, events, changes }
}
