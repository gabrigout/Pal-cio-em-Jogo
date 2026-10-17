import assert from 'node:assert/strict'
import test from 'node:test'
import { createCampaign } from '../engine/campaign'
import type { PartySelection } from '../state/types'
import {
  exportCampaignJson,
  importCampaignJson,
  listSavedCampaigns,
  loadCampaign,
  migrateSave,
  saveCampaign,
  type StorageLike,
} from './campaignRepository'

class MemoryStorage implements StorageLike {
  private readonly entries = new Map<string, string>()
  failWrites = false

  get length(): number {
    return this.entries.size
  }

  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null
  }

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) {
      const error = new Error('Quota excedida') as Error & { name: string }
      error.name = 'QuotaExceededError'
      throw error
    }
    this.entries.set(key, value)
  }

  removeItem(key: string): void {
    this.entries.delete(key)
  }
}

class QuotaStorage extends MemoryStorage {
  setItem(): void {
    const error = new Error('Quota excedida') as Error & { name: string }
    error.name = 'QuotaExceededError'
    throw error
  }
}

const party: PartySelection = {
  id: 'test-party',
  fullName: 'Partido de Teste',
  acronym: 'PDT',
  description: 'Partido para testes de persistência.',
  colors: ['#8bd4af', '#e5a05c'],
  custom: true,
}

function createTestCampaign() {
  return createCampaign('left', party, () => 0.5)
}

test('salva e carrega campanhas separadamente com o estado completo', () => {
  const storage = new MemoryStorage()
  const firstCampaign = createTestCampaign()
  const secondCampaign = { ...createTestCampaign(), id: 'campaign-second' }
  const timestamp = new Date('2027-01-02T12:00:00.000Z')

  assert.equal(saveCampaign(firstCampaign, storage, timestamp).ok, true)
  assert.equal(saveCampaign(secondCampaign, storage, timestamp).ok, true)

  const loaded = loadCampaign(firstCampaign.id, storage)
  assert.equal(loaded.ok, true)
  if (!loaded.ok) return
  assert.deepEqual(loaded.value.campaign, firstCampaign)
  assert.equal(loaded.value.savedAt, timestamp.toISOString())
  assert.equal(listSavedCampaigns(storage).campaigns.length, 2)
})

test('migra campanha legada sem versão para o save atual', () => {
  const current = createTestCampaign()
  const legacy = structuredClone(current) as unknown as Record<string, unknown>
  const legacyCountry = { ...(legacy.country as Record<string, unknown>) }
  delete legacyCountry.executiveSupport
  delete legacyCountry.judiciaryRelation
  delete legacy.theme
  delete legacy.turn
  delete legacy.news
  delete legacy.pendingEffects
  delete legacy.weeklySummary
  legacy.country = legacyCountry

  const result = migrateSave(legacy)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.migrated, true)
  assert.equal(result.save.versaoDoSave, 8)
  assert.equal(result.save.campaign.country.executiveSupport, 50)
  assert.equal(result.save.campaign.country.judiciaryRelation, 50)
  assert.ok(result.save.campaign.turn.activeDecisionId)
  assert.ok(Array.isArray(result.save.campaign.news))
})

test('migra save v3 sem economia e cria ministérios e orçamento determinísticos', () => {
  const campaign = createTestCampaign()
  const oldCampaign = structuredClone(campaign) as unknown as Record<string, unknown>
  delete oldCampaign.economy
  delete oldCampaign.ministries

  const first = migrateSave({ versaoDoSave: 3, savedAt: '2027-01-01T00:00:00.000Z', campaign: oldCampaign })
  const second = migrateSave({ versaoDoSave: 3, savedAt: '2027-01-01T00:00:00.000Z', campaign: oldCampaign })
  assert.equal(first.ok, true)
  assert.equal(second.ok, true)
  if (!first.ok || !second.ok) return

  assert.equal(first.save.versaoDoSave, 8)
  assert.equal(first.save.campaign.ministries.length, 17)
  assert.deepEqual(first.save.campaign.projects, [])
  assert.equal(first.save.campaign.economy.projectExpensesPaidThisMonth, 0)
  assert.deepEqual(first.save.campaign.economy, second.save.campaign.economy)
  assert.equal(first.save.campaign.country.budget, first.save.campaign.economy.availableFunds)
})

test('migra save versão 1 preservando pontos e inicializando o modelo de eventos', () => {
  const campaign = createTestCampaign()
  const versionOneTurn = { ...campaign.turn } as unknown as Record<string, unknown>
  delete versionOneTurn.activeReactionEventId
  delete versionOneTurn.chosenReactionOptionId
  delete versionOneTurn.activeMonthlyEventId
  delete versionOneTurn.chosenMonthlyOptionId
  delete versionOneTurn.recentDecisionIds
  delete versionOneTurn.recentReactionEventIds
  delete versionOneTurn.recentMonthlyEventIds
  delete versionOneTurn.scheduledNarrativeEvents
  delete versionOneTurn.decisionResult
  versionOneTurn.availableActionPoints = 3
  const versionOneCampaign = { ...campaign, turn: versionOneTurn }

  const result = migrateSave({ versaoDoSave: 1, savedAt: '2027-01-01T00:00:00.000Z', campaign: versionOneCampaign })
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.migrated, true)
  assert.equal(result.save.versaoDoSave, 8)
  assert.equal(result.save.campaign.turn.availableActionPoints, 3)
  assert.ok(Array.isArray(result.save.campaign.turn.scheduledNarrativeEvents))
})

test('migra save versão 2 e gera o gabinete para campanha existente', () => {
  const campaign = createTestCampaign() as unknown as Record<string, unknown>
  delete campaign.ministries
  delete campaign.executiveProposals

  const result = migrateSave({
    versaoDoSave: 2,
    savedAt: '2027-01-01T00:00:00.000Z',
    campaign,
  })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.migrated, true)
  assert.equal(result.save.versaoDoSave, 8)
  assert.equal(result.save.campaign.ministries.length, 17)
  assert.ok(result.save.campaign.ministries.every((ministry) => ministry.minister))
  const repeatedMigration = migrateSave({
    versaoDoSave: 2,
    savedAt: '2027-01-01T00:00:00.000Z',
    campaign,
  })
  assert.equal(repeatedMigration.ok, true)
  if (repeatedMigration.ok) assert.deepEqual(result.save.campaign.ministries, repeatedMigration.save.campaign.ministries)
})

test('rejeita import inválido e não altera campanhas existentes', () => {
  const storage = new MemoryStorage()
  const existingCampaign = createTestCampaign()
  saveCampaign(existingCampaign, storage)

  const invalidJson = importCampaignJson('{ arquivo quebrado', storage)
  const invalidSave = importCampaignJson(JSON.stringify({ versaoDoSave: 1, campaign: { id: 'incompleta' } }), storage)

  assert.equal(invalidJson.ok, false)
  assert.equal(invalidSave.ok, false)
  assert.equal(listSavedCampaigns(storage).campaigns.length, 1)
})

test('uma campanha corrompida não impede carregar as demais', () => {
  const storage = new MemoryStorage()
  const validCampaign = createTestCampaign()
  saveCampaign(validCampaign, storage)
  storage.setItem('palacio-em-jogo:campaign:broken', '{ JSON inválido')

  const result = listSavedCampaigns(storage)
  assert.equal(result.campaigns.length, 1)
  assert.equal(result.issues.length, 1)
})

test('importa backup validado como uma campanha independente e preserva o tema', () => {
  const storage = new MemoryStorage()
  const original = createTestCampaign()
  saveCampaign(original, storage)

  const result = importCampaignJson(exportCampaignJson(original), storage)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.notEqual(result.value.campaign.id, original.id)
  assert.deepEqual(result.value.campaign.theme, original.theme)
  assert.equal(listSavedCampaigns(storage).campaigns.length, 2)
})

test('avisa quando a quota estoura ou o armazenamento local está indisponível', () => {
  const quotaResult = saveCampaign(createTestCampaign(), new QuotaStorage())
  const unavailableResult = listSavedCampaigns()

  assert.equal(quotaResult.ok, false)
  if (!quotaResult.ok) assert.match(quotaResult.error, /cheio/)
  assert.match(unavailableResult.error ?? '', /indisponível/)
})

test('campanhas recém-criadas têm identificadores diferentes', () => {
  assert.notEqual(createTestCampaign().id, createTestCampaign().id)
})

test('abre save legado mesmo quando a migração não pode ser regravada', () => {
  const storage = new MemoryStorage()
  const campaign = createTestCampaign()
  const legacy = { ...campaign } as unknown as Record<string, unknown>
  delete legacy.theme
  const key = `palacio-em-jogo:campaign:${encodeURIComponent(campaign.id)}`
  storage.setItem(key, JSON.stringify(legacy))
  storage.failWrites = true

  const result = loadCampaign(campaign.id, storage)
  assert.equal(result.ok, true)
  if (result.ok) assert.match(result.warning ?? '', /cheio/)
})

test('salva e carrega os eventos narrativos agendados', () => {
  const storage = new MemoryStorage()
  const campaign = createTestCampaign()
  campaign.turn.scheduledNarrativeEvents = [{
    eventId: 'rain-follow-up',
    weeksRemaining: 2,
    scheduledBy: 'Chuva, mapa e três sirenes',
  }]

  assert.equal(saveCampaign(campaign, storage).ok, true)
  const loaded = loadCampaign(campaign.id, storage)
  assert.equal(loaded.ok, true)
  if (loaded.ok) assert.deepEqual(loaded.value.campaign.turn.scheduledNarrativeEvents, campaign.turn.scheduledNarrativeEvents)
})

test('migration v5 multiplies legacy abstract money by ten and initializes society', () => {
  const campaign = createTestCampaign() as unknown as Record<string, any>
  campaign.country.budget = 42
  campaign.economy.availableFunds = 42
  campaign.economy.projectExpensesPaidThisMonth = 3
  campaign.economy.indicators.publicRevenue = 52
  campaign.economy.indicators.publicExpenses = 57
  campaign.economy.indicators.publicDebt = 900
  campaign.economy.annualBudget.total = 684
  campaign.economy.annualBudget.fixedCommitments = 102
  campaign.economy.annualBudget.sectors = campaign.economy.annualBudget.sectors.map((sector: Record<string, unknown>) => ({
    ...sector, annualAllocation: 50, executedThisYear: 10,
  }))
  delete campaign.society
  delete campaign.legislature
  const result = migrateSave({ versaoDoSave: 5, savedAt: '2027-01-01T00:00:00.000Z', campaign })
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.save.versaoDoSave, 8)
  assert.equal(result.save.campaign.economy.availableFunds, 420)
  assert.equal(result.save.campaign.economy.indicators.publicRevenue, 520)
  assert.equal(result.save.campaign.economy.indicators.publicDebt, 9000)
  assert.equal(result.save.campaign.economy.annualBudget.total, 6840)
  assert.equal(result.save.campaign.economy.annualBudget.sectors[0].annualAllocation, 500)
  assert.equal(result.save.campaign.country.budget, result.save.campaign.economy.availableFunds)
  assert.equal(result.save.campaign.society.classes.length, 5)
  assert.equal(result.save.campaign.society.groups.length, 7)
})


test('migra save v6 para v8 sem reescalar valores que já estão em reais', () => {
  const campaign = createTestCampaign() as unknown as Record<string, any>
  campaign.country.budget = 42
  campaign.economy.availableFunds = 42
  campaign.economy.indicators.publicRevenue = 52
  campaign.economy.indicators.publicExpenses = 57
  campaign.economy.indicators.publicDebt = 900
  campaign.economy.congressProposals = ['Reforma tributária estrutural']
  campaign.executiveProposals = ['Reorganização da estrutura ministerial']
  delete campaign.legislature

  const result = migrateSave({
    versaoDoSave: 6,
    savedAt: '2027-01-01T00:00:00.000Z',
    campaign,
  })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.migrated, true)
  assert.equal(result.save.versaoDoSave, 8)
  assert.equal(result.save.campaign.economy.availableFunds, 42)
  assert.equal(result.save.campaign.economy.indicators.publicRevenue, 52)
  assert.equal(result.save.campaign.economy.indicators.publicDebt, 900)
  assert.equal(result.save.campaign.country.budget, 42)
  assert.equal(result.save.campaign.legislature.chamberOfDeputies.reduce((sum, bloc) => sum + bloc.seats, 0), 513)
  assert.equal(result.save.campaign.legislature.senate.reduce((sum, bloc) => sum + bloc.seats, 0), 81)
  assert.equal(result.save.campaign.legislature.bills.length, 2)
  assert.ok(result.save.campaign.legislature.bills.some((bill) => bill.title === 'Reforma tributária estrutural' && bill.type === 'complementary'))
  assert.ok(result.save.campaign.legislature.bills.some((bill) => bill.title === 'Reorganização da estrutura ministerial'))
})


test('migra paleta e tema de campanhas existentes sem alterar partido personalizado', () => {
  const predefinedPtp: PartySelection = {
    id: 'ptp',
    fullName: 'Partido da Taxa e da Picanha',
    acronym: 'PTP',
    description: 'Partido satírico inspirado no PT.',
    colors: ['#8bd4af', '#e5a05c'],
    custom: false,
  }
  const oldPtpCampaign = createCampaign('left', predefinedPtp, () => 0.5)
  const ptpMigration = migrateSave({
    versaoDoSave: 7,
    savedAt: '2027-01-01T00:00:00.000Z',
    campaign: oldPtpCampaign,
  })
  assert.equal(ptpMigration.ok, true)
  if (!ptpMigration.ok) return
  assert.equal(ptpMigration.save.versaoDoSave, 8)
  assert.deepEqual(ptpMigration.save.campaign.party.colors, ['#E30613', '#FFFFFF'])
  assert.equal(ptpMigration.save.campaign.theme.officialPrimary, '#e30613')
  assert.equal(ptpMigration.save.campaign.theme.officialSecondary, '#ffffff')

  const customCampaign = createTestCampaign()
  const customColors = [...customCampaign.party.colors]
  const customMigration = migrateSave({
    versaoDoSave: 7,
    savedAt: '2027-01-01T00:00:00.000Z',
    campaign: customCampaign,
  })
  assert.equal(customMigration.ok, true)
  if (!customMigration.ok) return
  assert.deepEqual(customMigration.save.campaign.party.colors, customColors)
})
