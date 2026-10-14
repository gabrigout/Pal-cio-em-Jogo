import { ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, CircleAlert, CircleHelp, TriangleAlert } from 'lucide-react'
import type { DashboardMetric } from '../state/types'
import { clampProgress } from '../engine/dashboard'

interface MetricCardProps {
  metric: DashboardMetric
}

export default function MetricCard({ metric }: MetricCardProps) {
  const TrendIcon = metric.change.startsWith('+')
    ? ArrowUpRight
    : metric.change.startsWith('−')
      ? ArrowDownRight
      : ArrowRight
  const StatusIcon = metric.tone === 'critical'
    ? CircleAlert
    : metric.tone === 'warning'
      ? TriangleAlert
      : metric.tone === 'positive'
        ? CheckCircle2
        : CircleHelp

  return (
    <article className={`metric-card tone-${metric.tone}`}>
      <div className="metric-card-top">
        <span className="metric-label">{metric.label}</span>
        <span className="metric-trend">
          <TrendIcon aria-hidden="true" size={14} />
          {metric.change}
        </span>
      </div>
      <strong className="metric-value">{metric.value}</strong>
      <span className="metric-status">
        <StatusIcon aria-hidden="true" size={12} /> {metric.statusLabel}
      </span>
      <span className="metric-detail">{metric.detail}</span>
      <div
        aria-label={`${metric.progress}%`}
        className="metric-track"
        role="img"
      >
        <span style={{ width: `${clampProgress(metric.progress)}%` }} />
      </div>
    </article>
  )
}