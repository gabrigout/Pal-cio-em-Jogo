import { indicatorLabels } from '../data/campaignConfig'
import { ministryCatalog } from '../data/ministries'
import { parties } from '../data/parties'
import type {
  CampaignState,
  CountryIndicators,
  ExecutiveDecisionEffect,
  IndicatorChange,
  MinisterCandidate,
  MinistryState,
  PartyDefinition,
} from '../state/types'

const firstNames = ['Lia', 'Caio', 'Nara', 'Ivo', 'Bia', 'Téo', 'Luma', 'Ravi', 'Cora', 'Davi', 'Malu', 'Noel']
const familyNames = ['Laranjeira', 'do Horizonte', 'Ponte Alta', 'Vento Sul', 'de Mirante', 'Ribeiro Claro', 'Vale Sereno', 'Campos Novos', 'Luz do Norte', 'das Acácias', 'Maré Mansa', 'Pedra Branca']
const profiles = [
  'Gestora metódica, focada em execução e pactos de equipe.',
  'Articulador pragmático, conhecido por negociar metas realistas.',
  'Especialista técnica, prefere evidências e prestação de contas.',
  'Comunicadora popular, valoriza entregas visíveis e escuta pública.',
  'Organizador de coalizões, costuma buscar acordos antes de anunciar.',
  'Reformadora ambiciosa, cobra ritmo e autonomia para a pasta.',
]

function roll(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function partyForCampaign(campaign: CampaignState): PartyDefinition[] {
  const compatible: PartyDefinition[] = parties.filter((party) =>
    party.ideology === campaign.orientation || party.ideology === 'center',
  )
  if (!compatible.some((party) => party.id === campaign.party.id)) {
    compatible.unshift({
      id: campaign.party.id,
      acronym: campaign.party.acronym,
      fullName: campaign.party.fullName,
      ideology: campaign.orientation,
      description: campaign.party.description,
      colors: [campaign.party.colors[0], campaign.party.colors[1]],
    })
  }
  return compatible
}

function createCandidate(
  campaign: CampaignState,
  ministryId: string,
  index: number,
  party: PartyDefinition,
  random: () => number,
): MinisterCandidate {
  const isPresidentParty = party.id === campaign.party.id
  const affiliated = party.ideology === campaign.orientation || party.ideology === 'center'
  return {
    id: `${ministryId}-candidate-${index}`,
    name: `${firstNames[roll(0, firstNames.length - 1, random)]} ${familyNames[(index * 3 + roll(0, familyNames.length - 1, random)) % familyNames.length]}`,
    partyId: party.id,
    partyName: party.fullName,
    partyAcronym: party.acronym,
    profile: profiles[roll(0, profiles.length - 1, random)],
    attributes: {
      competence: roll(48, 82, random),
      loyalty: isPresidentParty ? roll(68, 88, random) : affiliated ? roll(48, 73, random) : roll(28, 54, random),
      popularity: roll(36, 68, random),
      integrity: roll(53, 86, random),
      influence: roll(35, 76, random),
      ambition: roll(32, 74, random),
      relations: roll(38, 78, random),
    },
  }
}

export function createInitialMinistries(
  campaign: CampaignState,
  random: () => number = Math.random,
): MinistryState[] {
  const cabinetParties = partyForCampaign(campaign)
  const playerPartyIndex = cabinetParties.findIndex((party) => party.id === campaign.party.id)
  const otherParties = cabinetParties.filter((party) => party.id !== campaign.party.id)
  const opposition = parties.find((party) =>
    party.ideology !== campaign.orientation && party.ideology !== 'center',
  )

  return ministryCatalog.map((definition, ministryIndex) => {
    const candidateParties = [
      cabinetParties[playerPartyIndex],
      otherParties[ministryIndex % Math.max(1, otherParties.length)],
      opposition ?? otherParties[(ministryIndex + 1) % Math.max(1, otherParties.length)] ?? cabinetParties[playerPartyIndex],
    ].filter((party, index, all) => party && all.findIndex((candidate) => candidate.id === party.id) === index)
    const candidates = candidateParties.map((party, index) =>
      createCandidate(campaign, definition.id, index, party, random),
    )
    const initialMinister = candidates[ministryIndex % 3 === 0 && candidates[1] ? 1 : 0]
    return {
      ...definition,
      competences: [...definition.competences],
      monthlyAllocation: Math.floor(definition.annualBudget / 12),
      budgetAvailable: Math.floor(definition.annualBudget / 12),
      budgetExecuted: 0,
      administrativePerformance: initialMinister
        ? Math.round(initialMinister.attributes.competence * 0.55 + initialMinister.attributes.integrity * 0.25 + campaign.country.administrativeCapacity * 0.2)
        : 0,
      minister: initialMinister ?? null,
      candidates,
      negotiatedCandidateIds: [],
      pendingItems: [],
      risks: [],
      alerts: [],
    }
  })
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function recordCountryChanges(
  campaign: CampaignState,
  previous: CampaignState,
  indicators: Array<keyof CountryIndicators>,
  reason: string,
): CampaignState {
  const changes: IndicatorChange[] = indicators.flatMap((indicator) => {
    const amount = campaign.country[indicator] - previous.country[indicator]
    return amount === 0 ? [] : [{ indicator, label: indicatorLabels[indicator], amount, reason }]
  })
  return {
    ...campaign,
    turn: { ...campaign.turn, weeklyChanges: [...campaign.turn.weeklyChanges, ...changes] },
  }
}

function appendReaction(campaign: CampaignState, ministry: MinistryState): CampaignState {
  const partyReaction = ministry.minister?.partyId === campaign.party.id ? 0 : -1
  return {
    ...campaign,
    country: {
      ...campaign.country,
      executiveSupport: clamp(campaign.country.executiveSupport - 2),
      congressSupport: clamp(campaign.country.congressSupport + partyReaction),
      publicTrust: clamp(campaign.country.publicTrust - 1),
    },
  }
}

export function dismissMinister(campaign: CampaignState, ministryId: string): CampaignState | null {
  const ministry = campaign.ministries.find((item) => item.id === ministryId)
  if (!ministry?.minister || campaign.turn.availableActionPoints < 1 || campaign.country.politicalCapital < 4) return null
  const dismissedName = ministry.minister.name
  const updatedMinistry = {
    ...ministry,
    minister: null,
    pendingItems: [`Indicação para substituir ${dismissedName} pendente.`, ...ministry.pendingItems].slice(0, 4),
    alerts: [`Exoneração recente: partido, base e imprensa podem reagir.`, ...ministry.alerts].slice(0, 4),
  }
  const reacted = appendReaction(campaign, ministry)
  const result: CampaignState = {
    ...reacted,
    ministries: reacted.ministries.map((item) => item.id === ministryId ? updatedMinistry : item),
    country: { ...reacted.country, politicalCapital: reacted.country.politicalCapital - 4 },
    turn: {
      ...reacted.turn,
      availableActionPoints: reacted.turn.availableActionPoints - 1,
      actionsTaken: [...reacted.turn.actionsTaken, `Exonerar ministro de ${ministry.name}`],
    },
    news: [...reacted.news, {
      id: `exoneration-${ministryId}-${campaign.calendar.year}-${campaign.calendar.month}-${campaign.calendar.week}`,
      category: 'GOVERNO',
      time: 'SEMANA',
      title: `Mudança no comando de ${ministry.name}`,
      summary: `A exoneração de ${dismissedName} gerou reação do partido, da base do governo e da imprensa.`,
      tone: 'warning' as const,
    }].slice(-8),
  }
  return recordCountryChanges(
    result,
    campaign,
    ['executiveSupport', 'congressSupport', 'publicTrust', 'politicalCapital'],
    `Custos e reações da exoneração de ${dismissedName}.`,
  )
}

export function appointMinister(
  campaign: CampaignState,
  ministryId: string,
  candidateId: string,
): CampaignState | null {
  const ministry = campaign.ministries.find((item) => item.id === ministryId)
  const candidate = ministry?.candidates.find((item) => item.id === candidateId)
  if (!ministry || ministry.minister || !candidate || campaign.turn.availableActionPoints < 1) return null
  if (candidate.attributes.competence < 35 || candidate.attributes.integrity < 30) return null
  const crossParty = candidate.partyId !== campaign.party.id
  const politicalCost = crossParty ? 4 : 2
  if (campaign.country.politicalCapital < politicalCost) return null
  const supportChange = crossParty ? 3 : 0
  const result: CampaignState = {
    ...campaign,
    ministries: campaign.ministries.map((item) => item.id === ministryId
      ? {
        ...item,
        minister: candidate,
        pendingItems: item.pendingItems.filter((pending) => !pending.startsWith('Indicação para substituir')),
        alerts: item.alerts.filter((alert) => !alert.startsWith('Exoneração recente')),
      }
      : item),
    country: {
      ...campaign.country,
      politicalCapital: campaign.country.politicalCapital - politicalCost,
      congressSupport: clamp(campaign.country.congressSupport + supportChange),
      executiveSupport: clamp(campaign.country.executiveSupport + (crossParty ? 0 : 1)),
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - 1,
      actionsTaken: [...campaign.turn.actionsTaken, `Nomear ${candidate.name} para ${ministry.name}`],
    },
    news: [...campaign.news, {
      id: `appointment-${ministryId}-${candidate.id}-${campaign.calendar.year}-${campaign.calendar.week}`,
      category: 'GOVERNO',
      time: 'SEMANA',
      title: `Nova indicação para ${ministry.name}`,
      summary: `${candidate.name}, do ${candidate.partyAcronym}, assume a pasta. Requisitos técnicos foram verificados; apoio político não os substitui.`,
      tone: 'neutral' as const,
    }].slice(-8),
  }
  return recordCountryChanges(
    result,
    campaign,
    ['politicalCapital', 'congressSupport', 'executiveSupport'],
    `Custos e efeitos da nomeação de ${candidate.name}.`,
  )
}

export function negotiateMinisterNomination(
  campaign: CampaignState,
  ministryId: string,
  candidateId: string,
): CampaignState | null {
  const ministry = campaign.ministries.find((item) => item.id === ministryId)
  const candidate = ministry?.candidates.find((item) => item.id === candidateId)
  if (!ministry || ministry.minister || !candidate
    || ministry.negotiatedCandidateIds.includes(candidateId)
    || campaign.turn.availableActionPoints < 1
    || campaign.country.politicalCapital < 2) return null
  const result: CampaignState = {
    ...campaign,
    ministries: campaign.ministries.map((item) => item.id === ministryId
      ? { ...item, negotiatedCandidateIds: [...item.negotiatedCandidateIds, candidateId] }
      : item),
    country: {
      ...campaign.country,
      politicalCapital: campaign.country.politicalCapital - 2,
      congressSupport: clamp(campaign.country.congressSupport + (candidate.partyId === campaign.party.id ? 0 : 2)),
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - 1,
      actionsTaken: [...campaign.turn.actionsTaken, `Negociar indicação para ${ministry.name}`],
    },
  }
  return recordCountryChanges(result, campaign, ['politicalCapital', 'congressSupport'], 'Custos e efeito da negociação de indicação.')
}

export function proposeMinistryReorganization(campaign: CampaignState): CampaignState | null {
  if (campaign.executiveProposals.includes('Reorganização da estrutura ministerial')
    || campaign.turn.availableActionPoints < 1 || campaign.country.politicalCapital < 2) return null
  const result: CampaignState = {
    ...campaign,
    executiveProposals: [...campaign.executiveProposals, 'Reorganização da estrutura ministerial'],
    country: { ...campaign.country, politicalCapital: campaign.country.politicalCapital - 2 },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - 1,
      actionsTaken: [...campaign.turn.actionsTaken, 'Encaminhar proposta de reorganização ministerial ao Congresso'],
    },
    news: [...campaign.news, {
      id: `ministry-proposal-${campaign.calendar.year}-${campaign.calendar.month}`,
      category: 'PROPOSTA LEGISLATIVA',
      time: 'SEMANA',
      title: 'Proposta de reorganização ministerial registrada',
      summary: 'A proposta depende do Congresso e ainda não tem tramitação nesta fase do jogo. A estrutura atual permanece inalterada.',
      tone: 'neutral' as const,
    }].slice(-8),
  }
  return recordCountryChanges(result, campaign, ['politicalCapital'], 'Custo para registrar proposta dependente do Congresso.')
}

export function applyExecutiveDecision(
  campaign: CampaignState,
  effect: ExecutiveDecisionEffect,
): CampaignState | null {
  const ministry = campaign.ministries.find((item) => item.id === effect.ministryId)
  if (!ministry?.minister) return campaign
  if (effect.kind === 'dismiss') return dismissMinister(campaign, effect.ministryId)

  const changes: Partial<MinisterCandidate['attributes']> = effect.kind === 'defend'
    ? { loyalty: Math.min(100, ministry.minister.attributes.loyalty + 2) }
    : effect.kind === 'wait' || effect.kind === 'investigate'
      ? {}
      : effect.kind === 'negotiate-budget'
        ? { relations: Math.min(100, ministry.minister.attributes.relations + 2) }
        : { relations: Math.min(100, ministry.minister.attributes.relations + 3), loyalty: Math.min(100, ministry.minister.attributes.loyalty + 1) }
  const notice = effect.kind === 'investigate'
    ? 'Apuração em andamento; investigação não equivale a culpa.'
    : effect.kind === 'wait'
      ? 'Aguardando novos elementos; não há conclusão sobre responsabilidade.'
      : null
  return {
    ...campaign,
    ministries: campaign.ministries.map((item) => item.id === effect.ministryId
      ? {
        ...item,
        minister: item.minister ? { ...item.minister, attributes: { ...item.minister.attributes, ...changes } } : null,
        pendingItems: notice ? [notice, ...item.pendingItems.filter((pending) => pending !== notice)].slice(0, 4) : item.pendingItems,
        alerts: notice ? [notice, ...item.alerts.filter((alert) => alert !== notice)].slice(0, 4) : item.alerts,
      }
      : item),
  }
}

export function closeExecutiveMonth(campaign: CampaignState): { campaign: CampaignState; report: string[]; changes: IndicatorChange[] } {
  let executiveSupport = campaign.country.executiveSupport
  const report: string[] = []
  const ministries = campaign.ministries.map((ministry) => {
    const minister = ministry.minister
    if (!minister) {
      report.push(`${ministry.name}: sem ministro; indicação necessária. Desempenho administrativo não recalculado.`)
      return { ...ministry, budgetAvailable: ministry.monthlyAllocation, budgetExecuted: 0 }
    }
    const attributes = minister.attributes
    const budgetAdequacy = ministry.budgetAvailable >= ministry.monthlyAllocation ? 100
      : ministry.monthlyAllocation > 0 ? Math.round(ministry.budgetAvailable / ministry.monthlyAllocation * 100) : 0
    const performance = clamp(Math.round(
      attributes.competence * 0.4
      + attributes.integrity * 0.2
      + budgetAdequacy * 0.2
      + campaign.country.administrativeCapacity * 0.2,
    ))
    const executed = Math.min(ministry.budgetAvailable, Math.floor(ministry.monthlyAllocation * (0.45 + performance / 200)))
    const ambitiousAndDisloyal = attributes.ambition >= 72 && attributes.loyalty <= 45
    const pending = ambitiousAndDisloyal
      ? 'Sinal de agenda própria: alinhar prioridades e responsabilidades do gabinete.'
      : null
    if (ambitiousAndDisloyal) executiveSupport = clamp(executiveSupport - 1)
    report.push(`${ministry.name}: desempenho ${performance}/100; execução ${executed}/${ministry.monthlyAllocation} u.${ambitiousAndDisloyal ? ' Sinal de desalinhamento registrado.' : ''}`)
    return {
      ...ministry,
      administrativePerformance: performance,
      budgetAvailable: ministry.monthlyAllocation,
      budgetExecuted: executed,
      pendingItems: pending
        ? [pending, ...ministry.pendingItems.filter((item) => item !== pending)].slice(0, 4)
        : ministry.pendingItems,
      risks: ambitiousAndDisloyal
        ? ['Ambição alta e lealdade baixa podem tensionar a coordenação.']
        : performance < 45 ? ['Desempenho baixo exige acompanhamento da execução.'] : [],
      alerts: ambitiousAndDisloyal
        ? ['Ministro sinaliza agenda própria; decisão política não implica irregularidade.']
        : ministry.alerts.filter((alert) => !alert.startsWith('Ministro sinaliza agenda própria')),
    }
  })
  const updated = recordCountryChanges({
    ...campaign,
    ministries,
    country: { ...campaign.country, executiveSupport },
  }, campaign, ['executiveSupport'], 'Desalinhamento ministerial afetou o apoio interno do Executivo.')
  return {
    campaign: updated,
    report,
    changes: updated.turn.weeklyChanges.slice(campaign.turn.weeklyChanges.length),
  }
}
