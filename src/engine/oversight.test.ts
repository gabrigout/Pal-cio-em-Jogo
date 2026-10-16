import assert from 'node:assert/strict'
import test from 'node:test'
import type { CampaignState, OversightCase, OversightEvidenceRecord, PartySelection, PublicProjectState } from '../state/types'
import { createCampaign } from './campaign'
import { advanceOversightWeek, requestOversightReview } from './oversight'
import { registerLegislativeProposal } from './legislature'

const party: PartySelection = {
  id: 'oversight-test-party',
  fullName: 'Partido de Teste Institucional',
  acronym: 'PTI',
  description: 'Partido fictício usado nos testes de controle institucional.',
  colors: ['#8bd4af', '#e5a05c'],
  custom: true,
}

function buildCampaign(): CampaignState {
  const initial = createCampaign('left', party, () => 0.5)
  return {
    ...initial,
    id: 'oversight-test-campaign',
    calendar: { month: 'Janeiro', year: 2027, week: 1, weeksPerMonth: 4 },
    country: {
      ...initial.country,
      administrativeCapacity: 70,
      politicalCapital: 70,
      publicIntegrity: 35,
    },
    turn: { ...initial.turn, availableActionPoints: 8 },
  }
}

function atWeek(campaign: CampaignState, month: string, week: number): CampaignState {
  return {
    ...campaign,
    calendar: { month, year: 2027, week, weeksPerMonth: 4 },
  }
}

function auditProject(): PublicProjectState {
  return {
    id: 'audit-project-fixture',
    programId: 'fictional-program',
    name: 'Requalificação de terminal regional (ficcional)',
    sectorId: 'infrastructure',
    sectorName: 'Infraestrutura e transportes',
    ministryId: 'infrastructure',
    ministryName: 'Ministério da Infraestrutura',
    summary: 'Projeto fictício de teste para auditoria de execução.',
    approvedInvestment: 100,
    estimatedBudget: 105,
    budgetSpent: 145,
    baseDurationWeeks: 8,
    durationWeeks: 9,
    weeksElapsed: 6,
    progress: 57,
    priority: 'high',
    status: 'active',
    riskLevel: 'high',
    politicalCapitalInvested: 2,
    administrativeCapacityInvested: 3,
    delayWeeks: 8,
    launchYear: 2027,
    launchMonth: 'Janeiro',
    launchWeek: 1,
    lastMonthlyReviewKey: null,
    completedAt: null,
    outcomesApplied: false,
    completionEffects: {},
    economicEffects: {},
    risks: ['Atraso a reconciliar', 'Diferença de medição a conferir', 'Documentação pendente'],
    history: [
      { dateLabel: 'Janeiro de 2027', type: 'overrun', title: 'Variação de custo', summary: 'Variação de custo a reconciliar.', tone: 'warning' },
      { dateLabel: 'Janeiro de 2027', type: 'delay', title: 'Atraso de cronograma', summary: 'Atraso de cronograma a avaliar.', tone: 'warning' },
    ],
  } as PublicProjectState
}

test('inicializa um relato fictício sem evidência nem conclusão', () => {
  const campaign = buildCampaign()
  assert.equal(campaign.oversight.cases.length, 1)
  const initial = campaign.oversight.cases[0]
  assert.equal(initial.stage, 'received')
  assert.equal(initial.body, 'cgu')
  assert.equal(initial.finding, null)
  assert.equal(initial.evidence.length, 0)
  assert.equal(initial.evidenceStrength, 0)
  assert.match(initial.summary, /ainda não existe documento corroborante/)
})

test('pedido de auditoria consome ação e capacidade, não gasta dinheiro nem escolhe resultado', () => {
  const campaign = buildCampaign()
  const project = auditProject()
  const base = { ...campaign, projects: [project] }
  const cash = base.economy.availableFunds
  const request = requestOversightReview(base, {
    body: 'cgu',
    targetKind: 'project',
    targetId: project.id,
  })
  assert.ok(request)
  if (!request) return
  const item = request.oversight.cases.find((candidate) => candidate.targetId === project.id)
  assert.ok(item)
  if (!item) return
  assert.equal(item.stage, 'received')
  assert.equal(item.finding, null)
  assert.equal(item.evidence.length, 0)
  assert.equal(request.turn.availableActionPoints, base.turn.availableActionPoints - 1)
  assert.equal(request.country.administrativeCapacity, base.country.administrativeCapacity - 1)
  assert.equal(request.economy.availableFunds, cash)
  assert.equal(requestOversightReview(request, { body: 'cgu', targetKind: 'project', targetId: project.id }), null)
})

test('TCU recebe pedido de fiscalização financeira sem comandar a conclusão', () => {
  const campaign = buildCampaign()
  const request = requestOversightReview(campaign, { body: 'tcu', targetKind: 'budget', targetId: null })
  assert.ok(request)
  if (!request) return
  const item = request.oversight.cases.find((candidate) => candidate.body === 'tcu')
  assert.ok(item)
  if (!item) return
  assert.equal(item.type, 'external-audit')
  assert.equal(item.stage, 'received')
  assert.equal(item.finding, null)
  assert.match(item.summary, /não ordena o tribunal/)
})

test('expediente inicial avança semanalmente e triagem não se transforma em culpa', () => {
  let campaign = buildCampaign()
  const first = advanceOversightWeek(campaign, campaign.calendar)
  campaign = first.campaign
  assert.equal(campaign.oversight.cases[0].stage, 'screening')
  const repeated = advanceOversightWeek(campaign, campaign.calendar)
  assert.deepEqual(repeated.events, [])
  assert.equal(repeated.campaign.oversight.cases[0].stage, 'screening')

  campaign = atWeek(campaign, 'Janeiro', 2)
  campaign = advanceOversightWeek(campaign, campaign.calendar).campaign
  assert.equal(campaign.oversight.cases[0].stage, 'evidence')
  assert.ok(campaign.oversight.cases[0].evidence.length > 0)
  assert.equal(campaign.oversight.cases[0].finding, null)
})

test('parecer da AGU é consultivo e não é classificado como investigação criminal', () => {
  let campaign = buildCampaign()
  campaign = registerLegislativeProposal(campaign, {
    type: 'ordinary',
    title: 'Programa nacional de transparência',
    summary: 'Cria diretrizes de transparência e consulta para despesas públicas.',
    fiscalImpact: 0,
  })
  const bill = campaign.legislature.bills[0]
  const request = requestOversightReview(campaign, { body: 'agu', targetKind: 'bill', targetId: bill.id })
  assert.ok(request)
  if (!request) return
  let working = request
  const calendar = [
    ['Janeiro', 1],
    ['Janeiro', 2],
    ['Janeiro', 3],
    ['Janeiro', 4],
    ['Fevereiro', 1],
  ] as const
  for (const [month, week] of calendar) {
    working = atWeek(working, month, week)
    working = advanceOversightWeek(working, working.calendar).campaign
  }
  const opinion = working.oversight.cases.find((item) => item.body === 'agu')
  assert.ok(opinion)
  if (!opinion) return
  assert.equal(opinion.finding, 'legal-opinion-issued')
  assert.equal(opinion.type, 'legal-opinion')
  assert.notEqual(opinion.type, 'federal-investigation')
  assert.equal(opinion.referralTarget, null)
})

test('sinais objetivos de atraso e estouro podem acionar auditoria sem presumir fraude', () => {
  const campaign = { ...buildCampaign(), projects: [auditProject()] }
  const result = advanceOversightWeek(campaign, campaign.calendar)
  const trigger = result.campaign.oversight.cases.find((item) => item.sourceKind === 'automatic-audit-trigger')
  assert.ok(trigger)
  if (!trigger) return
  assert.equal(trigger.stage, 'received')
  assert.equal(trigger.finding, null)
  assert.equal(trigger.evidenceStrength, 0)
  assert.match(trigger.summary, /não é presumido irregular/)
  assert.ok(trigger.suspicionScore >= 62)
})

test('evidência robusta de auditoria gera encaminhamento para o MPF, não culpa automática', () => {
  const project = auditProject()
  const campaign = { ...buildCampaign(), projects: [project] }
  const requested = requestOversightReview(campaign, { body: 'tcu', targetKind: 'project', targetId: project.id })
  assert.ok(requested)
  if (!requested) return
  const item = requested.oversight.cases.find((candidate) => candidate.body === 'tcu' && candidate.targetId === project.id)
  assert.ok(item)
  if (!item) return
  const records: OversightEvidenceRecord[] = Array.from({ length: 8 }, (_, index) => ({
    id: item.id + '-strong-evidence-' + index,
    kind: 'financial-record',
    title: 'Registro financeiro conferido ' + (index + 1),
    description: 'Registro fictício conciliado entre autorização, medição e pagamento. O achado precisa ser avaliado pela autoridade competente.',
    source: 'Dossiê fictício de auditoria',
    strength: 86,
    verified: true,
    dateLabel: 'Janeiro de 2027',
  }))
  const analysisCase: OversightCase = {
    ...item,
    stage: 'analysis',
    stageWeeks: 0,
    suspicionScore: 90,
    evidenceStrength: 86,
    evidence: records,
  }
  const prepared: CampaignState = {
    ...requested,
    oversight: {
      ...requested.oversight,
      cases: requested.oversight.cases.map((candidate) => candidate.id === item.id ? analysisCase : candidate),
    },
  }
  const result = advanceOversightWeek(prepared, prepared.calendar)
  const parent = result.campaign.oversight.cases.find((candidate) => candidate.id === item.id)
  const referral = result.campaign.oversight.cases.find((candidate) => candidate.body === 'mpf' && candidate.linkedCaseId === item.id)
  assert.ok(parent)
  assert.ok(referral)
  if (!parent || !referral) return
  assert.equal(parent.stage, 'referred')
  assert.equal(parent.finding, 'referred-to-mpf')
  assert.equal(parent.referralTarget, 'mpf')
  assert.equal(referral.stage, 'received')
  assert.equal(referral.finding, null)
  assert.match(referral.summary, /não é denúncia formal/)
})
