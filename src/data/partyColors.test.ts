import assert from 'node:assert/strict'
import test from 'node:test'
import { partyColors } from './campaignConfig'
import { parties } from './parties'
import { createCampaign, selectionFromDefinition } from '../engine/campaign'
import { contrastRatio } from '../engine/theme'

const expectedPalettes: Record<string, [string, string]> = {
  ptp: ['#E4142C', '#FFFFFF'],
  pso: ['#E02028', '#FEDF00'],
  pdtt: ['#E4002B', '#005AB2'],
  plim: ['#004F9F', '#009640'],
  pssdb: ['#004C94', '#FFD600'],
  nova: ['#EC671C', '#1A2644'],
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
    assert.ok(contrastRatio(campaign.theme.buttonText, campaign.theme.officialPrimary) >= 4.5, definition.id + ' deve manter contraste acessível no botão principal')
    assert.ok(contrastRatio(campaign.theme.primary, '#373737') >= 4.5, definition.id + ' deve manter contraste acessível nos destaques pequenos')
  }
})
