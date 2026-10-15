import { dashboardNews } from '../data/dashboard'
import { createCampaignTheme } from '../engine/theme'
import { initializeCampaignTurn } from '../engine/turn'
import { calendarMonths } from '../state/initialState'
import type { CampaignState, CampaignTurnState } from '../state/types'

export const CURRENT_SAVE_VERSION = 2
const SAVE_KEY_PREFIX = 'palacio-em-jogo:campaign:'

export interface StorageLike {
  readonly length: number
  key(index: number): string | null
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface CampaignSave {
  versaoDoSave: number
  savedAt: string
  campaign: CampaignState
}

export interface SavedCampaign {
  campaign: CampaignState
  savedAt: string
}

export interface CampaignListResult {
  campaigns: SavedCampaign[]
  issues: string[]
  error: string | null
}

export type SaveResult<T> =
  | { ok: true; value: T; warning?: string }
  | { ok: false; error: string }

export type MigrationResult =
  | { ok: true; save: CampaignSave; migrated: boolean }
  | { ok: false; error: string }

function resolveStorage(storage?: StorageLike): StorageLike {
  if (storage) return storage
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('O armazenamento local não está disponível neste ambiente.')
    }
    return window.localStorage
  } catch {
    throw new Error('O armazenamento local está indisponível. Verifique as permissões do navegador.')
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isIndicatorChange(value: unknown): boolean {
  return isRecord(value)
    && typeof value.indicator === 'string'
    && typeof value.label === 'string'
    && isNumber(value.amount)
    && typeof value.reason === 'string'
}

function isNewsItem(value: unknown): boolean {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.category === 'string'
    && typeof value.time === 'string'
    && typeof value.title === 'string'
    && typeof value.summary === 'string'
    && ['positive', 'warning', 'critical', 'neutral'].includes(String(value.tone))
}

function isPendingEffect(value: unknown): boolean {
  if (!isRecord(value) || typeof value.reason !== 'string' || !isRecord(value.effects)) return false
  return Object.entries(value.effects).every(([key, amount]) =>
    ['presidentialApproval', 'congressSupport', 'executiveSupport', 'judiciaryRelation',
      'economicOutlook', 'budget', 'politicalCapital', 'administrativeCapacity',
      'institutionalStability', 'polarization', 'publicTrust', 'publicIntegrity', 'foreignRelations'].includes(key)
      && isNumber(amount),
  )
}

function isEconomyBalance(value: unknown): boolean {
  return isRecord(value)
    && isNumber(value.openingBudget)
    && isNumber(value.revenue)
    && isNumber(value.expenses)
    && isNumber(value.closingBudget)
}

function isDecisionResult(value: unknown): boolean {
  return isRecord(value)
    && ['decisão', 'reação', 'mensal'].includes(String(value.category))
    && typeof value.title === 'string'
    && typeof value.choice === 'string'
    && typeof value.message === 'string'
    && isStringArray(value.reasons)
    && Array.isArray(value.changes) && value.changes.every(isIndicatorChange)
    && (typeof value.scheduledEventTitle === 'string' || value.scheduledEventTitle === null)
}

function isWeeklySummary(value: unknown): boolean {
  if (!isRecord(value)) return false
  return typeof value.month === 'string'
    && isNumber(value.year)
    && isNumber(value.week)
    && Array.isArray(value.changes) && value.changes.every(isIndicatorChange)
    && isStringArray(value.events)
    && isStringArray(value.actions)
    && isNumber(value.carriedActionPoints)
    && isNumber(value.expiredActionPoints)
    && isNumber(value.newActionPoints)
    && isNumber(value.totalActionPoints)
    && (typeof value.monthlyEvent === 'string' || value.monthlyEvent === null)
    && (value.economyBalance === null || isEconomyBalance(value.economyBalance))
}

function isCampaignState(value: unknown): value is CampaignState {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id) return false
  if (value.orientation !== 'left' && value.orientation !== 'right') return false
  if (!isRecord(value.party) || typeof value.party.id !== 'string' || typeof value.party.fullName !== 'string'
    || typeof value.party.acronym !== 'string' || typeof value.party.description !== 'string'
    || (value.party.orientation !== 'left' && value.party.orientation !== 'right')) return false
  if (!Array.isArray(value.party.colors) || value.party.colors.length !== 2 || !value.party.colors.every(isHexColor)) return false
  if (!isNumber(value.party.popularity) || !isNumber(value.party.influence) || !isNumber(value.party.parliamentarySupport)
    || !isNumber(value.party.seats) || !isNumber(value.party.resources) || typeof value.party.custom !== 'boolean') return false
  if (!isRecord(value.calendar) || !calendarMonths.includes(value.calendar.month as typeof calendarMonths[number])
    || !Number.isInteger(value.calendar.year) || !isNumber(value.calendar.year)
    || !Number.isInteger(value.calendar.week) || !isNumber(value.calendar.week)
    || !Number.isInteger(value.calendar.weeksPerMonth) || value.calendar.weeksPerMonth !== 4
    || value.calendar.week < 1 || value.calendar.week > value.calendar.weeksPerMonth) return false
  const country = value.country
  if (!isRecord(country)) return false
  const countryKeys = [
    'presidentialApproval', 'congressSupport', 'executiveSupport', 'judiciaryRelation',
    'economicOutlook', 'budget', 'politicalCapital', 'administrativeCapacity',
    'institutionalStability', 'polarization', 'publicTrust', 'publicIntegrity', 'foreignRelations',
  ]
  if (!countryKeys.every((key) => isNumber(country[key]))) return false
  if (!isRecord(value.theme) || !isHexColor(value.theme.officialPrimary) || !isHexColor(value.theme.officialSecondary)
    || !isHexColor(value.theme.primary) || !isHexColor(value.theme.secondary) || !isHexColor(value.theme.buttonText)) return false
  if (!isRecord(value.turn) || !isNumber(value.turn.availableActionPoints) || !isNumber(value.turn.newActionPoints)
    || !isNumber(value.turn.carriedActionPoints) || typeof value.turn.activeDecisionId !== 'string'
    || !(typeof value.turn.chosenDecisionOptionId === 'string' || value.turn.chosenDecisionOptionId === null)
    || !(typeof value.turn.activeReactionEventId === 'string' || value.turn.activeReactionEventId === null)
    || !(typeof value.turn.chosenReactionOptionId === 'string' || value.turn.chosenReactionOptionId === null)
    || !(typeof value.turn.activeMonthlyEventId === 'string' || value.turn.activeMonthlyEventId === null)
    || !(typeof value.turn.chosenMonthlyOptionId === 'string' || value.turn.chosenMonthlyOptionId === null)
    || !isStringArray(value.turn.recentDecisionIds)
    || !isStringArray(value.turn.recentReactionEventIds)
    || !isStringArray(value.turn.recentMonthlyEventIds)
    || !Array.isArray(value.turn.scheduledNarrativeEvents)
    || !value.turn.scheduledNarrativeEvents.every((event) => isRecord(event)
      && typeof event.eventId === 'string' && Number.isInteger(event.weeksRemaining)
      && isNumber(event.weeksRemaining) && event.weeksRemaining >= 1 && typeof event.scheduledBy === 'string')
    || !(value.turn.decisionResult === null || isDecisionResult(value.turn.decisionResult))
    || !isStringArray(value.turn.actionsTaken)
    || !Array.isArray(value.turn.weeklyChanges) || !value.turn.weeklyChanges.every(isIndicatorChange)) return false
  if (!Array.isArray(value.news) || !value.news.every(isNewsItem)
    || !Array.isArray(value.pendingEffects) || !value.pendingEffects.every(isPendingEffect)) return false
  if (!(value.weeklySummary === null || isWeeklySummary(value.weeklySummary))) return false
  return true
}

function freshTurnState(): CampaignTurnState {
  return {
    availableActionPoints: 0,
    newActionPoints: 0,
    carriedActionPoints: 0,
    activeDecisionId: '',
    chosenDecisionOptionId: null,
    activeReactionEventId: null,
    chosenReactionOptionId: null,
    activeMonthlyEventId: null,
    chosenMonthlyOptionId: null,
    recentDecisionIds: [],
    recentReactionEventIds: [],
    recentMonthlyEventIds: [],
    scheduledNarrativeEvents: [],
    decisionResult: null,
    actionsTaken: [],
    weeklyChanges: [],
  }
}

function migrateLegacyCampaign(value: unknown): CampaignState | null {
  if (!isRecord(value) || !isRecord(value.party) || !isRecord(value.calendar) || !isRecord(value.country)) return null
  const party = value.party
  if (!Array.isArray(party.colors) || party.colors.length !== 2 || !party.colors.every(isHexColor)) return null

  const country = {
    ...value.country,
    executiveSupport: isNumber(value.country.executiveSupport) ? value.country.executiveSupport : 50,
    judiciaryRelation: isNumber(value.country.judiciaryRelation) ? value.country.judiciaryRelation : 50,
  }
  const theme = isRecord(value.theme)
    && isHexColor(value.theme.officialPrimary)
    && isHexColor(value.theme.officialSecondary)
    && isHexColor(value.theme.primary)
    && isHexColor(value.theme.secondary)
    && isHexColor(value.theme.buttonText)
    ? value.theme
    : createCampaignTheme(party.colors[0], party.colors[1])

  const candidate = {
    ...value,
    country,
    theme,
    turn: isRecord(value.turn) ? { ...freshTurnState(), ...value.turn } : freshTurnState(),
    news: Array.isArray(value.news) ? value.news : dashboardNews.map((item) => ({ ...item })),
    pendingEffects: Array.isArray(value.pendingEffects) ? value.pendingEffects : [],
    weeklySummary: isRecord(value.weeklySummary) ? value.weeklySummary : null,
  }

  if (!isCampaignState(candidate)) return null
  const hasDecisionStateV2 = isRecord(value.turn) && 'activeReactionEventId' in value.turn
  if (!hasDecisionStateV2) return initializeCampaignTurn(candidate)
  return candidate
}

export function migrateSave(value: unknown): MigrationResult {
  if (!isRecord(value)) return { ok: false, error: 'O arquivo não contém um save de campanha válido.' }

  const version = value.versaoDoSave === undefined ? 0 : value.versaoDoSave
  if (!Number.isInteger(version) || typeof version !== 'number' || version < 0) {
    return { ok: false, error: 'A versão do save é inválida.' }
  }
  if (version > CURRENT_SAVE_VERSION) {
    return { ok: false, error: 'Este save foi criado por uma versão mais recente do jogo.' }
  }

  if (version === CURRENT_SAVE_VERSION) {
    if (!isCampaignState(value.campaign)) return { ok: false, error: 'O save não contém todos os dados de campanha necessários.' }
    return {
      ok: true,
      migrated: false,
      save: {
        versaoDoSave: CURRENT_SAVE_VERSION,
        savedAt: typeof value.savedAt === 'string' ? value.savedAt : new Date().toISOString(),
        campaign: value.campaign,
      },
    }
  }

  const oldCampaign = value.campaign ?? value.campanha ?? value
  const campaign = migrateLegacyCampaign(oldCampaign)
  if (!campaign) return { ok: false, error: 'Não foi possível migrar: os dados da campanha estão incompletos ou inválidos.' }
  return {
    ok: true,
    migrated: true,
    save: {
      versaoDoSave: CURRENT_SAVE_VERSION,
      savedAt: typeof value.savedAt === 'string' ? value.savedAt : new Date().toISOString(),
      campaign,
    },
  }
}

function saveKey(campaignId: string): string {
  return `${SAVE_KEY_PREFIX}${encodeURIComponent(campaignId)}`
}

function storageError(error: unknown): string {
  const errorName = isRecord(error) ? error.name : undefined
  const errorCode = isRecord(error) ? error.code : undefined
  if (errorName === 'QuotaExceededError' || errorCode === 22) {
    return 'O armazenamento do navegador está cheio. Exporte um backup ou libere espaço antes de salvar.'
  }
  if (error instanceof Error && error.message.includes('indisponível')) return error.message
  return 'Não foi possível acessar o armazenamento local. Verifique as permissões do navegador.'
}

export function saveCampaign(campaign: CampaignState, storage?: StorageLike, now = new Date()): SaveResult<SavedCampaign> {
  try {
    const target = resolveStorage(storage)
    const savedAt = now.toISOString()
    const save: CampaignSave = {
      versaoDoSave: CURRENT_SAVE_VERSION,
      savedAt,
      campaign,
    }
    target.setItem(saveKey(campaign.id), JSON.stringify(save))
    return { ok: true, value: { campaign, savedAt } }
  } catch (error) {
    return { ok: false, error: storageError(error) }
  }
}

export function listSavedCampaigns(storage?: StorageLike): CampaignListResult {
  try {
    const target = resolveStorage(storage)
    const keys: string[] = []
    for (let index = 0; index < target.length; index += 1) {
      const key = target.key(index)
      if (key?.startsWith(SAVE_KEY_PREFIX)) keys.push(key)
    }

    const campaigns: SavedCampaign[] = []
    const issues: string[] = []
    for (const key of keys) {
      const raw = target.getItem(key)
      if (!raw) {
        issues.push('Uma campanha salva está vazia e não pôde ser carregada.')
        continue
      }
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        issues.push('Uma campanha salva está corrompida. As demais campanhas continuam disponíveis.')
        continue
      }
      const result = migrateSave(parsed)
      if (!result.ok) {
        issues.push(`Uma campanha salva foi ignorada: ${result.error}`)
        continue
      }
      if (result.migrated) {
        try {
          target.setItem(key, JSON.stringify(result.save))
        } catch {
          issues.push('Uma campanha antiga foi carregada, mas não foi possível atualizar sua versão salva.')
        }
      }
      campaigns.push({ campaign: result.save.campaign, savedAt: result.save.savedAt })
    }

    campaigns.sort((first, second) => second.savedAt.localeCompare(first.savedAt))
    return { campaigns, issues, error: null }
  } catch (error) {
    return { campaigns: [], issues: [], error: storageError(error) }
  }
}

export function loadCampaign(campaignId: string, storage?: StorageLike): SaveResult<SavedCampaign> {
  try {
    const target = resolveStorage(storage)
    const raw = target.getItem(saveKey(campaignId))
    if (!raw) return { ok: false, error: 'Esta campanha não foi encontrada no armazenamento local.' }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { ok: false, error: 'Esta campanha está corrompida e não pode ser aberta.' }
    }
    const result = migrateSave(parsed)
    if (!result.ok) return result
    if (result.save.campaign.id !== campaignId) {
      return { ok: false, error: 'O identificador salvo não corresponde a esta campanha.' }
    }
    const value = { campaign: result.save.campaign, savedAt: result.save.savedAt }
    if (result.migrated) {
      try {
        target.setItem(saveKey(campaignId), JSON.stringify(result.save))
      } catch (error) {
        return { ok: true, value, warning: storageError(error) }
      }
    }
    return { ok: true, value }
  } catch (error) {
    return { ok: false, error: storageError(error) }
  }
}

export function deleteCampaign(campaignId: string, storage?: StorageLike): SaveResult<string> {
  try {
    resolveStorage(storage).removeItem(saveKey(campaignId))
    return { ok: true, value: campaignId }
  } catch (error) {
    return { ok: false, error: storageError(error) }
  }
}

export function exportCampaignJson(campaign: CampaignState, savedAt = new Date().toISOString()): string {
  const save: CampaignSave = { versaoDoSave: CURRENT_SAVE_VERSION, savedAt, campaign }
  return JSON.stringify(save, null, 2)
}

export function importCampaignJson(text: string, storage?: StorageLike, now = new Date()): SaveResult<SavedCampaign> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' }
  }

  const migration = migrateSave(parsed)
  if (!migration.ok) return migration

  try {
    const target = resolveStorage(storage)
    const imported = migration.save.campaign
    const originalId = imported.id
    let suffix = 1
    while (target.getItem(saveKey(imported.id))) {
      imported.id = `${originalId}-importado-${suffix}`
      suffix += 1
    }
    const savedAt = now.toISOString()
    const save: CampaignSave = { versaoDoSave: CURRENT_SAVE_VERSION, savedAt, campaign: imported }
    target.setItem(saveKey(imported.id), JSON.stringify(save))
    return { ok: true, value: { campaign: imported, savedAt } }
  } catch (error) {
    return { ok: false, error: storageError(error) }
  }
}