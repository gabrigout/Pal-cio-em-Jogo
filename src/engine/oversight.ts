import { oversightRules } from '../data/oversight'
import { formatBRLMoney } from '../utils/money'
import type {
  CampaignState,
  MinistryState,
  NewsItem,
  OversightBodyId,
  OversightCase,
  OversightCaseStage,
  OversightCaseType,
  OversightEvidenceKind,
  OversightEvidenceRecord,
  OversightFinding,
  OversightSourceKind,
  OversightState,
  OversightTargetKind,
  PublicProjectState,
} from '../state/types'

export interface OversightRequestInput {
  body: 'cgu' | 'tcu' | 'agu'
  targetKind: OversightTargetKind
  targetId?: string | null
}

interface EvidenceContext {
  records: OversightEvidenceRecord[]
  varianceFound: boolean
  recommendationLikely: boolean
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value))
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10
}

function seededRandom(seedText: string): () => number {
  let seed = 2166136261
  for (const character of seedText) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function formatDate(calendar: CampaignState['calendar']): string {
  return 'Semana ' + calendar.week + ' · ' + calendar.month + ' de ' + calendar.year
}

function weeklyKey(calendar: CampaignState['calendar']): string {
  return calendar.year + '-' + calendar.month + '-' + calendar.week
}

function addHistory(state: OversightState, message: string): OversightState {
  return { ...state, history: [message, ...state.history].slice(0, oversightRules.maximumHistory) }
}

function makeNews(id: string, title: string, summary: string, tone: NewsItem['tone'] = 'neutral'): NewsItem {
  return { id, category: 'CONTROLE INSTITUCIONAL', time: 'SEMANA', title, summary, tone }
}

function makeEvidence(
  caseId: string,
  index: number,
  kind: OversightEvidenceKind,
  title: string,
  description: string,
  source: string,
  strength: number,
  verified: boolean,
  calendar: CampaignState['calendar'],
): OversightEvidenceRecord {
  return {
    id: caseId + '-evidence-' + index,
    kind,
    title,
    description,
    source,
    strength: clamp(Math.round(strength), 0, 100),
    verified,
    dateLabel: formatDate(calendar),
  }
}

function computeEvidenceStrength(records: OversightEvidenceRecord[]): number {
  if (records.length === 0) return 0
  const weighted = records.reduce((sum, record) =>
    sum + record.strength * (record.verified ? 1 : 0.4), 0)
  const verifiedCount = records.filter((record) => record.verified).length
  return clamp(Math.round(weighted / records.length + verifiedCount * 5), 0, 100)
}

function targetProject(campaign: CampaignState, item: OversightCase): PublicProjectState | undefined {
  return item.targetKind === 'project' && item.targetId
    ? campaign.projects.find((project) => project.id === item.targetId)
    : undefined
}

function targetMinistry(campaign: CampaignState, item: OversightCase): MinistryState | undefined {
  return item.targetKind === 'ministry' && item.targetId
    ? campaign.ministries.find((ministry) => ministry.id === item.targetId)
    : undefined
}


function collectEvidence(campaign: CampaignState, item: OversightCase, round: number): EvidenceContext {
  const records: OversightEvidenceRecord[] = []
  let varianceFound = false
  let recommendationLikely = false
  const add = (
    kind: OversightEvidenceKind,
    title: string,
    description: string,
    source: string,
    strength: number,
    verified: boolean,
  ) => {
    if (records.length >= oversightRules.maximumEvidenceRecords) return
    records.push(makeEvidence(item.id, round * 10 + records.length + 1, kind, title, description, source, strength, verified, campaign.calendar))
  }
  if (item.type === 'legal-opinion') {
    const targetBill = item.targetKind === 'bill' && item.targetId
      ? campaign.legislature.bills.find((bill) => bill.id === item.targetId)
      : undefined
    add(
      'legal-document',
      'Objeto da consulta jurídica',
      targetBill
        ? 'A AGU recebeu consulta sobre a norma ' + targetBill.title + ' (' + targetBill.type.toUpperCase()
          + '), com impacto fiscal estimado de ' + formatBRLMoney(targetBill.fiscalImpact)
          + '. A simulação registra análise consultiva, não um julgamento vinculante.'
        : 'A AGU recebeu pedido de avaliação consultiva sobre ' + item.targetName
          + '. O parecer não substitui a decisão administrativa competente nem vincula órgãos independentes.',
      'Pedido consultivo ' + item.id,
      42,
      true,
    )
    return { records, varianceFound: false, recommendationLikely: false }
  }

  const project = targetProject(campaign, item)
  if (project) {
    const spentRatio = project.approvedInvestment > 0 ? project.budgetSpent / project.approvedInvestment : 0
    add(
      'financial-record',
      'Registro de execução do projeto',
      'Execução registrada: gasto de ' + formatBRLMoney(project.budgetSpent)
        + ', investimento autorizado de ' + formatBRLMoney(project.approvedInvestment)
        + ', progresso de ' + Math.round(project.progress) + '% e atraso registrado de ' + project.delayWeeks + ' semanas. O registro descreve a execução e não prova ilícito.',
      'Estado do projeto ' + project.id,
      24 + Math.min(35, Math.abs(spentRatio - 1) * 90) + Math.min(18, project.delayWeeks * 4),
      true,
    )
    if (spentRatio > 1.1 || project.budgetSpent > project.estimatedBudget * 1.12) {
      varianceFound = true
      recommendationLikely = true
      add(
        'audit-trail',
        'Diferença entre autorização e execução',
        'A execução financeira ultrapassa a margem de acompanhamento configurada. É necessário reconciliar medição, pagamentos e alterações autorizadas antes de qualquer conclusão.',
        'Comparação de orçamento e execução do projeto',
        36 + Math.min(25, (spentRatio - 1) * 100),
        true,
      )
    }
    if (project.delayWeeks >= 3) {
      varianceFound = true
      recommendationLikely = true
      add(
        'project-document',
        'Histórico de atraso',
        'O cronograma registra ' + project.delayWeeks + ' semanas de atraso. Atraso pode decorrer de fatores administrativos ou externos e não demonstra, por si só, fraude ou dolo.',
        'Cronograma e histórico do projeto',
        25 + Math.min(30, project.delayWeeks * 3),
        true,
      )
    }
    if (project.risks.length > 0) {
      varianceFound = true
      recommendationLikely = true
      add(
        'contradictory-record',
        'Riscos de execução registrados',
        project.risks.slice(0, 3).join(' · ') + '. São sinais que precisam ser conferidos contra documentos e explicações dos responsáveis.',
        'Registro de riscos do projeto',
        22 + Math.min(26, project.risks.length * 5),
        false,
      )
    }
    if (!varianceFound) {
      add(
        'project-document',
        'Registros básicos consistentes',
        'Nesta amostra, investimento, gasto, progresso e cronograma não apresentam divergência material pelos limites desta simulação. Isso não equivale a uma certificação absoluta de legalidade.',
        'Conciliação preliminar de projeto',
        36,
        true,
      )
    }
  }

  const ministry = targetMinistry(campaign, item)
  if (ministry) {
    add(
      'financial-record',
      'Registros administrativos do ministério',
      ministry.name + ': dotação anual de ' + formatBRLMoney(ministry.annualBudget)
        + ', execução mensal registrada de ' + formatBRLMoney(ministry.budgetExecuted)
        + ', desempenho administrativo ' + Math.round(ministry.administrativePerformance) + '/100.',
      'Painel administrativo do ministério ' + ministry.id,
      28 + (ministry.risks.length > 0 ? 12 : 0) + (ministry.alerts.length > 0 ? 8 : 0),
      true,
    )
    if (ministry.risks.length > 0 || ministry.alerts.length > 0) {
      varianceFound = true
      recommendationLikely = true
      const notes = [...ministry.risks, ...ministry.alerts].slice(0, 4).join(' · ')
      add('audit-trail', 'Pendências e alertas registrados', notes, 'Histórico administrativo do ministério', 31, false)
    } else if (ministry.administrativePerformance < 40) {
      varianceFound = true
      recommendationLikely = true
      add('public-data', 'Desempenho administrativo abaixo da faixa configurada', 'O indicador de desempenho sugere necessidade de revisão de controles e execução; ele não representa evidência de crime.', 'Indicador administrativo interno', 25, true)
    } else {
      add('public-data', 'Sem alerta material nos dados consultados', 'A amostra consultada não apresenta alerta material além dos indicadores rotineiros. A conclusão se limita aos dados disponíveis.', 'Indicadores administrativos do ministério', 33, true)
    }
  }

  if (item.targetKind === 'budget') {
    const economy = campaign.economy
    const revenue = economy.indicators.publicRevenue
    const fiscalPressure = revenue > 0 ? Math.max(0, -economy.indicators.fiscalBalance / revenue) : 0
    add(
      'financial-record',
      'Relatório fiscal mensal',
      'Receita ' + formatBRLMoney(revenue) + ', despesa ' + formatBRLMoney(economy.indicators.publicExpenses)
        + ', saldo ' + formatBRLMoney(economy.indicators.fiscalBalance)
        + ', pagamentos adiados ' + formatBRLMoney(economy.deferredPayments) + '. Um déficit não é automaticamente irregularidade.',
      'Painel econômico e relatório mensal',
      30 + Math.min(30, fiscalPressure * 75) + (economy.deferredPayments > 0 ? 10 : 0),
      true,
    )
    if (economy.deferredPayments > 0 || fiscalPressure >= 0.15) {
      varianceFound = true
      recommendationLikely = true
      add('audit-trail', 'Sinal de atenção fiscal', 'Os parâmetros de monitoramento detectaram compromissos adiados ou pressão de déficit acima da faixa configurada. É necessário avaliar autorização, classificação e fluxo financeiro.', 'Conciliação de receita, saldo e pagamentos', 38, true)
    } else {
      add('public-data', 'Sem desvio fiscal material nesta amostra', 'O recorte fiscal consultado está dentro da faixa configurada para este alerta. Isso não constitui aprovação integral das contas.', 'Conciliação fiscal preliminar', 33, true)
    }
  }

  if (item.targetKind === 'bill' && item.targetId) {
    const bill = campaign.legislature.bills.find((candidate) => candidate.id === item.targetId)
    if (bill) {
      const voteCount = bill.voteHistory.length
      add(
        'legal-document',
        'Tramitação e efeito fiscal da norma',
        bill.title + ' (' + bill.type.toUpperCase() + ') foi registrada com impacto estimado de '
          + formatBRLMoney(bill.fiscalImpact) + ' e ' + voteCount + ' votação(ões). A ficha é material para revisão, não presunção de invalidade.',
        'Proposição legislativa ' + bill.id,
        28 + Math.min(22, Math.abs(bill.fiscalImpact) / 10) + Math.min(12, voteCount * 3),
        true,
      )
      if (bill.type === 'mp' || bill.type === 'credit' || Math.abs(bill.fiscalImpact) >= 80) {
        varianceFound = true
        recommendationLikely = true
        add('legal-document', 'Revisão de impacto ou procedimento', 'O instrumento ou seu impacto merece revisão especializada por parâmetros de monitoramento. Só a instância competente pode avaliar validade ou responsabilidade.', 'Registro legislativo configurado', 35, true)
      }
    }
  }

  if (item.targetKind === 'general' || records.length === 0) {
    add(
      'public-data',
      'Relato inicial sem documento corroborante',
      'O relato fictício foi recebido, mas nenhum documento ou depoimento independente foi anexado até o momento. A abertura do expediente não prova irregularidade.',
      'Representação fictícia recebida pelo órgão',
      8,
      false,
    )
  }

  return { records, varianceFound, recommendationLikely }
}

function caseTypeForRequest(body: OversightRequestInput['body']): OversightCaseType {
  return body === 'cgu' ? 'internal-audit' : body === 'tcu' ? 'external-audit' : 'legal-opinion'
}

function sourceLabel(sourceKind: OversightSourceKind): string {
  const labels: Record<OversightSourceKind, string> = {
    'citizen-report': 'representação cidadã',
    'executive-request': 'pedido formal de análise',
    'automatic-audit-trigger': 'gatilho de risco objetivo',
    'legislative-referral': 'encaminhamento legislativo',
    'judicial-referral': 'encaminhamento judicial',
    'institutional-referral': 'remessa institucional',
  }
  return labels[sourceKind]
}

function targetNameForRequest(campaign: CampaignState, kind: OversightTargetKind, targetId: string | null): string | null {
  if (kind === 'project') return campaign.projects.find((item) => item.id === targetId)?.name ?? null
  if (kind === 'ministry') return campaign.ministries.find((item) => item.id === targetId)?.name ?? null
  if (kind === 'bill') return campaign.legislature.bills.find((item) => item.id === targetId)?.title ?? null
  if (kind === 'budget') return 'Execução orçamentária federal'
  return 'Relato geral'
}

function makeCase(
  campaign: Pick<CampaignState, 'calendar'>,
  input: {
    id: string
    body: OversightBodyId
    type: OversightCaseType
    targetKind: OversightTargetKind
    targetId: string | null
    targetName: string
    title: string
    summary: string
    sourceKind: OversightSourceKind
    sourceKey: string | null
    suspicionScore: number
    publicImpact: number
    severity: OversightCase['severity']
    linkedCaseId?: string | null
  },
): OversightCase {
  return {
    id: input.id,
    type: input.type,
    body: input.body,
    title: input.title,
    summary: input.summary,
    targetKind: input.targetKind,
    targetId: input.targetId,
    targetName: input.targetName,
    origin: sourceLabel(input.sourceKind) + ' em ' + formatDate(campaign.calendar) + '.',
    sourceKind: input.sourceKind,
    sourceKey: input.sourceKey,
    createdYear: campaign.calendar.year,
    createdMonth: campaign.calendar.month,
    createdWeek: campaign.calendar.week,
    stage: 'received',
    stageWeeks: 0,
    daysInProcess: 0,
    suspicionScore: clamp(Math.round(input.suspicionScore), 0, 100),
    evidenceStrength: 0,
    publicImpact: clamp(Math.round(input.publicImpact), 0, 100),
    severity: input.severity,
    evidence: [],
    finding: null,
    referralTarget: null,
    linkedCaseId: input.linkedCaseId ?? null,
    closureReason: null,
    history: [
      formatDate(campaign.calendar) + ': expediente recebido por ' + input.body.toUpperCase()
        + '. A recepção inicia uma análise e não estabelece irregularidade ou culpa.',
    ],
  }
}

export function createInitialOversightState(campaign: Pick<CampaignState, 'id' | 'calendar'>): OversightState {
  const initial = makeCase({
    ...campaign,
    calendar: { ...campaign.calendar, week: 1 },
  }, {
    id: campaign.id + '-oversight-initial-report',
    body: 'cgu',
    type: 'internal-audit',
    targetKind: 'general',
    targetId: null,
    targetName: 'Repasse federal fictício',
    title: 'Representação sobre critérios de um repasse federal',
    summary: 'Um relato fictício pede esclarecimento sobre os critérios usados em um repasse federal. O expediente foi recebido para triagem; ainda não existe documento corroborante nem conclusão sobre irregularidade.',
    sourceKind: 'citizen-report',
    sourceKey: 'opening-citizen-report',
    suspicionScore: 22,
    publicImpact: 38,
    severity: 'routine',
  })
  return {
    cases: [initial],
    history: [
      'O sistema separa relato, indício, evidência, apontamento administrativo e encaminhamento a outro órgão. Nenhuma dessas etapas equivale automaticamente a culpa ou condenação.',
      'CGU e TCU têm competências diferentes; MPF/PGR, PF, AGU e Justiça Eleitoral não são controlados pelo presidente.',
    ],
    processedSourceKeys: ['opening-citizen-report'],
    lastAdvancedKey: null,
  }
}

function appendCaseHistory(item: OversightCase, message: string): OversightCase {
  return { ...item, history: [message, ...item.history].slice(0, 16) }
}

function canRequest(campaign: CampaignState, input: OversightRequestInput, targetName: string | null): boolean {
  if (!targetName || campaign.turn.availableActionPoints < oversightRules.requestActionPoints
    || campaign.country.administrativeCapacity < oversightRules.requestAdministrativeCapacity) return false
  if (input.body === 'cgu') return input.targetKind === 'project' || input.targetKind === 'ministry'
  if (input.body === 'tcu') return input.targetKind === 'project' || input.targetKind === 'budget'
  return input.body === 'agu' && (input.targetKind === 'project' || input.targetKind === 'ministry' || input.targetKind === 'bill')
}

export function requestOversightReview(campaign: CampaignState, input: OversightRequestInput): CampaignState | null {
  const targetId = input.targetId ?? null
  const targetName = targetNameForRequest(campaign, input.targetKind, targetId)
  if (!canRequest(campaign, input, targetName)) return null
  const body = input.body as OversightBodyId
  const existing = campaign.oversight.cases.find((item) =>
    item.body === body && item.targetKind === input.targetKind && item.targetId === targetId
      && !['archived', 'referred'].includes(item.stage))
  if (existing) return null

  const type = caseTypeForRequest(input.body)
  const id = campaign.id + '-oversight-request-' + campaign.calendar.year + '-' + campaign.calendar.month.toLowerCase()
    + '-' + campaign.calendar.week + '-' + (campaign.oversight.cases.length + 1)
  const targetKind = input.targetKind
  const caseTitle = type === 'internal-audit'
    ? 'Pedido de auditoria interna: ' + targetName
    : type === 'external-audit'
      ? 'Pedido de fiscalização: ' + targetName
      : 'Pedido de parecer jurídico: ' + targetName
  const summary = type === 'legal-opinion'
    ? 'A Presidência solicita análise consultiva da AGU sobre riscos jurídicos e opções legais. O parecer não vincula a decisão de órgãos independentes nem garante resultado judicial.'
    : type === 'internal-audit'
      ? 'Pedido formal de auditoria interna sobre dados e procedimentos de ' + targetName + '. A CGU decide a abordagem e as conclusões segundo sua competência; o Executivo não escolhe o resultado.'
      : 'Pedido de fiscalização sobre ' + targetName + ' encaminhado ao TCU. O pedido não ordena o tribunal nem antecipa decisão sobre contas ou responsabilidade.'
  const created = makeCase(campaign, {
    id,
    body,
    type,
    targetKind,
    targetId,
    targetName,
    title: caseTitle,
    summary,
    sourceKind: 'executive-request',
    sourceKey: 'executive-request:' + body + ':' + targetKind + ':' + (targetId ?? 'general') + ':' + campaign.calendar.year + ':' + campaign.calendar.month + ':' + campaign.calendar.week,
    suspicionScore: 18,
    publicImpact: 25,
    severity: 'routine',
  })
  const historyMessage = formatDate(campaign.calendar) + ': o Executivo encaminhou um pedido formal a ' + body.toUpperCase()
    + '. O pedido não determina o mérito nem força uma conclusão.'
  return {
    ...campaign,
    oversight: {
      ...campaign.oversight,
      cases: [created, ...campaign.oversight.cases].slice(0, oversightRules.maximumCases),
      history: [historyMessage, ...campaign.oversight.history].slice(0, oversightRules.maximumHistory),
    },
    country: {
      ...campaign.country,
      administrativeCapacity: Math.max(0, campaign.country.administrativeCapacity - oversightRules.requestAdministrativeCapacity),
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - oversightRules.requestActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, 'Encaminhar pedido de controle: ' + targetName],
    },
    news: [...campaign.news, makeNews(
      id + '-news',
      'Pedido de controle protocolado',
      historyMessage,
    )].slice(-8),
  }
}

function chooseFinding(campaign: CampaignState, item: OversightCase, context: EvidenceContext): OversightFinding {
  if (item.type === 'legal-opinion') return 'legal-opinion-issued'
  const score = computeEvidenceStrength(context.records)
  if (item.body === 'mpf' && score >= oversightRules.minimumSourceEvidenceForReferral && item.suspicionScore >= 52) {
    return 'referred-to-pf'
  }
  if ((item.body === 'cgu' || item.body === 'tcu')
    && score >= oversightRules.minimumSourceEvidenceForReferral
    && context.varianceFound
    && item.suspicionScore >= 42) return 'referred-to-mpf'
  if (score >= oversightRules.administrativeFindingThreshold && context.varianceFound) {
    if (item.body === 'tcu' && item.targetKind === 'budget') return 'accounting-adjustment'
    return 'administrative-recommendation'
  }
  if (score >= 30 && !context.varianceFound) return 'no-irregularity-found'
  return 'inconclusive'
}

function targetSuspicion(
  campaign: CampaignState,
  project: PublicProjectState,
): { score: number; impact: number; severity: OversightCase['severity']; reason: string } {
  const overrun = project.approvedInvestment > 0
    ? Math.max(0, (project.budgetSpent / project.approvedInvestment - 1) * 100)
    : 0
  let score = project.riskLevel === 'high' ? 22 : project.riskLevel === 'medium' ? 10 : 0
  score += project.delayWeeks >= 3 ? Math.min(28, project.delayWeeks * 4) : 0
  score += overrun >= 10 ? Math.min(30, overrun) : 0
  score += project.risks.length > 0 ? Math.min(20, project.risks.length * 5) : 0
  score += campaign.country.publicIntegrity < 45 ? 12 : 0
  const normalized = clamp(Math.round(score), 0, 100)
  return {
    score: normalized,
    impact: clamp(Math.round(28 + project.approvedInvestment / 40 + project.delayWeeks * 3), 20, 90),
    severity: normalized >= 78 ? 'critical' : normalized >= 65 ? 'important' : 'routine',
    reason: 'Os sinais objetivos de risco atingiram a faixa configurada após observar execução, atraso e/ou registros de risco. O gatilho inicia uma auditoria, não uma conclusão de irregularidade.',
  }
}

function detectAutomaticAuditRequests(campaign: CampaignState): { state: OversightState; cases: OversightCase[] } {
  let state = campaign.oversight
  const added: OversightCase[] = []
  const sources = new Set(state.processedSourceKeys)
  for (const project of campaign.projects) {
    const sourceKey = 'project-risk:' + project.id
    if (sources.has(sourceKey) || project.weeksElapsed < 3 || project.status === 'paused' || project.status === 'cancelled') continue
    const risk = targetSuspicion(campaign, project)
    if (risk.score < oversightRules.automaticTriggerThreshold) continue
    const body: OversightBodyId = project.budgetSpent > project.approvedInvestment * 1.1 ? 'tcu' : 'cgu'
    const item = makeCase(campaign, {
      id: campaign.id + '-oversight-project-' + project.id,
      body,
      type: body === 'tcu' ? 'external-audit' : 'internal-audit',
      targetKind: 'project',
      targetId: project.id,
      targetName: project.name,
      title: 'Auditoria independente sobre a execução de ' + project.name,
      summary: risk.reason + ' O projeto não é presumido irregular e os responsáveis não são considerados culpados.',
      sourceKind: 'automatic-audit-trigger',
      sourceKey,
      suspicionScore: risk.score,
      publicImpact: risk.impact,
      severity: risk.severity,
    })
    added.push(item)
    sources.add(sourceKey)
    state = addHistory(state, formatDate(campaign.calendar) + ': ' + body.toUpperCase()
      + ' recebeu um sinal objetivo para análise de ' + project.name + '; nenhum achado foi antecipado.')
  }
  return { state: { ...state, processedSourceKeys: [...sources].slice(-500) }, cases: added }
}

function createReferralCase(
  campaign: CampaignState,
  original: OversightCase,
  body: 'mpf' | 'pf',
): OversightCase {
  const isMpf = body === 'mpf'
  const id = campaign.id + '-oversight-referral-' + original.id + '-' + body
  return {
    ...makeCase(campaign, {
      id,
      body,
      type: isMpf ? 'prosecutorial-review' : 'federal-investigation',
      targetKind: original.targetKind,
      targetId: original.targetId,
      targetName: original.targetName,
      title: (isMpf ? 'Análise autônoma do MPF: ' : 'Apuração federal pela PF: ') + original.targetName,
      summary: isMpf
        ? 'O órgão remetente encaminhou elementos para avaliação autônoma do Ministério Público Federal. A remessa não é denúncia formal nem conclusão de culpa.'
        : 'A matéria foi encaminhada para apuração própria da Polícia Federal, dentro de sua competência. O encaminhamento não constitui indiciamento ou condenação.',
      sourceKind: 'institutional-referral',
      sourceKey: 'referral:' + original.id + ':' + body,
      suspicionScore: original.suspicionScore,
      publicImpact: original.publicImpact,
      severity: original.severity,
      linkedCaseId: original.id,
    }),
    evidence: original.evidence.map((record, index) => ({
      ...record,
      id: id + '-evidence-' + (index + 1),
      title: 'Elemento recebido: ' + record.title,
      description: record.description + ' Receber este elemento não significa que o novo órgão o considere comprovado ou suficiente.',
    })),
    evidenceStrength: original.evidenceStrength,
    history: [
      formatDate(campaign.calendar) + ': expediente recebido por encaminhamento institucional; a autoridade destinatária fará análise própria.',
    ],
  }
}

function applyFinding(
  campaign: CampaignState,
  current: OversightCase,
): { campaign: CampaignState; item: OversightCase; event: string } {
  const context = collectEvidence(campaign, current, 2)
  const evidence = [...current.evidence, ...context.records]
    .filter((record, index, all) => all.findIndex((candidate) => candidate.id === record.id) === index)
    .slice(0, oversightRules.maximumEvidenceRecords)
  const evidenceStrength = computeEvidenceStrength(evidence)
  const withEvidence = { ...current, evidence, evidenceStrength }
  const finding = chooseFinding(campaign, withEvidence, { ...context, records: evidence })
  const referralBody = finding === 'referred-to-mpf' ? 'mpf'
    : finding === 'referred-to-pf' ? 'pf' : null
  const stage: OversightCaseStage = referralBody ? 'referred' : 'finding'
  const reason = 'Análise concluída por ' + current.body.toUpperCase() + ': ' + finding
    + '. Força dos elementos registrada: ' + evidenceStrength + '/100; nenhum resultado equivale automaticamente a culpa criminal.'
  const nextCase = appendCaseHistory({
    ...withEvidence,
    stage,
    stageWeeks: 0,
    finding,
    referralTarget: referralBody,
    closureReason: referralBody ? null : finding === 'inconclusive'
      ? 'Elementos insuficientes para concluir; registro mantido no histórico.'
      : null,
  }, reason)
  let working: CampaignState = {
    ...campaign,
    oversight: {
      ...campaign.oversight,
      cases: campaign.oversight.cases.map((item) => item.id === nextCase.id ? nextCase : item),
      history: [reason, ...campaign.oversight.history].slice(0, oversightRules.maximumHistory),
    },
  }
  let finalCase = nextCase
  if (referralBody) {
    const referralKey = 'referral:' + current.id + ':' + referralBody
    if (!working.oversight.processedSourceKeys.includes(referralKey)) {
      const child = createReferralCase(working, nextCase, referralBody)
      finalCase = { ...nextCase, linkedCaseId: child.id }
      working = {
        ...working,
        oversight: {
          ...working.oversight,
          cases: [child, ...working.oversight.cases.map((item) => item.id === finalCase.id ? finalCase : item)]
            .slice(0, oversightRules.maximumCases),
          processedSourceKeys: [...working.oversight.processedSourceKeys, referralKey].slice(-500),
          history: [reason, ...working.oversight.history].slice(0, oversightRules.maximumHistory),
        },
        news: [...working.news, makeNews(
          child.id + '-news',
          'Expediente encaminhado para análise independente',
          child.summary,
          'warning',
        )].slice(-8),
      }
    }
  }
  const event = current.targetName + ': ' + reason
  working = {
    ...working,
    news: [...working.news, makeNews(
      finalCase.id + '-finding-news',
      'Atualização de controle institucional',
      event,
      finding === 'administrative-recommendation' || finding === 'accounting-adjustment'
        || finding === 'referred-to-mpf' || finding === 'referred-to-pf'
        ? 'warning' : 'neutral',
    )].slice(-8),
  }
  return { campaign: working, item: finalCase, event }
}

function progressCase(
  campaign: CampaignState,
  original: OversightCase,
): { campaign: CampaignState; item: OversightCase; event: string | null } {
  if (['archived', 'referred'].includes(original.stage)) return { campaign, item: original, event: null }
  const item: OversightCase = {
    ...original,
    stageWeeks: original.stageWeeks + 1,
    daysInProcess: original.daysInProcess + oversightRules.weeklyDays,
  }
  const stamp = formatDate(campaign.calendar)
  if (item.stage === 'received' && item.stageWeeks >= oversightRules.stageWeeks.received) {
    const next = appendCaseHistory({ ...item, stage: 'screening', stageWeeks: 0 },
      stamp + ': triagem inicial verifica competência, objeto e se há elementos mínimos para prosseguir.')
    return { campaign, item: next, event: next.history[0] }
  }
  if (item.stage === 'screening' && item.stageWeeks >= oversightRules.stageWeeks.screening) {
    const context = collectEvidence(campaign, item, 1)
    const evidence = [...item.evidence, ...context.records].slice(0, oversightRules.maximumEvidenceRecords)
    const evidenceStrength = computeEvidenceStrength(evidence)
    const next = appendCaseHistory({ ...item, stage: 'evidence', stageWeeks: 0, evidence, evidenceStrength },
      stamp + ': a análise passou à coleta e verificação de elementos. Até este ponto, o status é de apuração, não de culpa.')
    return { campaign, item: next, event: next.history[0] }
  }
  if (item.stage === 'evidence' && item.stageWeeks >= oversightRules.stageWeeks.evidence) {
    const context = collectEvidence(campaign, item, 2)
    const evidence = [...item.evidence, ...context.records]
      .filter((record, index, all) => all.findIndex((candidate) => candidate.id === record.id) === index)
      .slice(0, oversightRules.maximumEvidenceRecords)
    const evidenceStrength = computeEvidenceStrength(evidence)
    const next = appendCaseHistory({ ...item, stage: 'analysis', stageWeeks: 0, evidence, evidenceStrength },
      stamp + ': coleta preliminar encerrada e elementos registrados para análise independente.')
    return { campaign, item: next, event: next.history[0] }
  }
  if (item.stage === 'analysis' && item.stageWeeks >= oversightRules.stageWeeks.analysis) {
    const applied = applyFinding(campaign, item)
    return { campaign: applied.campaign, item: applied.item, event: applied.event }
  }
  if (item.stage === 'finding') {
    const next = appendCaseHistory({
      ...item,
      stage: 'archived',
      stageWeeks: 0,
      closureReason: item.closureReason ?? 'Relatório desta etapa concluído; permanecem possíveis revisões ou providências dentro das competências cabíveis.',
    }, stamp + ': etapa de relatório arquivada no histórico; resultados e limites permanecem visíveis.')
    return { campaign, item: next, event: next.history[0] }
  }
  return { campaign, item, event: null }
}

export function advanceOversightWeek(
  campaign: CampaignState,
  endingCalendar: CampaignState['calendar'] = campaign.calendar,
): { campaign: CampaignState; events: string[] } {
  const key = weeklyKey(endingCalendar)
  if (campaign.oversight.lastAdvancedKey === key) return { campaign, events: [] }
  let working: CampaignState = {
    ...campaign,
    oversight: { ...campaign.oversight, lastAdvancedKey: key },
  }
  const originalCases = [...campaign.oversight.cases]
  const updatedCases = new Map<string, OversightCase>()
  const events: string[] = []
  for (const original of originalCases) {
    const result = progressCase(working, original)
    working = result.campaign
    updatedCases.set(original.id, result.item)
    if (result.event) events.push(result.event)
  }
  const triggers = detectAutomaticAuditRequests(working)
  const mergedCases = triggers.cases
    .map((item) => item)
    .concat([...updatedCases.values()].filter((item) => !triggers.cases.some((added) => added.id === item.id)))
  const withNewAuditCases: CampaignState = {
    ...working,
    oversight: {
      ...triggers.state,
      cases: [...mergedCases, ...triggers.state.cases.filter((item) => !updatedCases.has(item.id) && !triggers.cases.some((added) => added.id === item.id))]
        .slice(0, oversightRules.maximumCases),
      lastAdvancedKey: key,
    },
  }
  for (const item of triggers.cases) {
    events.push(item.history[0])
    withNewAuditCases.news.push(makeNews(
      item.id + '-trigger-news',
      'Sinal objetivo encaminhado para auditoria',
      item.summary,
    ))
  }
  const campaignWithNews = {
    ...withNewAuditCases,
    news: withNewAuditCases.news.slice(-8),
  }
  return { campaign: campaignWithNews, events }
}
