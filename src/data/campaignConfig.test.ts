import assert from 'node:assert/strict'
import test from 'node:test'
import { partyColors } from './campaignConfig'
import { parties } from './parties'
import { createCampaign, selectionFromDefinition } from '../engine/campaign'
import { contrastRatio } from '../engine/theme'

test('paletas predefinidas refletem as referências visuais pesquisadas', () => {
  assert.deepEqual(partyColors.ptp, ['#E30613', '#FFFFFF'])
  assert.deepEqual(partyColors.pso, ['#E02028', '#FEDF00'])
  assert.deepEqual(partyColors.pdtt, ['#C8102E', '#00529B'])
  assert.deepEqual(partyColors.plim, ['#009640', '#FFD500'])
  assert.deepEqual(partyColors.pssdb, ['#064A8C', '#F6C700'])
  assert.deepEqual(partyColors.nova, ['#EC671C', '#1A2644'])
  assert.equal(parties.length, 6)
  for (const party of parties) {
    assert.equal(party.colors.length, 2)
    assert.ok(party.colors.every((color) => /^#[0-9A-Fa-f]{6}$/.test(color)))
  }
})

test('nova campanha PTP mantém vermelho e branco oficiais e usa variantes legíveis no tema', () => {
  const definition = parties.find((party) => party.id === 'ptp')
  assert.ok(definition)
  if (!definition) return
  const campaign = createCampaign('left', selectionFromDefinition(definition), () => 0.5)

  assert.deepEqual(campaign.party.colors, ['#E30613', '#FFFFFF'])
  assert.equal(campaign.theme.officialPrimary, '#e30613')
  assert.equal(campaign.theme.officialSecondary, '#ffffff')
  assert.ok(contrastRatio(campaign.theme.primary, '#373737') >= 4.5)
  assert.ok(contrastRatio(campaign.theme.secondary, '#373737') >= 4.5)
})

test('paletas de partidos diferentes mantêm identidades distintas', () => {
  const palettes = Object.values(partyColors).map((colors) => colors.join('|'))
  assert.equal(new Set(palettes).size, palettes.length)
})
