import assert from 'node:assert/strict'
import test from 'node:test'
import { budgetSectorCatalog } from '../data/economy'
import { createCampaign } from './campaign'
import {
  adjustEconomicTax,
  closeEconomicMonth,
  proposeTaxReform,
  reviseBudgetDistribution,
  takeEmergencyLoan,
} from './economy'
import { chooseNarrativeOption, getActionBlockedReason } from './turn'
import { sampleActions } from '../data/actions'

const party = {
  id: 'test-party',
  fullName: 'Partido de Teste',
  acronym: 'PDT',
  description: 'Partido ficcional para testes.',
  colors: ['#8bd4af', '#e5a05c'] as [string, string],
  custom: true,
}

function createTestCampaign() {
  return createCampaign('left', party, () => 0.5)
}

test('revisão orçamentária respeita janela, soma setorial e custos', () => {
  const initialCampaign = createTestCampaign()
  const campaign = {
    ...initialCampaign,
    economy: {
      ...initialCampaign.economy,
      annualBudget: {
        ...initialCampaign.economy.annualBudget,
        sectors: initialCampaign.economy.annualBudget.sectors.map((sector) =>
          sector.id === 'health' ? { ...sector, executedThisYear: 20 } : sector),
      },
    },
  }
  const shares = Object.fromEntries(budgetSectorCatalog.map((sector) => [sector.id, sector.initialShare]))
  const actionPoints = campaign.turn.availableActionPoints
  const politicalCapital = campaign.country.politicalCapital

  const revised = reviseBudgetDistribution(campaign, shares)

  assert.ok(revised)
  if (!revised) return
  assert.equal(revised.turn.availableActionPoints, actionPoints - 2)
  assert.equal(revised.country.politicalCapital, politicalCapital - 3)
  assert.equal(revised.economy.annualBudget.sectors.reduce((sum, sector) => sum + sector.share, 0), 100)
  assert.equal(revised.ministries.find((ministry) => ministry.id === 'health')?.annualBudget,
    revised.economy.annualBudget.sectors.find((sector) => sector.id === 'health')?.annualAllocation)
  assert.equal(revised.economy.annualBudget.sectors.find((sector) => sector.id === 'health')?.executedThisYear, 20)
  assert.equal(reviseBudgetDistribution(revised, shares), null)
})

test('ajuste tributário limitado altera a taxa, receita e recursos', () => {
  const campaign = createTestCampaign()
  const initialRevenue = campaign.economy.indicators.publicRevenue
  const initialRate = campaign.economy.taxes.find((tax) => tax.id === 'income')?.rate
  const revised = adjustEconomicTax(campaign, 'income', 1)

  assert.ok(revised)
  if (!revised) return
  assert.equal(revised.economy.taxes.find((tax) => tax.id === 'income')?.rate, (initialRate ?? 0) + 0.5)
  assert.ok(revised.economy.indicators.publicRevenue > initialRevenue)
  assert.equal(revised.turn.availableActionPoints, campaign.turn.availableActionPoints - 1)
  assert.match(revised.economy.socialEffects[0], /trabalhadores formais/)
})

test('crédito emergencial aumenta caixa e dívida com juros e custo de ação', () => {
  const campaign = createTestCampaign()
  const lowCash = {
    ...campaign,
    country: { ...campaign.country, budget: 0 },
    economy: { ...campaign.economy, availableFunds: 0 },
  }
  const loan = takeEmergencyLoan(lowCash)

  assert.ok(loan)
  if (!loan) return
  assert.equal(loan.economy.availableFunds, 240)
  assert.equal(loan.country.budget, 240)
  assert.equal(loan.economy.indicators.publicDebt, lowCash.economy.indicators.publicDebt + 240)
  assert.equal(loan.economy.loans[0]?.annualInterestRate, 9.5)
  assert.equal(loan.turn.availableActionPoints, lowCash.turn.availableActionPoints - 1)
  const closed = closeEconomicMonth(loan)
  assert.ok(closed.campaign.economy.loans[0]?.outstandingPrincipal < 240)
  assert.ok(closed.report.some((entry) => /juros pagos/.test(entry)))
})

test('reforma tributária fica registrada como proposta dependente do Congresso', () => {
  const campaign = createTestCampaign()
  const proposed = proposeTaxReform(campaign)

  assert.ok(proposed)
  if (!proposed) return
  assert.deepEqual(proposed.economy.congressProposals, ['Reforma tributária estrutural'])
  assert.equal(proposed.country.congressSupport, campaign.country.congressSupport)
  assert.equal(proposed.economy.taxes[0]?.rate, campaign.economy.taxes[0]?.rate)
  assert.equal(proposeTaxReform(proposed), null)
})

test('ações com custo monetário ficam bloqueadas quando o caixa é insuficiente', () => {
  const campaign = createTestCampaign()
  const emptyTreasury = {
    ...campaign,
    country: { ...campaign.country, budget: 0 },
    economy: { ...campaign.economy, availableFunds: 0 },
  }
  const action = sampleActions.find((item) => item.id === 'service-mutirao')
  assert.ok(action)
  if (!action) return
  assert.equal(getActionBlockedReason(emptyTreasury, action), 'Orçamento insuficiente para esta ação.')
})

test('decisão econômica aplica efeitos contextuais ao fechamento mensal', () => {
  const campaign = createTestCampaign()
  const activeCampaign = {
    ...campaign,
    turn: { ...campaign.turn, activeDecisionId: 'market-confidence-briefing' },
  }
  const selected = chooseNarrativeOption(activeCampaign, 'decisão', 'publish-calendar')
  assert.ok(selected)
  if (!selected) return
  assert.equal(selected.economy.pressures.growth, 0.18)
  assert.match(selected.economy.pressures.notes[0] ?? '', /Calendário público/)

  const closed = closeEconomicMonth(selected)
  assert.ok(closed.report.some((entry) => /crescimento/.test(entry)))
  assert.equal(closed.campaign.economy.history.length, selected.economy.history.length + 1)
  assert.equal(closed.campaign.country.budget, closed.campaign.economy.availableFunds)
})

test('caixa insuficiente reduz execução e não permite despesas acima dos recursos', () => {
  const campaign = createTestCampaign()
  const emptyTreasury = {
    ...campaign,
    country: { ...campaign.country, budget: 0 },
    economy: {
      ...campaign.economy,
      availableFunds: 0,
      indicators: { ...campaign.economy.indicators, publicRevenue: 0 },
    },
  }
  const closed = closeEconomicMonth(emptyTreasury)
  assert.equal(closed.campaign.economy.availableFunds, 0)
  assert.ok(closed.report.some((entry) => /não financiados/.test(entry)))
  assert.ok(closed.campaign.economy.deferredPayments > 0)
})


test('execução ministerial não ultrapassa a dotação anual remanescente do setor', () => {
  const initial = createCampaign('left', party, () => 0.5)
  const health = initial.economy.annualBudget.sectors.find((sector) => sector.id === 'health')
  assert.ok(health)
  if (!health) return
  const constrained = {
    ...initial,
    country: { ...initial.country, budget: 1_000_000 },
    economy: {
      ...initial.economy,
      availableFunds: 1_000_000,
      annualBudget: {
        ...initial.economy.annualBudget,
        sectors: initial.economy.annualBudget.sectors.map((sector) => sector.id === 'health'
          ? { ...sector, executedThisYear: sector.annualAllocation - 1 }
          : sector),
      },
    },
    ministries: initial.ministries.map((ministry) => ministry.id === 'health'
      ? { ...ministry, budgetExecuted: 100 }
      : { ...ministry, budgetExecuted: 0 }),
  }
  const result = closeEconomicMonth(constrained)
  const updatedHealth = result.campaign.economy.annualBudget.sectors.find((sector) => sector.id === 'health')
  assert.ok(updatedHealth)
  if (!updatedHealth) return
  assert.ok(updatedHealth.executedThisYear <= updatedHealth.annualAllocation)
  assert.ok(updatedHealth.executedThisYear >= health.annualAllocation - 1)
})
