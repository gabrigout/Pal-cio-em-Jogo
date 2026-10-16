import { useState } from 'react'
import { Activity, Archive, ArrowRightLeft, CheckCircle2, ClipboardCheck, FileSearch, Landmark, Scale, ShieldCheck, TriangleAlert } from 'lucide-react'
import { oversightBodies, oversightCaseTypeLabels, oversightFindingDescriptions, oversightFindingLabels, oversightRules, oversightTargetKindLabels } from '../data/oversight'
import type { CampaignState, OversightBodyId, OversightCase, OversightCaseStage, OversightRequestInput } from '../state/types'

const stageLabels: Record<OversightCaseStage, string> = {
  received: 'Recebido',
  screening: 'Triagem',
  evidence: 'Coleta de elementos',
  analysis: 'Análise institucional',
  finding: 'Relatório registrado',
  referred: 'Encaminhado a outro órgão',
  archived: 'Arquivado nesta etapa',
}
const bodyTone: Record<OversightBodyId, string> = {
  mpf: 'independent',
  pf: 'independent',
  cgu: 'internal',
  tcu: 'independent',
  agu: 'advisory',
  tse: 'independent',
  congress: 'legislative',
}
const stageOrder: OversightCaseStage[] = ['received', 'screening', 'evidence', 'analysis', 'finding', 'referred', 'archived']
const terminalStages: OversightCaseStage[] = ['referred', 'archived']

function formatPercent(value: number): string {
  return Math.round(value) + '/100'
}

function CaseCard({ item }: { item: OversightCase }) {
  const [expanded, setExpanded] = useState(false)
  const body = oversightBodies[item.body]
  const findingLabel = item.finding ? oversightFindingLabels[item.finding] : null
  const stageIndex = stageOrder.indexOf(item.stage)
  return (
    <article className="oversight-case">
      <header className="oversight-case-header">
        <div className="oversight-case-title">
          <span className="oversight-case-type">{oversightCaseTypeLabels[item.type]} · {body.shortName}</span>
          <h3>{item.title}</h3>
        </div>
        <span className={'oversight-status oversight-status-' + (terminalStages.includes(item.stage) ? 'closed' : item.stage === 'finding' ? 'finding' : 'active')}>
          {stageLabels[item.stage]}
        </span>
      </header>
      <p className="oversight-case-summary">{item.summary}</p>
      <div className="oversight-case-meta">
        <span>Objeto <strong>{oversightTargetKindLabels[item.targetKind]}: {item.targetName}</strong></span>
        <span>Origem <strong>{item.origin}</strong></span>
        <span>Em análise há <strong>{item.daysInProcess} dias simulados</strong></span>
        <span>Severidade <strong>{item.severity === 'critical' ? 'Crítica' : item.severity === 'important' ? 'Importante' : 'Rotineira'}</strong></span>
      </div>
      <div className="oversight-scores">
        <div>
          <span>Suspeita/risco inicial</span>
          <strong>{formatPercent(item.suspicionScore)}</strong>
          <div className="oversight-meter"><span style={{ width: item.suspicionScore + '%' }} /></div>
        </div>
        <div>
          <span>Força dos elementos registrados</span>
          <strong>{formatPercent(item.evidenceStrength)}</strong>
          <div className="oversight-meter"><span style={{ width: item.evidenceStrength + '%' }} /></div>
        </div>
      </div>
      <div className="oversight-stage-track" aria-label={'Etapa ' + stageLabels[item.stage]}>
        {stageOrder.map((stage, index) => (
          <span className={index <= stageIndex ? 'oversight-stage-step is-past' : 'oversight-stage-step'} key={stage} title={stageLabels[stage]} />
        ))}
      </div>
      {item.finding && (
        <section className="oversight-finding">
          <div className="oversight-finding-heading">
            <ClipboardCheck aria-hidden="true" size={15} />
            <strong>{findingLabel}</strong>
          </div>
          <p>{oversightFindingDescriptions[item.finding]}</p>
          {item.referralTarget && (
            <div className="oversight-referral">
              <ArrowRightLeft aria-hidden="true" size={13} />
              Encaminhamento: <strong>{oversightBodies[item.referralTarget].shortName}</strong>
              {item.linkedCaseId && <span> · processo vinculado registrado</span>}
            </div>
          )}
        </section>
      )}
      <div className="oversight-case-actions">
        <button className="oversight-button oversight-button-secondary" onClick={() => setExpanded((value) => !value)} type="button">
          <FileSearch aria-hidden="true" size={13} /> {expanded ? 'Ocultar elementos e histórico' : 'Ver elementos e histórico'}
        </button>
        {terminalStages.includes(item.stage) && <span className="oversight-terminal-label"><Archive aria-hidden="true" size={12} /> Etapa encerrada; registros preservados.</span>}
      </div>
      {expanded && (
        <div className="oversight-evidence-history">
          <section>
            <h4>Elementos registrados ({item.evidence.length})</h4>
            {item.evidence.length === 0 ? <p className="oversight-muted">Nenhum elemento foi anexado ainda; a força probatória permanece zero.</p> : (
              <div className="oversight-evidence-list">
                {item.evidence.map((evidence) => (
                  <article className="oversight-evidence" key={evidence.id}>
                    <div className="oversight-evidence-heading">
                      <strong>{evidence.title}</strong>
                      <span className={evidence.verified ? 'oversight-evidence-verified' : 'oversight-evidence-unverified'}>
                        {evidence.verified ? 'Registro conferido' : 'Pista não corroborada'}
                      </span>
                    </div>
                    <p>{evidence.description}</p>
                    <div className="oversight-evidence-meta">
                      <span>Fonte: {evidence.source}</span>
                      <span>Força estimada: {evidence.strength}/100</span>
                      <span>{evidence.dateLabel}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          <section>
            <h4>Histórico do expediente</h4>
            <ol className="oversight-history">
              {item.history.map((message, index) => <li key={item.id + '-history-' + index}>{message}</li>)}
            </ol>
          </section>
        </div>
      )}
    </article>
  )
}

export default function OversightPanel({
  campaign,
  onRequest,
}: {
  campaign: CampaignState
  onRequest: (input: OversightRequestInput) => void
}) {
  const [cguScope, setCguScope] = useState<'project' | 'ministry'>('project')
  const [cguTargetId, setCguTargetId] = useState(campaign.projects[0]?.id ?? '')
  const [tcuScope, setTcuScope] = useState<'budget' | 'project'>('budget')
  const [tcuProjectId, setTcuProjectId] = useState(campaign.projects[0]?.id ?? '')
  const [aguScope, setAguScope] = useState<'bill' | 'project' | 'ministry'>('bill')
  const [aguTargetId, setAguTargetId] = useState(campaign.legislature.bills[0]?.id ?? '')
  const [filter, setFilter] = useState<'all' | 'active' | 'findings'>('all')
  const oversight = campaign.oversight
  const activeCases = oversight.cases.filter((item) => !terminalStages.includes(item.stage))
  const referredCases = oversight.cases.filter((item) => item.stage === 'referred')
  const recordedFindings = oversight.cases.filter((item) => item.finding !== null)
  const visibleCases = [...oversight.cases]
    .filter((item) => filter === 'all'
      || (filter === 'active' ? !terminalStages.includes(item.stage) : item.finding !== null))
    .sort((first, second) => second.createdYear - first.createdYear
      || second.createdWeek - first.createdWeek
      || second.daysInProcess - first.daysInProcess)
  const capacity = campaign.country.administrativeCapacity
  const canRequest = campaign.turn.availableActionPoints >= oversightRules.requestActionPoints
    && capacity >= oversightRules.requestAdministrativeCapacity
  const cguTargets = cguScope === 'project' ? campaign.projects : campaign.ministries
  const tcuCanRequest = tcuScope === 'budget' || (tcuScope === 'project' && Boolean(tcuProjectId))
  const aguTargets = aguScope === 'bill' ? campaign.legislature.bills
    : aguScope === 'project' ? campaign.projects : campaign.ministries
  const targetIsAvailable = aguTargets.length > 0 && Boolean(aguTargetId)
  const countActive = activeCases.length

  return (
    <main className="oversight-panel page-enter">
      <header className="oversight-heading">
        <div>
          <p className="eyebrow">CONTROLE INSTITUCIONAL <span>·</span> FISCALIZAÇÃO E INVESTIGAÇÃO</p>
          <h1>Auditorias, evidências e encaminhamentos</h1>
          <p>Órgãos diferentes possuem competências diferentes. O Executivo pode encaminhar um pedido ou cooperar com solicitações formais, mas não escolhe o resultado de auditorias e investigações. Um relato não é prova; uma auditoria não é condenação.</p>
        </div>
        <div className="oversight-heading-status">
          <ShieldCheck aria-hidden="true" size={21} />
          <span><strong>{countActive}</strong> expedientes em andamento</span>
        </div>
      </header>

      <section className="oversight-summary-grid" aria-label="Resumo do controle institucional">
        <article><span>EXPEDIENTES</span><strong>{oversight.cases.length}</strong><p>Relatos, auditorias e encaminhamentos preservados no histórico.</p></article>
        <article><span>ANÁLISES ATIVAS</span><strong>{activeCases.length}</strong><p>Uma abertura ou triagem não equivale a achado formal.</p></article>
        <article><span>RELATÓRIOS/ACHADOS</span><strong>{recordedFindings.length}</strong><p>Resultados limitados ao material efetivamente registrado.</p></article>
        <article><span>ENCAMINHAMENTOS</span><strong>{referredCases.length}</strong><p>Remessa para outro órgão não significa denúncia ou condenação.</p></article>
      </section>

      <section className="oversight-institutions-section">
        <div className="oversight-section-heading">
          <div><p className="eyebrow">COMPETÊNCIAS E LIMITES</p><h2>Órgãos e instituições</h2></div>
          <Landmark aria-hidden="true" size={18} />
        </div>
        <div className="oversight-institution-grid">
          {Object.values(oversightBodies).map((body) => (
            <article className="oversight-institution" key={body.id}>
              <div className="oversight-institution-head">
                <span className={'oversight-body-tag oversight-body-' + bodyTone[body.id]}>{body.shortName}</span>
                <span className="oversight-independence">{body.independence === 'independent' ? 'Independente' : body.independence === 'internal-control' ? 'Controle interno' : body.independence === 'legal-advisory' ? 'Consultivo' : 'Legislativo'}</span>
              </div>
              <h3>{body.name}</h3>
              <p>{body.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="oversight-request-section">
        <div className="oversight-section-heading">
          <div><p className="eyebrow">ENCAMINHAMENTO DO EXECUTIVO</p><h2>Solicitar análise ou parecer</h2></div>
          <Activity aria-hidden="true" size={18} />
        </div>
        <p className="oversight-section-intro">Os pedidos consomem 1 ponto de ação e 1 de capacidade administrativa. Eles criam um expediente para triagem independente; não acrescentam evidência por conta própria nem permitem ao presidente ordenar uma conclusão.</p>
        <div className="oversight-request-grid">
          <article className="oversight-request-card">
            <div className="oversight-request-title"><ShieldCheck aria-hidden="true" size={17} /><div><span>CGU · CONTROLE INTERNO</span><h3>Solicitar auditoria interna</h3></div></div>
            <label>Objeto do pedido
              <select onChange={(event) => { setCguScope(event.target.value as typeof cguScope); setCguTargetId(event.target.value === 'project' ? campaign.projects[0]?.id ?? '' : campaign.ministries[0]?.id ?? '') }} value={cguScope}>
                <option value="project">Projeto público</option><option value="ministry">Ministério</option>
              </select>
            </label>
            <label>{cguScope === 'project' ? 'Projeto' : 'Ministério'}
              <select onChange={(event) => setCguTargetId(event.target.value)} value={cguTargetId}>
                {cguTargets.map((target) => <option key={target.id} value={target.id}>{target.name}</option>)}
              </select>
            </label>
            {cguTargets.length === 0 && <p className="oversight-muted">Não há objetos desse tipo nesta campanha.</p>}
            <button className="oversight-button" disabled={!canRequest || cguTargets.length === 0} onClick={() => onRequest({ body: 'cgu', targetKind: cguScope, targetId: cguTargetId })} type="button">
              Solicitar auditoria à CGU
            </button>
          </article>

          <article className="oversight-request-card">
            <div className="oversight-request-title"><Scale aria-hidden="true" size={17} /><div><span>TCU · CONTROLE EXTERNO</span><h3>Encaminhar pedido de fiscalização</h3></div></div>
            <label>Objeto do pedido
              <select onChange={(event) => setTcuScope(event.target.value as typeof tcuScope)} value={tcuScope}>
                <option value="budget">Execução orçamentária</option><option value="project">Projeto público</option>
              </select>
            </label>
            {tcuScope === 'project' && <label>Projeto
              <select onChange={(event) => setTcuProjectId(event.target.value)} value={tcuProjectId}>
                {campaign.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>}
            <p className="oversight-muted">A solicitação não dá ordens ao TCU e não antecipa a análise das contas.</p>
            <button className="oversight-button" disabled={!canRequest || !tcuCanRequest || (tcuScope === 'project' && campaign.projects.length === 0)} onClick={() => onRequest({ body: 'tcu', targetKind: tcuScope, targetId: tcuScope === 'project' ? tcuProjectId : null })} type="button">
              Encaminhar ao TCU
            </button>
          </article>

          <article className="oversight-request-card">
            <div className="oversight-request-title"><FileSearch aria-hidden="true" size={17} /><div><span>AGU · CONSULTORIA JURÍDICA</span><h3>Solicitar parecer consultivo</h3></div></div>
            <label>Objeto da consulta
              <select onChange={(event) => { setAguScope(event.target.value as typeof aguScope); const next = event.target.value === 'bill' ? campaign.legislature.bills[0]?.id ?? '' : event.target.value === 'project' ? campaign.projects[0]?.id ?? '' : campaign.ministries[0]?.id ?? ''; setAguTargetId(next) }} value={aguScope}>
                <option value="bill">Norma/proposta legislativa</option><option value="project">Projeto público</option><option value="ministry">Ministério</option>
              </select>
            </label>
            <label>Item analisado
              <select onChange={(event) => setAguTargetId(event.target.value)} value={aguTargetId}>
                {aguTargets.map((target) => <option key={target.id} value={target.id}>{aguScope === 'bill' ? target.title : target.name}</option>)}
              </select>
            </label>
            <p className="oversight-muted">O parecer orienta juridicamente o Executivo; não controla tribunais ou órgãos de investigação.</p>
            <button className="oversight-button" disabled={!canRequest || !targetIsAvailable} onClick={() => onRequest({ body: 'agu', targetKind: aguScope, targetId: aguTargetId })} type="button">
              Solicitar parecer à AGU
            </button>
          </article>
        </div>
        {!canRequest && <p className="oversight-resource-warning"><TriangleAlert aria-hidden="true" size={14} /> Ação indisponível: faltam pontos de ação ou capacidade administrativa. Caixa não é usado como atalho para influenciar conclusões.</p>}
        <p className="oversight-resource-note">Recursos atuais: {campaign.turn.availableActionPoints} pontos de ação · {Math.round(capacity)} capacidade administrativa.</p>
      </section>

      <section className="oversight-cases-section">
        <div className="oversight-section-heading">
          <div><p className="eyebrow">EXPEDIENTES EM ANDAMENTO</p><h2>Relatos, auditorias e encaminhamentos</h2></div>
          <label className="oversight-filter">Mostrar
            <select onChange={(event) => setFilter(event.target.value as typeof filter)} value={filter}>
              <option value="all">Todos</option><option value="active">Em andamento</option><option value="findings">Com resultado registrado</option>
            </select>
          </label>
        </div>
        {visibleCases.length > 0 ? (
          <div className="oversight-case-list">
            {visibleCases.map((item) => <CaseCard item={item} key={item.id} />)}
          </div>
        ) : <p className="oversight-empty">Não há expedientes nesta categoria. Pedidos de auditoria podem ser encaminhados para objetos existentes; sinais objetivos de risco também podem gerar uma triagem sem pré-julgar a conclusão.</p>}
      </section>

      <section className="oversight-history-section">
        <div className="oversight-section-heading">
          <div><p className="eyebrow">HISTÓRICO GERAL</p><h2>Movimentações institucionais</h2></div>
          <Archive aria-hidden="true" size={18} />
        </div>
        <ol className="oversight-history">
          {oversight.history.slice(0, 18).map((message, index) => <li key={'oversight-global-history-' + index}>{message}</li>)}
        </ol>
      </section>

      <section className="oversight-disclaimer">
        <TriangleAlert aria-hidden="true" size={16} />
        <p><strong>Distinção obrigatória:</strong> relato é uma alegação; suspeita/risco é uma hipótese de triagem; elemento verificado é um registro limitado à fonte; achado administrativo é uma conclusão dessa análise; encaminhamento é uma remessa para decisão autônoma. Nada disso significa automaticamente denúncia formal, culpa criminal ou condenação. CPI e impeachment terão procedimentos próprios na próxima parte desta fase.</p>
      </section>
    </main>
  )
}
