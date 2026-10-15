import {
  ArrowDown,
  ArrowUp,
  Banknote,
  BriefcaseBusiness,
  Cloud,
  Check,
  ClipboardList,
  CircleAlert,
  Coins,
  Gauge,
  Landmark,
  Megaphone,
  MessageCircle,
  Newspaper,
  Scale,
  Shield,
  Sparkles,
  Swords,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getOptionConsequences } from '../engine/turn'
import type { CampaignState, DecisionIcon, DecisionResult, NarrativeDecision, TurnDashboardData } from '../state/types'
import { formatBRLMoney, formatBRLMoneyDelta } from '../utils/money'

const actionTypeLabels = {
  administrative: 'Ação administrativa do Executivo',
  decree: 'Decreto/regulamento',
  congress: 'Proposta que depende do Congresso',
  'institutional-approval': 'Nomeação sujeita à aprovação de outra instituição',
  'legal-budgetary-review': 'Ato sujeito a controle jurídico ou orçamentário',
} as const

const decisionIcons: Record<DecisionIcon, LucideIcon> = {
  briefcase: BriefcaseBusiness,
  landmark: Landmark,
  scale: Scale,
  megaphone: Megaphone,
  users: UsersRound,
  newspaper: Newspaper,
  coins: Coins,
  shield: Shield,
  message: MessageCircle,
  clipboard: ClipboardList,
  cloud: Cloud,
}

function DecisionChoiceCard({
  decision,
  category,
  selectedLabel,
  onChoose,
  eyebrow,
  availableActionPoints,
  politicalCapital,
  ministries,
}: {
  decision: NarrativeDecision
  category: DecisionResult['category']
  selectedLabel: string | null
  onChoose: (optionId: string, category: DecisionResult['category']) => void
  eyebrow: string
  availableActionPoints: number
  politicalCapital: number
  ministries: CampaignState['ministries']
}) {
  return (
    <section aria-labelledby={`decision-${decision.id}`} className={`narrative-decision-card decision-${category}`}>
      <div className="decision-card-heading">
        <div>
          <p className="eyebrow">{eyebrow} <span>·</span> GRATUITA</p>
          <h2 id={`decision-${decision.id}`}>{decision.title}</h2>
        </div>
        <Sparkles aria-hidden="true" className="decision-mark" size={18} />
      </div>
      <p className="decision-prompt">{decision.prompt}</p>
      <div className="decision-options">
        {decision.options.map((option) => {
          const OptionIcon = option.icon ? decisionIcons[option.icon] : Sparkles
          const selected = selectedLabel === option.label
          const requiresDismissal = option.executiveEffect?.kind === 'dismiss'
          const blockedByDismissalCost = requiresDismissal
            && (availableActionPoints < 1 || politicalCapital < 4)
          const executiveTargetUnavailable = option.executiveEffect
            && !ministries.some((ministry) => ministry.id === option.executiveEffect?.ministryId && ministry.minister)
          const executiveOptionType = option.executiveEffect ? actionTypeLabels.administrative : null
          const consequences = getOptionConsequences(option).map((consequence) => ({
            label: (consequence.direction === 'up' ? '↑ ' : '↓ ') + (['Caixa disponível', 'Orçamento'].includes(consequence.label) ? formatBRLMoneyDelta(consequence.amount) : (consequence.amount > 0 ? '+' : '') + consequence.amount + ' ' + consequence.label),
            direction: consequence.direction,
          }))
          if (option.uncertainConsequences?.length) {
            consequences.push({ label: option.uncertainConsequences[0], direction: 'down' })
          } else if (option.schedule) {
            consequences.push({ label: 'Pode gerar reação', direction: 'down' })
          }
          return (
            <button
              aria-pressed={selected}
              className={`decision-option${selected ? ' is-chosen' : ''}`}
              disabled={Boolean(selectedLabel) || blockedByDismissalCost || Boolean(executiveTargetUnavailable)}
              title={executiveTargetUnavailable ? 'O ministro desta decisão já não ocupa a pasta.' : undefined}
              key={option.id}
              onClick={() => onChoose(option.id, category)}
              type="button"
            >
              <span className="decision-option-icon"><OptionIcon aria-hidden="true" size={17} /></span>
              <span className="decision-option-copy">
                <strong>{option.label}</strong>
                {executiveOptionType && <small className="executive-action-type">{executiveOptionType}</small>}
                <small>{option.description}</small>
              </span>
              <span className="decision-consequences">
                {consequences.slice(0, 4).map((consequence, index) => (
                  <small className={`consequence-tag${index >= getOptionConsequences(option).length ? ' is-uncertain' : ` is-${consequence.direction}`}`} key={`${consequence.label}-${index}`}>
                    {index < getOptionConsequences(option).length
                      ? consequence.direction === 'up' ? <ArrowUp aria-hidden="true" size={11} /> : <ArrowDown aria-hidden="true" size={11} />
                      : <CircleAlert aria-hidden="true" size={11} />}
                    {consequence.label}
                  </small>
                ))}
              </span>
              <span className="decision-option-select">{selected ? 'Escolhido' : 'Escolher'} <Check aria-hidden="true" size={13} /></span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

interface TurnControlsProps {
  campaign: CampaignState
  data: TurnDashboardData
  onRunAction: (actionId: string) => void
  onChooseDecision: (optionId: string, category: DecisionResult['category']) => void
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
                <span className="executive-action-type">{actionTypeLabels[action.actionType]}</span>
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

      <DecisionChoiceCard
        category="decisão"
        decision={data.decision}
        eyebrow={`DECISÃO DA SEMANA ${campaign.calendar.week}`}
        onChoose={onChooseDecision}
        selectedLabel={data.selectedDecisionOptionLabel}
        availableActionPoints={campaign.turn.availableActionPoints}
        politicalCapital={campaign.country.politicalCapital}
        ministries={campaign.ministries}
      />

      {data.reactionEvent && (
        <DecisionChoiceCard
          category="reação"
          decision={data.reactionEvent}
          eyebrow="REAÇÃO DO PAÍS"
          onChoose={onChooseDecision}
          selectedLabel={data.selectedReactionOptionLabel}
          availableActionPoints={campaign.turn.availableActionPoints}
          politicalCapital={campaign.country.politicalCapital}
          ministries={campaign.ministries}
        />
      )}

      {data.monthlyEvent && data.monthlyEconomyPreview && (
        <section aria-labelledby="month-end-title" className="month-end-panel">
          <div className="month-end-icon"><Landmark aria-hidden="true" size={17} /></div>
          <div className="month-end-copy">
            <p className="eyebrow">ENCERRAMENTO DO MÊS <span>·</span> SEMANA 4</p>
            <h2 id="month-end-title">{data.monthlyEvent.title}</h2>
            <p>{data.monthlyEvent.description}</p>
            <div className="economy-balance-preview">
              <span><Scale aria-hidden="true" size={13} /> Previsão do balanço</span>
              <span>Receitas <strong>{formatBRLMoneyDelta(data.monthlyEconomyPreview.revenue)}</strong></span>
              <span>Despesas <strong>{formatBRLMoney(data.monthlyEconomyPreview.expenses)}</strong></span>
              <span>Caixa final <strong>{formatBRLMoney(data.monthlyEconomyPreview.closingBudget)}</strong></span>
            </div>
          </div>
          <DecisionChoiceCard
            category="mensal"
            decision={data.monthlyEvent}
            eyebrow="EVENTO DE ENCERRAMENTO"
            onChoose={onChooseDecision}
            selectedLabel={data.selectedMonthlyOptionLabel}
            availableActionPoints={campaign.turn.availableActionPoints}
            politicalCapital={campaign.country.politicalCapital}
            ministries={campaign.ministries}
          />
        </section>
      )}
    </div>
  )
}