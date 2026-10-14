import { dashboardMetricLabels } from '../data/dashboard'
import type { CampaignState, DashboardMetric, MetricTone } from '../state/types'

export function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function rating(value: number): string {
  if (value >= 68) return 'Favorável'
  if (value >= 54) return 'Regular'
  return 'Atenção'
}

function ratingTone(value: number): MetricTone {
  if (value >= 64) return 'positive'
  if (value >= 50) return 'warning'
  return 'critical'
}

function ratingStatus(value: number): string {
  if (value >= 64) return 'Estável'
  if (value >= 50) return 'Atenção'
  return 'Crítico'
}

export function getDashboardMetrics(campaign: CampaignState): DashboardMetric[] {
  const { country } = campaign
  const resourceBalance = Math.round(
    (country.budget + country.politicalCapital + country.administrativeCapacity) / 3,
  )

  return [
    {
      id: 'approval', label: dashboardMetricLabels.approval,
      value: `${country.presidentialApproval}%`, detail: 'Opinião pública inicial',
      change: 'início da campanha', tone: ratingTone(country.presidentialApproval),
      statusLabel: ratingStatus(country.presidentialApproval),
      progress: country.presidentialApproval,
    },
    {
      id: 'congress', label: dashboardMetricLabels.congress,
      value: `${country.congressSupport}%`, detail: 'Base em construção',
      change: `${campaign.party.seats} cadeiras do partido`, tone: ratingTone(country.congressSupport),
      statusLabel: ratingStatus(country.congressSupport),
      progress: country.congressSupport,
    },
    {
      id: 'economy', label: dashboardMetricLabels.economy,
      value: rating(country.economicOutlook), detail: `Atividade · ${country.economicOutlook}/100`,
      change: 'cenário inicial', tone: ratingTone(country.economicOutlook),
      statusLabel: ratingStatus(country.economicOutlook),
      progress: country.economicOutlook,
    },
    {
      id: 'resources', label: dashboardMetricLabels.resources,
      value: 'Equilibrados',
      detail: `Orçamento ${country.budget} · capital ${country.politicalCapital} · gestão ${country.administrativeCapacity}`,
      change: '3 recursos distintos', tone: 'neutral', statusLabel: ratingStatus(resourceBalance), progress: resourceBalance,
    },
    {
      id: 'stability', label: dashboardMetricLabels.stability,
      value: `${country.institutionalStability}%`, detail: 'Poderes independentes',
      change: 'cenário inicial', tone: ratingTone(country.institutionalStability),
      statusLabel: ratingStatus(country.institutionalStability),
      progress: country.institutionalStability,
    },
    {
      id: 'trust', label: dashboardMetricLabels.trust,
      value: `${country.polarization}% / ${country.publicTrust}%`,
      detail: 'Polarização / confiança pública', change: 'atenção equilibrada',
      tone: country.polarization > 50 ? 'warning' : 'neutral',
      statusLabel: country.polarization > 50 ? 'Atenção' : 'Estável', progress: country.publicTrust,
    },
    {
      id: 'integrity', label: dashboardMetricLabels.integrity,
      value: rating(country.publicIntegrity), detail: 'Indicador geral inicial',
      change: 'monitorada', tone: ratingTone(country.publicIntegrity),
      statusLabel: ratingStatus(country.publicIntegrity),
      progress: country.publicIntegrity,
    },
    {
      id: 'foreign', label: dashboardMetricLabels.foreign,
      value: rating(country.foreignRelations), detail: 'Agenda diplomática inicial',
      change: 'cenário inicial', tone: ratingTone(country.foreignRelations),
      statusLabel: ratingStatus(country.foreignRelations),
      progress: country.foreignRelations,
    },
  ]
}