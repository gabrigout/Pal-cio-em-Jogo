import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowUp, Check, ChevronRight, Sparkles } from 'lucide-react'
import type { DecisionResult } from '../state/types'

interface DecisionResultDialogProps {
  result: DecisionResult
  onContinue: () => void
}

export default function DecisionResultDialog({ result, onContinue }: DecisionResultDialogProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="summary-backdrop decision-result-backdrop">
      <section aria-labelledby="decision-result-title" aria-modal="true" className="decision-result-dialog" role="dialog">
        <div className="decision-result-heading">
          <span className="decision-result-icon"><Sparkles aria-hidden="true" size={18} /></span>
          <div>
            <p className="eyebrow">RESULTADO <span>·</span> {result.category.toUpperCase()}</p>
            <h2 id="decision-result-title" ref={titleRef} tabIndex={-1}>{result.title}</h2>
          </div>
        </div>
        <p className="decision-result-choice">Escolha: <strong>{result.choice}</strong></p>
        <p className="decision-result-message">{result.message}</p>
        {result.reasons.length > 0 && (
          <ul className="decision-result-changes">
            {result.changes.map((change, index) => (
              <li key={`${change.indicator}-${index}`}>
                <span className={change.amount > 0 ? 'result-direction is-up' : 'result-direction is-down'}>
                  {change.amount > 0 ? <ArrowUp aria-hidden="true" size={13} /> : <ArrowDown aria-hidden="true" size={13} />}
                  {change.amount > 0 ? '+' : ''}{change.amount}
                </span>
                <span><strong>{change.label}</strong><small>{change.reason}</small></span>
              </li>
            ))}
          </ul>
        )}
        {result.scheduledEventTitle && (
          <p className="result-scheduled"><Check aria-hidden="true" size={14} /> Reação agendada: {result.scheduledEventTitle}</p>
        )}
        <button className="summary-dismiss-button" onClick={onContinue} type="button">Voltar ao painel <ChevronRight aria-hidden="true" size={16} /></button>
      </section>
    </div>
  )
}
