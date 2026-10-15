import assert from 'node:assert/strict'
import test from 'node:test'
import { additionalDecisions } from '../data/additionalDecisions'
import { weeklyDecisions } from '../data/decisions'
import { createCampaign } from './campaign'
import { advanceCalendar, advanceWeek, calculateActionPoints, chooseNarrativeOption, getReactionEvent } from './turn'

const thresholdIndicators = {
  executiveSupport: 49,
  congressSupport: 49,
  judiciaryRelation: 49,
  presidentialApproval: 49,
}

test('catálogo inclui pelo menos 25 cartões semanais', () => {
  assert.ok(weeklyDecisions.length + additionalDecisions.length >= 25)
})

test('pontos de ação partem da base fixa e bônus exigem passar de 49%', () => {
  assert.equal(calculateActionPoints(thresholdIndicators).newPoints, 2)
  assert.equal(calculateActionPoints({
    executiveSupport: 50,
    congressSupport: 49,
    judiciaryRelation: 49,
    presidentialApproval: 49,
  }).newPoints, 3)
})

test('pontos de ação concedidos na semana nunca passam de seis', () => {
  const result = calculateActionPoints({
    executiveSupport: 100,
    congressSupport: 100,
    judiciaryRelation: 100,
    presidentialApproval: 100,
  })

  assert.equal(result.newPoints, 6)
})

test('calendário avança semana, vira mês e vira ano após dezembro', () => {
  const fourthWeek = { month: 'Janeiro', year: 2027, week: 3, weeksPerMonth: 4 }
  assert.deepEqual(advanceCalendar(fourthWeek), { ...fourthWeek, week: 4 })
  assert.deepEqual(advanceCalendar({ ...fourthWeek, week: 4 }), {
    ...fourthWeek,
    month: 'Fevereiro',
    week: 1,
  })
  assert.deepEqual(advanceCalendar({ ...fourthWeek, month: 'Dezembro', week: 4 }), {
    ...fourthWeek,
    month: 'Janeiro',
    year: 2028,
    week: 1,
  })
})

test('virada semanal carrega até dois pontos e a virada mensal fecha evento e balanço', () => {
  const campaign = createCampaign('left', {
    id: 'test-party',
    fullName: 'Partido de Teste',
    acronym: 'PDT',
    description: 'Partido usado em teste.',
    colors: ['#8bd4af', '#e5a05c'],
    custom: true,
  }, () => 0.999999)

  assert.equal(campaign.turn.newActionPoints, 6)
  let nextWeek = advanceWeek(campaign)
  assert.equal(nextWeek.turn.carriedActionPoints, 2)
  assert.equal(nextWeek.turn.availableActionPoints, 8)

  nextWeek = advanceWeek(advanceWeek(advanceWeek(nextWeek)))
  assert.deepEqual(
    { month: nextWeek.calendar.month, year: nextWeek.calendar.year, week: nextWeek.calendar.week },
    { month: 'Fevereiro', year: 2027, week: 1 },
  )
  assert.ok(nextWeek.weeklySummary?.monthlyEvent)
  assert.ok(nextWeek.weeklySummary?.economyBalance)
})

test('evento de reação só é elegível quando sua condição é atendida', () => {
  const campaign = createCampaign('left', {
    id: 'test-party',
    fullName: 'Partido de Teste',
    acronym: 'PDT',
    description: 'Partido usado em teste.',
    colors: ['#8bd4af', '#e5a05c'],
    custom: true,
  }, () => 0.5)

  assert.equal(getReactionEvent(campaign), null)
  const lowApproval = { ...campaign, country: { ...campaign.country, presidentialApproval: 40 } }
  assert.equal(getReactionEvent(lowApproval)?.id, 'low-approval-pulse')
})

test('não repete imediatamente uma reação que já apareceu', () => {
  const campaign = createCampaign('left', {
    id: 'test-party',
    fullName: 'Partido de Teste',
    acronym: 'PDT',
    description: 'Partido usado em teste.',
    colors: ['#8bd4af', '#e5a05c'],
    custom: true,
  }, () => 0.5)
  campaign.country.presidentialApproval = 40
  campaign.country.polarization = 60
  campaign.turn.recentReactionEventIds = ['low-approval-pulse']

  assert.equal(getReactionEvent(campaign)?.id, 'high-polarization-pulse')
})

test('evento encadeado dispara na semana prevista, após duas viradas', () => {
  const campaign = createCampaign('left', {
    id: 'test-party',
    fullName: 'Partido de Teste',
    acronym: 'PDT',
    description: 'Partido usado em teste.',
    colors: ['#8bd4af', '#e5a05c'],
    custom: true,
  }, () => 0.5)
  campaign.turn.activeDecisionId = 'rain-response'
  const chosen = chooseNarrativeOption(campaign, 'decisão', 'federative-coordination')
  assert.ok(chosen)
  if (!chosen) return
  assert.equal(chosen.turn.scheduledNarrativeEvents[0]?.weeksRemaining, 2)

  const afterOneWeek = advanceWeek(chosen)
  assert.equal(afterOneWeek.turn.activeReactionEventId, null)
  assert.equal(afterOneWeek.turn.scheduledNarrativeEvents[0]?.weeksRemaining, 1)
  const afterTwoWeeks = advanceWeek(afterOneWeek)
  assert.equal(afterTwoWeeks.calendar.week, 3)
  assert.equal(afterTwoWeeks.turn.activeReactionEventId, 'rain-follow-up')
  assert.equal(afterTwoWeeks.turn.scheduledNarrativeEvents.length, 0)
})