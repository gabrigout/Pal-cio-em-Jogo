export interface CampaignState {
  month: string
  year: number
  week: number
  weeksPerMonth: number
}

export const initialCampaignState: CampaignState = {
  month: 'Janeiro',
  year: 2027,
  week: 1,
  weeksPerMonth: 4,
}