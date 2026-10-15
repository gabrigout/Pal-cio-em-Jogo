import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Banknote, ChartNoAxesCombined, Landmark, Scale } from 'lucide-react'
import { economicRules } from '../data/campaignConfig'
import { canReviseBudget } from '../engine/economy'
import type { CampaignState, EconomicIndicators } from '../state/types'

const indicatorMeta: Array<{ id: keyof EconomicIndicators; label: string; suffix: string }> = [
  { id: 'publicRevenue', label: 'Receitas públicas', suffix: ' u./mês' },
  { id: 'publicExpenses', label: 'Despesas públicas', suffix: ' u./mês' },
  { id: 'fiscalBalance', label: 'Déficit / superávit', suffix: ' u./mês' },
  { id: 'publicDebt', label: 'Dívida pública', suffix: ' u.' },
  { id: 'growth', label: 'Crescimento', suffix: '%' },
  { id: 'inflation', label: 'Inflação', suffix: '%' },
  { id: 'unemployment', label: 'Desemprego', suffix: '%' },
  { id: 'incomeInequality', label: 'Desigualdade (Gini)', suffix: '' },
]

const economicActionType = 'Ação administrativa do Executivo'
const controlledActionType = 'Ato sujeito a controle jurídico ou orçamentário'

function TrendChart({ campaign, indicator }: { campaign: CampaignState; indicator: keyof EconomicIndicators }) {
  const snapshots = campaign.economy.history.slice(-8)
  const values = snapshots.map((snapshot) => snapshot.indicators[indicator])
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = Math.max(1, maximum - minimum)
  const points = values.map((value, index) => {
    const x = values.length < 2 ? 50 : index / (values.length - 1) * 100
    const y = 38 - (value - minimum) / range * 30
    return `${x},${y}`
  }).join(' ')

  return (
    <svg aria-label={`Histórico de ${indicatorMeta.find((meta) => meta.id === indicator)?.label}`} className="economy-sparkline" role="img" viewBox="0 0 100 42">
      <line className="economy-chart-axis" x1="0" x2="100" y1="39" y2="39" />
      <polyline className="economy-chart-line" points={points} />
    </svg>
  )
}

export default function EconomyPanel({
  campaign,
  onReviseBudget,
  onAdjustTax,
  onProposeReform,
  onEmergencyLoan,
  onDeferPayments,
}: {
  campaign: CampaignState
  onReviseBudget: (shares: Record<string, number>) => void
  onAdjustTax: (taxId: string, direction: -1 | 1) => void
  onProposeReform: () => void
  onEmergencyLoan: () => void
  onDeferPayments: () => void
}) {
  const { economy } = campaign
  const [shares, setShares] = useState<Record<string, number>>(
    Object.fromEntries(economy.annualBudget.sectors.map((sector) => [sector.id, sector.share])),
  )
  useEffect(() => {
    setShares(Object.fromEntries(economy.annualBudget.sectors.map((sector) => [sector.id, sector.share])))
  }, [economy.annualBudget.sectors])

  const revision = canReviseBudget(campaign)
  const shareTotal = Object.values(shares).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0)
  const monthlyPayments = economy.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)
  const debtRatio = economy.indicators.publicDebt / Math.max(1, economy.indicators.publicRevenue * 12)
  const cashIsLow = economy.availableFunds <= economicRules.emergencyCashThreshold

  return (
    <main className="economy-panel page-enter">
      <header className="economy-heading">
        <div><p className="eyebrow">TESOURO NACIONAL <span>·</span> {campaign.calendar.month.toUpperCase()} DE {campaign.calendar.year}</p><h1>Economia</h1></div>
        <div className="economy-cash"><Banknote aria-hidden="true" size={17} /><span>Caixa disponível<strong>{economy.availableFunds.toFixed(1)} u.</strong></span></div>
      </header>

      <section aria-label="Indicadores econômicos" className="economy-indicators">
        {indicatorMeta.map((meta) => {
          const current = economy.indicators[meta.id]
          const previous = economy.history[economy.history.length - 2]?.indicators[meta.id] ?? current
          const delta = Math.round((current - previous) * 10) / 10
          const direction = delta > 0 ? 'subiu' : delta < 0 ? 'caiu' : 'estável'
          return (
            <article className="economy-indicator-card" key={meta.id}>
              <span>{meta.label}</span>
              <strong>{current.toFixed(1)}{meta.suffix}</strong>
              <small aria-label={`Tendência: ${direction}`}>
                {delta > 0 ? <ArrowUp aria-hidden="true" size={12} /> : delta < 0 ? <ArrowDown aria-hidden="true" size={12} /> : <span aria-hidden="true">—</span>}
                {direction} {delta ? `${Math.abs(delta).toFixed(1)} desde o último mês` : 'no último mês'}
              </small>
              <TrendChart campaign={campaign} indicator={meta.id} />
            </article>
          )
        })}
      </section>

      <section aria-labelledby="economy-budget-title" className="economy-card">
        <div className="economy-section-heading">
          <div><p className="eyebrow">CICLO ANUAL · {economy.annualBudget.year}</p><h2 id="economy-budget-title">Orçamento por setor</h2></div>
          <span className="executive-action-type"><Landmark aria-hidden="true" size={12} /> {economicActionType}</span>
        </div>
        <p className="economy-caption">Envelope anual: {economy.annualBudget.total} u. · compromissos fixos: {economy.annualBudget.fixedCommitments} u. · execução mensal financiada pelo caixa.</p>
        <div className="economy-sector-list">
          {economy.annualBudget.sectors.map((sector) => {
            const share = shares[sector.id] ?? sector.share
            const execution = sector.annualAllocation > 0 ? Math.min(100, sector.executedThisYear / sector.annualAllocation * 100) : 0
            return (
              <div className="economy-sector-row" key={sector.id}>
                <div className="economy-sector-title"><strong>{sector.name}</strong><span>{sector.annualAllocation} u. · executado {sector.executedThisYear.toFixed(1)} u.</span></div>
                <div aria-label={`${execution.toFixed(0)}% executado`} className="economy-progress"><span style={{ width: `${execution}%` }} /></div>
                <label className="economy-share-input">{share}%<input aria-label={`Percentual do setor ${sector.name}`} max={economicRules.maximumSectorShare} min={economicRules.minimumSectorShare} onChange={(event) => setShares((current) => ({ ...current, [sector.id]: Number(event.target.value) }))} step="1" type="number" value={share} /></label>
              </div>
            )
          })}
        </div>
        <div className="economy-control-footer">
          <span>Distribuição atualizada: {shareTotal}% · revisão custa {economicRules.budgetRevisionActionPoints} PA e {economicRules.budgetRevisionPoliticalCapital} de capital político.</span>
          <button className="economy-button" disabled={!revision.allowed || shareTotal !== 100} onClick={() => onReviseBudget(shares)} title={revision.allowed ? 'Aplicar distribuição dentro dos limites' : revision.reason} type="button">Revisar distribuição</button>
        </div>
        {!revision.allowed && <p className="economy-caption">{revision.reason}</p>}
      </section>

      <section aria-labelledby="economy-taxes-title" className="economy-card">
        <div className="economy-section-heading">
          <div><p className="eyebrow">POLÍTICA TRIBUTÁRIA</p><h2 id="economy-taxes-title">Ajustes e propostas</h2></div>
          <span className="executive-action-type"><Scale aria-hidden="true" size={12} /> Decreto, dentro de limites</span>
        </div>
        <div className="economy-tax-list">
          {economy.taxes.map((tax) => (
            <article className="economy-tax-row" key={tax.id}>
              <div><strong>{tax.name}</strong><span>{tax.affectedGroups.join(' · ')}</span></div>
              <strong>{tax.rate.toFixed(1)}%</strong>
              <button aria-label={`Reduzir ${tax.name}`} disabled={tax.rate <= tax.minimumRate || campaign.turn.availableActionPoints < economicRules.taxAdjustmentActionPoints || campaign.country.politicalCapital < economicRules.taxAdjustmentPoliticalCapital} onClick={() => onAdjustTax(tax.id, -1)} type="button">−</button>
              <button aria-label={`Aumentar ${tax.name}`} disabled={tax.rate >= tax.maximumRate || campaign.turn.availableActionPoints < economicRules.taxAdjustmentActionPoints || campaign.country.politicalCapital < economicRules.taxAdjustmentPoliticalCapital} onClick={() => onAdjustTax(tax.id, 1)} type="button">+</button>
            </article>
          ))}
        </div>
        <div className="economy-control-footer">
          <span>Cada ajuste: {economicRules.taxAdjustmentActionPoints} PA e {economicRules.taxAdjustmentPoliticalCapital} de capital político; afeta receita e grupos sociais.</span>
          <button className="economy-button" disabled={economy.congressProposals.includes('Reforma tributária estrutural') || campaign.turn.availableActionPoints < economicRules.taxReformActionPoints || campaign.country.politicalCapital < economicRules.taxReformPoliticalCapital} onClick={onProposeReform} type="button">
            Propor reforma ao Congresso
          </button>
        </div>
        <p className="economy-action-label">Reforma tributária estrutural · Proposta que depende do Congresso · sem tramitação nesta fase.</p>
      </section>

      <section aria-labelledby="economy-debt-title" className="economy-card">
        <div className="economy-section-heading">
          <div><p className="eyebrow">DÍVIDA E CRÉDITO</p><h2 id="economy-debt-title">Financiamento público</h2></div>
          <span className="executive-action-type"><Scale aria-hidden="true" size={12} /> {controlledActionType}</span>
        </div>
        <div className="economy-debt-overview">
          <span>Dívida / receita anual<strong>{debtRatio.toFixed(2)}×</strong></span>
          <span>Parcelas mensais contratadas<strong>{monthlyPayments.toFixed(1)} u.</strong></span>
          <span>Pagamentos adiados<strong>{economy.deferredPayments.toFixed(1)} u.</strong></span>
        </div>
        {economy.loans.length ? (
          <div className="economy-loan-list">
            {economy.loans.map((loan) => (
              <article key={loan.id}><strong>{loan.lender}</strong><span>{loan.outstandingPrincipal.toFixed(1)} u. restantes · {loan.annualInterestRate}% a.a. · {loan.remainingMonths} meses</span><small>{loan.conditions.join(' ')}</small></article>
            ))}
          </div>
        ) : <p className="economy-caption">Nenhum empréstimo contratado.</p>}
        {cashIsLow && (
          <div className="economy-emergency-actions">
            <p>Caixa baixo. As alternativas são limitadas e geram custos futuros.</p>
            <button className="economy-button" disabled={campaign.turn.availableActionPoints < economicRules.emergencyLoanActionPoints || campaign.country.politicalCapital < economicRules.emergencyLoanPoliticalCapital} onClick={onEmergencyLoan} type="button">Crédito emergencial: {economicRules.emergencyLoanAmount} u., juros de {economicRules.emergencyLoanAnnualInterestRate}%, custa {economicRules.emergencyLoanActionPoints} PA e {economicRules.emergencyLoanPoliticalCapital} de capital político</button>
            <button className="economy-button economy-button-secondary" disabled={campaign.turn.availableActionPoints < economicRules.deferredPaymentActionPoints || campaign.country.politicalCapital < economicRules.deferredPaymentPoliticalCapital || economy.deferredPayments > 0} onClick={onDeferPayments} type="button">Adiar {economicRules.deferredPaymentAmount} u. de compromissos: custa {economicRules.deferredPaymentActionPoints} PA e {economicRules.deferredPaymentPoliticalCapital} de capital político</button>
          </div>
        )}
        {economy.congressProposals.length > 0 && <p className="economy-action-label">Propostas legislativas registradas: {economy.congressProposals.join(' · ')}.</p>}
      </section>

      <section aria-labelledby="economy-context-title" className="economy-card">
        <div className="economy-section-heading"><div><p className="eyebrow">FECHAMENTO MENSAL</p><h2 id="economy-context-title"><ChartNoAxesCombined aria-hidden="true" size={19} /> Explicações do último mês</h2></div></div>
        <ul className="economy-report-list">{economy.lastMonthlyReport.map((entry, index) => <li key={`${index}-${entry}`}>{entry}</li>)}</ul>
        {economy.pendingBudgetRequests.length > 0 && <p className="economy-action-label">Pedidos pendentes: {economy.pendingBudgetRequests.join(' · ')}</p>}
        {economy.socialEffects.length > 0 && <p className="economy-action-label">Efeitos sociais: {economy.socialEffects.join(' · ')}</p>}
      </section>
    </main>
  )
}
