import assert from 'node:assert/strict'
import test from 'node:test'
import { createCampaign } from './campaign'
import { applySocietyAction, closeSocietyMonth, getSocietyActionAvailability } from './society'
import type { PartySelection } from '../state/types'

const party: PartySelection = {
  id: 'society-test', fullName: 'Partido de Teste', acronym: 'PTST', description: 'Partido ficcional de teste.',
  colors: ['#8bd4af', '#e5a05c'], custom: true,
}
const makeCampaign = () => createCampaign('left', party, () => 0.5)

test('inicializa cinco classes e sete grupos organizados', () => {
  const campaign = makeCampaign()
  assert.equal(campaign.society.classes.length, 5)
  assert.equal(campaign.society.groups.length, 7)
  assert.ok(campaign.society.classes.every((item) => item.approval >= 0 && item.approval <= 100))
  assert.ok(campaign.society.groups.every((item) => item.pressure >= 0 && item.pressure <= 100))
})

test('revisão social é mensal e idempotente', () => {
  const campaign = makeCampaign()
  const first = closeSocietyMonth(campaign)
  assert.equal(first.campaign.society.lastReviewKey, '2027-Janeiro')
  assert.ok(first.report.length > 0)
  const second = closeSocietyMonth(first.campaign)
  assert.deepEqual(second.report, [])
  assert.deepEqual(second.campaign.society, first.campaign.society)
})

test('diálogo consome pontos e capital e reduz pressão sem gastar caixa', () => {
  const campaign = makeCampaign()
  const group = campaign.society.groups[0]
  const before = group.pressure
  const next = applySocietyAction(campaign, group.id, 'dialogue')
  assert.ok(next)
  if (!next) return
  assert.equal(next.turn.availableActionPoints, campaign.turn.availableActionPoints - 1)
  assert.equal(next.country.politicalCapital, campaign.country.politicalCapital - 2)
  assert.equal(next.society.groups[0].pressure, Math.max(0, before - 12))
  assert.equal(next.economy.availableFunds, campaign.economy.availableFunds)
})

test('acordo social debita caixa e setor, e é bloqueado quando falta dinheiro', () => {
  const campaign = makeCampaign()
  const group = campaign.society.groups[0]
  const next = applySocietyAction(campaign, group.id, 'agreement')
  assert.ok(next)
  if (!next) return
  assert.equal(next.economy.availableFunds, campaign.economy.availableFunds - 15)
  assert.equal(next.country.budget, next.economy.availableFunds)
  assert.equal(next.economy.projectExpensesPaidThisMonth, campaign.economy.projectExpensesPaidThisMonth + 15)
  const empty = { ...campaign, country: { ...campaign.country, budget: 0 }, economy: { ...campaign.economy, availableFunds: 0 } }
  assert.equal(getSocietyActionAvailability(empty, group.id, 'agreement').allowed, false)
})
