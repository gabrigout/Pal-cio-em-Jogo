import { economicRules } from '../data/campaignConfig'
import { legislativePartySeatWeights, legislativeRules } from '../data/legislature'
import { parties } from '../data/parties'
import type {
  CampaignState,
  LegislativeBill,
  LegislativeBillType,
  LegislativeBloc,
  LegislativeChamber,
  LegislativeOrigin,
  LegislativeStage,
  LegislativeVote,
  LegislatureState,
} from '../state/types'
import { formatBRLMoney } from '../utils/money'

export interface LegislativeProposalInput {
  type: LegislativeBillType
  title: string
  summary: string
  fiscalImpact?: number
  targetSectorId?: string | null
  sourceSectorId?: string | null
  authorPartyId?: string
  declaresUrgency?: boolean
  origin?: LegislativeOrigin
  sourceKey?: string | null
}

export interface VoteResult {
  vote: LegislativeVote
  bill: LegislativeBill
}

const terminalStages: LegislativeStage[] = ['approved', 'rejected', 'expired']

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value))
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10
}

function seededRandom(seedText: string): () => number {
  let seed = 2166136261
  for (const character of seedText) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function getPartyRows(campaign: Pick<CampaignState, 'party'>) {
  const rows = parties.map((party) => ({
    partyId: party.id,
    partyName: party.fullName,
    acronym: party.acronym,
    orientation: party.ideology,
    weight: legislativePartySeatWeights[party.id] ?? 10,
  }))
  const playerIndex = rows.findIndex((party) => party.partyId === campaign.party.id)
  const playerRow = {
    partyId: campaign.party.id,
    partyName: campaign.party.fullName,
    acronym: campaign.party.acronym,
    orientation: campaign.party.orientation,
    weight: Math.max(1, campaign.party.popularity),
  }
  if (playerIndex >= 0) rows[playerIndex] = playerRow
  else rows.push(playerRow)
  return rows
}

function allocateSeats(
  campaign: Pick<CampaignState, 'party'>,
  totalSeats: number,
  chamber: LegislativeChamber,
): LegislativeBloc[] {
  const rows = getPartyRows(campaign)
  const governmentSeats = chamber === 'senate'
    ? Math.max(1, Math.min(totalSeats - rows.length, Math.round(campaign.party.seats * totalSeats / legislativeRules.chambers.house.seats)))
    : Math.max(1, Math.min(totalSeats - rows.length, Math.round(campaign.party.seats)))
  const otherRows = rows.filter((row) => row.partyId !== campaign.party.id)
  const weightTotal = otherRows.reduce((sum, row) => sum + Math.max(1, row.weight), 0)
  const remainingSeats = totalSeats - governmentSeats
  const shares = otherRows.map((row) => {
    const exact = remainingSeats * Math.max(1, row.weight) / weightTotal
    return { row, seats: Math.floor(exact), fraction: exact - Math.floor(exact) }
  })
  let remainder = remainingSeats - shares.reduce((sum, share) => sum + share.seats, 0)
  const remainderOrder = [...shares].sort((first, second) => second.fraction - first.fraction)
  for (const item of remainderOrder) {
    if (remainder <= 0) break
    const target = shares.find((share) => share.row.partyId === item.row.partyId)
    if (target) target.seats += 1
    remainder -= 1
  }
  const otherBlocs = shares.map(({ row, seats }) => ({
    partyId: row.partyId,
    partyName: row.partyName,
    acronym: row.acronym,
    orientation: row.orientation,
    seats,
  }))
  const government = {
    partyId: campaign.party.id,
    partyName: campaign.party.fullName,
    acronym: campaign.party.acronym,
    orientation: campaign.party.orientation,
    seats: governmentSeats,
  }
  return [...otherBlocs, government].sort((first, second) => second.seats - first.seats)
}

export function createInitialLegislatureState(campaign: Pick<CampaignState, 'party'>): LegislatureState {
  return {
    chamberOfDeputies: allocateSeats(campaign, legislativeRules.chambers.house.seats, 'house'),
    senate: allocateSeats(campaign, legislativeRules.chambers.senate.seats, 'senate'),
    bills: [],
    history: [
      'Composição parlamentar inicializada para a campanha ficcional. As bancadas são agregadas; não representam deputados ou senadores individuais.',
      'Apoio no Congresso indica ambiente político e não obriga parlamentares a acompanhar o governo.',
    ],
    lastAdvancedKey: null,
  }
}

function initialChamber(type: LegislativeBillType): LegislativeChamber {
  return ['ppa', 'ldo', 'loa', 'credit', 'amendment'].includes(type) ? 'joint' : 'house'
}

function typeLabel(type: LegislativeBillType): string {
  const labels: Record<LegislativeBillType, string> = {
    ordinary: 'PL',
    complementary: 'PLP',
    pec: 'PEC',
    mp: 'MP',
    ppa: 'PPA',
    ldo: 'LDO',
    loa: 'LOA',
    credit: 'crédito adicional',
    amendment: 'emenda parlamentar',
  }
  return labels[type]
}

function formatDate(campaign: Pick<CampaignState, 'calendar'>): string {
  return campaign.calendar.month + ' de ' + campaign.calendar.year + ', semana ' + campaign.calendar.week
}

export function createDraftLegislativeBill(
  campaign: CampaignState,
  input: LegislativeProposalInput,
): LegislativeBill {
  const title = input.title.trim()
  const isMp = input.type === 'mp'
  const fiscalImpact = roundOne(input.fiscalImpact ?? 0)
  const billCount = campaign.legislature.bills.length + 1
  const authorPartyId = input.authorPartyId ?? campaign.party.id
  const author = [...campaign.legislature.chamberOfDeputies, ...campaign.legislature.senate]
    .find((bloc) => bloc.partyId === authorPartyId)
  const authorPartyAcronym = author?.acronym
    ?? (authorPartyId === campaign.party.id ? campaign.party.acronym : 'Bancada')
  return {
    id: 'bill-' + campaign.calendar.year + '-' + campaign.calendar.month.toLowerCase() + '-' + campaign.calendar.week + '-' + billCount + '-' + input.type,
    type: input.type,
    title,
    summary: input.summary.trim(),
    origin: input.origin ?? (input.type === 'amendment' ? 'parliamentary' : 'executive'),
    authorPartyId,
    authorPartyAcronym,
    createdYear: campaign.calendar.year,
    createdMonth: campaign.calendar.month,
    createdWeek: campaign.calendar.week,
    stage: 'committee',
    stageWeeks: 0,
    daysInProcess: 0,
    currentChamber: initialChamber(input.type),
    currentRound: 1,
    negotiatedSupport: 0,
    fiscalImpact,
    targetSectorId: input.targetSectorId ?? null,
    sourceSectorId: input.sourceSectorId ?? null,
    voteHistory: [],
    history: [
      formatDate(campaign) + ': ' + typeLabel(input.type) + ' apresentado por ' + authorPartyAcronym + '.',
    ],
    isUrgent: false,
    provisionalFiscalImpactApplied: isMp && fiscalImpact !== 0,
    vetoReason: null,
    sourceKey: input.sourceKey ?? null,
  }
}

function appendLegislativeHistory(state: LegislatureState, message: string): LegislatureState {
  return { ...state, history: [message, ...state.history].slice(0, 40) }
}

export function registerLegislativeProposal(
  campaign: CampaignState,
  input: LegislativeProposalInput,
): CampaignState {
  const existing = input.sourceKey
    ? campaign.legislature.bills.find((bill) => bill.sourceKey === input.sourceKey)
    : undefined
  if (existing) return campaign
  const bill = createDraftLegislativeBill(campaign, input)
  let next: CampaignState = {
    ...campaign,
    legislature: {
      ...campaign.legislature,
      bills: [bill, ...campaign.legislature.bills],
      history: [
        formatDate(campaign) + ': recebida proposta ' + bill.title + ' (' + typeLabel(bill.type) + ').',
        ...campaign.legislature.history,
      ].slice(0, 40),
    },
  }
  if (bill.type === 'mp' && bill.fiscalImpact !== 0) {
    next = {
      ...next,
      economy: {
        ...next.economy,
        pressures: {
          ...next.economy.pressures,
          expenses: next.economy.pressures.expenses + bill.fiscalImpact / 12,
          notes: [
            'Efeito fiscal provisório de MP em tramitação: ' + formatBRLMoney(bill.fiscalImpact / 12) + ' por mês.',
            ...next.economy.pressures.notes,
          ].slice(0, 12),
        },
      },
    }
  }
  return next
}

function proposalCosts(type: LegislativeBillType) {
  return legislativeRules.proposalActionCosts[type]
}

function validateProposal(campaign: CampaignState, input: LegislativeProposalInput): string | null {
  if (input.title.trim().length < 5 || input.title.trim().length > 90) return 'O título precisa ter de 5 a 90 caracteres.'
  if (input.summary.trim().length < 12 || input.summary.trim().length > 480) return 'A justificativa precisa ter de 12 a 480 caracteres.'
  const impact = input.fiscalImpact ?? 0
  if (!Number.isFinite(impact)) return 'Informe um impacto fiscal numérico.'
  if (input.type === 'mp' && !input.declaresUrgency) return 'Uma medida provisória exige que relevância e urgência sejam justificadas.'
  if (input.type === 'loa') {
    const budget = campaign.economy.annualBudget.total
    if (impact < budget * legislativeRules.minimumLoaMultiplier || impact > budget * legislativeRules.maximumLoaMultiplier) {
      return 'A LOA proposta deve ficar entre ' + (legislativeRules.minimumLoaMultiplier * 100) + '% e ' + (legislativeRules.maximumLoaMultiplier * 100) + '% do orçamento anual atual.'
    }
    const sectors = campaign.economy.annualBudget.sectors
    const envelope = impact * economicRules.sectorBudgetShare
    if (sectors.some((sector) => envelope * sector.share / 100 < sector.executedThisYear)) {
      return 'A proposta não pode reduzir uma dotação abaixo do valor já executado no ano.'
    }
  } else if (input.type === 'credit') {
    if (impact <= 0 || impact > legislativeRules.creditProposalLimit) return 'O crédito adicional deve ser positivo e respeitar o limite configurado.'
    if (!input.targetSectorId || !campaign.economy.annualBudget.sectors.some((sector) => sector.id === input.targetSectorId)) return 'Selecione o setor que receberá o crédito.'
  } else if (input.type === 'amendment') {
    if (impact <= 0) return 'O valor da emenda precisa ser positivo.'
    if (!input.sourceSectorId || !input.targetSectorId || input.sourceSectorId === input.targetSectorId) return 'Escolha setores de origem e destino diferentes.'
    const source = campaign.economy.annualBudget.sectors.find((sector) => sector.id === input.sourceSectorId)
    const target = campaign.economy.annualBudget.sectors.find((sector) => sector.id === input.targetSectorId)
    if (!source || !target) return 'Setor de origem ou destino inválido.'
    const envelope = campaign.economy.annualBudget.total * economicRules.sectorBudgetShare
    const shareChange = impact / Math.max(1, envelope) * 100
    if (impact > source.annualAllocation - source.executedThisYear) return 'A emenda excede a dotação ainda não executada do setor de origem.'
    if (source.share - shareChange < economicRules.minimumSectorShare || target.share + shareChange > economicRules.maximumSectorShare) {
      return 'O remanejamento precisa manter os dois setores dentro dos limites configurados de participação orçamentária.'
    }
  } else if (input.type !== 'ppa' && input.type !== 'ldo') {
    if (Math.abs(impact) > legislativeRules.annualFiscalImpactLimit) return 'O impacto anual deve ficar entre -R$ ' + legislativeRules.annualFiscalImpactLimit + ' bi e +R$ ' + legislativeRules.annualFiscalImpactLimit + ' bi.'
    if (impact > 0 && input.targetSectorId && !campaign.economy.annualBudget.sectors.some((sector) => sector.id === input.targetSectorId)) return 'Setor de destino inválido.'
  }
  if ((input.type === 'ppa' || input.type === 'ldo') && Math.abs(impact) > legislativeRules.annualFiscalImpactLimit) return 'O impacto fiscal informado excede o limite configurado.'
  return null
}

export function submitLegislativeProposal(
  campaign: CampaignState,
  input: LegislativeProposalInput,
): CampaignState | null {
  if (validateProposal(campaign, input)) return null
  if (input.type === 'amendment' && input.origin !== 'parliamentary') return null
  const costs = proposalCosts(input.type)
  if (campaign.turn.availableActionPoints < costs.actionPoints
    || campaign.country.politicalCapital < costs.politicalCapital) return null
  const paid: CampaignState = {
    ...campaign,
    country: { ...campaign.country, politicalCapital: campaign.country.politicalCapital - costs.politicalCapital },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - costs.actionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, 'Apresentar ' + typeLabel(input.type) + ': ' + input.title.trim()],
    },
  }
  return registerLegislativeProposal(paid, input)
}

export function negotiateLegislativeProposal(campaign: CampaignState, billId: string): CampaignState | null {
  const bill = campaign.legislature.bills.find((item) => item.id === billId)
  const costs = { actionPoints: 1, politicalCapital: 2 }
  if (!bill || !['committee', 'negotiation'].includes(bill.stage)
    || bill.negotiatedSupport >= legislativeRules.maximumNegotiatedSupport
    || campaign.turn.availableActionPoints < costs.actionPoints
    || campaign.country.politicalCapital < costs.politicalCapital) return null
  const increase = Math.min(legislativeRules.negotiationSupportStep, legislativeRules.maximumNegotiatedSupport - bill.negotiatedSupport)
  const updatedBill = {
    ...bill,
    negotiatedSupport: bill.negotiatedSupport + increase,
    history: [formatDate(campaign) + ': negociação parlamentar elevou a margem de articulação em ' + increase + ' pontos.', ...bill.history].slice(0, 12),
  }
  const next: CampaignState = {
    ...campaign,
    legislature: {
      ...campaign.legislature,
      bills: campaign.legislature.bills.map((item) => item.id === billId ? updatedBill : item),
      history: [formatDate(campaign) + ': articulação política registrada para ' + bill.title + '; apoio não é garantia de voto.', ...campaign.legislature.history].slice(0, 40),
    },
    country: { ...campaign.country, politicalCapital: campaign.country.politicalCapital - costs.politicalCapital },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - costs.actionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, 'Articular apoio para ' + bill.title],
    },
  }
  return next
}

function combineJointBlocs(campaign: CampaignState): LegislativeBloc[] {
  const blocs = new Map<string, LegislativeBloc>()
  for (const bloc of [...campaign.legislature.chamberOfDeputies, ...campaign.legislature.senate]) {
    const existing = blocs.get(bloc.partyId)
    if (existing) existing.seats += bloc.seats
    else blocs.set(bloc.partyId, { ...bloc })
  }
  return [...blocs.values()]
}

function getBlocs(campaign: CampaignState, chamber: LegislativeChamber): LegislativeBloc[] {
  if (chamber === 'house') return campaign.legislature.chamberOfDeputies
  if (chamber === 'senate') return campaign.legislature.senate
  return combineJointBlocs(campaign)
}

function seatCount(campaign: CampaignState, chamber: LegislativeChamber): number {
  return legislativeRules.chambers[chamber].seats
}

function requiredVotes(
  campaign: CampaignState,
  bill: LegislativeBill,
  chamber: LegislativeChamber,
  yes: number,
  no: number,
  overrideVeto = false,
): { quorumNeeded: number; requiredYes: number; passed: boolean; present: number; totalSeats: number } {
  const totalSeats = seatCount(campaign, chamber)
  const present = yes + no
  const quorumNeeded = Math.floor(totalSeats * legislativeRules.ordinaryPresenceQuorumNumerator / legislativeRules.ordinaryPresenceQuorumDenominator) + 1
  let requiredYes: number
  if (overrideVeto || bill.type === 'complementary') {
    requiredYes = Math.floor(totalSeats * legislativeRules.complementaryMajorityNumerator / legislativeRules.complementaryMajorityDenominator) + 1
  } else if (bill.type === 'pec') {
    requiredYes = Math.ceil(totalSeats * legislativeRules.amendmentMajorityNumerator / legislativeRules.amendmentMajorityDenominator)
  } else {
    requiredYes = Math.floor((yes + no) / 2) + 1
  }
  const attendance = present
  return { quorumNeeded, requiredYes, passed: attendance >= quorumNeeded && yes >= requiredYes, present: attendance, totalSeats }
}

function castVote(
  campaign: CampaignState,
  bill: LegislativeBill,
  chamber: LegislativeChamber,
  round: number,
  overrideVeto = false,
): LegislativeVote {
  const blocs = getBlocs(campaign, chamber)
  const totalSeats = seatCount(campaign, chamber)
  const random = seededRandom(campaign.id + ':' + bill.id + ':' + chamber + ':' + round + ':' + (overrideVeto ? 'veto' : 'ordinary'))
  let yes = 0
  let no = 0
  let abstain = 0
  let absent = 0
  for (const bloc of blocs) {
    let probability = overrideVeto
      ? 0.48 + (50 - campaign.country.congressSupport) * 0.005 + bill.negotiatedSupport / 180
      : 0.48 + (campaign.country.congressSupport - 50) * 0.009 + (campaign.country.presidentialApproval - 50) * 0.002
        + bill.negotiatedSupport / 100
    if (bloc.orientation === campaign.orientation) probability += overrideVeto ? 0.025 : 0.105
    else if (bloc.orientation === 'center') probability += 0.015
    else probability -= overrideVeto ? 0.025 : 0.105
    if (bloc.partyId === campaign.party.id) probability += overrideVeto ? -0.035 : 0.18
    if (!overrideVeto && bill.fiscalImpact > 0 && bill.type !== 'loa') {
      probability -= Math.min(0.12, bill.fiscalImpact / 4000)
    } else if (!overrideVeto && bill.fiscalImpact < 0) {
      probability += Math.min(0.08, Math.abs(bill.fiscalImpact) / 5000)
    }
    probability = clamp(probability, overrideVeto ? 0.12 : 0.06, overrideVeto ? 0.82 : 0.94)
    for (let seat = 0; seat < bloc.seats; seat += 1) {
      if (random() > legislativeRules.standardAttendanceRate) {
        absent += 1
        continue
      }
      if (random() < 0.025) {
        abstain += 1
        continue
      }
      if (random() < probability) yes += 1
      else no += 1
    }
  }
  const result = requiredVotes(campaign, bill, chamber, yes, no, overrideVeto)
  const present = yes + no + abstain
  const requiredYes = result.requiredYes
  return {
    id: bill.id + '-' + chamber + '-turno-' + round + (overrideVeto ? '-veto' : ''),
    chamber,
    round,
    dateLabel: formatDate(campaign),
    yes,
    no,
    abstain,
    absent,
    present,
    totalSeats,
    quorumNeeded: result.quorumNeeded,
    requiredYes,
    passed: present >= result.quorumNeeded && yes >= requiredYes,
    note: overrideVeto
      ? 'Análise de veto: exige maioria absoluta em cada Casa, em votações separadas.'
      : bill.type === 'pec'
        ? 'PEC: quórum de três quintos dos membros; dois turnos em cada Casa.'
        : bill.type === 'complementary'
          ? 'Lei complementar: maioria absoluta dos membros.'
          : 'Regra ordinária da simulação: maioria dos votos, com presença mínima configurada.',
  }
}

function setBill(campaign: CampaignState, bill: LegislativeBill): CampaignState {
  return {
    ...campaign,
    legislature: {
      ...campaign.legislature,
      bills: campaign.legislature.bills.map((item) => item.id === bill.id ? bill : item),
    },
  }
}

function rollBackProvisionalMeasure(campaign: CampaignState, bill: LegislativeBill): CampaignState {
  if (!bill.provisionalFiscalImpactApplied || bill.fiscalImpact === 0) return campaign
  return {
    ...campaign,
    economy: {
      ...campaign.economy,
      pressures: {
        ...campaign.economy.pressures,
        expenses: roundOne(campaign.economy.pressures.expenses - bill.fiscalImpact / 12),
        notes: [
          'Efeito fiscal provisório de MP revertido após ' + (bill.stage === 'expired' ? 'perda de vigência' : 'rejeição') + '.',
          ...campaign.economy.pressures.notes,
        ].slice(0, 12),
      },
    },
  }
}

function recalculateMinistryAllocations(
  campaign: CampaignState,
  sectors: CampaignState['economy']['annualBudget']['sectors'],
): CampaignState['ministries'] {
  const allocations = new Map<string, number>()
  for (const sector of sectors) {
    if (!sector.ministryIds.length) continue
    const perMinistry = sector.annualAllocation / sector.ministryIds.length
    for (const ministryId of sector.ministryIds) {
      allocations.set(ministryId, (allocations.get(ministryId) ?? 0) + perMinistry)
    }
  }
  return campaign.ministries.map((ministry) => {
    const annualBudget = roundOne(allocations.get(ministry.id) ?? 0)
    const monthlyAllocation = annualBudget / 12
    return {
      ...ministry,
      annualBudget,
      monthlyAllocation,
      budgetAvailable: Math.max(0, roundOne(monthlyAllocation - ministry.budgetExecuted)),
    }
  })
}

function scaledBudgetSectors(campaign: CampaignState, total: number) {
  const envelope = total * economicRules.sectorBudgetShare
  let allocated = 0
  return campaign.economy.annualBudget.sectors.map((sector, index, all) => {
    const allocation = index === all.length - 1
      ? roundOne(envelope - allocated)
      : roundOne(envelope * sector.share / 100)
    allocated += allocation
    return { ...sector, annualAllocation: allocation }
  })
}

function applyBudgetAmendment(campaign: CampaignState, bill: LegislativeBill): CampaignState | null {
  const source = campaign.economy.annualBudget.sectors.find((sector) => sector.id === bill.sourceSectorId)
  const target = campaign.economy.annualBudget.sectors.find((sector) => sector.id === bill.targetSectorId)
  if (!source || !target || source.id === target.id || bill.fiscalImpact <= 0
    || bill.fiscalImpact > source.annualAllocation - source.executedThisYear) return null
  const envelope = campaign.economy.annualBudget.total * economicRules.sectorBudgetShare
  const shareChange = bill.fiscalImpact / Math.max(1, envelope) * 100
  const newSourceShare = source.share - shareChange
  const newTargetShare = target.share + shareChange
  if (newSourceShare < economicRules.minimumSectorShare || newTargetShare > economicRules.maximumSectorShare) return null
  const sectors = campaign.economy.annualBudget.sectors.map((sector) => {
    if (sector.id === source.id) return { ...sector, annualAllocation: roundOne(sector.annualAllocation - bill.fiscalImpact), share: roundOne(newSourceShare) }
    if (sector.id === target.id) return { ...sector, annualAllocation: roundOne(sector.annualAllocation + bill.fiscalImpact), share: roundOne(newTargetShare) }
    return sector
  })
  const sectorRoundingDiff = roundOne(envelope - sectors.reduce((sum, sector) => sum + sector.annualAllocation, 0))
  const fixedSectors = sectorRoundingDiff === 0 ? sectors : sectors.map((sector, index) =>
    index === sectors.length - 1 ? { ...sector, annualAllocation: roundOne(sector.annualAllocation + sectorRoundingDiff) } : sector)
  return {
    ...campaign,
    economy: {
      ...campaign.economy,
      annualBudget: { ...campaign.economy.annualBudget, sectors: fixedSectors },
    },
    ministries: recalculateMinistryAllocations(campaign, fixedSectors),
  }
}

function applyLegislativeFinancialEffect(campaign: CampaignState, bill: LegislativeBill): CampaignState | null {
  if (bill.type === 'amendment') return applyBudgetAmendment(campaign, bill)
  if (bill.type === 'loa') {
    const total = bill.fiscalImpact
    if (total < campaign.economy.annualBudget.total * legislativeRules.minimumLoaMultiplier
      || total > campaign.economy.annualBudget.total * legislativeRules.maximumLoaMultiplier) return null
    const sectors = scaledBudgetSectors(campaign, total)
    if (sectors.some((sector) => sector.annualAllocation < sector.executedThisYear)) return null
    const annualBudget = {
      ...campaign.economy.annualBudget,
      total,
      fixedCommitments: roundOne(total * (1 - economicRules.sectorBudgetShare)),
      sectors,
      lastRevisionKey: null,
    }
    return {
      ...campaign,
      economy: { ...campaign.economy, annualBudget },
      ministries: recalculateMinistryAllocations(campaign, sectors),
      country: {
        ...campaign.country,
        publicTrust: clamp(campaign.country.publicTrust - Math.max(0, (campaign.economy.annualBudget.total - total) / 1000), 0, 100),
      },
    }
  }
  if (bill.type === 'credit') {
    const amount = bill.fiscalImpact
    const sector = campaign.economy.annualBudget.sectors.find((item) => item.id === bill.targetSectorId)
    if (!sector || amount <= 0 || amount > legislativeRules.creditProposalLimit) return null
    const sectorIncrease = roundOne(amount * economicRules.sectorBudgetShare)
    const fixedIncrease = roundOne(amount * (1 - economicRules.sectorBudgetShare))
    const sectors = campaign.economy.annualBudget.sectors.map((item) =>
      item.id === sector.id ? { ...item, annualAllocation: roundOne(item.annualAllocation + sectorIncrease) } : item)
    const annualBudget = {
      ...campaign.economy.annualBudget,
      total: roundOne(campaign.economy.annualBudget.total + amount),
      fixedCommitments: roundOne(campaign.economy.annualBudget.fixedCommitments + fixedIncrease),
      sectors,
    }
    return {
      ...campaign,
      economy: { ...campaign.economy, annualBudget },
      ministries: recalculateMinistryAllocations(campaign, sectors),
      country: {
        ...campaign.country,
        institutionalStability: clamp(campaign.country.institutionalStability - Math.min(3, amount / 200), 0, 100),
      },
    }
  }
  if (bill.fiscalImpact !== 0) {
    const baseCommitments = campaign.economy.annualBudget.fixedCommitments / 12
    const maximumPressure = Math.max(10, baseCommitments * 0.5)
    const nextExpensePressure = clamp(
      campaign.economy.pressures.expenses + bill.fiscalImpact / 12,
      -maximumPressure,
      maximumPressure,
    )
    return {
      ...campaign,
      economy: {
        ...campaign.economy,
        pressures: {
          ...campaign.economy.pressures,
          expenses: roundOne(nextExpensePressure),
          notes: [
            'Lei aprovada: impacto fiscal recorrente estimado de ' + formatBRLMoney(bill.fiscalImpact / 12) + ' por mês.',
            ...campaign.economy.pressures.notes,
          ].slice(0, 12),
        },
      },
    }
  }
  return campaign
}

function appendBillEvent(campaign: CampaignState, bill: LegislativeBill, message: string): CampaignState {
  const updatedBill = { ...bill, history: [message, ...bill.history].slice(0, 12) }
  return {
    ...campaign,
    legislature: {
      ...campaign.legislature,
      bills: campaign.legislature.bills.map((item) => item.id === bill.id ? updatedBill : item),
      history: [message, ...campaign.legislature.history].slice(0, 40),
    },
  }
}

function rejectBill(campaign: CampaignState, bill: LegislativeBill, reason: string, stage: 'rejected' | 'expired' = 'rejected') {
  let next = rollBackProvisionalMeasure(campaign, { ...bill, stage })
  const rejected = { ...bill, stage, history: [reason, ...bill.history].slice(0, 12) }
  next = setBill(next, rejected)
  next = {
    ...next,
    country: { ...next.country, congressSupport: clamp(next.country.congressSupport - 1, 0, 100) },
    legislature: {
      ...next.legislature,
      history: [reason, ...next.legislature.history].slice(0, 40),
    },
  }
  return next
}

function processBillWeek(
  campaign: CampaignState,
  originalBill: LegislativeBill,
): { campaign: CampaignState; bill: LegislativeBill; event: string | null } {
  let bill: LegislativeBill = {
    ...originalBill,
    daysInProcess: originalBill.daysInProcess + legislativeRules.weeklyDays,
    stageWeeks: originalBill.stageWeeks + 1,
  }
  if (bill.type === 'mp') bill.isUrgent = bill.daysInProcess >= legislativeRules.mpUrgencyAfterDays
  if (bill.type === 'mp' && bill.daysInProcess >= legislativeRules.mpInitialValidityDays + legislativeRules.mpExtensionDays
    && bill.stage !== 'sanction') {
    const reason = 'A medida provisória ' + bill.title + ' perdeu vigência após o prazo configurado de 120 dias sem conclusão das votações.'
    const expiredBill: LegislativeBill = { ...bill, stage: 'expired', history: [reason, ...bill.history].slice(0, 12) }
    return { campaign: rejectBill(campaign, bill, reason, 'expired'), bill: expiredBill, event: reason }
  }
  if (bill.stage === 'sanction' || terminalStages.includes(bill.stage)) return { campaign, bill: originalBill, event: null }
  if (bill.stageWeeks < 1) return { campaign, bill, event: null }

  if (bill.stage === 'committee') {
    const next = { ...bill, stage: 'negotiation' as const, stageWeeks: 0 }
    const message = 'A proposta ' + bill.title + ' concluiu a análise inicial e entrou em negociação.'
    next.history = [message, ...next.history].slice(0, 12)
    return { campaign: appendBillEvent(campaign, next, message), bill: next, event: message }
  }
  if (bill.stage === 'negotiation') {
    const next = { ...bill, stage: 'voting' as const, stageWeeks: 0, currentChamber: initialChamber(bill.type) }
    const message = 'A proposta ' + bill.title + ' foi pautada para votação em ' + legislativeRules.chambers[next.currentChamber].name + '.'
    next.history = [message, ...next.history].slice(0, 12)
    return { campaign: appendBillEvent(campaign, next, message), bill: next, event: message }
  }
  if (bill.stage === 'veto-review') {
    const houseVote = castVote(campaign, bill, 'house', 1, true)
    const senateVote = castVote(campaign, bill, 'senate', 1, true)
    const votes = [...bill.voteHistory, houseVote, senateVote]
    const overridden = houseVote.passed && senateVote.passed
    const message = overridden
      ? 'O Congresso derrubou o veto de ' + bill.title + ' nas duas Casas; a lei foi promulgada na simulação.'
      : 'O veto de ' + bill.title + ' foi mantido: a derrubada não atingiu maioria absoluta nas duas Casas.'
    let nextBill: LegislativeBill = {
      ...bill,
      stage: overridden ? 'approved' : 'rejected',
      voteHistory: votes,
      stageWeeks: 0,
      history: [message, ...bill.history].slice(0, 12),
    }
    let nextCampaign = overridden && !bill.provisionalFiscalImpactApplied
      ? applyLegislativeFinancialEffect(campaign, bill)
      : campaign
    if (!nextCampaign) {
      nextCampaign = campaign
      nextBill = { ...nextBill, stage: 'rejected', history: ['A derrubada do veto não pôde ser aplicada por incompatibilidade orçamentária. ', ...nextBill.history].slice(0, 12) }
    }
    nextCampaign = setBill(nextCampaign, nextBill)
    nextCampaign = {
      ...nextCampaign,
      country: { ...nextCampaign.country, congressSupport: clamp(nextCampaign.country.congressSupport + (overridden ? 1 : -1), 0, 100) },
      legislature: { ...nextCampaign.legislature, history: [message, ...nextCampaign.legislature.history].slice(0, 40) },
    }
    return { campaign: nextCampaign, bill: nextBill, event: message }
  }
  if (bill.stage === 'voting') {
    const vote = castVote(campaign, bill, bill.currentChamber, bill.currentRound)
    let nextBill: LegislativeBill = {
      ...bill,
      voteHistory: [...bill.voteHistory, vote],
      stageWeeks: 0,
    }
    if (!vote.passed) {
      const message = 'A proposta ' + bill.title + ' foi rejeitada em ' + legislativeRules.chambers[bill.currentChamber].name + ' (' + vote.yes + ' a favor, ' + vote.no + ' contra).'
      const rejectedBill: LegislativeBill = { ...nextBill, stage: 'rejected', history: [message, ...nextBill.history].slice(0, 12) }
      return { campaign: rejectBill(campaign, nextBill, message), bill: rejectedBill, event: message }
    }

    let message = ''
    if (bill.type === 'pec' && bill.currentRound < legislativeRules.constitutionalAmendmentRoundsPerChamber) {
      nextBill = { ...nextBill, currentRound: bill.currentRound + 1 }
      message = 'A PEC ' + bill.title + ' passou no turno ' + bill.currentRound + ' e seguirá para o turno ' + nextBill.currentRound + ' na mesma Casa.'
    } else if (bill.type === 'pec' && bill.currentChamber === 'house') {
      nextBill = { ...nextBill, currentChamber: 'senate', currentRound: 1 }
      message = 'A PEC ' + bill.title + ' concluiu os dois turnos na Câmara e segue para os dois turnos no Senado.'
    } else if (bill.type === 'pec') {
      nextBill = { ...nextBill, stage: 'approved' }
      message = 'A PEC ' + bill.title + ' foi aprovada em dois turnos por cada Casa e promulgada; não há sanção presidencial.'
    } else if (bill.currentChamber === 'joint') {
      if (bill.type === 'amendment') {
        const changed = applyBudgetAmendment(campaign, bill)
        if (!changed) {
          message = 'A emenda ' + bill.title + ' recebeu votos suficientes, mas ficou incompatível com a dotação disponível e foi rejeitada na execução.'
          nextBill = { ...nextBill, stage: 'rejected' }
          let nextCampaign = setBill(campaign, { ...nextBill, history: [message, ...nextBill.history].slice(0, 12) })
          nextCampaign = { ...nextCampaign, legislature: { ...nextCampaign.legislature, history: [message, ...nextCampaign.legislature.history].slice(0, 40) } }
          return { campaign: nextCampaign, bill: nextBill, event: message }
        }
        nextBill = { ...nextBill, stage: 'approved' }
        message = 'A emenda ' + bill.title + ' foi aprovada em sessão conjunta e remanejou ' + formatBRLMoney(bill.fiscalImpact) + ' sem aumentar o orçamento total.'
        let nextCampaign = setBill(changed, { ...nextBill, history: [message, ...nextBill.history].slice(0, 12) })
        nextCampaign = { ...nextCampaign, legislature: { ...nextCampaign.legislature, history: [message, ...nextCampaign.legislature.history].slice(0, 40) } }
        return { campaign: nextCampaign, bill: nextBill, event: message }
      }
      nextBill = { ...nextBill, stage: 'sanction' }
      message = 'A proposta orçamentária ' + bill.title + ' passou pela sessão conjunta e aguarda sanção ou veto presidencial.'
    } else if (bill.currentChamber === 'house') {
      nextBill = { ...nextBill, currentChamber: 'senate', currentRound: 1 }
      message = bill.title + ' passou na Câmara e segue para deliberação do Senado.'
    } else if (bill.type === 'mp') {
      nextBill = { ...nextBill, stage: 'approved' }
      message = 'A medida provisória ' + bill.title + ' foi convertida em lei após aprovação nas duas Casas.'
    } else {
      nextBill = { ...nextBill, stage: 'sanction' }
      message = bill.title + ' passou nas duas Casas e aguarda sanção ou veto presidencial.'
    }
    nextBill.history = [message, ...nextBill.history].slice(0, 12)
    let nextCampaign = setBill(campaign, nextBill)
    nextCampaign = {
      ...nextCampaign,
      country: { ...nextCampaign.country, congressSupport: clamp(nextCampaign.country.congressSupport + 1, 0, 100) },
      legislature: { ...nextCampaign.legislature, history: [message, ...nextCampaign.legislature.history].slice(0, 40) },
    }
    return { campaign: nextCampaign, bill: nextBill, event: message }
  }
  return { campaign, bill, event: null }
}

export function advanceLegislatureWeek(
  campaign: CampaignState,
  endingCalendar: CampaignState['calendar'] = campaign.calendar,
): { campaign: CampaignState; events: string[] } {
  const key = endingCalendar.year + '-' + endingCalendar.month + '-' + endingCalendar.week
  if (campaign.legislature.lastAdvancedKey === key) return { campaign, events: [] }
  let working = {
    ...campaign,
    legislature: { ...campaign.legislature, lastAdvancedKey: key },
  }
  const originalBills = [...campaign.legislature.bills]
  const processedBills = [...originalBills]
  const events: string[] = []
  for (let index = 0; index < originalBills.length; index += 1) {
    const bill = originalBills[index]
    if (terminalStages.includes(bill.stage) || bill.stage === 'sanction') continue
    const processed = processBillWeek(working, bill)
    working = processed.campaign
    processedBills[index] = processed.bill
    if (processed.event) events.push(processed.event)
  }
  working = {
    ...working,
    legislature: {
      ...working.legislature,
      bills: processedBills,
      lastAdvancedKey: key,
    },
    news: events.length
      ? [...working.news, ...events.slice(0, 3).map((event, index) => ({
        id: 'legislature-' + key + '-' + index,
        category: 'CONGRESSO',
        time: 'SEMANA',
        title: event.length > 72 ? event.slice(0, 69) + '…' : event,
        summary: event,
        tone: event.includes('rejeitad') || event.includes('veto foi mantido') || event.includes('perdeu vigência') ? 'warning' as const : 'neutral' as const,
      }))].slice(-8)
      : working.news,
  }
  return { campaign: working, events }
}

export function decidePresidentialSanction(
  campaign: CampaignState,
  billId: string,
  decision: 'sanction' | 'veto',
): CampaignState | null {
  const bill = campaign.legislature.bills.find((item) => item.id === billId)
  if (!bill || bill.stage !== 'sanction' || bill.type === 'pec' || bill.type === 'mp'
    || campaign.turn.availableActionPoints < 1) return null
  if (decision === 'veto' && campaign.country.politicalCapital < 2) return null

  let working = campaign
  let nextStage: LegislativeStage
  let message: string
  if (decision === 'sanction') {
    const financiallyApplied = bill.provisionalFiscalImpactApplied
      ? working
      : applyLegislativeFinancialEffect(working, bill)
    if (!financiallyApplied) return null
    working = financiallyApplied
    nextStage = 'approved'
    message = 'O presidente sancionou ' + bill.title + '. O efeito fiscal segue a regra do tipo de proposição; a sanção não substitui a execução orçamentária.'
  } else {
    nextStage = 'veto-review'
    message = 'O presidente vetou ' + bill.title + '; o Congresso poderá deliberar sobre a manutenção ou derrubada do veto.'
  }
  const updatedBill: LegislativeBill = {
    ...bill,
    stage: nextStage,
    stageWeeks: 0,
    vetoReason: decision === 'veto' ? 'Veto registrado pelo Executivo para deliberação posterior do Congresso.' : null,
    history: [formatDate(campaign) + ': ' + message, ...bill.history].slice(0, 12),
  }
  working = setBill(working, updatedBill)
  working = {
    ...working,
    country: {
      ...working.country,
      politicalCapital: working.country.politicalCapital - (decision === 'veto' ? 2 : 0),
    },
    turn: {
      ...working.turn,
      availableActionPoints: working.turn.availableActionPoints - 1,
      actionsTaken: [...working.turn.actionsTaken, decision === 'sanction' ? 'Sancionar ' + bill.title : 'Vetar ' + bill.title],
    },
    legislature: {
      ...working.legislature,
      history: [message, ...working.legislature.history].slice(0, 40),
    },
  }
  return working
}
