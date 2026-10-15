import assert from 'node:assert/strict'
import test from 'node:test'
import { createCampaign } from './campaign'
import { getDashboardMetrics, getIndicatorStatus } from './dashboard'

const party = {
  id: 'status-test-party',
  fullName: 'Partido de Teste',
  acronym: 'PDT',
  description: 'Partido para teste de indicadores.',
  colors: ['#8bd4af', '#e5a05c'] as [string, string],
  custom: true,
}

test('faixas de estado obedecem aos limites configurados', () => {
  assert.equal(getIndicatorStatus(34), 'Crítico')
  assert.equal(getIndicatorStatus(35), 'Atenção')
  assert.equal(getIndicatorStatus(49), 'Atenção')
  assert.equal(getIndicatorStatus(50), 'Estável')
})

test('todos os indicadores mostram rótulo coerente com seus valores, incluindo recursos', () => {
  const campaign = createCampaign('left', party)
  const statuses = [
    { value: 34, label: 'Crítico', resourceLabel: 'Escassos' },
    { value: 35, label: 'Atenção', resourceLabel: 'Limitados' },
    { value: 50, label: 'Estável', resourceLabel: 'Equilibrados' },
  ]

  for (const expected of statuses) {
    campaign.country.presidentialApproval = expected.value
    campaign.country.congressSupport = expected.value
    campaign.country.economicOutlook = expected.value
    campaign.country.budget = expected.value
    campaign.country.politicalCapital = expected.value
    campaign.country.administrativeCapacity = expected.value
    campaign.country.institutionalStability = expected.value
    campaign.country.polarization = 100 - expected.value
    campaign.country.publicTrust = expected.value
    campaign.country.publicIntegrity = expected.value
    campaign.country.foreignRelations = expected.value

    const metrics = getDashboardMetrics(campaign)
    assert.equal(metrics.length, 8)
    assert.ok(metrics.every((metric) => metric.statusLabel === expected.label))
    assert.equal(metrics.find((metric) => metric.id === 'resources')?.value, expected.resourceLabel)
  }
})