import { dashboardMetricLabels } from '../data/dashboard'
import { dashboardStatusBands } from '../data/campaignConfig'
import type { CampaignState, DashboardMetric, MetricTone } from '../state/types'
import { formatBRLMoney } from '../utils/money'

export function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export function getIndicatorStatus(value: number): DashboardMetric['statusLabel'] {
  if (value < dashboardStatusBands.criticalBelow) return 'Crítico'
  if (value < dashboardStatusBands.attentionBelow) return 'Atenção'
  return 'Estável'
}

function statusTone(status: DashboardMetric['statusLabel']): MetricTone {
  if (status === 'Crítico') return 'critical'
  if (status === 'Atenção') return 'warning'
  return 'positive'
}

export function getDashboardMetrics(campaign: CampaignState): DashboardMetric[] {
  const { country } = campaign
  const cashCoverageMonths = country.budget / Math.max(1, campaign.economy.indicators.publicExpenses)
  const cashScore = clampProgress(cashCoverageMonths * 50)
  const resourceBalance = Math.round((cashScore + country.politicalCapital + country.administrativeCapacity) / 3)
  const resourceStatus = getIndicatorStatus(resourceBalance)
  const publicClimate = Math.min(100 - country.polarization, country.publicTrust)
  const climateStatus = getIndicatorStatus(publicClimate)

  return [
    {
      id: 'approval', label: dashboardMetricLabels.approval,
      value: `${country.presidentialApproval}%`, detail: 'Opinião pública inicial',
      change: 'início da campanha', tone: statusTone(getIndicatorStatus(country.presidentialApproval)),
      statusLabel: getIndicatorStatus(country.presidentialApproval),
      progress: country.presidentialApproval,
    },
    {
      id: 'congress', label: dashboardMetricLabels.congress,
      value: `${country.congressSupport}%`, detail: 'Base em construção',
      change: `${campaign.party.seats} cadeiras do partido`, tone: statusTone(getIndicatorStatus(country.congressSupport)),
      statusLabel: getIndicatorStatus(country.congressSupport),
      progress: country.congressSupport,
    },
    {
      id: 'economy', label: dashboardMetricLabels.economy,
      value: `${country.economicOutlook}%`, detail: 'Atividade econômica inicial',
      change: 'cenário inicial', tone: statusTone(getIndicatorStatus(country.economicOutlook)),
      statusLabel: getIndicatorStatus(country.economicOutlook),
      progress: country.economicOutlook,
    },
    {
      id: 'resources', label: dashboardMetricLabels.resources,
      value: resourceStatus === 'Estável' ? 'Equilibrados' : resourceStatus === 'Atenção' ? 'Limitados' : 'Escassos',
      detail: `Caixa ${formatBRLMoney(country.budget)} · cobertura ${cashCoverageMonths.toFixed(1)} mês · capital ${country.politicalCapital} · gestão ${country.administrativeCapacity}`,
      change: '3 recursos distintos', tone: statusTone(resourceStatus), statusLabel: resourceStatus, progress: resourceBalance,
    },
    {
      id: 'stability', label: dashboardMetricLabels.stability,
      value: `${country.institutionalStability}%`, detail: 'Poderes independentes',
      change: 'cenário inicial', tone: statusTone(getIndicatorStatus(country.institutionalStability)),
      statusLabel: getIndicatorStatus(country.institutionalStability),
      progress: country.institutionalStability,
    },
    {
      id: 'trust', label: dashboardMetricLabels.trust,
      value: `${country.polarization}% / ${country.publicTrust}%`,
      detail: 'Polarização / confiança pública', change: 'atenção equilibrada',
      tone: statusTone(climateStatus),
      statusLabel: climateStatus, progress: publicClimate,
    },
    {
      id: 'integrity', label: dashboardMetricLabels.integrity,
      value: `${country.publicIntegrity}%`, detail: 'Indicador geral inicial',
      change: 'monitorada', tone: statusTone(getIndicatorStatus(country.publicIntegrity)),
      statusLabel: getIndicatorStatus(country.publicIntegrity),
      progress: country.publicIntegrity,
    },
    {
      id: 'foreign', label: dashboardMetricLabels.foreign,
      value: `${country.foreignRelations}%`, detail: 'Agenda diplomática inicial',
      change: 'cenário inicial', tone: statusTone(getIndicatorStatus(country.foreignRelations)),
      statusLabel: getIndicatorStatus(country.foreignRelations),
      progress: country.foreignRelations,
    },
  ]
}