import {
  Banknote,
  BriefcaseBusiness,
  Check,
  CircleAlert,
  Coins,
  Gauge,
  Landmark,
  Scale,
  Sparkles,
  Swords,
} from 'lucide-react'
import type { CampaignState, TurnDashboardData } from '../state/types'

interface TurnControlsProps {
  campaign: CampaignState
  data: TurnDashboardData
  onRunAction: (actionId: string) => void
  onChooseDecision: (optionId: string) => void
}

export default function TurnControls({ campaign, data, onRunAction, onChooseDecision }: TurnControlsProps) {
  return (
    <div className="turn-controls">
      <section aria-label="Pontos de ação e recursos globais" className="resource-overview">
        <div aria-label="Explicação dos pontos de ação" className="action-points-panel" tabIndex={0} title={data.actionPointExplanation}>
          <span className="resource-icon action-icon"><Gauge aria-hidden="true" size={17} /></span>
          <span className="resource-copy">
            <small>PONTOS DE AÇÃO</small>
            <strong>{campaign.turn.availableActionPoints}<span> disponíveis</span></strong>
            <span className="resource-footnote">{campaign.turn.newActionPoints} novos · {campaign.turn.carriedActionPoints} carregados</span>
          </span>
          <CircleAlert aria-hidden="true" className="points-help" size={14} />
        </div>
        <div className="global-resources">
          <div className="global-resource">
            <Banknote aria-hidden="true" size={15} />
            <span><small>ORÇAMENTO</small><strong>{campaign.country.budget} <i>u.</i></strong></span>
          </div>
          <div className="global-resource">
            <Coins aria-hidden="true" size={15} />
            <span><small>CAPITAL POLÍTICO</small><strong>{campaign.country.politicalCapital} <i>pt</i></strong></span>
          </div>
          <div className="global-resource">
            <BriefcaseBusiness aria-hidden="true" size={15} />
            <span><small>CAPACIDADE ADMINISTRATIVA</small><strong>{campaign.country.administrativeCapacity} <i>pt</i></strong></span>
          </div>
        </div>
      </section>

      <section aria-labelledby="actions-title" className="sample-actions-panel">
        <div className="turn-section-heading">
          <div><p className="eyebrow">AGENDA EXECUTIVA <span>·</span> AÇÕES DE EXEMPLO</p><h2 id="actions-title">Ações da semana</h2></div>
          <span className="free-activity-note">Navegação, notícias e consulta são gratuitas.</span>
        </div>
        <div className="sample-actions-list">
          {data.actions.map(({ action, blockedReason, costSummary }) => (
            <article className={`sample-action${blockedReason ? ' is-blocked' : ''}`} key={action.id}>
              <span className="sample-action-icon"><Swords aria-hidden="true" size={15} /></span>
              <div className="sample-action-copy">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <span className="action-cost">Custo: {costSummary}</span>
                {blockedReason && <span className="action-blocked-reason">{blockedReason}</span>}
              </div>
              <button
                aria-label={blockedReason ? `${action.title}: ${blockedReason}` : `Executar ${action.title}`}
                className="action-run-button"
                disabled={Boolean(blockedReason)}
                onClick={() => onRunAction(action.id)}
                title={blockedReason ?? `Executar por ${costSummary}`}
                type="button"
              >
                {blockedReason ? 'Bloqueada' : 'Executar'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="decision-title" className="weekly-decision-panel">
        <div className="turn-section-heading">
          <div>
            <p className="eyebrow">DECISÃO NARRATIVA <span>·</span> GRATUITA <span>·</span> SEMANA {campaign.calendar.week}</p>
            <h2 id="decision-title">{data.decision.title}</h2>
          </div>
          <Sparkles aria-hidden="true" className="decision-mark" size={18} />
        </div>
        <p className="decision-prompt">{data.decision.prompt}</p>
        {data.selectedDecisionOptionLabel && (
          <p className="decision-confirmation"><Check aria-hidden="true" size={14} /> Escolha registrada: {data.selectedDecisionOptionLabel}</p>
        )}
        <div className="decision-options">
          {data.decision.options.map((option) => (
            <button
              aria-pressed={data.selectedDecisionOptionLabel === option.label}
              className={`decision-option${data.selectedDecisionOptionLabel === option.label ? ' is-chosen' : ''}`}
              disabled={Boolean(data.selectedDecisionOptionLabel)}
              key={option.id}
              onClick={() => onChooseDecision(option.id)}
              type="button"
            >
              <span className="decision-option-copy"><strong>{option.label}</strong><small>{option.description}</small></span>
              <span className="decision-option-icon"><Check aria-hidden="true" size={15} /></span>
            </button>
          ))}
        </div>
      </section>

      {data.monthlyEvent && data.monthlyEconomyPreview && (
        <section aria-labelledby="month-end-title" className="month-end-panel">
          <div className="month-end-icon"><Landmark aria-hidden="true" size={17} /></div>
          <div className="month-end-copy">
            <p className="eyebrow">ENCERRAMENTO DO MÊS <span>·</span> SEMANA 4</p>
            <h2 id="month-end-title">{data.monthlyEvent.title}</h2>
            <p>{data.monthlyEvent.description}</p>
            <div className="economy-balance-preview">
              <span><Scale aria-hidden="true" size={13} /> Previsão do balanço</span>
              <span>Receitas <strong>+{data.monthlyEconomyPreview.revenue}</strong></span>
              <span>Despesas <strong>−{data.monthlyEconomyPreview.expenses}</strong></span>
              <span>Orçamento final <strong>{data.monthlyEconomyPreview.closingBudget} u.</strong></span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}