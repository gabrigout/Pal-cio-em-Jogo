import assert from 'node:assert/strict'
import test from 'node:test'
import { partyColors } from './campaignConfig'
import { parties } from './parties'
import { createCampaign, selectionFromDefinition } from '../engine/campaign'

const expectedPalettes: Record<string, [string, string]> = {
  ptp: ['#E4142C', '#FFFFFF'],
  pso: ['#D71920', '#FFD52B'],
  pdtt: ['#C8102E', '#009640'],
  plim: ['#004F9F', '#009640'],
  pssdb: ['#004C94', '#FFD600'],
  nova: ['#F17021', '#1A2948'],
}

test('as seis legendas satíricas usam os pares de cores pesquisados', () => {
  assert.equal(parties.length, 6)
  for (const [id, colors] of Object.entries(expectedPalettes)) {
    assert.deepEqual(partyColors[id as keyof typeof partyColors], colors, id)
    const definition = parties.find((party) => party.id === id)
    assert.ok(definition, 'A definição partidária ' + id + ' deve existir')
    if (!definition) continue
    assert.deepEqual(definition.colors, colors, id + ' deve usar a paleta configurada')
  }
})

test('campanhas novas aplicam a paleta do partido escolhido ao tema principal', () => {
  for (const definition of parties) {
    const orientation = definition.ideology === 'right' ? 'right' : 'left'
    const campaign = createCampaign(orientation, selectionFromDefinition(definition), () => 0.5)
    assert.deepEqual(campaign.party.colors, expectedPalettes[definition.id], definition.id)
    assert.equal(campaign.theme.officialPrimary, expectedPalettes[definition.id][0].toLowerCase())
    assert.equal(campaign.theme.officialSecondary, expectedPalettes[definition.id][1].toLowerCase())
  }
})
