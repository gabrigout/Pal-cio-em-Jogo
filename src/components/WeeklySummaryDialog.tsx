import { useEffect, useRef } from 'react'
import { Check, ChevronRight, Clock3, Coins, FileText } from 'lucide-react'
import type { WeeklySummary } from '../state/types'

interface WeeklySummaryDialogProps {
  summary: WeeklySummary
  onDismiss: () => void
}

export default function WeeklySummaryDialog({ summary, onDismiss }: WeeklySummaryDialogProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="summary-backdrop">
      <section aria-labelledby="summary-title" aria-modal="true" className="weekly-summary-dialog" role="dialog">
        <div className="summary-heading">
          <span className="summary-icon"><FileText aria-hidden="true" size={18} /></span>
          <div><p className="eyebrow">RELATÓRIO DE GOVERNO <span>·</span> SEMANA {summary.week}</p><h2 id="summary-title" ref={titleRef} tabIndex={-1}>Semana encerrada.</h2></div>
        </div>
        <p className="summary-date">{summary.month} de {summary.year}</p>

        <section className="summary-section">
          <h3>O que mudou</h3>
          {summary.changes.length ? (
            <ul className="summary-change-list">
              {summary.changes.map((change, index) => (
                <li key={`${change.indicator}-${change.reason}-${index}`}>
                  <span className="summary-change-value">{change.amount > 0 ? '+' : ''}{change.amount}</span>
                  <span><strong>{change.label}</strong><small>{change.reason}</small></span>
                </li>
              ))}
            </ul>
          ) : <p className="summary-muted">Nenhum indicador mudou nesta semana.</p>}
        </section>

        {summary.actions.length > 0 && (
          <section className="summary-section">
            <h3>Ações executadas</h3>
            <ul className="summary-plain-list">{summary.actions.map((action) => <li key={action}><Check aria-hidden="true" size={13} /> {action}</li>)}</ul>
          </section>
        )}

        {summary.events.length > 0 && (
          <section className="summary-section">
            <h3>Pendências e contexto</h3>
            <ul className="summary-plain-list">{summary.events.map((event) => <li key={event}><Clock3 aria-hidden="true" size={13} /> {event}</li>)}</ul>
          </section>
        )}

        {summary.economyBalance && (
          <section className="summary-economy">
            <Coins aria-hidden="true" size={16} />
            <span><strong>Balanço do mês</strong><small>Orçamento {summary.economyBalance.openingBudget} + receitas {summary.economyBalance.revenue} − despesas {summary.economyBalance.expenses} = {summary.economyBalance.closingBudget} u.</small></span>
          </section>
        )}

        <div className="summary-points">
          <span>{summary.carriedActionPoints} PA carregados</span>
          <span>{summary.expiredActionPoints} PA expirados</span>
          <strong>{summary.totalActionPoints} PA disponíveis na próxima semana</strong>
        </div>
        <button className="summary-dismiss-button" onClick={onDismiss} type="button">Continuar <ChevronRight aria-hidden="true" size={16} /></button>
      </section>
    </div>
  )
}