import { useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, Check, CircleAlert, Landmark, Scale, UsersRound } from 'lucide-react'
import type { CampaignState, MinisterCandidate, MinistryState } from '../state/types'

const actionTypeLabel = 'Ação administrativa do Executivo'

function AttributeList({ candidate }: { candidate: MinisterCandidate }) {
  const labels: Array<[keyof MinisterCandidate['attributes'], string]> = [
    ['competence', 'Competência'],
    ['loyalty', 'Lealdade'],
    ['popularity', 'Popularidade'],
    ['integrity', 'Integridade'],
    ['influence', 'Influência'],
    ['ambition', 'Ambição'],
    ['relations', 'Relações'],
  ]
  return (
    <dl className="minister-attributes">
      {labels.map(([key, label]) => (
        <div key={key}><dt>{label}</dt><dd>{candidate.attributes[key]}</dd></div>
      ))}
    </dl>
  )
}

function MinistryDetail({
  ministry,
  campaign,
  onAppoint,
  onDismiss,
  onNegotiate,
}: {
  ministry: MinistryState
  campaign: CampaignState
  onAppoint: (ministryId: string, candidateId: string) => void
  onDismiss: (ministryId: string) => void
  onNegotiate: (ministryId: string, candidateId: string) => void
}) {
  const minister = ministry.minister
  const recordLists: Array<{ title: string; items: string[] }> = [
    { title: 'Pendências', items: ministry.pendingItems },
    { title: 'Riscos', items: ministry.risks },
    { title: 'Alertas', items: ministry.alerts },
  ]
  const dismissalBlocked = campaign.turn.availableActionPoints < 1
    ? 'Falta 1 ponto de ação.'
    : campaign.country.politicalCapital < 4
      ? 'Faltam 4 pontos de capital político.'
      : null

  return (
    <section aria-labelledby="ministry-detail-title" className="ministry-detail">
      <div className="ministry-detail-heading">
        <div>
          <p className="eyebrow">FICHA MINISTERIAL <span>·</span> {ministry.area.toUpperCase()}</p>
          <h2 id="ministry-detail-title">{ministry.name}</h2>
        </div>
        <span className="executive-action-type"><BriefcaseBusiness aria-hidden="true" size={12} /> {actionTypeLabel}</span>
      </div>

      <div className="ministry-detail-grid">
        <section className="ministry-info-block">
          <h3>Ministro responsável</h3>
          {minister ? (
            <>
              <div className="minister-identity"><strong>{minister.name}</strong><span>{minister.partyAcronym} · {minister.partyName}</span></div>
              <p className="minister-profile">{minister.profile}</p>
              <AttributeList candidate={minister} />
              <p className="minister-performance">Desempenho administrativo <strong>{ministry.administrativePerformance}/100</strong></p>
              <span className="executive-action-type"><BriefcaseBusiness aria-hidden="true" size={12} /> {actionTypeLabel}</span>
              <button
                className="executive-danger-button"
                disabled={Boolean(dismissalBlocked)}
                onClick={() => onDismiss(ministry.id)}
                title={dismissalBlocked ?? 'Custa 1 PA e 4 de capital político'}
                type="button"
              >
                Exonerar ministro · 1 PA · 4 capital
              </button>
              {dismissalBlocked && <small className="executive-button-hint">{dismissalBlocked}</small>}
              <p className="executive-reaction-note">A exoneração gera reação do partido do ministro, da base do governo e da imprensa.</p>
            </>
          ) : (
            <div className="vacant-ministry"><CircleAlert aria-hidden="true" size={16} /><span>Ministério sem titular. A indicação deve cumprir os requisitos do cargo.</span></div>
          )}
        </section>

        <section className="ministry-info-block">
          <h3>Competências oficiais</h3>
          <ul className="ministry-competences">{ministry.competences.map((competence) => <li key={competence}>{competence}</li>)}</ul>
          <div className="ministry-budget">
            <span>Dotação anual de referência <strong>{ministry.annualBudget} u.</strong></span>
            <span>Disponível no mês <strong>{ministry.budgetAvailable} u.</strong></span>
            <span>Executado no último mês <strong>{ministry.budgetExecuted} u.</strong></span>
          </div>
        </section>
      </div>

      <section className="ministry-info-block ministry-programs">
        <h3>Programas e projetos</h3>
        <p>Programas e projetos ministeriais ficam disponíveis na próxima etapa.</p>
      </section>

      <div className="ministry-detail-grid">
        {recordLists.map(({ title, items }) => (
          <section className="ministry-info-block" key={title}>
            <h3>{title}</h3>
            {items.length
              ? <ul className="ministry-competences">{items.map((item) => <li key={item}>{item}</li>)}</ul>
              : <p className="executive-empty-note">Nenhum registro no momento.</p>}
          </section>
        ))}
      </div>

      {!minister && (
        <section className="ministry-info-block candidate-block">
          <h3>Candidatos à indicação</h3>
          <p className="executive-legal-note"><Scale aria-hidden="true" size={14} /> Negociação política não elimina requisitos: competência mínima 35 e integridade mínima 30.</p>
          <div className="minister-candidate-list">
            {ministry.candidates.map((candidate) => {
              const eligible = candidate.attributes.competence >= 35 && candidate.attributes.integrity >= 30
              const negotiated = ministry.negotiatedCandidateIds.includes(candidate.id)
              const crossParty = candidate.partyId !== campaign.party.id
              const negotiationBlocked = campaign.turn.availableActionPoints < 1
                ? 'Falta 1 ponto de ação.'
                : campaign.country.politicalCapital < 2
                  ? 'Faltam 2 pontos de capital político.'
                  : null
              const appointmentBlocked = campaign.turn.availableActionPoints < 1
                ? 'Falta 1 ponto de ação.'
                : campaign.country.politicalCapital < (crossParty ? 4 : 2)
                  ? `Faltam ${crossParty ? 4 : 2} pontos de capital político.`
                  : null
              return (
                <article className="minister-candidate" key={candidate.id}>
                  <div className="candidate-heading"><strong>{candidate.name}</strong><span>{candidate.partyAcronym} · {candidate.partyName}</span></div>
                  <p>{candidate.profile}</p>
                  <AttributeList candidate={candidate} />
                  <p className="candidate-requirements">
                    {eligible ? <Check aria-hidden="true" size={13} /> : <CircleAlert aria-hidden="true" size={13} />}
                    {eligible ? 'Requisitos mínimos atendidos.' : 'Não atende aos requisitos mínimos.'}
                    {crossParty && <span>A indicação pode ampliar o apoio no Congresso e custa 4 de capital.</span>}
                  </p>
                  <div className="candidate-actions">
                    <div className="candidate-action">
                      <span className="executive-action-type"><BriefcaseBusiness aria-hidden="true" size={12} /> {actionTypeLabel}</span>
                      <button
                        className="executive-secondary-button"
                        disabled={Boolean(negotiationBlocked) || negotiated}
                        onClick={() => onNegotiate(ministry.id, candidate.id)}
                        title={negotiationBlocked ?? (negotiated ? 'Apoio já negociado' : 'Negociar custa 1 PA e 2 de capital político')}
                        type="button"
                      >
                        {negotiated ? 'Apoio negociado' : 'Negociar apoio · 1 PA · 2 capital'}
                      </button>
                    </div>
                    <div className="candidate-action">
                      <span className="executive-action-type"><BriefcaseBusiness aria-hidden="true" size={12} /> {actionTypeLabel}</span>
                      <button
                        className="executive-primary-button"
                        disabled={!eligible || Boolean(appointmentBlocked)}
                        onClick={() => onAppoint(ministry.id, candidate.id)}
                        title={appointmentBlocked ?? 'A nomeação consome 1 ponto de ação'}
                        type="button"
                      >
                        Nomear · 1 PA · {crossParty ? 4 : 2} capital
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </section>
  )
}

export default function ExecutivePanel({
  campaign,
  onAppoint,
  onDismiss,
  onNegotiate,
  onProposeReorganization,
}: {
  campaign: CampaignState
  onAppoint: (ministryId: string, candidateId: string) => void
  onDismiss: (ministryId: string) => void
  onNegotiate: (ministryId: string, candidateId: string) => void
  onProposeReorganization: () => void
}) {
  const [selectedMinistryId, setSelectedMinistryId] = useState(campaign.ministries[0]?.id ?? '')
  const selectedMinistry = campaign.ministries.find((ministry) => ministry.id === selectedMinistryId)

  return (
    <main className="executive-panel page-enter">
      <div className="state-subnavigation" aria-label="Subnavegação de Estado">
        <span aria-current="page">Executivo</span>
      </div>
      <header className="executive-page-heading">
        <div>
          <p className="eyebrow">ESTADO <span>·</span> PODER EXECUTIVO</p>
          <h1>Ministérios e gabinete</h1>
          <p>A estrutura de referência de janeiro de 2027; cada indicação permanece sujeita aos requisitos do cargo.</p>
        </div>
        <span className="executive-overview"><Landmark aria-hidden="true" size={17} /> {campaign.ministries.length} ministérios</span>
      </header>

      <div className="executive-layout">
        <nav aria-label="Ministérios" className="ministry-list">
          {campaign.ministries.map((ministry) => (
            <button
              aria-current={ministry.id === selectedMinistryId ? 'true' : undefined}
              className={`ministry-list-item${ministry.id === selectedMinistryId ? ' is-selected' : ''}`}
              key={ministry.id}
              onClick={() => setSelectedMinistryId(ministry.id)}
              type="button"
            >
              <span className="ministry-list-copy"><small>{ministry.area}</small><strong>{ministry.name}</strong><span>{ministry.minister?.name ?? 'Sem titular'}</span></span>
              <span className="ministry-list-performance">{ministry.administrativePerformance}<small>/100</small></span>
            </button>
          ))}
        </nav>

        {selectedMinistry && (
          <MinistryDetail
            campaign={campaign}
            ministry={selectedMinistry}
            onAppoint={onAppoint}
            onDismiss={onDismiss}
            onNegotiate={onNegotiate}
          />
        )}
      </div>

      <section className="ministry-reorganization">
        <div className="reorganization-copy">
          <span className="executive-action-type"><UsersRound aria-hidden="true" size={12} /> Proposta que depende do Congresso</span>
          <h2>Reorganizar a estrutura ministerial</h2>
          <p>Criar, extinguir ou transformar ministérios não é uma ação direta do presidente. A proposta não altera a estrutura e ainda não tem tramitação nesta fase.</p>
          {campaign.executiveProposals.includes('Reorganização da estrutura ministerial') && <span className="proposal-status">Proposta registrada · aguardando a fase do Legislativo · sem tramitação</span>}
        </div>
        <button
          className="executive-secondary-button"
          disabled={campaign.executiveProposals.includes('Reorganização da estrutura ministerial')
            || campaign.turn.availableActionPoints < 1 || campaign.country.politicalCapital < 2}
          onClick={onProposeReorganization}
          type="button"
        >
          {campaign.executiveProposals.includes('Reorganização da estrutura ministerial') ? 'Proposta registrada' : 'Registrar proposta · 1 PA · 2 capital'}
        </button>
      </section>
      <p className="executive-footnote"><ArrowLeft aria-hidden="true" size={12} /> Partidos e personagens deste gabinete são ficcionais.</p>
    </main>
  )
}
