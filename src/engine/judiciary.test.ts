import assert from 'node:assert/strict'
import test from 'node:test'
import type { CampaignState, JudicialCase, JudicialNomination } from '../state/types'
import { createInitialJudiciaryState, isEligibleJudicialCandidate, nominateJudicialCandidate, formalizeJudicialAppointment, evaluateJudicialCase, advanceJudiciaryWeek, closeJudiciaryMonth, appealJudicialCase, complyWithJudicialDecision } from './judiciary'
import { createCampaign } from './campaign'
import type { PartySelection } from '../state/types'
import { judicialRules } from '../data/judiciary'

const party: PartySelection = {
  id: 'judiciary-test-party',
  fullName: 'Partido de Teste Institucional',
  acronym: 'PTI',
  description: 'Partido fictício usado nos testes do Judiciário.',
  colors: ['#8bd4af', '#e5a05c'],
  custom: true,
}

function buildCampaign(): CampaignState {
  const initial = createCampaign('left', party, () => 0.5)
  const campaignId = 'judiciary-test-campaign'
  const base = {
    ...initial,
    id: campaignId,
    calendar: { month: 'Janeiro', year: 2027, week: 1, weeksPerMonth: 4 },
    country: {
      ...initial.country,
      presidentialApproval: 90,
      congressSupport: 90,
      judiciaryRelation: 5,
      politicalCapital: 65,
      publicTrust: 52,
    },
    turn: { ...initial.turn, availableActionPoints: 8 },
  }
  return { ...base, judiciary: createInitialJudiciaryState(base) }
}

function getOpeningCase(campaign: CampaignState): JudicialCase {
  const judicialCase = campaign.judiciary.cases[0]
  assert.ok(judicialCase)
  return judicialCase
}

function atWeek(campaign: CampaignState, month: string, week: number): CampaignState {
  return { ...campaign, calendar: { month, year: 2027, week, weeksPerMonth: 4 } }
}

test('nova campanha inicializa composição fictícia do STF, vaga e processo', () => {
  const first = buildCampaign()
  const second = buildCampaign()
  assert.equal(first.judiciary.stfJustices.length, 10)
  assert.equal(first.judiciary.vacancies.length, 1)
  assert.equal(first.judiciary.vacancies[0].seatNumber, 11)
  assert.equal(first.judiciary.vacancies[0].candidates.length, 3)
  assert.equal(first.judiciary.cases.length, 1)
  assert.equal(first.judiciary.cases[0].stage, 'evidence')
  assert.equal(first.judiciary.cases[0].court, 'trf')
  assert.deepEqual(first.judiciary, second.judiciary)
  assert.ok(first.judiciary.stfJustices.every((justice) => !/Moraes|Barroso|Fachin|Gilmar|Toffoli/i.test(justice.name)))
})

test('critérios de elegibilidade para indicação ao STF usam idade, conhecimento e reputação', () => {
  const candidate = buildCampaign().judiciary.vacancies[0].candidates[0]
  assert.equal(isEligibleJudicialCandidate(candidate), true)
  assert.equal(isEligibleJudicialCandidate({ ...candidate, age: 35 }), false)
  assert.equal(isEligibleJudicialCandidate({ ...candidate, age: 70 }), false)
  assert.equal(isEligibleJudicialCandidate({ ...candidate, legalKnowledge: judicialRules.minimumLegalKnowledge - 1 }), false)
  assert.equal(isEligibleJudicialCandidate({ ...candidate, publicReputation: judicialRules.minimumReputation - 1 }), false)
})

test('indicação presidencial não nomeia diretamente e consome recursos configurados', () => {
  const campaign = buildCampaign()
  const vacancy = campaign.judiciary.vacancies[0]
  const candidate = vacancy.candidates[0]
  const nominated = nominateJudicialCandidate(campaign, vacancy.id, candidate.id)
  assert.ok(nominated)
  if (!nominated) return
  assert.equal(nominated.judiciary.nominations.length, 1)
  assert.equal(nominated.judiciary.nominations[0].status, 'awaiting-senate')
  assert.equal(nominated.judiciary.stfJustices.length, 10)
  assert.equal(nominated.turn.availableActionPoints, campaign.turn.availableActionPoints - judicialRules.nominationActionPoints)
  assert.equal(nominated.country.politicalCapital, campaign.country.politicalCapital - judicialRules.nominationPoliticalCapital)
  assert.equal(nominateJudicialCandidate(nominated, vacancy.id, vacancy.candidates[1].id), null)
  assert.equal(formalizeJudicialAppointment(nominated, nominated.judiciary.nominations[0].id), null)
})

test('votação de indicação é registrada por maioria absoluta do Senado', () => {
  const campaign = buildCampaign()
  const vacancy = campaign.judiciary.vacancies[0]
  const nominated = nominateJudicialCandidate(campaign, vacancy.id, vacancy.candidates[0].id)
  assert.ok(nominated)
  if (!nominated) return
  const nextWeek = atWeek(nominated, 'Janeiro', 2)
  const result = advanceJudiciaryWeek(nextWeek, nextWeek.calendar)
  const nomination = result.campaign.judiciary.nominations[0]
  assert.ok(nomination.vote)
  if (!nomination.vote) return
  assert.equal(nomination.vote.totalSeats, 81)
  assert.equal(nomination.vote.requiredYes, 41)
  assert.equal(nomination.vote.yes + nomination.vote.no + nomination.vote.abstain, nomination.vote.present)
  assert.equal(nomination.vote.present + nomination.vote.absent, 81)
  assert.equal(nomination.status, nomination.vote.approved ? 'approved' : 'rejected')
})

test('nomeação formal só acontece após aprovação pelo Senado e preenche a vaga exata', () => {
  const campaign = buildCampaign()
  const vacancy = campaign.judiciary.vacancies[0]
  const candidate = vacancy.candidates[0]
  const nominated = nominateJudicialCandidate(campaign, vacancy.id, candidate.id)
  assert.ok(nominated)
  if (!nominated) return
  const original = nominated.judiciary.nominations[0]
  const approved: JudicialNomination = {
    ...original,
    status: 'approved',
    vote: {
      id: original.id + '-test-vote',
      yes: 52,
      no: 20,
      abstain: 3,
      absent: 6,
      present: 75,
      totalSeats: 81,
      requiredYes: 41,
      approved: true,
      dateLabel: 'Janeiro de 2027, semana 2',
      note: 'Teste: maioria absoluta atingida.',
    },
  }
  const awaitingFormalAppointment: CampaignState = {
    ...nominated,
    judiciary: {
      ...nominated.judiciary,
      nominations: [approved],
    },
  }
  const appointed = formalizeJudicialAppointment(awaitingFormalAppointment, approved.id)
  assert.ok(appointed)
  if (!appointed) return
  assert.equal(appointed.judiciary.stfJustices.length, 11)
  assert.equal(appointed.judiciary.stfJustices.find((justice) => justice.id === candidate.id + '-appointed')?.seatNumber, vacancy.seatNumber)
  assert.equal(appointed.judiciary.vacancies.some((item) => item.id === vacancy.id), false)
  assert.equal(appointed.judiciary.nominations[0].status, 'appointed')
  assert.equal(formalizeJudicialAppointment(appointed, approved.id), null)
})

test('mérito judicial não muda ao variar aprovação presidencial ou relação política com o Judiciário', () => {
  const campaign = buildCampaign()
  const judicialCase = getOpeningCase(campaign)
  const baseline = evaluateJudicialCase(campaign, judicialCase)
  const alteredPolitics = {
    ...campaign,
    country: {
      ...campaign.country,
      presidentialApproval: 0,
      judiciaryRelation: 100,
      congressSupport: 0,
      politicalCapital: 0,
      polarization: 100,
    },
  }
  const comparison = evaluateJudicialCase(alteredPolitics, judicialCase)
  assert.deepEqual(comparison, baseline)
  assert.ok(comparison.rationale.length > 10)
})

test('processo percorre admissibilidade, instrução e decisão com fundamento registrado', () => {
  const campaign = buildCampaign()
  const opening = getOpeningCase(campaign)
  const caseUnderTest: JudicialCase = {
    ...opening,
    id: 'timeline-case',
    stage: 'filed',
    stageWeeks: 0,
    daysInProcess: 0,
    proceduralRegularity: 80,
    history: ['Processo criado para teste de tramitação.'],
    decisions: [],
    outcome: null,
  }
  let working: CampaignState = {
    ...campaign,
    judiciary: { ...campaign.judiciary, cases: [caseUnderTest] },
  }
  const expectedStages = [
    ['Janeiro', 1, 'admissibility'],
    ['Janeiro', 2, 'evidence'],
    ['Janeiro', 3, 'evidence'],
    ['Janeiro', 4, 'awaiting-decision'],
    ['Fevereiro', 1, 'decision'],
  ] as const
  for (const [month, week, expectedStage] of expectedStages) {
    working = atWeek(working, month, week)
    working = advanceJudiciaryWeek(working, working.calendar).campaign
    assert.equal(working.judiciary.cases[0].stage, expectedStage, month + ' semana ' + week)
  }
  const decided = working.judiciary.cases[0]
  assert.ok(decided.outcome)
  assert.equal(decided.decisions.length, 1)
  assert.ok(decided.decisions[0].rationale.length > 10)
  assert.ok(decided.history.some((message) => message.includes('fundamentos')))
})

test('recurso tem requisitos, custo político e só altera a instância competente', () => {
  const campaign = buildCampaign()
  const opening = getOpeningCase(campaign)
  const appealCase: JudicialCase = {
    ...opening,
    id: 'appeal-case',
    stage: 'decision',
    governmentIsParty: true,
    outcome: 'plaintiff',
    appealTo: 'stj',
    appealCount: 0,
    appealWindowWeeks: 2,
    decisions: [{
      id: 'appeal-case-decision',
      court: 'trf',
      year: 2027,
      month: 'Janeiro',
      week: 1,
      outcome: 'plaintiff',
      score: 80,
      rationale: 'A evidência e os fundamentos justificaram o acolhimento do pedido.',
      panelNames: [],
    }],
  }
  const withCase: CampaignState = {
    ...campaign,
    judiciary: { ...campaign.judiciary, cases: [appealCase] },
  }
  const appealed = appealJudicialCase(withCase, appealCase.id)
  assert.ok(appealed)
  if (!appealed) return
  assert.equal(appealed.judiciary.cases[0].stage, 'appeal')
  assert.equal(appealed.judiciary.cases[0].court, 'stj')
  assert.equal(appealed.judiciary.cases[0].appealCount, 1)
  assert.equal(appealed.turn.availableActionPoints, withCase.turn.availableActionPoints - 1)
  assert.equal(appealed.country.politicalCapital, withCase.country.politicalCapital - 2)
  assert.equal(appealJudicialCase(appealed, appealCase.id), null)
})

test('cumprir decisão final reduz impacto institucional de atraso e recupera confiança', () => {
  const campaign = buildCampaign()
  const opening = getOpeningCase(campaign)
  const finalCase: JudicialCase = {
    ...opening,
    id: 'compliance-case',
    stage: 'final',
    governmentIsParty: true,
    outcome: 'plaintiff',
    appealTo: null,
    appealWindowWeeks: 0,
    complianceStatus: 'pending',
    complianceWeeksRemaining: 1,
    decisions: [{
      id: 'compliance-case-decision',
      court: 'trf',
      year: 2027,
      month: 'Janeiro',
      week: 1,
      outcome: 'plaintiff',
      score: 70,
      rationale: 'O requerente demonstrou fundamento suficiente dentro do escopo do pedido.',
      panelNames: [],
    }],
  }
  const withCase: CampaignState = {
    ...campaign,
    judiciary: { ...campaign.judiciary, cases: [finalCase] },
  }
  const complied = complyWithJudicialDecision(withCase, finalCase.id)
  assert.ok(complied)
  if (!complied) return
  assert.equal(complied.judiciary.cases[0].complianceStatus, 'complied')
  assert.equal(complied.country.publicTrust, withCase.country.publicTrust + 2)
  assert.equal(complied.country.institutionalStability, withCase.country.institutionalStability + 2)
  assert.equal(complied.turn.availableActionPoints, withCase.turn.availableActionPoints - 1)
})

test('aposentadoria abre vaga uma única vez por mês e exige novo processo de nomeação', () => {
  const campaign = buildCampaign()
  const justices = campaign.judiciary.stfJustices.map((justice) =>
    justice.monthsUntilRetirement === null ? justice : { ...justice, monthsUntilRetirement: 1 })
  const nearRetirement: CampaignState = {
    ...campaign,
    judiciary: { ...campaign.judiciary, stfJustices: justices, lastClosedMonthKey: null },
  }
  const first = closeJudiciaryMonth(nearRetirement, nearRetirement.calendar)
  const second = closeJudiciaryMonth(first.campaign, first.campaign.calendar)
  assert.equal(first.campaign.judiciary.stfJustices.length, 9)
  assert.equal(first.campaign.judiciary.vacancies.length, 2)
  assert.equal(second.campaign.judiciary.vacancies.length, 2)
  assert.ok(first.events.length > 0)
})

test('avanço judicial não processa duas vezes a mesma semana', () => {
  const campaign = buildCampaign()
  const first = advanceJudiciaryWeek(campaign, campaign.calendar)
  const second = advanceJudiciaryWeek(first.campaign, campaign.calendar)
  assert.equal(first.campaign.judiciary.cases[0].stage, second.campaign.judiciary.cases[0].stage)
  assert.deepEqual(second.events, [])
})
