import assert from 'node:assert/strict'
import test from 'node:test'
import { executiveDecisions } from '../data/executiveDecisions'
import { createCampaign } from './campaign'
import {
  appointMinister,
  closeExecutiveMonth,
  dismissMinister,
} from './executive'

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

test('exonerar um ministro custa um ponto de ação e capital político e registra reação', () => {
  const campaign = createTestCampaign()
  const ministry = campaign.ministries[0]
  const actionPoints = campaign.turn.availableActionPoints
  const capital = campaign.country.politicalCapital
  const result = dismissMinister(campaign, ministry.id)

  assert.ok(result)
  if (!result) return
  assert.equal(result.turn.availableActionPoints, actionPoints - 1)
  assert.equal(result.country.politicalCapital, capital - 4)
  assert.equal(result.ministries[0].minister, null)
  assert.match(result.ministries[0].alerts.join(' '), /reagir/)
  assert.ok(result.news[result.news.length - 1]?.summary.includes('imprensa'))
})

test('nomear pessoa de outro partido amplia o apoio no Congresso', () => {
  const campaign = createTestCampaign()
  const ministry = campaign.ministries[0]
  const candidate = ministry.candidates.find((item) => item.partyId !== campaign.party.id)
  assert.ok(candidate)
  if (!candidate) return
  const vacantCampaign = {
    ...campaign,
    ministries: campaign.ministries.map((item) => item.id === ministry.id ? { ...item, minister: null } : item),
    country: { ...campaign.country, congressSupport: 50, politicalCapital: 20 },
  }

  const result = appointMinister(vacantCampaign, ministry.id, candidate.id)
  assert.ok(result)
  if (!result) return
  assert.equal(result.country.congressSupport, 53)
  assert.equal(result.ministries[0].minister?.partyId, candidate.partyId)
})

test('fechamento mensal recalcula desempenho e registra o desempenho ministerial', () => {
  const campaign = createTestCampaign()
  const result = closeExecutiveMonth(campaign)

  assert.equal(result.campaign.ministries.length, 17)
  assert.equal(result.report.length, 17)
  assert.match(result.report[0], /desempenho \d+\/100; execução/)
  assert.ok(result.campaign.ministries.every((ministry) => ministry.administrativePerformance >= 0))
})

test('o catálogo acrescenta seis decisões inéditas sobre ministros', () => {
  assert.equal(executiveDecisions.length, 6)
  assert.ok(executiveDecisions.every((decision) => decision.category === 'ministros'))
})
