import { judicialRules } from '../data/judiciary'
import type {
  CampaignState,
  JudicialCase,
  JudicialCourtId,
  JudicialDecisionRecord,
  JudicialJustice,
  JudicialNomination,
  JudicialNomineeCandidate,
  JudicialOutcome,
  JudicialSenateVote,
  JudiciaryState,
  JudicialVacancy,
} from '../state/types'

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
  return calendar.month + ' de ' + calendar.year + ', semana ' + calendar.week
}

function makeNomineeCandidates(campaignId: string, vacancyId: string): JudicialNomineeCandidate[] {
  const random = seededRandom(campaignId + ':' + vacancyId + ':candidate-pool')
  const names = [
    'Marina Valença', 'Raul Azevedo', 'Helena Brandão', 'Caio Montenegro',
    'Lívia Fontoura', 'Sérgio Noronha', 'Tereza Alencar', 'Otávio Prado',
    'Nádia Farias', 'Davi Junqueira', 'Carolina Paes', 'Miguel Furtado',
    'Renata Galvão', 'André Siqueira', 'Iara Cavalcante', 'Bruno Lacerda',
    'Mônica Avelar', 'Samuel Amaral', 'Beatriz Nogueira', 'Ícaro Menezes',
    'Joana Meireles', 'Pedro Valverde', 'Laura Figueiredo', 'Daniela Portela',
  ]
  const profiles = [
    'Constitucionalista; tende a detalhar os fundamentos e os limites da competência.',
    'Especialista em direito público; prioriza a aplicação consistente dos precedentes.',
    'Carreira jurídica pública; reconhece a importância de rito, prova e motivação.',
    'Docente e pesquisador(a); costuma explicitar divergências interpretativas.',
    'Experiência em tribunais; busca decisões com fundamentação clara e executável.',
    'Advocacia pública e federativa; conhece conflitos entre entes e competências.',
  ]
  const pool = [...names]
  const candidates: JudicialNomineeCandidate[] = []
  for (let index = 0; index < 3; index += 1) {
    const nameIndex = Math.floor(random() * pool.length)
    const name = pool.splice(nameIndex, 1)[0]
    candidates.push({
      id: vacancyId + '-candidate-' + index,
      name,
      age: 38 + Math.floor(random() * 31),
      legalKnowledge: 64 + Math.floor(random() * 33),
      precedentReliance: 48 + Math.floor(random() * 48),
      proceduralRigour: 58 + Math.floor(random() * 39),
      independence: 62 + Math.floor(random() * 37),
      publicReputation: 61 + Math.floor(random() * 38),
      profile: profiles[Math.floor(random() * profiles.length)],
    })
  }
  return candidates
}

function makeVacancy(
  campaignId: string,
  seatNumber: number,
  year: number,
  month: string,
  reason: string,
): JudicialVacancy {
  const id = campaignId + '-stf-vacancy-seat-' + seatNumber + '-' + year + '-' + month.toLowerCase()
  return {
    id,
    court: 'stf',
    seatNumber,
    openedYear: year,
    openedMonth: month,
    reason,
    candidates: makeNomineeCandidates(campaignId, id),
    nominatedCandidateIds: [],
  }
}

function makeInitialJustices(campaignId: string, year: number): JudicialJustice[] {
  const names = [
    'Ministra Marina Saldanha',
    'Ministro Raul Mendonça',
    'Ministra Helena Duarte',
    'Ministro Caio Avelar',
    'Ministra Lívia Fontes',
    'Ministro Sérgio Valença',
    'Ministra Tereza Noronha',
    'Ministro Otávio Farias',
    'Ministra Nádia Siqueira',
    'Ministro Davi Lacerda',
  ]
  return names.map((name, index) => {
    const random = seededRandom(campaignId + ':initial-justice:' + (index + 1))
    const retiringSoon = index === 3
    const age = retiringSoon ? 74 : 45 + Math.floor(random() * 22)
    return {
      id: campaignId + '-stf-justice-' + (index + 1),
      name,
      seatNumber: index + 1,
      age,
      legalKnowledge: 72 + Math.floor(random() * 25),
      precedentReliance: 48 + Math.floor(random() * 45),
      proceduralRigour: 64 + Math.floor(random() * 31),
      independence: 68 + Math.floor(random() * 31),
      publicReputation: 65 + Math.floor(random() * 32),
      joinedYear: year - (4 + Math.floor(random() * 20)),
      monthsUntilRetirement: retiringSoon ? Math.max(1, (judicialRules.mandatoryRetirementAge - age) * 12) : null,
    }
  })
}

function makeOpeningCase(campaign: Pick<CampaignState, 'id' | 'calendar'>): JudicialCase {
  return {
    id: campaign.id + '-judicial-case-opening-transfer',
    title: 'Questionamento sobre os critérios de execução de um repasse federal',
    summary: 'Um consórcio municipal fictício questiona a transparência e a aplicação dos critérios administrativos de um repasse. A ação está em instrução; o ajuizamento não significa que a União tenha agido ilegalmente.',
    type: 'administrative',
    court: 'trf',
    stage: 'evidence',
    plaintiff: 'Consórcio Municipal do Norte (ficcional)',
    defendant: 'União',
    origin: 'Ação proposta por ente municipal fictício e herdada do ciclo administrativo anterior.',
    sourceKey: 'opening-federal-transfer',
    governmentIsParty: true,
    filedYear: campaign.calendar.year,
    filedMonth: campaign.calendar.month,
    filedWeek: 1,
    stageWeeks: 0,
    daysInProcess: 14,
    legalMerit: 62,
    evidenceStrength: 55,
    precedentFit: 51,
    proceduralRegularity: 78,
    publicImpact: 54,
    severity: 'important',
    appealTo: 'stj',
    appealCount: 0,
    appealWindowWeeks: 0,
    outcome: null,
    decisions: [],
    complianceStatus: 'not-required',
    complianceWeeksRemaining: 0,
    publicReactionSummary: null,
    closedReason: null,
    history: [
      'Processo fictício já em tramitação no início da campanha; não atribui irregularidade comprovada a pessoa real.',
      'A ação superou a análise inicial e segue para instrução dos elementos relevantes.',
    ],
  }
}

export function isEligibleJudicialCandidate(candidate: JudicialNomineeCandidate): boolean {
  return Number.isInteger(candidate.age)
    && candidate.age >= judicialRules.constitutionalMinimumAge
    && candidate.age <= judicialRules.constitutionalMaximumAge
    && candidate.legalKnowledge >= judicialRules.minimumLegalKnowledge
    && candidate.publicReputation >= judicialRules.minimumReputation
}

export function createInitialJudiciaryState(
  campaign: Pick<CampaignState, 'id' | 'calendar' | 'legislature'>,
): JudiciaryState {
  const vacancy = makeVacancy(
    campaign.id,
    judicialRules.initialVacancySeat,
    campaign.calendar.year,
    campaign.calendar.month,
    'Vaga ficcional aberta no início da simulação para introduzir a indicação e a aprovação pelo Senado; não representa um fato histórico real.',
  )
  return {
    stfJustices: makeInitialJustices(campaign.id, campaign.calendar.year),
    vacancies: [vacancy],
    nominations: [],
    cases: [makeOpeningCase(campaign)],
    history: [
      'A composição judicial inicial e os processos de abertura são inteiramente ficcionais.',
      'O STF começa com uma vaga simulada disponível; a Presidência pode indicar uma pessoa elegível, mas a nomeação depende de aprovação do Senado por maioria absoluta.',
      'Relação institucional, aprovação presidencial e orientação partidária não comandam o mérito de decisões judiciais.',
    ],
    processedSourceKeys: campaign.legislature.bills
      .filter((bill) => bill.stage === 'approved')
      .map((bill) => 'bill:' + bill.id),
    lastAdvancedKey: null,
    lastClosedMonthKey: null,
  }
}

function pushHistory(state: JudiciaryState, message: string): JudiciaryState {
  return { ...state, history: [message, ...state.history].slice(0, 50) }
}

function withJudiciary(campaign: CampaignState, judiciary: JudiciaryState): CampaignState {
  return { ...campaign, judiciary }
}

function makeNews(
  id: string,
  title: string,
  summary: string,
  tone: 'positive' | 'warning' | 'critical' | 'neutral' = 'neutral',
) {
  return { id, category: 'JUDICIÁRIO', time: 'SEMANA', title, summary, tone }
}

function publishEvent(
  campaign: CampaignState,
  eventKey: string,
  title: string,
  summary: string,
  historyMessage: string,
  tone: 'positive' | 'warning' | 'critical' | 'neutral' = 'neutral',
): CampaignState {
  const judicialState = pushHistory(campaign.judiciary, historyMessage)
  return {
    ...campaign,
    judiciary: judicialState,
    news: [...campaign.news, makeNews(eventKey, title, summary, tone)].slice(-8),
  }
}

function activeNominationForVacancy(state: JudiciaryState, vacancyId: string): JudicialNomination | undefined {
  return state.nominations.find((nomination) => nomination.vacancyId === vacancyId
    && (nomination.status === 'awaiting-senate' || nomination.status === 'approved'))
}

export function nominateJudicialCandidate(
  campaign: CampaignState,
  vacancyId: string,
  candidateId: string,
): CampaignState | null {
  const vacancy = campaign.judiciary.vacancies.find((item) => item.id === vacancyId)
  if (!vacancy || activeNominationForVacancy(campaign.judiciary, vacancyId)) return null
  if (campaign.turn.availableActionPoints < judicialRules.nominationActionPoints
    || campaign.country.politicalCapital < judicialRules.nominationPoliticalCapital) return null
  if (vacancy.nominatedCandidateIds.includes(candidateId)) return null
  const candidate = vacancy.candidates.find((item) => item.id === candidateId)
  if (!candidate || !isEligibleJudicialCandidate(candidate)) return null

  const nomination: JudicialNomination = {
    id: campaign.id + '-judicial-nomination-' + (campaign.judiciary.nominations.length + 1) + '-' + vacancy.id,
    vacancyId,
    candidate: { ...candidate },
    status: 'awaiting-senate',
    createdYear: campaign.calendar.year,
    createdMonth: campaign.calendar.month,
    createdWeek: campaign.calendar.week,
    weeksRemaining: 1,
    vote: null,
    history: [
      formatDate(campaign.calendar) + ': o presidente apresentou ' + candidate.name + ' para a vaga do STF; a escolha depende de sabatina/votação no Senado.',
    ],
  }
  let next: CampaignState = {
    ...campaign,
    judiciary: {
      ...campaign.judiciary,
      vacancies: campaign.judiciary.vacancies.map((item) => item.id === vacancyId
        ? { ...item, nominatedCandidateIds: [...item.nominatedCandidateIds, candidateId] }
        : item),
      nominations: [nomination, ...campaign.judiciary.nominations],
      history: [
        formatDate(campaign.calendar) + ': indicação de ' + candidate.name + ' enviada ao Senado; não há nomeação automática.',
        ...campaign.judiciary.history,
      ].slice(0, 50),
    },
    country: {
      ...campaign.country,
      politicalCapital: campaign.country.politicalCapital - judicialRules.nominationPoliticalCapital,
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - judicialRules.nominationActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, 'Indicar candidatura ao STF: ' + candidate.name],
    },
  }
  next = {
    ...next,
    news: [...next.news, makeNews(
      nomination.id + '-news',
      'Indicação ao STF enviada ao Senado',
      candidate.name + ' foi indicado para uma vaga ficcional; a deliberação do Senado ocorre de forma independente no próximo avanço semanal.',
    )].slice(-8),
  }
  return next
}

function nomineeVoteProbability(campaign: CampaignState, candidate: JudicialNomineeCandidate, bloc: CampaignState['legislature']['senate'][number]): number {
  let probability = 0.5
    + (campaign.country.congressSupport - 50) * 0.006
    + (campaign.country.presidentialApproval - 50) * 0.0015
    + (candidate.legalKnowledge - 75) * 0.004
    + (candidate.publicReputation - 75) * 0.006
  if (bloc.partyId === campaign.party.id) probability += 0.12
  else if (bloc.orientation === campaign.orientation) probability += 0.055
  else if (bloc.orientation === 'center') probability += 0.02
  else probability -= 0.055
  return clamp(probability, 0.08, 0.94)
}

function simulateSenateConfirmationVote(
  campaign: CampaignState,
  nomination: JudicialNomination,
): JudicialSenateVote {
  const random = seededRandom(campaign.id + ':' + nomination.id + ':senate-confirmation')
  let yes = 0
  let no = 0
  let abstain = 0
  let absent = 0
  for (const bloc of campaign.legislature.senate) {
    const probability = nomineeVoteProbability(campaign, nomination.candidate, bloc)
    for (let seat = 0; seat < bloc.seats; seat += 1) {
      if (random() > judicialRules.standardAttendanceRate) {
        absent += 1
      } else if (random() < 0.025) {
        abstain += 1
      } else if (random() < probability) {
        yes += 1
      } else {
        no += 1
      }
    }
  }
  const present = yes + no + abstain
  const approved = yes >= judicialRules.senateAbsoluteMajority
  return {
    id: nomination.id + '-senate-vote',
    yes,
    no,
    abstain,
    absent,
    present,
    totalSeats: judicialRules.senateSeats,
    requiredYes: judicialRules.senateAbsoluteMajority,
    approved,
    dateLabel: formatDate(campaign.calendar),
    note: 'A indicação precisa de maioria absoluta do Senado (41 de 81 votos). Presença ou alinhamento político não substituem o quórum de votos favoráveis.',
  }
}

export function formalizeJudicialAppointment(
  campaign: CampaignState,
  nominationId: string,
): CampaignState | null {
  const nomination = campaign.judiciary.nominations.find((item) => item.id === nominationId)
  if (!nomination || nomination.status !== 'approved'
    || campaign.turn.availableActionPoints < judicialRules.appointmentActionPoints) return null
  const vacancy = campaign.judiciary.vacancies.find((item) => item.id === nomination.vacancyId)
  if (!vacancy || campaign.judiciary.stfJustices.some((justice) => justice.seatNumber === vacancy.seatNumber)) return null

  const candidate = nomination.candidate
  const justice: JudicialJustice = {
    id: candidate.id + '-appointed',
    name: candidate.name,
    seatNumber: vacancy.seatNumber,
    age: candidate.age,
    legalKnowledge: candidate.legalKnowledge,
    precedentReliance: candidate.precedentReliance,
    proceduralRigour: candidate.proceduralRigour,
    independence: candidate.independence,
    publicReputation: candidate.publicReputation,
    joinedYear: campaign.calendar.year,
    monthsUntilRetirement: Math.max(1, (judicialRules.mandatoryRetirementAge - candidate.age) * 12),
  }
  const historyMessage = formatDate(campaign.calendar) + ': ' + candidate.name + ' foi nomeado(a) para a vaga do STF após aprovação do Senado.'
  let next: CampaignState = {
    ...campaign,
    judiciary: {
      ...campaign.judiciary,
      stfJustices: [...campaign.judiciary.stfJustices, justice].sort((first, second) => first.seatNumber - second.seatNumber),
      vacancies: campaign.judiciary.vacancies.filter((item) => item.id !== vacancy.id),
      nominations: campaign.judiciary.nominations.map((item) => item.id === nominationId
        ? { ...item, status: 'appointed', history: [historyMessage, ...item.history].slice(0, 10) }
        : item),
      history: [historyMessage, ...campaign.judiciary.history].slice(0, 50),
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - judicialRules.appointmentActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, 'Formalizar nomeação ao STF: ' + candidate.name],
    },
  }
  next = {
    ...next,
    news: [...next.news, makeNews(
      nominationId + '-appointed-news',
      'Nomeação ao STF formalizada',
      candidate.name + ' passa a integrar a composição ficcional do STF. As futuras decisões continuam a depender dos elementos de cada processo.',
    )].slice(-8),
  }
  return next
}

export function evaluateJudicialCase(
  campaign: Pick<CampaignState, 'id' | 'judiciary' | 'calendar'>,
  judicialCase: JudicialCase,
): JudicialDecisionRecord {
  const panel = judicialCase.court === 'stf' ? campaign.judiciary.stfJustices : []
  const average = (select: (justice: JudicialJustice) => number) => panel.length
    ? panel.reduce((sum, justice) => sum + select(justice), 0) / panel.length
    : 70
  const averageLegalKnowledge = average((justice) => justice.legalKnowledge)
  const averagePrecedentReliance = average((justice) => justice.precedentReliance)
  const averageProceduralRigour = average((justice) => justice.proceduralRigour)
  const averageIndependence = average((justice) => justice.independence)
  const legalBase = judicialCase.legalMerit * 0.32
    + judicialCase.evidenceStrength * 0.30
    + judicialCase.precedentFit * 0.21
    + judicialCase.proceduralRegularity * 0.17
  const panelAdjustment = (averageLegalKnowledge - 70) * 0.08
    + (averagePrecedentReliance - 65) * 0.045
    + (averageProceduralRigour - 70) * 0.06
  const publicPressure = (judicialCase.publicImpact - 50) * (100 - averageIndependence) / 100 * 0.10
  const random = seededRandom(campaign.id + ':' + judicialCase.id + ':decision:' + judicialCase.appealCount + ':' + judicialCase.court)
  const noise = (random() * 12) - 6
  const score = roundOne(clamp(legalBase + panelAdjustment + publicPressure + noise, 0, 100))
  const outcome: JudicialOutcome = judicialCase.proceduralRegularity < 35
    ? 'inadmissible'
    : score >= 64
      ? 'plaintiff'
      : score <= 42
        ? 'government'
        : 'partial'
  const rationale = outcome === 'inadmissible'
    ? 'O processo não superou requisitos processuais da simulação; o mérito não foi julgado.'
    : outcome === 'plaintiff'
      ? 'A base jurídica, os elementos apresentados e a adequação dos fundamentos favoreceram o pedido, nos limites da decisão.'
      : outcome === 'government'
        ? 'Os elementos e fundamentos não foram suficientes para acolher o pedido contra a parte demandada.'
        : 'O tribunal reconheceu fundamentos concorrentes e acolheu parte do pedido, delimitando a obrigação na fundamentação.'
  return {
    id: judicialCase.id + '-decision-' + (judicialCase.appealCount + 1) + '-' + judicialCase.court,
    court: judicialCase.court,
    year: campaign.calendar.year,
    month: campaign.calendar.month,
    week: campaign.calendar.week,
    outcome,
    score,
    rationale,
    panelNames: panel.map((justice) => justice.name),
  }
}

function adverseToGovernment(outcome: JudicialOutcome | null): boolean {
  return outcome === 'plaintiff' || outcome === 'partial'
}

function applyJudicialDecision(
  campaign: CampaignState,
  judicialCase: JudicialCase,
  decision: JudicialDecisionRecord,
): { campaign: CampaignState; judicialCase: JudicialCase; event: string } {
  const appealWindow = judicialCase.governmentIsParty && adverseToGovernment(decision.outcome)
    && judicialCase.appealTo !== null && judicialCase.appealCount < 1
    ? judicialRules.appealWindowWeeks
    : 0
  const nextCase: JudicialCase = {
    ...judicialCase,
    stage: decision.outcome === 'inadmissible' ? 'dismissed' : 'decision',
    stageWeeks: 0,
    outcome: decision.outcome,
    decisions: [...judicialCase.decisions, decision],
    appealWindowWeeks: appealWindow,
    complianceStatus: 'not-required',
    complianceWeeksRemaining: 0,
    closedReason: decision.outcome === 'inadmissible' ? 'Encerrado por questão processual; o mérito não foi julgado.' : null,
    publicReactionSummary: judicialCase.publicImpact >= 65 && campaign.country.polarization >= 60
      ? 'A repercussão pública tende a ser intensa em razão do impacto do caso e da polarização; isso não altera o fundamento jurídico.'
      : judicialCase.publicImpact >= 65
        ? 'O caso pode gerar debate público relevante; a reação política é distinta do mérito jurídico.'
        : 'A repercussão prevista é moderada; o mérito segue fundamentado nos elementos do processo.',
    history: [
      formatDate(campaign.calendar) + ': ' + decision.rationale,
      ...judicialCase.history,
    ].slice(0, 14),
  }
  const event = nextCase.title + ': ' + decision.rationale
  const newsTone = decision.outcome === 'plaintiff' || decision.outcome === 'partial' ? 'warning' as const : 'neutral' as const
  let nextCampaign = publishEvent(
    campaign,
    decision.id + '-news',
    decision.outcome === 'inadmissible' ? 'Processo encerrado por questão processual' : 'Decisão judicial publicada',
    nextCase.title + ' — ' + decision.rationale + ' A decisão não é escolhida pelo presidente.',
    event,
    newsTone,
  )
  nextCampaign = withJudiciary(nextCampaign, {
    ...nextCampaign.judiciary,
    cases: nextCampaign.judiciary.cases.map((item) => item.id === nextCase.id ? nextCase : item),
  })
  return { campaign: nextCampaign, judicialCase: nextCase, event }
}

function createCaseFromBill(campaign: CampaignState, billId: string): JudicialCase | null {
  const bill = campaign.legislature.bills.find((item) => item.id === billId)
  if (!bill || bill.stage !== 'approved') return null
  const random = seededRandom(campaign.id + ':' + bill.id + ':judicial-filing')
  let risk = bill.type === 'mp' ? 34
    : bill.type === 'pec' ? 23
      : bill.type === 'loa' || bill.type === 'credit' ? 25
        : bill.type === 'complementary' ? 17
          : bill.type === 'amendment' ? 15 : 11
  risk += Math.min(17, Math.abs(bill.fiscalImpact) / 18)
  if (campaign.country.publicIntegrity < 45) risk += 12
  if (campaign.country.publicTrust < 40) risk += 8
  if (campaign.country.polarization >= 65) risk += 7
  risk = clamp(risk, 0, 80)
  if (risk < judicialRules.billChallengeRiskThreshold || random() * 100 >= risk) return null

  const budgetMatter = ['ppa', 'ldo', 'loa', 'credit', 'amendment'].includes(bill.type)
  const court: JudicialCourtId = budgetMatter ? 'trf' : 'stf'
  const plaintiffOptions = budgetMatter
    ? ['Consórcio Municipal do Norte (ficcional)', 'Rede de Entidades Cívicas (ficcional)', 'Frente de Governos Regionais (ficcional)']
    : ['Instituto Cívico de Direito Público (ficcional)', 'Associação por Garantias Constitucionais (ficcional)', 'Frente Cidadã de Acompanhamento Normativo (ficcional)']
  const plaintiff = plaintiffOptions[Math.floor(random() * plaintiffOptions.length)]
  const title = budgetMatter
    ? 'Questionamento judicial sobre a proposição orçamentária "' + bill.title + '"'
    : 'Ação de controle constitucional sobre a norma "' + bill.title + '"'
  return {
    id: campaign.id + '-judicial-case-' + bill.id,
    title,
    summary: 'Uma entidade fictícia ajuizou ação após a aprovação legislativa, sustentando dúvidas sobre a competência, a forma ou os efeitos da norma. A existência da ação não significa que a lei seja inválida.',
    type: budgetMatter ? 'fiscal' : 'constitutional-review',
    court,
    stage: 'filed',
    plaintiff,
    defendant: 'União',
    origin: 'Questionamento apresentado após a tramitação legislativa; os fundamentos serão apreciados judicialmente.',
    sourceKey: 'bill:' + bill.id,
    governmentIsParty: true,
    filedYear: campaign.calendar.year,
    filedMonth: campaign.calendar.month,
    filedWeek: campaign.calendar.week,
    stageWeeks: 0,
    daysInProcess: 0,
    legalMerit: 42 + Math.floor(random() * 49),
    evidenceStrength: 35 + Math.floor(random() * 56),
    precedentFit: 38 + Math.floor(random() * 53),
    proceduralRegularity: 52 + Math.floor(random() * 44),
    publicImpact: clamp(38 + Math.abs(bill.fiscalImpact) / 7 + (campaign.country.polarization - 50) * 0.35, 25, 95),
    severity: risk >= 65 ? 'critical' : risk >= 48 ? 'important' : 'routine',
    appealTo: court === 'trf' ? 'stj' : null,
    appealCount: 0,
    appealWindowWeeks: 0,
    outcome: null,
    decisions: [],
    complianceStatus: 'not-required',
    complianceWeeksRemaining: 0,
    publicReactionSummary: null,
    closedReason: null,
    history: [
      formatDate(campaign.calendar) + ': ação ajuizada após aprovação legislativa; a validade da norma não é presumida.',
    ],
  }
}

function progressCase(
  campaign: CampaignState,
  judicialCase: JudicialCase,
): { campaign: CampaignState; judicialCase: JudicialCase; event: string | null } {
  let next: JudicialCase = {
    ...judicialCase,
    stageWeeks: judicialCase.stageWeeks + 1,
    daysInProcess: judicialCase.daysInProcess + judicialRules.weeklyDays,
  }
  const history = (message: string) => { next = { ...next, history: [message, ...next.history].slice(0, 14) } }
  let event: string | null = null
  const stamp = formatDate(campaign.calendar)

  if (next.stage === 'filed') {
    next = { ...next, stage: 'admissibility', stageWeeks: 0 }
    const message = stamp + ': processo distribuído para análise de admissibilidade.'
    history(message)
    event = message
  } else if (next.stage === 'admissibility') {
    if (next.proceduralRegularity < 28) {
      next = { ...next, stage: 'dismissed', outcome: 'inadmissible', closedReason: 'Não atingiu os requisitos processuais mínimos da simulação.', stageWeeks: 0 }
      const message = stamp + ': processo encerrado por requisito processual; mérito não julgado.'
      history(message)
      event = message
    } else {
      next = { ...next, stage: 'evidence', stageWeeks: 0 }
      const message = stamp + ': a ação foi admitida e segue para instrução dos elementos.'
      history(message)
      event = message
    }
  } else if (next.stage === 'evidence' && next.stageWeeks >= judicialRules.evidenceWeeks) {
    next = { ...next, stage: 'awaiting-decision', stageWeeks: 0 }
    const message = stamp + ': instrução concluída; o processo está concluso para decisão.'
    history(message)
    event = message
  } else if (next.stage === 'awaiting-decision') {
    const decision = evaluateJudicialCase(campaign, next)
    next = { ...next, stage: 'decision', stageWeeks: 0 }
    const result = applyJudicialDecision(campaign, next, decision)
    next = result.judicialCase
    event = result.event
    return { campaign: result.campaign, judicialCase: next, event }
  } else if (next.stage === 'decision') {
    if (next.appealWindowWeeks > 0) {
      next = { ...next, appealWindowWeeks: next.appealWindowWeeks - 1, stageWeeks: 0 }
      if (next.appealWindowWeeks === 0) {
        next = {
          ...next,
          stage: 'final',
          complianceStatus: next.governmentIsParty && adverseToGovernment(next.outcome) ? 'pending' : 'not-required',
          complianceWeeksRemaining: next.governmentIsParty && adverseToGovernment(next.outcome) ? judicialRules.complianceGraceWeeks : 0,
        }
        const message = stamp + ': prazo de recurso encerrado; a decisão tornou-se final.'
        history(message)
        event = message
      }
    } else {
      next = {
        ...next,
        stage: 'final',
        complianceStatus: next.governmentIsParty && adverseToGovernment(next.outcome) ? 'pending' : 'not-required',
        complianceWeeksRemaining: next.governmentIsParty && adverseToGovernment(next.outcome) ? judicialRules.complianceGraceWeeks : 0,
        stageWeeks: 0,
      }
      const message = stamp + ': decisão finalizada após o prazo processual simulado.'
      history(message)
      event = message
    }
  } else if (next.stage === 'appeal') {
    next = { ...next, stage: 'awaiting-decision', stageWeeks: 0 }
    const message = stamp + ': recurso recebido pela instância revisora; o mérito será reavaliado com os elementos registrados.'
    history(message)
    event = message
  } else if (next.stage === 'final' && next.complianceStatus === 'pending') {
    next = { ...next, complianceWeeksRemaining: next.complianceWeeksRemaining - 1 }
    if (next.complianceWeeksRemaining <= 0) {
      next = { ...next, complianceStatus: 'overdue', complianceWeeksRemaining: 0 }
      const message = stamp + ': prazo de cumprimento expirou sem registro de cumprimento; aumentam os custos institucionais.'
      history(message)
      event = message
      let nextCampaign = {
        ...campaign,
        country: {
          ...campaign.country,
          institutionalStability: clamp(campaign.country.institutionalStability - 2, 0, 100),
          publicTrust: clamp(campaign.country.publicTrust - 2, 0, 100),
        },
      }
      nextCampaign = publishEvent(
        nextCampaign,
        next.id + '-overdue',
        'Prazo judicial não cumprido',
        next.title + ' permanece sem cumprimento registrado; a simulação aplica custos institucionais.',
        message,
        'critical',
      )
      return { campaign: withJudiciary(nextCampaign, {
        ...nextCampaign.judiciary,
        cases: nextCampaign.judiciary.cases.map((item) => item.id === next.id ? next : item),
      }), judicialCase: next, event }
    }
  }
  return { campaign: withJudiciary(campaign, {
    ...campaign.judiciary,
    cases: campaign.judiciary.cases.map((item) => item.id === next.id ? next : item),
  }), judicialCase: next, event }
}

function progressNomination(
  campaign: CampaignState,
  nomination: JudicialNomination,
): { campaign: CampaignState; nomination: JudicialNomination; event: string | null } {
  if (nomination.status !== 'awaiting-senate') return { campaign, nomination, event: null }
  const weeksRemaining = nomination.weeksRemaining - 1
  if (weeksRemaining > 0) {
    return {
      campaign,
      nomination: { ...nomination, weeksRemaining },
      event: null,
    }
  }
  const vote = simulateSenateConfirmationVote(campaign, nomination)
  const status = vote.approved ? 'approved' : 'rejected'
  const message = vote.approved
    ? 'O Senado aprovou a indicação de ' + nomination.candidate.name + ' por ' + vote.yes + ' votos favoráveis; a nomeação formal ainda depende do presidente.'
    : 'O Senado rejeitou a indicação de ' + nomination.candidate.name + ' (' + vote.yes + ' votos favoráveis; eram necessários ' + vote.requiredYes + '). A vaga continua aberta.'
  const nextNomination: JudicialNomination = {
    ...nomination,
    status,
    weeksRemaining: 0,
    vote,
    history: [formatDate(campaign.calendar) + ': ' + message, ...nomination.history].slice(0, 10),
  }
  let next: CampaignState = {
    ...campaign,
    judiciary: {
      ...campaign.judiciary,
      nominations: campaign.judiciary.nominations.map((item) => item.id === nomination.id ? nextNomination : item),
      history: [message, ...campaign.judiciary.history].slice(0, 50),
    },
    news: [...campaign.news, makeNews(
      nomination.id + '-vote-news',
      vote.approved ? 'Senado aprova indicação judicial' : 'Senado rejeita indicação judicial',
      message,
      vote.approved ? 'neutral' : 'warning',
    )].slice(-8),
  }
  if (!vote.approved) {
    next = {
      ...next,
      judiciary: {
        ...next.judiciary,
        vacancies: next.judiciary.vacancies.map((vacancy) => vacancy.id === nomination.vacancyId
          ? { ...vacancy, nominatedCandidateIds: [...new Set(vacancy.nominatedCandidateIds)] }
          : vacancy),
      },
    }
  }
  return { campaign: next, nomination: nextNomination, event: message }
}

function advanceRetirement(
  campaign: CampaignState,
  endingCalendar: CampaignState['calendar'],
): { campaign: CampaignState; events: string[] } {
  const key = endingCalendar.year + '-' + endingCalendar.month
  if (campaign.judiciary.lastClosedMonthKey === key) return { campaign, events: [] }
  let working: CampaignState = {
    ...campaign,
    judiciary: { ...campaign.judiciary, lastClosedMonthKey: key },
  }
  const events: string[] = []
  const remainingJustices: JudicialJustice[] = []
  for (const justice of campaign.judiciary.stfJustices) {
    if (justice.monthsUntilRetirement === null) {
      remainingJustices.push(justice)
      continue
    }
    const months = justice.monthsUntilRetirement - 1
    if (months > 0) {
      remainingJustices.push({ ...justice, monthsUntilRetirement: months })
      continue
    }
    const reason = justice.name + ' atingiu a aposentadoria compulsória ficcional aos 75 anos; a vaga será preenchida somente após nova indicação e aprovação.'
    const vacancy = makeVacancy(
      campaign.id,
      justice.seatNumber,
      endingCalendar.year,
      endingCalendar.month,
      reason,
    )
    working = {
      ...working,
      judiciary: {
        ...working.judiciary,
        vacancies: [...working.judiciary.vacancies, vacancy],
        history: [reason, ...working.judiciary.history].slice(0, 50),
      },
    }
    events.push(reason)
    working = {
      ...working,
      news: [...working.news, makeNews(
        justice.id + '-retirement',
        'Vaga judicial aberta',
        reason,
      )].slice(-8),
    }
  }
  working = {
    ...working,
    judiciary: {
      ...working.judiciary,
      stfJustices: remainingJustices,
      lastClosedMonthKey: key,
    },
  }
  return { campaign: working, events }
}

export function advanceJudiciaryWeek(
  campaign: CampaignState,
  endingCalendar: CampaignState['calendar'] = campaign.calendar,
): { campaign: CampaignState; events: string[] } {
  const key = endingCalendar.year + '-' + endingCalendar.month + '-' + endingCalendar.week
  if (campaign.judiciary.lastAdvancedKey === key) return { campaign, events: [] }
  let working: CampaignState = {
    ...campaign,
    judiciary: { ...campaign.judiciary, lastAdvancedKey: key },
  }
  const events: string[] = []
  const originalCases = [...campaign.judiciary.cases]
  for (const originalCase of originalCases) {
    const result = progressCase(working, originalCase)
    working = result.campaign
    if (result.event) events.push(result.event)
  }

  const originalNominations = [...working.judiciary.nominations]
  for (const nomination of originalNominations) {
    const result = progressNomination(working, nomination)
    working = result.campaign
    if (result.event) events.push(result.event)
  }

  const processedSourceKeys = new Set(working.judiciary.processedSourceKeys)
  const newCases: JudicialCase[] = []
  for (const bill of working.legislature.bills) {
    if (bill.stage !== 'approved') continue
    const sourceKey = 'bill:' + bill.id
    if (processedSourceKeys.has(sourceKey)) continue
    processedSourceKeys.add(sourceKey)
    const judicialCase = createCaseFromBill(working, bill.id)
    if (!judicialCase) continue
    newCases.push(judicialCase)
    const message = 'A ação ' + judicialCase.title + ' foi registrada; a propositura não determina o resultado.'
    events.push(message)
    working = publishEvent(
      working,
      judicialCase.id + '-filed-news',
      'Novo processo judicial',
      message,
      message,
      'neutral',
    )
  }

  working = {
    ...working,
    judiciary: {
      ...working.judiciary,
      cases: [...working.judiciary.cases, ...newCases],
      processedSourceKeys: [...processedSourceKeys].slice(-500),
      lastAdvancedKey: key,
    },
  }
  return { campaign: working, events }
}

export function closeJudiciaryMonth(
  campaign: CampaignState,
  endingCalendar: CampaignState['calendar'] = campaign.calendar,
): { campaign: CampaignState; events: string[] } {
  return advanceRetirement(campaign, endingCalendar)
}

export function appealJudicialCase(campaign: CampaignState, caseId: string): CampaignState | null {
  const judicialCase = campaign.judiciary.cases.find((item) => item.id === caseId)
  if (!judicialCase || judicialCase.stage !== 'decision' || !judicialCase.governmentIsParty
    || !adverseToGovernment(judicialCase.outcome) || judicialCase.appealTo === null
    || judicialCase.appealCount >= 1 || judicialCase.appealWindowWeeks <= 0
    || campaign.turn.availableActionPoints < judicialRules.appealActionPoints
    || campaign.country.politicalCapital < judicialRules.appealPoliticalCapital) return null
  const newCourt = judicialCase.appealTo
  const stamp = formatDate(campaign.calendar)
  const message = 'O Executivo interpôs recurso cabível para ' + newCourt.toUpperCase() + '; a instância revisora decidirá de forma independente.'
  const nextCase: JudicialCase = {
    ...judicialCase,
    court: newCourt,
    stage: 'appeal',
    stageWeeks: 0,
    appealCount: judicialCase.appealCount + 1,
    appealTo: null,
    appealWindowWeeks: 0,
    complianceStatus: 'not-required',
    complianceWeeksRemaining: 0,
    history: [stamp + ': ' + message, ...judicialCase.history].slice(0, 14),
  }
  return {
    ...campaign,
    judiciary: {
      ...campaign.judiciary,
      cases: campaign.judiciary.cases.map((item) => item.id === caseId ? nextCase : item),
      history: [message, ...campaign.judiciary.history].slice(0, 50),
    },
    country: {
      ...campaign.country,
      politicalCapital: campaign.country.politicalCapital - judicialRules.appealPoliticalCapital,
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - judicialRules.appealActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, 'Interpor recurso judicial cabível: ' + judicialCase.title],
    },
  }
}

export function complyWithJudicialDecision(campaign: CampaignState, caseId: string): CampaignState | null {
  const judicialCase = campaign.judiciary.cases.find((item) => item.id === caseId)
  if (!judicialCase || judicialCase.stage !== 'final' || !judicialCase.governmentIsParty
    || !adverseToGovernment(judicialCase.outcome) || judicialCase.complianceStatus === 'complied'
    || judicialCase.complianceStatus === 'not-required'
    || campaign.turn.availableActionPoints < judicialRules.complianceActionPoints) return null
  const message = 'O Executivo registrou cumprimento da decisão final em ' + judicialCase.title + '.'
  const nextCase: JudicialCase = {
    ...judicialCase,
    complianceStatus: 'complied',
    complianceWeeksRemaining: 0,
    history: [formatDate(campaign.calendar) + ': ' + message, ...judicialCase.history].slice(0, 14),
  }
  const wasOverdue = judicialCase.complianceStatus === 'overdue'
  return {
    ...campaign,
    judiciary: {
      ...campaign.judiciary,
      cases: campaign.judiciary.cases.map((item) => item.id === caseId ? nextCase : item),
      history: [message, ...campaign.judiciary.history].slice(0, 50),
    },
    country: {
      ...campaign.country,
      institutionalStability: clamp(campaign.country.institutionalStability + (wasOverdue ? 0 : 2), 0, 100),
      publicTrust: clamp(campaign.country.publicTrust + (wasOverdue ? 0 : 2), 0, 100),
    },
    turn: {
      ...campaign.turn,
      availableActionPoints: campaign.turn.availableActionPoints - judicialRules.complianceActionPoints,
      actionsTaken: [...campaign.turn.actionsTaken, 'Cumprir decisão judicial: ' + judicialCase.title],
    },
    news: [...campaign.news, makeNews(
      caseId + '-compliance',
      'Cumprimento de decisão judicial',
      message + (wasOverdue ? ' O cumprimento ocorreu após o prazo simulado.' : ' O respeito ao prazo contribui para a estabilidade institucional.'),
      wasOverdue ? 'warning' : 'positive',
    )].slice(-8),
  }
}
