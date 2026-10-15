import { economicRanges, economicRules } from '../data/campaignConfig'
import { budgetSectorCatalog, initialTaxes, sectorEconomicWeights, taxReformProposal } from '../data/economy'
import type {
  AnnualBudget,
  BudgetSector,
  CampaignState,
  EconomicDecisionEffect,
  EconomicIndicators,
  EconomicPressures,
  EconomicSnapshot,
  EconomicState,
  IndicatorChange,
  PublicLoan,
} from '../state/types'

const economicIndicatorLabels: Record<keyof EconomicIndicators, string> = {
  publicRevenue: 'Receitas públicas mensais',
  publicExpenses: 'Despesas públicas mensais',
  fiscalBalance: 'Déficit/superávit mensal',
  publicDebt: 'Dívida pública',
  growth: 'Crescimento econômico',
  inflation: 'Inflação',
  unemployment: 'Desemprego',
  incomeInequality: 'Desigualdade de renda (Gini)',
}

function roll(min: number, max: number, random: () => number): number {
  return Math.round((min + random() * (max - min)) * 10) / 10
}

function emptyPressures(): EconomicPressures {
  return { growth: 0, inflation: 0, unemployment: 0, inequality: 0, expenses: 0, revenue: 0, notes: [] }
}

function makeSnapshot(year: number, month: string, indicators: EconomicIndicators): EconomicSnapshot {
  return { year, month, indicators: { ...indicators } }
}

function sectorAllocation(total: number, share: number, sectorId: string): number {
  const sectorEnvelope = total * economicRules.sectorBudgetShare
  const amount = sectorEnvelope * share / 100
  return sectorId === budgetSectorCatalog[budgetSectorCatalog.length - 1].id
    ? amount
    : Math.floor(amount)
}

function makeSectors(
  total: number,
  shares: Record<string, number>,
  previousSectors: BudgetSector[] = [],
): BudgetSector[] {
  let assigned = 0
  const executedBySector = new Map(previousSectors.map((sector) => [sector.id, sector.executedThisYear]))
  const sectors = budgetSectorCatalog.map((definition, index) => {
    const isLast = index === budgetSectorCatalog.length - 1
    const allocation = isLast
      ? Math.round(total * economicRules.sectorBudgetShare - assigned)
      : sectorAllocation(total, shares[definition.id], definition.id)
    assigned += allocation
    return {
      id: definition.id,
      name: definition.name,
      share: shares[definition.id],
      annualAllocation: allocation,
      executedThisYear: executedBySector.get(definition.id) ?? 0,
      ministryIds: [...definition.ministryIds],
    }
  })
  return sectors
}

function applyBudgetToMinistries(
  campaign: Pick<CampaignState, 'ministries'>,
  sectors: BudgetSector[],
): CampaignState['ministries'] {
  const allocatedByMinistry = new Map<string, number>()
  for (const sector of sectors) {
    const ministries = sector.ministryIds
    if (!ministries.length) continue
    const each = Math.floor(sector.annualAllocation / ministries.length)
    let allocated = 0
    ministries.forEach((ministryId, index) => {
      const amount = index === ministries.length - 1 ? sector.annualAllocation - allocated : each
      allocated += amount
      allocatedByMinistry.set(ministryId, amount)
    })
  }
  return campaign.ministries.map((ministry) => {
    const annualBudget = allocatedByMinistry.get(ministry.id) ?? 0
    const monthlyAllocation = annualBudget / 12
    return { ...ministry, annualBudget, monthlyAllocation, budgetAvailable: monthlyAllocation }
  })
}

export function allocateSectorBudgetToMinistries(
  campaign: Pick<CampaignState, 'ministries'>,
  sectors: BudgetSector[],
): CampaignState['ministries'] {
  return applyBudgetToMinistries(campaign, sectors)
}

export function createEconomicState(
  campaign: Pick<CampaignState, 'id' | 'calendar' | 'country' | 'ministries'>,
  random: () => number = Math.random,
): EconomicState {
  const indicators: EconomicIndicators = {
    publicRevenue: roll(economicRanges.publicRevenue.min, economicRanges.publicRevenue.max, random),
    publicExpenses: roll(economicRanges.publicExpenses.min, economicRanges.publicExpenses.max, random),
    fiscalBalance: 0,
    publicDebt: roll(economicRanges.publicDebt.min, economicRanges.publicDebt.max, random),
    growth: roll(economicRanges.growth.min, economicRanges.growth.max, random),
    inflation: roll(economicRanges.inflation.min, economicRanges.inflation.max, random),
    unemployment: roll(economicRanges.unemployment.min, economicRanges.unemployment.max, random),
    incomeInequality: roll(economicRanges.incomeInequality.min, economicRanges.incomeInequality.max, random),
  }
  indicators.fiscalBalance = Math.round((indicators.publicRevenue - indicators.publicExpenses) * 10) / 10
  const total = Math.round(indicators.publicExpenses * 12)
  const shares = Object.fromEntries(budgetSectorCatalog.map((sector) => [sector.id, sector.initialShare]))
  const sectors = makeSectors(total, shares)
  const annualBudget: AnnualBudget = {
    year: campaign.calendar.year,
    total,
    fixedCommitments: Math.round(total * (1 - economicRules.sectorBudgetShare)),
    sectors,
    lastRevisionKey: null,
  }
  const economy: EconomicState = {
    indicators,
    availableFunds: roll(economicRanges.availableFunds.min, economicRanges.availableFunds.max, random),
    projectExpensesPaidThisMonth: 0,
    annualBudget,
    taxes: initialTaxes.map((tax) => ({ ...tax, affectedGroups: [...tax.affectedGroups] })),
    loans: [],
    congressProposals: [],
    socialEffects: [],
    pendingBudgetRequests: [],
    history: [makeSnapshot(campaign.calendar.year, campaign.calendar.month, indicators)],
    lastMonthlyReport: ['Série econômica inicializada com estimativas ficcionais e equilibradas.'],
    pressures: emptyPressures(),
    deferredPayments: 0,
  }
  return economy
}

export function canReviseBudget(campaign: CampaignState): { allowed: boolean; reason: string } {
  const { month, week, year } = campaign.calendar
  if (week !== 1 || !economicRules.budgetRevisionMonths.some((revisionMonth) => revisionMonth === month)) {
    return { allowed: false, reason: 'A distribuição só pode ser revista na primeira semana de janeiro, abril, julho ou outubro.' }
  }
  const revisionKey = `${year}-${month}`
  if (campaign.economy.annualBudget.lastRevisionKey === revisionKey) {
    return { allowed: false, reason: 'A revisão orçamentária deste período já foi utilizada.' }
  }
  if (campaign.turn.availableActionPoints < economicRules.budgetRevisionActionPoints) {
    return { allowed: false, reason: `A revisão custa ${economicRules.budgetRevisionActionPoints} pontos de ação.` }
  }
  if (campaign.country.politicalCapital < economicRules.budgetRevisionPoliticalCapital) {
    return { allowed: false, reason: `A revisão custa ${economicRules.budgetRevisionPoliticalCapital} pontos de capital político.` }
  }
  return { allowed: true, reason: '' }
}

export function reviseBudgetDistribution(
  campaign: CampaignState,
  shares: Record<string, number>,
): CampaignState | null {
  if (!canReviseBudget(campaign).allowed) return null
  const sectorIds = budgetSectorCatalog.map((sector) => sector.id)
  if (Object.keys(shares).length !== sectorIds.length
    || sectorIds.some((id) => !Number.isInteger(shares[id])
      || shares[id] < economicRules.minimumSectorShare
      || shares[id] > economicRules.maximumSectorShare)
    || sectorIds.reduce((sum, id) => sum + shares[id], 0) !== 100) return null

  const sectors = makeSectors(campaign.economy.annualBudget.total, shares, campaign.economy.annualBudget.sectors)
  const revisionKey = `${campaign.calendar.year}-${campaign.calendar.month}`
  const economy = {
    ...campaign.economy,
    annualBudget: {
      ...campaign.economy.annualBudget,
      sectors,
      lastRevisionKey: revisionKey,
    },
    pendingBudgetRequests: [],
  }
  const result = {
    ...campaign,
    economy,
    ministries: applyBudgetToMinistries(campaign, sectors),
    country: {
      ...campaign.country,
      politicalCapital: campaign.country.politicalCapital - economicRules.budgetRevisionPoliticalCapital,
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - economicRules.budgetRevisionActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, `Revisar distribuição orçamentária (${campaign.calendar.month})`],
    },
  }
  return recordEconomicChanges(result, campaign, ['publicDebt'], 'Revisão orçamentária registrada; resultados fiscais serão recalculados na virada mensal.')
}

export function adjustEconomicTax(
  campaign: CampaignState,
  taxId: string,
  direction: -1 | 1,
): CampaignState | null {
  const tax = campaign.economy.taxes.find((item) => item.id === taxId)
  if (!tax || campaign.turn.availableActionPoints < economicRules.taxAdjustmentActionPoints
    || campaign.country.politicalCapital < economicRules.taxAdjustmentPoliticalCapital) return null
  const nextRate = Math.round((tax.rate + direction * tax.adjustmentStep) * 10) / 10
  if (nextRate < tax.minimumRate || nextRate > tax.maximumRate) return null

  const revenueChange = Math.max(0.1, campaign.economy.indicators.publicRevenue * tax.revenueSensitivity * tax.adjustmentStep / 100)
  const nextIndicators = {
    ...campaign.economy.indicators,
    publicRevenue: Math.round((campaign.economy.indicators.publicRevenue + direction * revenueChange) * 10) / 10,
  }
  const growthPressure = direction > 0
    ? -tax.adjustmentStep * (tax.id === 'corporate' ? 0.18 : 0.08)
    : tax.adjustmentStep * 0.04
  const inflationPressure = direction > 0 && tax.id === 'consumption' ? 0.12 : 0
  const inequalityPressure = direction > 0 && tax.id === 'income' ? -0.08
    : direction > 0 && tax.id === 'consumption' ? 0.1
      : 0
  const label = `${tax.name}: ${direction > 0 ? 'aumento' : 'redução'} de ${tax.adjustmentStep} p.p.`
  const result = {
    ...campaign,
    economy: {
      ...campaign.economy,
      indicators: nextIndicators,
      taxes: campaign.economy.taxes.map((item) => item.id === taxId ? { ...item, rate: nextRate } : item),
      socialEffects: [`${label} afeta ${tax.affectedGroups.join(' e ')}.`, ...campaign.economy.socialEffects].slice(0, 6),
      pressures: {
        ...campaign.economy.pressures,
        growth: campaign.economy.pressures.growth + growthPressure,
        inflation: campaign.economy.pressures.inflation + inflationPressure,
        inequality: campaign.economy.pressures.inequality + inequalityPressure,
        notes: [...campaign.economy.pressures.notes, `Ajuste tributário limitado: ${label}`],
      },
    },
    country: { ...campaign.country, politicalCapital: campaign.country.politicalCapital - economicRules.taxAdjustmentPoliticalCapital },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - economicRules.taxAdjustmentActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, `Ajustar tributo: ${label}`],
    },
  }
  return recordEconomicChanges(
    result,
    campaign,
    ['publicRevenue'],
    `${label}; efeito em receita e grupos econômicos registrados.`,
  )
}

export function proposeTaxReform(campaign: CampaignState): CampaignState | null {
  if (campaign.economy.congressProposals.includes(taxReformProposal)
    || campaign.turn.availableActionPoints < economicRules.taxReformActionPoints
    || campaign.country.politicalCapital < economicRules.taxReformPoliticalCapital) return null
  return {
    ...campaign,
    economy: {
      ...campaign.economy,
      congressProposals: [...campaign.economy.congressProposals, taxReformProposal],
    },
    country: { ...campaign.country, politicalCapital: campaign.country.politicalCapital - economicRules.taxReformPoliticalCapital },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - economicRules.taxReformActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, 'Registrar proposta de reforma tributária ao Congresso'],
    },
  }
}

function debtLimit(campaign: CampaignState): number {
  return campaign.economy.indicators.publicRevenue * 12 * economicRules.maximumDebtToAnnualRevenue
}

function createLoan(
  campaign: CampaignState,
  terms: { amount: number; annualInterestRate: number; termMonths: number; lender: string; emergency: boolean; conditions: string[] },
): CampaignState | null {
  if (campaign.economy.indicators.publicDebt + terms.amount > debtLimit(campaign)) return null
  const id = `loan-${campaign.calendar.year}-${campaign.calendar.month}-${campaign.calendar.week}-${campaign.economy.loans.length + 1}`
  const loan: PublicLoan = {
    id,
    lender: terms.lender,
    amount: terms.amount,
    outstandingPrincipal: terms.amount,
    annualInterestRate: terms.annualInterestRate,
    termMonths: terms.termMonths,
    remainingMonths: terms.termMonths,
    monthlyPayment: Math.ceil(terms.amount / terms.termMonths + terms.amount * terms.annualInterestRate / 1200),
    conditions: [...terms.conditions],
    startYear: campaign.calendar.year,
    startMonth: campaign.calendar.month,
    emergency: terms.emergency,
  }
  return {
    ...campaign,
    economy: {
      ...campaign.economy,
      availableFunds: campaign.economy.availableFunds + terms.amount,
      indicators: { ...campaign.economy.indicators, publicDebt: campaign.economy.indicators.publicDebt + terms.amount },
      loans: [...campaign.economy.loans, loan],
      lastMonthlyReport: [`Empréstimo de ${terms.amount} u. contratado com ${terms.lender}; taxa anual ${terms.annualInterestRate}%, prazo ${terms.termMonths} meses.`, ...campaign.economy.lastMonthlyReport].slice(0, 8),
    },
    country: { ...campaign.country, budget: campaign.country.budget + terms.amount },
  }
}

export function takeEmergencyLoan(campaign: CampaignState): CampaignState | null {
  const hasActiveEmergencyLoan = campaign.economy.loans.some((loan) => loan.emergency && loan.outstandingPrincipal > 0)
  if (campaign.economy.availableFunds > economicRules.emergencyCashThreshold
    || hasActiveEmergencyLoan
    || campaign.turn.availableActionPoints < economicRules.emergencyLoanActionPoints
    || campaign.country.politicalCapital < economicRules.emergencyLoanPoliticalCapital) return null
  const borrowed = createLoan(campaign, {
    amount: economicRules.emergencyLoanAmount,
    annualInterestRate: economicRules.emergencyLoanAnnualInterestRate,
    termMonths: economicRules.emergencyLoanTermMonths,
    lender: 'Fundo de Estabilização Cívica',
    emergency: true,
    conditions: ['Publicar saldo e custo do serviço mensal.', 'Revisar despesas no próximo trimestre.'],
  })
  if (!borrowed) return null
  return {
    ...borrowed,
    country: { ...borrowed.country, politicalCapital: borrowed.country.politicalCapital - economicRules.emergencyLoanPoliticalCapital },
    turn: {
      ...borrowed.turn,
      availableActionPoints: borrowed.turn.availableActionPoints - economicRules.emergencyLoanActionPoints,
      actionsTaken: [...borrowed.turn.actionsTaken, 'Contratar empréstimo emergencial limitado'],
    },
  }
}

export function deferEconomicPayments(campaign: CampaignState): CampaignState | null {
  if (campaign.economy.availableFunds > economicRules.emergencyCashThreshold
    || campaign.economy.deferredPayments > 0
    || campaign.turn.availableActionPoints < economicRules.deferredPaymentActionPoints
    || campaign.country.politicalCapital < economicRules.deferredPaymentPoliticalCapital) return null
  return {
    ...campaign,
    economy: {
      ...campaign.economy,
      deferredPayments: campaign.economy.deferredPayments + economicRules.deferredPaymentAmount,
      lastMonthlyReport: [`Medida emergencial: ${economicRules.deferredPaymentAmount} u. de compromissos adiadas para o próximo mês; confiança e execução serão pressionadas.`, ...campaign.economy.lastMonthlyReport].slice(0, 8),
    },
    country: {
      ...campaign.country,
      politicalCapital: campaign.country.politicalCapital - economicRules.deferredPaymentPoliticalCapital,
      publicTrust: Math.max(0, campaign.country.publicTrust - 2),
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - economicRules.deferredPaymentActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, `Adiar ${economicRules.deferredPaymentAmount} u. de compromissos para o próximo mês`],
    },
  }
}

export function applyEconomicDecision(
  campaign: CampaignState,
  effect: EconomicDecisionEffect,
): CampaignState | null {
  if (effect.kind === 'loan-offer') {
    return createLoan(campaign, {
      ...effect,
      emergency: false,
      conditions: ['Relatório mensal de execução e serviço da dívida.', 'Sem alteração automática de tributos.'],
    })
  }
  if (effect.kind === 'budget-request') {
    const sector = campaign.economy.annualBudget.sectors.find((item) => item.id === effect.sectorId)
    if (!sector) return null
    return {
      ...campaign,
      economy: {
        ...campaign.economy,
        pendingBudgetRequests: [`${sector.name}: pedido de ${effect.amount} u.; sujeito à próxima janela de revisão.`, ...campaign.economy.pendingBudgetRequests].slice(0, 8),
        pressures: { ...campaign.economy.pressures, notes: [...campaign.economy.pressures.notes, effect.note] },
      },
    }
  }
  const pressures = { ...campaign.economy.pressures, notes: [...campaign.economy.pressures.notes, effect.note] }
  if (effect.kind === 'market-confidence') {
    pressures.growth += effect.growth
    pressures.inflation += effect.inflation
  } else if (effect.kind === 'public-service-strike') {
    pressures.growth -= 0.15 * effect.months
    pressures.expenses += 2 * effect.months
    pressures.notes.push('Paralisação reduziu entregas e acrescentou custo de negociação e continuidade.')
  } else if (effect.kind === 'food-price-pressure') {
    pressures.inflation += effect.inflation
    pressures.inequality += effect.inequality
  } else {
    pressures.growth += effect.growth
    pressures.inflation += effect.inflation
  }
  return { ...campaign, economy: { ...campaign.economy, pressures } }
}

function recordEconomicChanges(
  campaign: CampaignState,
  previous: CampaignState,
  indicators: Array<keyof EconomicIndicators>,
  reason: string,
): CampaignState {
  const changes: IndicatorChange[] = indicators.flatMap((indicator) => {
    const amount = Math.round((campaign.economy.indicators[indicator] - previous.economy.indicators[indicator]) * 10) / 10
    return amount === 0 ? [] : [{ indicator, label: economicIndicatorLabels[indicator], amount, reason }]
  })
  return { ...campaign, turn: { ...campaign.turn, weeklyChanges: [...campaign.turn.weeklyChanges, ...changes] } }
}

export function prepareEconomicYear(campaign: CampaignState, year: number): CampaignState {
  if (campaign.economy.annualBudget.year === year) return campaign
  const total = Math.round(campaign.economy.indicators.publicRevenue * 12)
  const shares = Object.fromEntries(campaign.economy.annualBudget.sectors.map((sector) => [sector.id, sector.share]))
  const sectors = makeSectors(total, shares)
  const annualBudget: AnnualBudget = {
    year,
    total,
    fixedCommitments: Math.round(total * (1 - economicRules.sectorBudgetShare)),
    sectors,
    lastRevisionKey: null,
  }
  return {
    ...campaign,
    economy: { ...campaign.economy, annualBudget },
    ministries: applyBudgetToMinistries(campaign, sectors),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function loanPaymentSchedule(loan: PublicLoan): { interest: number; principal: number } {
  if (loan.outstandingPrincipal <= 0 || loan.remainingMonths <= 0) return { interest: 0, principal: 0 }
  const interest = Math.ceil(loan.outstandingPrincipal * loan.annualInterestRate / 1200)
  const principal = Math.min(loan.outstandingPrincipal, Math.ceil(loan.outstandingPrincipal / loan.remainingMonths))
  return { interest, principal }
}

export function closeEconomicMonth(campaign: CampaignState): { campaign: CampaignState; report: string[]; changes: IndicatorChange[] } {
  const previous = campaign.economy.indicators
  const economy = campaign.economy
  const context = campaign.country
  const revenue = Math.max(0, Math.round(previous.publicRevenue
    * (1 + previous.growth / 1000 + (context.publicIntegrity - 50) / 10000)
    + economy.pressures.revenue))
  const availableBeforeSpending = economy.availableFunds + revenue
  let funds = availableBeforeSpending
  let interestPaid = 0
  let principalPaid = 0
  let unpaidInterest = 0
  const loans = economy.loans.map((loan) => {
    const schedule = loanPaymentSchedule(loan)
    const interest = Math.min(funds, schedule.interest)
    funds -= interest
    interestPaid += interest
    const unpaid = schedule.interest - interest
    unpaidInterest += unpaid
    const principal = Math.min(funds, schedule.principal)
    funds -= principal
    principalPaid += principal
    const outstandingPrincipal = Math.max(0, loan.outstandingPrincipal - principal) + unpaid
    return {
      ...loan,
      outstandingPrincipal,
      remainingMonths: outstandingPrincipal > 0 ? Math.max(1, loan.remainingMonths - 1) : 0,
      monthlyPayment: outstandingPrincipal > 0 ? schedule.interest + schedule.principal : 0,
    }
  })

  const ministryById = new Map(campaign.ministries.map((ministry) => [ministry.id, ministry]))
  const plannedSectorSpending = economy.annualBudget.sectors.map((sector) => {
    const weights = sectorEconomicWeights[sector.id]
    const ministryExecutions = sector.ministryIds.reduce((total, id) =>
      total + (ministryById.get(id)?.budgetExecuted ?? 0), 0)
    return {
      sector,
      weights,
      planned: ministryExecutions * weights.costMultiplier,
      nominalExecuted: ministryExecutions,
    }
  })
  const fixedPlanned = economy.annualBudget.fixedCommitments / 12
    + economy.deferredPayments
    + economy.pressures.expenses
  const fixedPaid = Math.min(funds, fixedPlanned)
  funds -= fixedPaid
  const plannedSectorTotal = plannedSectorSpending.reduce((sum, item) => sum + item.planned, 0)
  const sectorFundingRatio = plannedSectorTotal > 0 ? Math.min(1, funds / plannedSectorTotal) : 1
  const actualSectors = plannedSectorSpending.map(({ sector, weights, nominalExecuted }) => {
    const paid = nominalExecuted * sectorFundingRatio
    return {
      ...sector,
      executedToDate: sector.executedThisYear + paid,
      paid,
      weightedExpense: paid * weights.costMultiplier,
    }
  })
  const sectorExpenses = actualSectors.reduce((sum, sector) => sum + sector.weightedExpense, 0)
  funds = Math.max(0, funds - sectorExpenses)
  const nominalSectorTotal = plannedSectorSpending.reduce((sum, item) => sum + item.nominalExecuted, 0)
  const paidNominalSectorTotal = plannedSectorSpending.reduce((sum, item) => sum + item.nominalExecuted * sectorFundingRatio, 0)
  const unpaidCommitments = Math.max(0, fixedPlanned - fixedPaid)
    + Math.max(0, nominalSectorTotal - paidNominalSectorTotal)
  const projectExpensesPaid = Math.max(0, economy.projectExpensesPaidThisMonth)
  const expenses = Math.round((fixedPaid + sectorExpenses + interestPaid + projectExpensesPaid) * 10) / 10
  const fiscalBalance = Math.round((revenue - fixedPaid - sectorExpenses - interestPaid - projectExpensesPaid) * 10) / 10
  const surplusDebtRepayment = fiscalBalance > 0
    ? Math.max(0, Math.min(previous.publicDebt - principalPaid, Math.floor(fiscalBalance * 0.25)))
    : 0
  const publicDebt = Math.max(0, Math.round((previous.publicDebt
    + Math.max(0, -fiscalBalance)
    - principalPaid
    - surplusDebtRepayment
    + unpaidInterest) * 10) / 10)
  funds = Math.max(0, funds - surplusDebtRepayment)

  const growthWeighted = economy.annualBudget.sectors.reduce((sum, sector) =>
    sum + sector.share * sectorEconomicWeights[sector.id].growth, 0) / 100
  const inequalityWeighted = economy.annualBudget.sectors.reduce((sum, sector) =>
    sum + sector.share * sectorEconomicWeights[sector.id].inequality, 0) / 100
  const costWeighted = economy.annualBudget.sectors.reduce((sum, sector) =>
    sum + sector.share * sectorEconomicWeights[sector.id].costMultiplier, 0) / 100
  const deficitPressure = -fiscalBalance / Math.max(1, revenue)
  const debtRisk = publicDebt / Math.max(1, revenue * 12)
  const averagePerformance = campaign.ministries.length
    ? campaign.ministries.reduce((sum, ministry) => sum + ministry.administrativePerformance, 0) / campaign.ministries.length
    : 50
  const growthChange = clamp(
    (growthWeighted - 0.32) * 0.22
    + (context.institutionalStability - 50) * 0.006
    + (context.publicTrust - 50) * 0.003
    + (context.publicIntegrity - 50) * 0.004
    + (context.foreignRelations - 50) * 0.003
    + (averagePerformance - 55) * 0.003
    - Math.max(0, debtRisk - 3) * 0.08
    + economy.pressures.growth,
    -1,
    1,
  )
  const inflationChange = clamp(
    deficitPressure * 0.15
    + (context.polarization - 50) * 0.004
    + Math.max(0, debtRisk - 3) * 0.05
    + economy.pressures.inflation,
    -1,
    1,
  )
  const unemploymentChange = clamp(-growthChange * 0.12 + (growthChange < 0 ? 0.08 : 0) + economy.pressures.unemployment, -0.5, 0.5)
  const inequalityChange = clamp(
    -(inequalityWeighted - 0.25) * 0.25
    - (context.publicIntegrity - 50) * 0.003
    + unemploymentChange * 0.08
    + economy.pressures.inequality,
    -0.5,
    0.5,
  )
  const indicators: EconomicIndicators = {
    publicRevenue: revenue,
    publicExpenses: expenses,
    fiscalBalance,
    publicDebt,
    growth: Math.round(clamp(previous.growth + growthChange, -10, 15) * 10) / 10,
    inflation: Math.round(clamp(previous.inflation + inflationChange, 0, 40) * 10) / 10,
    unemployment: Math.round(clamp(previous.unemployment + unemploymentChange, 0, 40) * 10) / 10,
    incomeInequality: Math.round(clamp(previous.incomeInequality + inequalityChange, 20, 80) * 10) / 10,
  }
  const report = [
    `Receita de ${revenue} u. e despesa de ${expenses} u.; saldo ${fiscalBalance >= 0 ? 'superavitário' : 'deficitário'} em ${fiscalBalance} u.`,
    `Execução ministerial e composição do orçamento: custo setorial médio ${costWeighted.toFixed(2)}; execução financiada de ${Math.round(sectorFundingRatio * 100)}%.`,
    `Confiança ${context.publicTrust}, integridade ${context.publicIntegrity}, polarização ${context.polarization} e estabilidade ${context.institutionalStability} influenciaram inflação, crescimento e execução.`,
    `Dívida em ${indicators.publicDebt} u. (${debtRisk.toFixed(1)} vezes a receita anual); juros pagos ${interestPaid} u.${unpaidInterest ? ` Juros não pagos capitalizados: ${unpaidInterest} u.` : ''}`,
    ...(projectExpensesPaid > 0 ? [`Projetos públicos executaram ${projectExpensesPaid.toFixed(1)} u. já descontadas do caixa semanal.`] : []),
    `Mudanças do mês: crescimento ${growthChange >= 0 ? '+' : ''}${growthChange.toFixed(1)} p.p.; inflação ${inflationChange >= 0 ? '+' : ''}${inflationChange.toFixed(1)} p.p.; desemprego ${unemploymentChange >= 0 ? '+' : ''}${unemploymentChange.toFixed(1)} p.p.; desigualdade ${inequalityChange >= 0 ? '+' : ''}${inequalityChange.toFixed(1)} p.p.`,
    ...(unpaidCommitments > 0 ? [`Compromissos não financiados de ${Math.round(unpaidCommitments)} u. foram adiados; nenhuma despesa excedeu o caixa disponível.`] : []),
    ...economy.pressures.notes,
  ]
  if (debtRisk >= 4) report.push('Risco fiscal elevado: dívida acima de quatro vezes a receita anual pode pressionar confiança, custo de crédito e apoio político.')

  const nextSectors = actualSectors.map(({ paid, weightedExpense: _weightedExpense, ...sector }) => sector)
  const updatedAnnualBudget = { ...economy.annualBudget, sectors: nextSectors }
  const updatedLoans = loans
  const nextState: EconomicState = {
    ...economy,
    indicators,
    availableFunds: Math.round(funds * 10) / 10,
    projectExpensesPaidThisMonth: 0,
    annualBudget: updatedAnnualBudget,
    loans: updatedLoans,
    history: [...economy.history, makeSnapshot(campaign.calendar.year, campaign.calendar.month, indicators)]
      .slice(-economicRules.monthlyHistoryLimit),
    lastMonthlyReport: report.slice(0, 12),
    pressures: emptyPressures(),
    deferredPayments: Math.round(unpaidCommitments * 10) / 10,
  }
  const country = { ...campaign.country }
  if (debtRisk >= 4) {
    country.publicTrust = Math.max(0, country.publicTrust - 1)
    country.economicOutlook = Math.max(0, country.economicOutlook - 1)
    country.institutionalStability = Math.max(0, country.institutionalStability - 1)
  }
  const ministeries = campaign.ministries.map((ministry) => {
    const sector = economy.annualBudget.sectors.find((item) => item.ministryIds.includes(ministry.id))
    const scaleFactor = sector
      ? Math.min(1, (actualSectors.find((item) => item.id === sector.id)?.paid ?? 0)
        / Math.max(1, sector.ministryIds.reduce((sum, id) => sum + (ministryById.get(id)?.budgetExecuted ?? 0), 0)))
      : 1
    return { ...ministry, budgetExecuted: Math.floor(ministry.budgetExecuted * scaleFactor) }
  })
  const result = {
    ...campaign,
    economy: nextState,
    ministries: ministeries,
    country: { ...country, budget: Math.round(funds * 10) / 10 },
  }
  return {
    campaign: recordEconomicChanges(
      result,
      campaign,
      ['publicRevenue', 'publicExpenses', 'fiscalBalance', 'publicDebt', 'growth', 'inflation', 'unemployment', 'incomeInequality'],
      'Fechamento mensal: execução, distribuição setorial, contexto institucional e decisões econômicas.',
    ),
    report,
    changes: Object.entries(indicators).flatMap(([key, amount]) => {
      const indicator = key as keyof EconomicIndicators
      const delta = Math.round((amount - previous[indicator]) * 10) / 10
      return delta ? [{ indicator, label: economicIndicatorLabels[indicator], amount: delta, reason: report[0] }] : []
    }),
  }
}
