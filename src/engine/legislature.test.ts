import assert from 'node:assert/strict'
import test from 'node:test'
import { legislativeRules } from '../data/legislature'
import type { CampaignState, PartySelection } from '../state/types'
import {
  advanceLegislatureWeek,
  createInitialLegislatureState,
  negotiateLegislativeProposal,
  registerLegislativeProposal,
  submitLegislativeProposal,
} from './legislature'
import { createCampaign } from './campaign'

const party: PartySelection = {
  id: 'test-party',
  fullName: 'Partido de Teste',
  acronym: 'PDT',
  description: 'Bancada de teste para regras do Congresso.',
  colors: ['#8bd4af', '#e5a05c'],
  custom: true,
}

function buildCampaign() {
  const created = createCampaign('left', party, () => 0.5)
  return {
    ...created,
    id: 'legislature-test-campaign',
    country: {
      ...created.country,
      congressSupport: 100,
      presidentialApproval: 100,
      politicalCapital: 80,
    },
    turn: { ...created.turn, availableActionPoints: 8 },
  }
}

function advanceAt(campaign: ReturnType<typeof buildCampaign>, week: number) {
  return advanceLegislatureWeek(campaign, {
    ...campaign.calendar,
    month: 'Janeiro',
    year: 2027,
    week,
  })
}

test('composição parlamentar soma exatamente 513 deputados e 81 senadores', () => {
  const state = createInitialLegislatureState(buildCampaign())
  assert.equal(state.chamberOfDeputies.reduce((sum, bloc) => sum + bloc.seats, 0), legislativeRules.chambers.house.seats)
  assert.equal(state.senate.reduce((sum, bloc) => sum + bloc.seats, 0), legislativeRules.chambers.senate.seats)
  assert.ok(state.chamberOfDeputies.every((bloc) => Number.isInteger(bloc.seats) && bloc.seats >= 0))
  assert.ok(state.senate.every((bloc) => Number.isInteger(bloc.seats) && bloc.seats >= 0))
  const playerHouseSeats = state.chamberOfDeputies.find((bloc) => bloc.partyId === 'test-party')?.seats ?? 0
  const playerSenateSeats = state.senate.find((bloc) => bloc.partyId === 'test-party')?.seats ?? 0
  assert.ok(playerHouseSeats >= 14 && playerHouseSeats <= 16, 'partido personalizado com 3% começa com poucas cadeiras na Câmara')
  assert.ok(playerSenateSeats >= 2 && playerSenateSeats <= 3, 'partido personalizado com 3% começa com poucas cadeiras no Senado')
})

test('proposição exige conteúdo, recursos e cobra os custos configurados', () => {
  const campaign = buildCampaign()
  const costs = legislativeRules.proposalActionCosts.ordinary
  const submitted = submitLegislativeProposal(campaign, {
    type: 'ordinary',
    title: 'Programa nacional de serviços',
    summary: 'Define metas públicas e mecanismos de prestação de contas.',
    fiscalImpact: 0,
  })
  assert.ok(submitted)
  if (!submitted) return
  assert.equal(submitted.legislature.bills.length, 1)
  assert.equal(submitted.legislature.bills[0].stage, 'committee')
  assert.equal(submitted.turn.availableActionPoints, campaign.turn.availableActionPoints - costs.actionPoints)
  assert.equal(submitted.country.politicalCapital, campaign.country.politicalCapital - costs.politicalCapital)
  assert.equal(submitted.economy.availableFunds, campaign.economy.availableFunds)

  assert.equal(submitLegislativeProposal(campaign, {
    type: 'ordinary', title: 'A', summary: 'curta', fiscalImpact: 0,
  }), null)
})

test('medida provisória exige declaração de urgência e aplica custo fiscal provisório explícito', () => {
  const campaign = buildCampaign()
  const rejected = submitLegislativeProposal(campaign, {
    type: 'mp',
    title: 'Resposta emergencial sanitária',
    summary: 'Medida temporária com justificativa de interesse público.',
    fiscalImpact: 120,
    declaresUrgency: false,
  })
  assert.equal(rejected, null)
  const accepted = submitLegislativeProposal(campaign, {
    type: 'mp',
    title: 'Resposta emergencial sanitária',
    summary: 'Medida temporária com justificativa de interesse público.',
    fiscalImpact: 120,
    declaresUrgency: true,
  })
  assert.ok(accepted)
  if (!accepted) return
  assert.equal(accepted.legislature.bills[0].provisionalFiscalImpactApplied, true)
  assert.equal(accepted.economy.pressures.expenses, campaign.economy.pressures.expenses + 10)
  assert.equal(accepted.economy.availableFunds, campaign.economy.availableFunds)
})

test('articulação aumenta apoio provável sem alterar ou garantir votos', () => {
  const campaign = buildCampaign()
  const submitted = submitLegislativeProposal(campaign, {
    type: 'ordinary',
    title: 'Programa de infraestrutura',
    summary: 'Amplia a manutenção de corredores públicos.',
    fiscalImpact: 40,
  })
  assert.ok(submitted)
  if (!submitted) return
  const billId = submitted.legislature.bills[0].id
  const negotiated = negotiateLegislativeProposal(submitted, billId)
  assert.ok(negotiated)
  if (!negotiated) return
  assert.equal(negotiated.legislature.bills[0].negotiatedSupport, legislativeRules.negotiationSupportStep)
  assert.equal(negotiated.turn.availableActionPoints, submitted.turn.availableActionPoints - 1)
  assert.equal(negotiated.country.politicalCapital, submitted.country.politicalCapital - 2)
  assert.equal(negotiateLegislativeProposal(negotiated, billId)?.legislature.bills[0].negotiatedSupport, 2 * legislativeRules.negotiationSupportStep)
})

test('tramitação de lei ordinária registra votos com totais consistentes por Casa', () => {
  const campaign = buildCampaign()
  const submitted = submitLegislativeProposal(campaign, {
    type: 'ordinary',
    title: 'Programa nacional de serviços',
    summary: 'Define metas públicas e mecanismos de prestação de contas.',
    fiscalImpact: 0,
  })
  assert.ok(submitted)
  if (!submitted) return
  let working = {
    ...submitted,
    legislature: {
      ...submitted.legislature,
      bills: submitted.legislature.bills.map((bill) => ({ ...bill, negotiatedSupport: 35 })),
    },
  }
  working = advanceAt(working, 1).campaign
  assert.equal(working.legislature.bills[0].stage, 'negotiation')
  working = advanceAt(working, 2).campaign
  assert.equal(working.legislature.bills[0].stage, 'voting')
  working = advanceAt(working, 3).campaign
  const bill = working.legislature.bills[0]
  assert.equal(bill.voteHistory.length, 1)
  const vote = bill.voteHistory[0]
  assert.equal(vote.chamber, 'house')
  assert.equal(vote.present + vote.absent, vote.totalSeats)
  assert.equal(vote.yes + vote.no + vote.abstain, vote.present)
  assert.ok(vote.present >= vote.quorumNeeded || !vote.passed)
  assert.equal(bill.currentChamber === 'senate' || bill.stage === 'rejected', true)
})

test('PEC exige dois turnos em cada Casa e três quintos dos membros', () => {
  const campaign = buildCampaign()
  const submitted = submitLegislativeProposal(campaign, {
    type: 'pec',
    title: 'Emenda de transparência federativa',
    summary: 'Altera parâmetros constitucionais de transparência administrativa.',
    fiscalImpact: 0,
  })
  assert.ok(submitted)
  if (!submitted) return
  let working = {
    ...submitted,
    legislature: {
      ...submitted.legislature,
      bills: submitted.legislature.bills.map((bill) => ({ ...bill, negotiatedSupport: 35 })),
    },
  }
  for (let week = 1; week <= 6; week += 1) working = advanceAt(working, week).campaign
  const bill = working.legislature.bills[0]
  if (bill.stage === 'approved') {
    assert.equal(bill.voteHistory.length, 4)
    assert.deepEqual(bill.voteHistory.map((vote) => vote.chamber), ['house', 'house', 'senate', 'senate'])
    for (const vote of bill.voteHistory) {
      assert.equal(vote.requiredYes, Math.ceil(vote.totalSeats * legislativeRules.amendmentMajorityNumerator / legislativeRules.amendmentMajorityDenominator))
      assert.ok(vote.yes >= vote.requiredYes)
    }
  } else {
    assert.equal(bill.stage, 'rejected')
    assert.ok(bill.voteHistory.some((vote) => !vote.passed))
  }
})

test('emenda aprovada remaneja dotação sem elevar o total orçamentário', () => {
  const campaign = buildCampaign()
  const source = campaign.economy.annualBudget.sectors.find((sector) => sector.id === 'health')
  const target = campaign.economy.annualBudget.sectors.find((sector) => sector.id === 'environment')
  assert.ok(source && target)
  if (!source || !target) return
  const initialTotal = campaign.economy.annualBudget.total
  const initialSectorTotal = campaign.economy.annualBudget.sectors.reduce((sum, sector) => sum + sector.annualAllocation, 0)
  const billId = 'test-budget-amendment'
  const registered = registerLegislativeProposal(campaign, {
    type: 'amendment',
    origin: 'parliamentary',
    authorPartyId: party.id,
    title: 'Remanejar dotação para serviços essenciais',
    summary: 'Realoca parte da reserva de infraestrutura administrativa para cuidado preventivo.',
    fiscalImpact: 10,
    sourceSectorId: source.id,
    targetSectorId: target.id,
    sourceKey: billId,
  })
  let working: CampaignState = {
    ...registered,
    legislature: {
      ...registered.legislature,
      bills: registered.legislature.bills.map((bill) => ({
        ...bill,
        stage: 'voting',
        currentChamber: 'joint',
        negotiatedSupport: 35,
      })),
    },
  }
  working = advanceAt(working, 1).campaign
  const bill = working.legislature.bills[0]
  if (bill.stage === 'approved') {
    assert.equal(working.economy.annualBudget.total, initialTotal)
    assert.equal(working.economy.annualBudget.sectors.reduce((sum, sector) => sum + sector.annualAllocation, 0), initialSectorTotal)
    assert.equal(working.economy.annualBudget.sectors.find((sector) => sector.id === source.id)?.annualAllocation, source.annualAllocation - 10)
    assert.equal(working.economy.annualBudget.sectors.find((sector) => sector.id === target.id)?.annualAllocation, target.annualAllocation + 10)
  } else {
    assert.equal(bill.stage, 'rejected')
  }
})
