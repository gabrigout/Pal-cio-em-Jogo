import { countryRanges, partyRanges } from '../data/campaignConfig'
import { parties } from '../data/parties'
import { initialCalendar } from '../state/initialState'
import { createCampaignTheme } from './theme'
import type {
  CampaignState,
  CountryIndicators,
  PartyDefinition,
  PartySelection,
  PoliticalOrientation,
} from '../state/types'

function randomInRange(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

export function getCompatibleParties(orientation: PoliticalOrientation): PartyDefinition[] {
  return parties
    .filter((party) => party.ideology === orientation || party.ideology === 'center')
    .map((party) => ({ ...party, colors: [party.colors[0], party.colors[1]] }))
}

export function selectionFromDefinition(definition: PartyDefinition): PartySelection {
  return {
    id: definition.id,
    acronym: definition.acronym,
    fullName: definition.fullName,
    description: definition.description,
    colors: [definition.colors[0], definition.colors[1]],
    custom: false,
  }
}

export function selectPartyColor(currentColors: string[], color: string): string[] {
  if (currentColors.includes(color)) return currentColors.filter((selected) => selected !== color)
  if (currentColors.length < 2) return [...currentColors, color]
  return [currentColors[0], color]
}

export function createCustomPartySelection(
  name: string,
  acronym: string,
  colors: string[],
): PartySelection | null {
  if (!isCustomPartyValid(name, acronym, colors)) return null
  return {
    id: 'custom',
    fullName: name.trim(),
    acronym: acronym.trim().replace(/\s+/g, '').toUpperCase(),
    description: 'Partido personalizado criado para esta campanha.',
    colors: [colors[0], colors[1]],
    custom: true,
  }
}

function rollCountryIndicators(random: () => number): CountryIndicators {
  return {
    presidentialApproval: randomInRange(countryRanges.presidentialApproval.min, countryRanges.presidentialApproval.max, random),
    congressSupport: randomInRange(countryRanges.congressSupport.min, countryRanges.congressSupport.max, random),
    economicOutlook: randomInRange(countryRanges.economicOutlook.min, countryRanges.economicOutlook.max, random),
    budget: randomInRange(countryRanges.budget.min, countryRanges.budget.max, random),
    politicalCapital: randomInRange(countryRanges.politicalCapital.min, countryRanges.politicalCapital.max, random),
    administrativeCapacity: randomInRange(countryRanges.administrativeCapacity.min, countryRanges.administrativeCapacity.max, random),
    institutionalStability: randomInRange(countryRanges.institutionalStability.min, countryRanges.institutionalStability.max, random),
    polarization: randomInRange(countryRanges.polarization.min, countryRanges.polarization.max, random),
    publicTrust: randomInRange(countryRanges.publicTrust.min, countryRanges.publicTrust.max, random),
    publicIntegrity: randomInRange(countryRanges.publicIntegrity.min, countryRanges.publicIntegrity.max, random),
    foreignRelations: randomInRange(countryRanges.foreignRelations.min, countryRanges.foreignRelations.max, random),
  }
}

export function createCampaign(
  orientation: PoliticalOrientation,
  selection: PartySelection,
  random: () => number = Math.random,
): CampaignState {
  const party = {
    ...selection,
    colors: [selection.colors[0], selection.colors[1]] as [string, string],
    orientation,
    popularity: selection.custom ? 3 : randomInRange(partyRanges.popularity.min, partyRanges.popularity.max, random),
    influence: randomInRange(
      selection.custom ? partyRanges.customInfluence.min : partyRanges.influence.min,
      selection.custom ? partyRanges.customInfluence.max : partyRanges.influence.max,
      random,
    ),
    parliamentarySupport: randomInRange(
      selection.custom ? partyRanges.customParliamentarySupport.min : partyRanges.parliamentarySupport.min,
      selection.custom ? partyRanges.customParliamentarySupport.max : partyRanges.parliamentarySupport.max,
      random,
    ),
    resources: randomInRange(
      selection.custom ? partyRanges.customResources.min : partyRanges.resources.min,
      selection.custom ? partyRanges.customResources.max : partyRanges.resources.max,
      random,
    ),
    seats: randomInRange(
      selection.custom ? partyRanges.customSeats.min : partyRanges.seats.min,
      selection.custom ? partyRanges.customSeats.max : partyRanges.seats.max,
      random,
    ),
  }

  return {
    id: `campaign-${Date.now()}-${randomInRange(1000, 9999, random)}`,
    orientation,
    party,
    calendar: { ...initialCalendar },
    country: rollCountryIndicators(random),
    theme: createCampaignTheme(selection.colors[0], selection.colors[1]),
  }
}

export function isCustomPartyValid(name: string, acronym: string, colors: string[]): boolean {
  return name.trim().length >= 3
    && acronym.trim().replace(/\s+/g, '').length >= 2
    && colors.length === 2
    && colors[0] !== colors[1]
}