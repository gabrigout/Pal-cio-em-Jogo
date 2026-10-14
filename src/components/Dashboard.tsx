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
import {
  activeWork,
  closedWork,
  dashboardNews,
  waitingWork,
} from '../data/dashboard'
import type { CampaignState, WorkItem } from '../state/types'
import MetricCard from './MetricCard'

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

export default function Dashboard({ campaign, onAdvanceWeek }: { campaign: CampaignState; onAdvanceWeek: () => void }) {
  const dashboardMetrics = getDashboardMetrics(campaign)

  return (
    <main className="dashboard page-enter">
      <section aria-labelledby="overview-title" className="overview-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">VISÃO GERAL <span>·</span> SEMANA {String(campaign.calendar.week).padStart(2, '0')}</p>
            <h2 id="overview-title">O país, agora.</h2>
          </div>
          <div className="live-indicator"><span /> Brasília, DF <b>·</b> ao vivo</div>
        </div>
        <div className="metrics-grid">
          {dashboardMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
        </div>
      </section>

      <section aria-labelledby="alerts-title" className="alerts-panel">
        <div className="alerts-symbol"><CircleAlert aria-hidden="true" size={19} /></div>
        <div className="alerts-copy">
          <p className="eyebrow">CENTRAL DE ATENÇÃO <span>·</span> 02 PONTOS</p>
          <h2 id="alerts-title">A semana começa com duas frentes abertas.</h2>
          <p>Articulação legislativa e resposta às chuvas pedem coordenação do governo.</p>
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
          {dashboardNews.map((news, index) => (
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
        <button className="advance-button" onClick={onAdvanceWeek} type="button">
          Avançar Semana <ChevronRight aria-hidden="true" size={17} />
        </button>
      </footer>
    </main>
  )
}