import { useRef } from 'react'
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  Flag,
  Radio,
} from 'lucide-react'
import { getDashboardMetrics } from '../engine/dashboard'
import { getTurnDashboardData } from '../engine/turn'
import {
  activeWork,
  closedWork,
  waitingWork,
} from '../data/dashboard'
import type { CampaignState, DecisionResult, WorkItem } from '../state/types'
import MetricCard from './MetricCard'
import TurnControls from './TurnControls'
import WeeklySummaryDialog from './WeeklySummaryDialog'
import DecisionResultDialog from './DecisionResultDialog'

function WorkColumn({ title, items, icon: Icon }: {
  title: string
  items: WorkItem[]
  icon: typeof Clock3
}) {
  return (
    <section className="work-column">
      <header className="column-heading">
        <span className="column-icon"><Icon aria-hidden="true" size={15} /></span>
        <h3>{title}</h3>
        <span className="column-count">{items.length.toString().padStart(2, '0')}</span>
      </header>
      <div className="work-list">
        {items.map((item) => (
          <article className="work-item" key={item.id}>
            <span className={`work-marker tone-${item.tone}`} />
            <div className="work-copy">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <span className="work-meta">{item.meta}</span>
            </div>
            <ChevronRight aria-hidden="true" className="work-chevron" size={16} />
          </article>
        ))}
      </div>
    </section>
  )
}

interface DashboardProps {
  campaign: CampaignState
  onChooseDecision: (optionId: string, category: DecisionResult['category']) => void
  onDismissDecisionResult: () => void
  onDismissSummary: () => void
}

export default function Dashboard({ campaign, onChooseDecision, onDismissDecisionResult, onDismissSummary }: DashboardProps) {
  const overviewTitleRef = useRef<HTMLHeadingElement>(null)
  const dashboardMetrics = getDashboardMetrics(campaign)
  const turnDashboardData = getTurnDashboardData(campaign)

  function dismissSummary() {
    onDismissSummary()
    requestAnimationFrame(() => overviewTitleRef.current?.focus({ preventScroll: true }))
  }

  function dismissDecisionResult() {
    onDismissDecisionResult()
    requestAnimationFrame(() => overviewTitleRef.current?.focus({ preventScroll: true }))
  }

  return (
    <main className="dashboard page-enter">
      <section aria-labelledby="overview-title" className="overview-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">VISÃO GERAL <span>·</span> SEMANA {String(campaign.calendar.week).padStart(2, '0')}</p>
            <h2 id="overview-title" ref={overviewTitleRef} tabIndex={-1}>O país, agora.</h2>
          </div>
          <div className="live-indicator"><span /> Brasília, DF <b>·</b> ao vivo</div>
        </div>
        <div className="metrics-grid">
          {dashboardMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
        </div>
      </section>

      <TurnControls
        campaign={campaign}
        data={turnDashboardData}
        onChooseDecision={onChooseDecision}
      />

      <section aria-labelledby="alerts-title" className="alerts-panel">
        <div className="alerts-symbol"><CircleAlert aria-hidden="true" size={19} /></div>
        <div className="alerts-copy">
          <p className="eyebrow">CENTRAL DE ATENÇÃO <span>·</span> {campaign.society.groups.filter((group) => group.pressure >= 65).length.toString().padStart(2, '0')} ALERTAS SOCIAIS</p>
          <h2 id="alerts-title">{campaign.society.groups.some((group) => group.pressure >= 65) ? 'Grupos sociais aumentaram a pressão.' : 'A semana começa sem pressão social extraordinária.'}</h2>
          <p>{campaign.society.groups.filter((group) => group.pressure >= 65).sort((a, b) => b.pressure - a.pressure).slice(0, 2).map((group) => group.name + ' (' + Math.round(group.pressure) + '/100)').join(' · ') || 'A aprovação por classe e as reivindicações seguem no painel Sociedade.'}</p>
        </div>
        <button className="text-action" type="button" title="Ver alertas">
          Ver alertas <ArrowUpRight aria-hidden="true" size={16} />
        </button>
      </section>

      <section aria-labelledby="news-title" className="news-section">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">GIRO DO DIA <span>·</span> 3 ATUALIZAÇÕES</p>
            <h2 id="news-title">Notícias e sinais</h2>
          </div>
          <span className="section-aside"><Radio aria-hidden="true" size={14} /> Monitoramento nacional</span>
        </div>
        <div className="news-list">
          {[...campaign.news].reverse().map((news, index) => (
            <article className="news-item" key={news.id}>
              <span className="news-index">0{index + 1}</span>
              <span className={`news-marker tone-${news.tone}`} />
              <div className="news-copy">
                <div className="news-meta"><span>{news.category}</span><time>{news.time}</time></div>
                <h3>{news.title}</h3>
                <p>{news.summary}</p>
              </div>
              <ChevronRight aria-hidden="true" className="news-chevron" size={17} />
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="agenda-title" className="agenda-section">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">ACOMPANHAMENTO <span>·</span> GOVERNO</p>
            <h2 id="agenda-title">Frentes de trabalho</h2>
          </div>
          <span className="section-aside"><FileText aria-hidden="true" size={14} /> 3 registros</span>
        </div>
        <div className="work-columns">
          <WorkColumn title="Em andamento" items={activeWork} icon={Clock3} />
          <WorkColumn title="Aguardando resposta" items={waitingWork} icon={CircleAlert} />
          <WorkColumn title="Encerrado" items={closedWork} icon={Check} />
        </div>
      </section>

      <footer className="dashboard-footer">
        <div className="footer-context">
          <span className="footer-flag"><Flag aria-hidden="true" size={16} /></span>
          <span><strong>Fim do resumo semanal</strong><small>O próximo passo é seu.</small></span>
        </div>
        <span className="footer-next-step">Use o botão fixo no cabeçalho para avançar quando estiver pronto.</span>
      </footer>
      {campaign.weeklySummary && (
        <WeeklySummaryDialog
          onDismiss={dismissSummary}
          summary={campaign.weeklySummary}
        />
      )}
      {campaign.turn.decisionResult && (
        <DecisionResultDialog onContinue={dismissDecisionResult} result={campaign.turn.decisionResult} />
      )}
    </main>
  )
}