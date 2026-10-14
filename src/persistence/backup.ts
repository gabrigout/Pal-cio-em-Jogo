import type { CampaignState } from '../state/types'
import { exportCampaignJson } from './campaignRepository'

export function downloadCampaignBackup(campaign: CampaignState, savedAt: string): void {
  const file = new Blob([exportCampaignJson(campaign, savedAt)], { type: 'application/json' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `${campaign.party.acronym.toLowerCase()}-${campaign.calendar.year}-semana-${campaign.calendar.week}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
