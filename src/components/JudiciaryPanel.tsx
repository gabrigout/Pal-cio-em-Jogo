import { useState } from 'react'
import { Activity, BookOpen, CheckCircle2, Clock3, FileCheck2, Gavel, Landmark, Scale, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { judicialCaseDescriptions, judicialCaseLabels, judicialCourts, judicialOutcomeDescriptions, judicialOutcomeLabels, judicialRules } from '../data/judiciary'
import { isEligibleJudicialCandidate } from '../engine/judiciary'
import type { CampaignState, JudicialCase, JudicialCaseStage, JudicialNominationStatus, JudicialOutcome } from '../state/types'

const caseStageLabels: Record<JudicialCaseStage, string> = {
  filed: 'Distribuído',
  admissibility: 'Admissibilidade',
  evidence: 'Instrução',
  'awaiting-decision': 'Conclusos para decisão',
  decision: 'Decisão publicada',
  appeal: 'Recurso',
  final: 'Decisão final',
  dismissed: 'Encerrado sem julgamento do mérito',
}
const nominationLabels: Record<JudicialNominationStatus, string> = {
  'awaiting-senate': 'Aguardando votação no Senado',
  approved: 'Aprovada pelo Senado',
  rejected: 'Rejeitada pelo Senado',
  appointed: 'Nomeação formalizada',
}
const outcomeTone: Record<JudicialOutcome, string> = {
  plaintiff: 'attention',
  government: 'neutral',
  partial: 'attention',
  inadmissible: 'neutral',
}
const activeCaseStages: JudicialCaseStage[] = ['filed', 'admissibility', 'evidence', 'awaiting-decision', 'decision', 'appeal']

function CaseCard({
  judicialCase,
  campaign,
  onAppeal,
  onComply,
}: {
  judicialCase: JudicialCase
  campaign: CampaignState
  onAppeal: (id: string) => void
  onComply: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const latestDecision = judicialCase.decisions[judicialCase.decisions.length - 1]
  const court = judicialCourts[judicialCase.court]
  const canAppeal = judicialCase.stage === 'decision'
    && judicialCase.governmentIsParty
    && (judicialCase.outcome === 'plaintiff' || judicialCase.outcome === 'partial')
    && judicialCase.appealTo !== null
    && judicialCase.appealWindowWeeks > 0
    && judicialCase.appealCount < 1
  const canComply = judicialCase.stage === 'final'
    && judicialCase.governmentIsParty
    && (judicialCase.outcome === 'plaintiff' || judicialCase.outcome === 'partial')
    && ['pending', 'overdue'].includes(judicialCase.complianceStatus)
  const isActive = activeCaseStages.includes(judicialCase.stage)

  return (
    <article className="judiciary-case">
      <header className="judiciary-case-header">
        <div className="judiciary-case-title">
          <span className="judiciary-case-type">{judicialCaseLabels[judicialCase.type]} · {court.shortName}</span>
          <h3>{judicialCase.title}</h3>
        </div>
        <span className={'judiciary-status judiciary-status-' + (judicialCase.stage === 'final' ? 'final' : judicialCase.stage === 'dismissed' ? 'closed' : isActive ? 'active' : 'pending')}>
          {caseStageLabels[judicialCase.stage]}
        </span>
      </header>
      <p className="judiciary-case-summary">{judicialCase.summary}</p>
      <div className="judiciary-case-meta">
        <span>Requerente <strong>{judicialCase.plaintiff}</strong></span>
        <span>Parte demandada <strong>{judicialCase.defendant}</strong></span>
        <span>Tempo <strong>{judicialCase.daysInProcess} dias</strong></span>
        <span>Impacto público <strong>{Math.round(judicialCase.publicImpact)}/100</strong></span>
      </div>
      {judicialCase.outcome && (
        <div className={'judiciary-decision judiciary-tone-' + outcomeTone[judicialCase.outcome]}>
          <div className="judiciary-decision-heading">
            <Scale aria-hidden="true" size={15} />
            <span><strong>{judicialOutcomeLabels[judicialCase.outcome]}</strong> · {judicialCase.court.toUpperCase()}</span>
          </div>
          <p>{latestDecision?.rationale ?? judicialOutcomeDescriptions[judicialCase.outcome]}</p>
          {judicialCase.complianceStatus !== 'not-required' && (
            <span className="judiciary-compliance-status">Cumprimento: {judicialCase.complianceStatus === 'pending'
              ? 'pendente (' + judicialCase.complianceWeeksRemaining + ' semanas)'
              : judicialCase.complianceStatus === 'overdue' ? 'prazo expirado' : 'registrado'}</span>
          )}
        </div>
      )}
      {judicialCase.publicReactionSummary && (
        <div className="judiciary-public-reaction">
          <Activity aria-hidden="true" size={14} />
          <div><strong>Repercussão pública, separada do mérito</strong><p>{judicialCase.publicReactionSummary}</p></div>
        </div>
      )}
      <div className="judiciary-case-actions">
        <button className="judiciary-button judiciary-button-secondary" onClick={() => setExpanded((current) => !current)} type="button">
          <BookOpen aria-hidden="true" size={13} /> {expanded ? 'Ocultar histórico' : 'Histórico (' + judicialCase.history.length + ')'}
        </button>
        {canAppeal && (
          <button
            className="judiciary-button"
            disabled={campaign.turn.availableActionPoints < judicialRules.appealActionPoints || campaign.country.politicalCapital < judicialRules.appealPoliticalCapital}
            onClick={() => onAppeal(judicialCase.id)}
            type="button"
          >
            <Gavel aria-hidden="true" size={13} /> {'Recorrer para ' + judicialCase.appealTo?.toUpperCase() + ' (' + judicialCase.appealWindowWeeks + ' sem.)'}
          </button>
        )}
        {canComply && (
          <button
            className="judiciary-button"
            disabled={campaign.turn.availableActionPoints < judicialRules.complianceActionPoints}
            onClick={() => onComply(judicialCase.id)}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" size={13} /> Registrar cumprimento
          </button>
        )}
      </div>
      {expanded && (
        <ol className="judiciary-case-history">
          {judicialCase.history.map((item, index) => <li key={judicialCase.id + '-history-' + index}>{item}</li>)}
        </ol>
      )}
    </article>
  )
}

export default function JudiciaryPanel({
  campaign,
  onNominate,
  onAppoint,
  onAppeal,
  onComply,
}: {
  campaign: CampaignState
  onNominate: (vacancyId: string, candidateId: string) => void
  onAppoint: (nominationId: string) => void
  onAppeal: (caseId: string) => void
  onComply: (caseId: string) => void
}) {
  const [caseFilter, setCaseFilter] = useState<'all' | 'active' | 'closed'>('all')
  const judiciary = campaign.judiciary
  const activeCases = judiciary.cases.filter((judicialCase) => activeCaseStages.includes(judicialCase.stage))
  const visibleCases = [...judiciary.cases]
    .filter((judicialCase) => caseFilter === 'all'
      || (caseFilter === 'active' ? activeCaseStages.includes(judicialCase.stage) : !activeCaseStages.includes(judicialCase.stage)))
    .sort((first, second) => second.filedYear - first.filedYear
      || second.filedWeek - first.filedWeek
      || second.daysInProcess - first.daysInProcess)
  const openVacancies = judiciary.vacancies
  const pendingNominations = judiciary.nominations.filter((nomination) => nomination.status === 'awaiting-senate')
  const canNominate = campaign.turn.availableActionPoints >= judicialRules.nominationActionPoints
    && campaign.country.politicalCapital >= judicialRules.nominationPoliticalCapital

  return (
    <main className="judiciary-panel page-enter">
      <header className="judiciary-heading">
        <div>
          <p className="eyebrow">PODER JUDICIÁRIO <span>·</span> INDEPENDÊNCIA INSTITUCIONAL</p>
          <h1>Justiça, processos e decisões</h1>
          <p>O Executivo pode cumprir decisões e interpor recursos cabíveis. Não escolhe julgamentos nem controla a fundamentação jurídica. Aprovação política e repercussão pública são separadas do mérito de cada processo.</p>
        </div>
        <div className="judiciary-heading-status">
          <Scale aria-hidden="true" size={21} />
          <span><strong>{activeCases.length}</strong> processos em andamento</span>
        </div>
      </header>

      <section className="judiciary-summary-grid" aria-label="Resumo judicial">
        <article><span>COMPOSIÇÃO DO STF</span><strong>{judiciary.stfJustices.length}/11</strong><p>Ministros ficcionais; vagas exigem indicação, votação no Senado e nomeação.</p></article>
        <article><span>VAGAS ABERTAS</span><strong>{openVacancies.length}</strong><p>Não há preenchimento automático de cadeiras.</p></article>
        <article><span>INDICAÇÕES PENDENTES</span><strong>{pendingNominations.length}</strong><p>A aprovação pelo Senado é uma etapa separada da nomeação.</p></article>
        <article><span>RECURSOS DISPONÍVEIS</span><strong>{campaign.turn.availableActionPoints} PA · {campaign.country.politicalCapital} CP</strong><p>Indicações, recursos e cumprimento de decisões consomem recursos definidos.</p></article>
      </section>

      <section className="judiciary-roster-section">
        <div className="judiciary-section-heading">
          <div><p className="eyebrow">SUPREMO TRIBUNAL FEDERAL</p><h2>Composição e mandatos</h2></div>
          <Landmark aria-hidden="true" size={18} />
        </div>
        <div className="judiciary-justice-grid">
          {judiciary.stfJustices.map((justice) => (
            <article className="judiciary-justice-card" key={justice.id}>
              <span className="judiciary-seat-label">CADEIRA {String(justice.seatNumber).padStart(2, '0')}</span>
              <h3>{justice.name}</h3>
              <span className="judiciary-justice-age">{justice.age} anos {justice.monthsUntilRetirement !== null ? '· aposentadoria simulada em ' + justice.monthsUntilRetirement + ' meses' : ''}</span>
              <div className="judiciary-justice-attributes">
                <span>Conhecimento jurídico <strong>{justice.legalKnowledge}</strong></span>
                <span>Independência <strong>{justice.independence}</strong></span>
                <span>Rigor processual <strong>{justice.proceduralRigour}</strong></span>
              </div>
            </article>
          ))}
          {openVacancies.map((vacancy) => (
            <article className="judiciary-vacancy-card" key={vacancy.id}>
              <span className="judiciary-seat-label">CADEIRA {String(vacancy.seatNumber).padStart(2, '0')} · VAGA</span>
              <h3>Vaga disponível no STF</h3>
              <p>{vacancy.reason}</p>
              <span className="judiciary-vacancy-date">Aberta em {vacancy.openedMonth} de {vacancy.openedYear}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="judiciary-nominations-section">
        <div className="judiciary-section-heading">
          <div><p className="eyebrow">INDICAÇÃO E APROVAÇÃO</p><h2>Processo de nomeação</h2></div>
          <UserRoundCheck aria-hidden="true" size={18} />
        </div>
        {openVacancies.length ? openVacancies.map((vacancy) => {
          const activeForVacancy = judiciary.nominations.find((nomination) => nomination.vacancyId === vacancy.id
            && ['awaiting-senate', 'approved'].includes(nomination.status))
          return (
            <article className="judiciary-vacancy-workflow" key={vacancy.id}>
              <header><div><span className="judiciary-seat-label">VAGA NO STF · CADEIRA {vacancy.seatNumber}</span><h3>Escolha uma indicação</h3></div><span>{activeForVacancy ? nominationLabels[activeForVacancy.status] : 'Aguardando indicação presidencial'}</span></header>
              {activeForVacancy ? (
                <div className="judiciary-nomination-status">
                  <div><strong>{activeForVacancy.candidate.name}</strong><p>{activeForVacancy.candidate.profile}</p>
                    {activeForVacancy.vote && <p className="judiciary-vote-line">Senado: {activeForVacancy.vote.yes} a favor, {activeForVacancy.vote.no} contra, {activeForVacancy.vote.abstain} abstenções, {activeForVacancy.vote.absent} ausentes; eram necessários {activeForVacancy.vote.requiredYes} votos favoráveis.</p>}
                  </div>
                  {activeForVacancy.status === 'approved' && <button className="judiciary-button" disabled={campaign.turn.availableActionPoints < judicialRules.appointmentActionPoints} onClick={() => onAppoint(activeForVacancy.id)} type="button"><CheckCircle2 aria-hidden="true" size={13} /> Formalizar nomeação (1 PA)</button>}
                </div>
              ) : (
                <div className="judiciary-candidate-grid">
                  {vacancy.candidates.map((candidate) => {
                    const eligible = isEligibleJudicialCandidate(candidate)
                    const alreadyNominated = vacancy.nominatedCandidateIds.includes(candidate.id)
                    return (
                      <article className="judiciary-candidate-card" key={candidate.id}>
                        <h4>{candidate.name}</h4><p>{candidate.profile}</p>
                        <div className="judiciary-candidate-metrics">
                          <span>Idade <strong>{candidate.age}</strong></span>
                          <span>Conhecimento <strong>{candidate.legalKnowledge}</strong></span>
                          <span>Reputação <strong>{candidate.publicReputation}</strong></span>
                        </div>
                        {!eligible && <p className="judiciary-ineligible">Não atende aos critérios de elegibilidade configurados.</p>}
                        <button
                          className="judiciary-button judiciary-button-secondary"
                          disabled={!eligible || alreadyNominated || !canNominate}
                          onClick={() => onNominate(vacancy.id, candidate.id)}
                          type="button"
                        >
                          <UserRoundCheck aria-hidden="true" size={13} /> Indicar ao Senado
                        </button>
                      </article>
                    )
                  })}
                </div>
              )}
              <p className="judiciary-caption">Candidatos e autoridades são ficcionais. A indicação exige critérios de elegibilidade e aprovação por maioria absoluta: {judicialRules.senateAbsoluteMajority} de {judicialRules.senateSeats} senadores. O indicador de apoio no Congresso não determina o resultado.</p>
            </article>
          )
        }) : <p className="judiciary-empty">Não há vaga no STF no momento. O sistema não inventa novas vagas por conveniência política; elas surgem na simulação a partir de aposentadoria compulsória.</p>}
        {judiciary.nominations.length > 0 && (
          <details className="judiciary-archive">
            <summary>Histórico de indicações ({judiciary.nominations.length})</summary>
            <ol>{judiciary.nominations.map((nomination) => (
              <li key={nomination.id}><strong>{nomination.candidate.name}</strong> — {nominationLabels[nomination.status]}
                {nomination.vote && <span> · {nomination.vote.yes} votos favoráveis, {nomination.vote.no} contrários.</span>}
                <ul>{nomination.history.slice(0, 4).map((message, index) => <li key={nomination.id + '-history-' + index}>{message}</li>)}</ul>
              </li>
            ))}</ol>
          </details>
        )}
      </section>

      <section className="judiciary-cases-section">
        <div className="judiciary-section-heading">
          <div><p className="eyebrow">CONTENCIOSO</p><h2>Processos, recursos e cumprimento</h2></div>
          <label className="judiciary-filter">Mostrar
            <select onChange={(event) => setCaseFilter(event.target.value as typeof caseFilter)} value={caseFilter}>
              <option value="all">Todos os processos</option>
              <option value="active">Em andamento</option>
              <option value="closed">Encerrados/finalizados</option>
            </select>
          </label>
        </div>
        <div className="judiciary-case-types">
          {Object.entries(judicialCaseLabels).map(([id, label]) => (
            <span key={id} title={judicialCaseDescriptions[id as keyof typeof judicialCaseDescriptions]}>{label}</span>
          ))}
        </div>
        {visibleCases.length ? (
          <div className="judiciary-case-list">
            {visibleCases.map((judicialCase) => (
              <CaseCard campaign={campaign} judicialCase={judicialCase} key={judicialCase.id} onAppeal={onAppeal} onComply={onComply} />
            ))}
          </div>
        ) : <p className="judiciary-empty">Não há processos nesta categoria. Novos casos podem nascer de conflitos administrativos plausíveis ou de questionamentos de normas aprovadas.</p>}
      </section>

      <section className="judiciary-institutions-section">
        <div className="judiciary-section-heading">
          <div><p className="eyebrow">COMPETÊNCIAS</p><h2>Instâncias e limites institucionais</h2></div>
          <ShieldCheck aria-hidden="true" size={18} />
        </div>
        <div className="judiciary-institution-grid">
          {Object.values(judicialCourts).map((court) => (
            <article className="judiciary-institution-card" key={court.id}>
              <span>{court.shortName}</span><h3>{court.name}</h3><p>{court.competence}</p>
              {court.id === 'cnj' && <strong>Controle administrativo/disciplinar — não é recurso comum de mérito.</strong>}
            </article>
          ))}
        </div>
      </section>

      <section className="judiciary-history-section">
        <div className="judiciary-section-heading">
          <div><p className="eyebrow">HISTÓRICO INSTITUCIONAL</p><h2>Acontecimentos recentes</h2></div><Clock3 aria-hidden="true" size={18} />
        </div>
        {judiciary.history.length
          ? <ol className="judiciary-global-history">{judiciary.history.slice(0, 16).map((item, index) => <li key={'judiciary-global-history-' + index}>{item}</li>)}</ol>
          : <p className="judiciary-empty">Ainda não há registros institucionais.</p>}
      </section>

      <section className="judiciary-disclaimer">
        <FileCheck2 aria-hidden="true" size={16} />
        <p><strong>Modelo ficcional e simplificado.</strong> A Presidência não decide os casos. O placar e os motivos são gerados pelo estado processual e pelos elementos do caso; a repercussão pública fica em campo separado. A composição, os prazos e as decisões deste protótipo não substituem processo judicial real nem reproduzem todo o rito jurídico brasileiro.</p>
      </section>
    </main>
  )
}
