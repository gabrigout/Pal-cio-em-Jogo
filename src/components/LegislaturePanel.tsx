import { useState, type FormEvent } from 'react'
import { CheckCircle2, CircleAlert, FileText, Gavel, Landmark, MessageSquare, Vote, Wallet } from 'lucide-react'
import { legislativeRules, legislativeTypeDescriptions, legislativeTypeLabels } from '../data/legislature'
import type { CampaignState, LegislativeBillType, LegislativeStage } from '../state/types'
import type { LegislativeProposalInput } from '../engine/legislature'
import { formatBRLMoney } from '../utils/money'

const billTypes: LegislativeBillType[] = ['ordinary', 'complementary', 'pec', 'mp', 'ppa', 'ldo', 'loa', 'credit']
const stageLabels: Record<LegislativeStage, string> = {
  committee: 'Análise inicial',
  negotiation: 'Negociação',
  voting: 'Em votação',
  sanction: 'Sanção ou veto',
  'veto-review': 'Análise de veto',
  approved: 'Concluída: aprovada',
  rejected: 'Concluída: rejeitada',
  expired: 'Concluída: perdeu vigência',
}
const chamberLabels = {
  house: 'Câmara dos Deputados',
  senate: 'Senado Federal',
  joint: 'Sessão conjunta',
}

function BlocList({ title, blocs, total }: {
  title: string
  blocs: CampaignState['legislature']['chamberOfDeputies']
  total: number
}) {
  return (
    <section className="legislature-chamber">
      <header><span>{title}</span><strong>{total} cadeiras</strong></header>
      <div className="legislature-blocs">
        {[...blocs].sort((first, second) => second.seats - first.seats).map((bloc) => (
          <div className="legislature-bloc" key={bloc.partyId}>
            <span title={bloc.partyName}>{bloc.acronym}</span>
            <div className="legislature-bloc-track"><span style={{ width: (bloc.seats / total * 100) + '%' }} /></div>
            <strong>{bloc.seats}</strong>
          </div>
        ))}
      </div>
      <p className="legislature-caption">Composição agregada fictícia. Partidos não votam como um bloco obrigatório; há dissidências.</p>
    </section>
  )
}

function billStatusTone(stage: LegislativeStage): string {
  if (stage === 'approved') return 'positive'
  if (stage === 'rejected' || stage === 'expired') return 'warning'
  if (stage === 'sanction' || stage === 'veto-review') return 'attention'
  return 'neutral'
}

export default function LegislaturePanel({
  campaign,
  onSubmitProposal,
  onNegotiate,
  onPresidentialDecision,
}: {
  campaign: CampaignState
  onSubmitProposal: (input: LegislativeProposalInput) => void
  onNegotiate: (billId: string) => void
  onPresidentialDecision: (billId: string, decision: 'sanction' | 'veto') => void
}) {
  const [type, setType] = useState<LegislativeBillType>('ordinary')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [impact, setImpact] = useState('0')
  const [targetSectorId, setTargetSectorId] = useState(campaign.economy.annualBudget.sectors[0]?.id ?? '')
  const [urgent, setUrgent] = useState(false)
  const [proposalError, setProposalError] = useState('')
  const [authorPartyId, setAuthorPartyId] = useState(campaign.party.id)
  const [sourceSectorId, setSourceSectorId] = useState(campaign.economy.annualBudget.sectors[0]?.id ?? '')
  const [amendmentTargetId, setAmendmentTargetId] = useState(campaign.economy.annualBudget.sectors[1]?.id ?? '')
  const [amendmentAmount, setAmendmentAmount] = useState('10')
  const [amendmentTitle, setAmendmentTitle] = useState('')
  const [amendmentSummary, setAmendmentSummary] = useState('')
  const [amendmentError, setAmendmentError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const legislature = campaign.legislature
  const activeBills = legislature.bills.filter((bill) => !['approved', 'rejected', 'expired'].includes(bill.stage))
  const visibleBills = [...legislature.bills]
    .filter((bill) => filter === 'all' || (filter === 'active'
      ? !['approved', 'rejected', 'expired'].includes(bill.stage)
      : ['approved', 'rejected', 'expired'].includes(bill.stage)))
    .sort((first, second) => second.createdYear - first.createdYear
      || second.createdWeek - first.createdWeek
      || second.id.localeCompare(first.id))
  const latestVotes = legislature.bills.flatMap((bill) => bill.voteHistory.map((vote) => ({ ...vote, title: bill.title, type: bill.type }))).slice(-5).reverse()
  const configuredCosts = legislativeRules.proposalActionCosts[type]
  const currentImpact = Number(impact)
  const sectors = campaign.economy.annualBudget.sectors
  const authorOptions = [...legislature.chamberOfDeputies, ...legislature.senate]
    .filter((bloc, index, all) => all.findIndex((candidate) => candidate.partyId === bloc.partyId) === index)
    .sort((first, second) => first.acronym.localeCompare(second.acronym))
  const selectedTypeDescription = legislativeTypeDescriptions[type]

  function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProposalError('')
    const data: LegislativeProposalInput = {
      type,
      title,
      summary,
      fiscalImpact: currentImpact,
      targetSectorId: type === 'credit' ? targetSectorId : null,
      declaresUrgency: type === 'mp' ? urgent : false,
      origin: 'executive',
      sourceKey: null,
    }
    if (type === 'loa' && currentImpact <= 0) {
      setProposalError('Informe o total anual da LOA em R$ bilhões.')
      return
    }
    onSubmitProposal(data)
  }

  function submitAmendment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAmendmentError('')
    if (sourceSectorId === amendmentTargetId) {
      setAmendmentError('Origem e destino precisam ser setores diferentes.')
      return
    }
    onSubmitProposal({
      type: 'amendment',
      title: amendmentTitle,
      summary: amendmentSummary,
      fiscalImpact: Number(amendmentAmount),
      sourceSectorId,
      targetSectorId: amendmentTargetId,
      authorPartyId,
      origin: 'parliamentary',
    })
  }

  function changeType(nextType: LegislativeBillType) {
    setType(nextType)
    setImpact(nextType === 'loa' ? String(campaign.economy.annualBudget.total) : '0')
    setUrgent(false)
    setProposalError('')
  }

  return (
    <main className="legislature-panel page-enter">
      <header className="legislature-heading">
        <div>
          <p className="eyebrow">PODER LEGISLATIVO <span>·</span> CONGRESSO NACIONAL</p>
          <h1>Negociação, leis e votação</h1>
          <p>Você pode apresentar propostas e negociar apoio. As bancadas deliberam por suas próprias regras: articulação política melhora as chances, mas não garante voto.</p>
        </div>
        <div className="legislature-heading-status">
          <Landmark aria-hidden="true" size={20} />
          <span><strong>{activeBills.length}</strong> proposições em tramitação</span>
        </div>
      </header>

      <section aria-label="Composição parlamentar" className="legislature-chamber-grid">
        <BlocList title="Câmara dos Deputados" blocs={legislature.chamberOfDeputies} total={legislativeRules.chambers.house.seats} />
        <BlocList title="Senado Federal" blocs={legislature.senate} total={legislativeRules.chambers.senate.seats} />
      </section>

      <section className="legislature-summary-grid">
        <article><span>APOIO NO CONGRESSO</span><strong>{campaign.country.congressSupport}%</strong><p>Indicador político — não é previsão exata de votos.</p></article>
        <article><span>CAPITAL POLÍTICO</span><strong>{campaign.country.politicalCapital}</strong><p>Negociações e apresentação de propostas consomem capital político.</p></article>
        <article><span>CAIXA DISPONÍVEL</span><strong>{formatBRLMoney(campaign.economy.availableFunds)}</strong><p>Impacto aprovado não significa dinheiro disponível automaticamente.</p></article>
      </section>

      <section className="legislature-work-grid">
        <section aria-labelledby="legislature-proposal-title" className="legislature-card">
          <div className="legislature-section-heading">
            <div><p className="eyebrow">INICIATIVA DO EXECUTIVO</p><h2 id="legislature-proposal-title">Apresentar proposição</h2></div>
            <FileText aria-hidden="true" size={17} />
          </div>
          <form className="legislature-form" onSubmit={submitProposal}>
            <label>Instrumento legislativo
              <select onChange={(event) => changeType(event.target.value as LegislativeBillType)} value={type}>
                {billTypes.map((billType) => <option key={billType} value={billType}>{legislativeTypeLabels[billType]}</option>)}
              </select>
            </label>
            <p className="legislature-form-help">{selectedTypeDescription}</p>
            <label>Título
              <input maxLength={90} minLength={5} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Programa de modernização da saúde" required value={title} />
            </label>
            <label>Justificativa pública
              <textarea maxLength={480} minLength={12} onChange={(event) => setSummary(event.target.value)} placeholder="Explique o objetivo e o interesse público da proposta" required rows={3} value={summary} />
            </label>
            <label>{type === 'loa' ? 'Orçamento anual total proposto (R$ bi)' : type === 'credit' ? 'Valor do crédito adicional (R$ bi)' : 'Impacto fiscal anual estimado (R$ bi; negativo = economia)' }
              <input max={type === 'loa' ? campaign.economy.annualBudget.total * legislativeRules.maximumLoaMultiplier : type === 'credit' ? legislativeRules.creditProposalLimit : legislativeRules.annualFiscalImpactLimit} min={type === 'loa' ? campaign.economy.annualBudget.total * legislativeRules.minimumLoaMultiplier : type === 'credit' ? 0.1 : -legislativeRules.annualFiscalImpactLimit} onChange={(event) => setImpact(event.target.value)} required step="0.1" type="number" value={impact} />
            </label>
            {type === 'credit' && <label>Setor que receberá o crédito
              <select onChange={(event) => setTargetSectorId(event.target.value)} value={targetSectorId}>
                {sectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
              </select>
            </label>}
            {type === 'mp' && <label className="legislature-checkbox">
              <input checked={urgent} onChange={(event) => setUrgent(event.target.checked)} type="checkbox" />
              <span>Declaro relevância e urgência da medida provisória</span>
            </label>}
            {proposalError && <p className="legislature-form-error" role="alert">{proposalError}</p>}
            <button className="legislature-button" type="submit"><FileText aria-hidden="true" size={14} /> Protocolar proposta</button>
            <p className="legislature-form-help">Custo desta proposta: {configuredCosts.actionPoints} PA e {configuredCosts.politicalCapital} capital político.</p>
          </form>
        </section>

        <section aria-labelledby="legislature-amendment-title" className="legislature-card">
          <div className="legislature-section-heading">
            <div><p className="eyebrow">INICIATIVA PARLAMENTAR</p><h2 id="legislature-amendment-title">Emenda de remanejamento</h2></div>
            <Wallet aria-hidden="true" size={17} />
          </div>
          <form className="legislature-form" onSubmit={submitAmendment}>
            <label>Bancada autora
              <select onChange={(event) => setAuthorPartyId(event.target.value)} value={authorPartyId}>
                {authorOptions.map((bloc) => <option key={bloc.partyId} value={bloc.partyId}>{bloc.acronym} — {bloc.partyName}</option>)}
              </select>
            </label>
            <label>Título da emenda
              <input maxLength={90} minLength={5} onChange={(event) => setAmendmentTitle(event.target.value)} placeholder="Ex.: Remanejamento para atenção básica" required value={amendmentTitle} />
            </label>
            <label>Justificativa
              <textarea maxLength={480} minLength={12} onChange={(event) => setAmendmentSummary(event.target.value)} placeholder="Justifique o redirecionamento e o benefício esperado" required rows={3} value={amendmentSummary} />
            </label>
            <div className="legislature-two-fields">
              <label>Setor de origem
                <select onChange={(event) => setSourceSectorId(event.target.value)} value={sourceSectorId}>
                  {sectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                </select>
              </label>
              <label>Setor de destino
                <select onChange={(event) => setAmendmentTargetId(event.target.value)} value={amendmentTargetId}>
                  {sectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                </select>
              </label>
            </div>
            <label>Valor a remanejar (R$ bi)
              <input max={Math.max(0, (sectors.find((sector) => sector.id === sourceSectorId)?.annualAllocation ?? 0) - (sectors.find((sector) => sector.id === sourceSectorId)?.executedThisYear ?? 0))} min="0.1" onChange={(event) => setAmendmentAmount(event.target.value)} required step="0.1" type="number" value={amendmentAmount} />
            </label>
            {amendmentError && <p className="legislature-form-error" role="alert">{amendmentError}</p>}
            <button className="legislature-button legislature-button-secondary" type="submit"><Wallet aria-hidden="true" size={14} /> Protocolar emenda</button>
            <p className="legislature-form-help">Emenda não cria caixa: reduz a dotação disponível na origem e aumenta a do destino. Custa 1 PA e 2 de capital político.</p>
          </form>
        </section>
      </section>

      <section aria-labelledby="legislature-bills-title" className="legislature-card legislature-bills-section">
        <div className="legislature-section-heading">
          <div><p className="eyebrow">AGENDA PARLAMENTAR</p><h2 id="legislature-bills-title">Proposições e decisões</h2></div>
          <label className="legislature-filter">Mostrar
            <select onChange={(event) => setFilter(event.target.value as typeof filter)} value={filter}>
              <option value="all">Todas</option><option value="active">Em tramitação</option><option value="completed">Concluídas</option>
            </select>
          </label>
        </div>
        {visibleBills.length === 0 ? <p className="legislature-empty">Ainda não há proposições nesta categoria. Apresente uma proposta para iniciar a tramitação.</p> : (
          <div className="legislature-bill-list">
            {visibleBills.map((bill) => {
              const lastVote = bill.voteHistory[bill.voteHistory.length - 1]
              const isActive = !['approved', 'rejected', 'expired'].includes(bill.stage)
              return (
                <article className="legislature-bill" key={bill.id}>
                  <header className="legislature-bill-head">
                    <div><span className="legislature-bill-type">{legislativeTypeLabels[bill.type]}</span><h3>{bill.title}</h3></div>
                    <span className={'legislature-status tone-' + billStatusTone(bill.stage)}>{stageLabels[bill.stage]}</span>
                  </header>
                  <p className="legislature-bill-summary">{bill.summary}</p>
                  <div className="legislature-bill-meta">
                    <span>Autor: <strong>{bill.authorPartyAcronym}</strong></span>
                    <span>Etapa: <strong>{chamberLabels[bill.currentChamber]}</strong></span>
                    <span>Articulação: <strong>+{bill.negotiatedSupport}</strong></span>
                    <span>Impacto anual: <strong>{bill.type === 'loa' ? 'Total ' : ''}{formatBRLMoney(bill.fiscalImpact)}</strong></span>
                    {bill.type === 'mp' && <span>Prazo: <strong>{Math.min(120, bill.daysInProcess)}/120 dias {bill.isUrgent ? '· urgência' : ''}</strong></span>}
                  </div>
                  {lastVote && <div className="legislature-vote-result">
                    <Vote aria-hidden="true" size={15} />
                    <span>{chamberLabels[lastVote.chamber]} · {lastVote.round}º turno: <strong>{lastVote.yes} sim</strong>, {lastVote.no} não, {lastVote.abstain} abstenções, {lastVote.absent} ausentes.</span>
                    <b>{lastVote.passed ? 'Aprovada nesta votação' : 'Rejeitada nesta votação'}</b>
                  </div>}
                  {bill.history.length > 0 && <details className="legislature-history">
                    <summary>Histórico da tramitação ({bill.history.length})</summary>
                    <ol>{bill.history.map((item, index) => <li key={bill.id + '-history-' + index}>{item}</li>)}</ol>
                  </details>}
                  {isActive && bill.stage === 'committee' || isActive && bill.stage === 'negotiation' ? (
                    <div className="legislature-bill-actions">
                      <button className="legislature-button legislature-button-secondary" disabled={bill.negotiatedSupport >= legislativeRules.maximumNegotiatedSupport || campaign.turn.availableActionPoints < 1 || campaign.country.politicalCapital < 2} onClick={() => onNegotiate(bill.id)} type="button"><MessageSquare aria-hidden="true" size={13} /> Articular apoio (+10)</button>
                      <span>Negociação custa 1 PA e 2 de capital político; apoio não garante a aprovação.</span>
                    </div>
                  ) : null}
                  {bill.stage === 'sanction' && (
                    <div className="legislature-bill-actions">
                      <button className="legislature-button" disabled={campaign.turn.availableActionPoints < 1} onClick={() => onPresidentialDecision(bill.id, 'sanction')} type="button"><CheckCircle2 aria-hidden="true" size={13} /> Sancionar</button>
                      <button className="legislature-button legislature-button-secondary" disabled={campaign.turn.availableActionPoints < 1 || campaign.country.politicalCapital < 2} onClick={() => onPresidentialDecision(bill.id, 'veto')} type="button"><Gavel aria-hidden="true" size={13} /> Vetar</button>
                      <span>Decisão do Executivo; um veto volta ao Congresso para análise das duas Casas.</span>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="legislature-recent-title" className="legislature-two-column">
        <article className="legislature-card">
          <div className="legislature-section-heading"><div><p className="eyebrow">HISTÓRICO</p><h2 id="legislature-recent-title">Atividade institucional</h2></div><Gavel aria-hidden="true" size={17} /></div>
          {legislature.history.length ? <ol className="legislature-activity-list">{legislature.history.slice(0, 10).map((item, index) => <li key={'legislature-history-' + index}>{item}</li>)}</ol> : <p className="legislature-empty">Ainda não houve atividade legislativa.</p>}
        </article>
        <article className="legislature-card">
          <div className="legislature-section-heading"><div><p className="eyebrow">VOTAÇÕES</p><h2>Resultados recentes</h2></div><Vote aria-hidden="true" size={17} /></div>
          {latestVotes.length ? <ol className="legislature-activity-list">{latestVotes.map((vote) => <li key={vote.id}>
            <strong>{vote.title}</strong><span>{vote.chamber === 'house' ? 'Câmara' : vote.chamber === 'senate' ? 'Senado' : 'Congresso'} · {vote.yes} a favor / {vote.no} contra · {vote.passed ? 'aprovada' : 'rejeitada'}</span>
          </li>)}</ol> : <p className="legislature-empty">As votações aparecerão aqui conforme a pauta avançar semana a semana.</p>}
        </article>
      </section>

      <section className="legislature-note">
        <CircleAlert aria-hidden="true" size={16} />
        <p><strong>Modelo institucional simplificado.</strong> As bancadas e os resultados são simulados e determinísticos para que a campanha seja reproduzível. O sistema representa as etapas centrais, mas não substitui o processo regimental integral nem o calendário real do Congresso.</p>
      </section>
    </main>
  )
}
