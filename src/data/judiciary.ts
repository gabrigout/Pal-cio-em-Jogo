import type { JudicialCaseType, JudicialCourtId } from '../state/types'

export const judicialRules = {
  supremeCourtSeats: 11,
  constitutionalMinimumAge: 36,
  constitutionalMaximumAge: 69,
  minimumLegalKnowledge: 60,
  minimumReputation: 60,
  senateSeats: 81,
  senateAbsoluteMajority: 41,
  nominationActionPoints: 1,
  nominationPoliticalCapital: 3,
  appointmentActionPoints: 1,
  appealActionPoints: 1,
  appealPoliticalCapital: 2,
  complianceActionPoints: 1,
  standardAttendanceRate: 0.92,
  weeklyDays: 7,
  admissibilityWeeks: 1,
  evidenceWeeks: 2,
  deliberationWeeks: 1,
  appealWindowWeeks: 2,
  complianceGraceWeeks: 2,
  mandatoryRetirementAge: 75,
  initialVacancySeat: 11,
  billChallengeRiskThreshold: 42,
  initialCasePublicImpact: 54,
} as const

export interface JudicialCourtDefinition {
  id: JudicialCourtId
  name: string
  shortName: string
  competence: string
  administrativeControl: boolean
}

export const judicialCourts: Record<JudicialCourtId, JudicialCourtDefinition> = {
  stf: {
    id: 'stf',
    name: 'Supremo Tribunal Federal',
    shortName: 'STF',
    competence: 'Guarda da Constituição e competências originárias definidas pela Constituição.',
    administrativeControl: false,
  },
  stj: {
    id: 'stj',
    name: 'Superior Tribunal de Justiça',
    shortName: 'STJ',
    competence: 'Uniformização da interpretação da legislação federal nos casos de sua competência.',
    administrativeControl: false,
  },
  trf: {
    id: 'trf',
    name: 'Tribunal Regional Federal / Justiça Federal',
    shortName: 'TRF / JF',
    competence: 'Conflitos e causas federais em instâncias próprias, conforme matéria e competência.',
    administrativeControl: false,
  },
  tj: {
    id: 'tj',
    name: 'Tribunal de Justiça estadual',
    shortName: 'TJ',
    competence: 'Matérias de competência estadual e recursos na Justiça estadual.',
    administrativeControl: false,
  },
  tse: {
    id: 'tse',
    name: 'Tribunal Superior Eleitoral',
    shortName: 'TSE',
    competence: 'Matérias eleitorais em sua competência específica.',
    administrativeControl: false,
  },
  tst: {
    id: 'tst',
    name: 'Tribunal Superior do Trabalho',
    shortName: 'TST',
    competence: 'Matérias trabalhistas em sua competência específica.',
    administrativeControl: false,
  },
  stm: {
    id: 'stm',
    name: 'Superior Tribunal Militar',
    shortName: 'STM',
    competence: 'Matérias da Justiça Militar em sua competência específica.',
    administrativeControl: false,
  },
  cnj: {
    id: 'cnj',
    name: 'Conselho Nacional de Justiça',
    shortName: 'CNJ',
    competence: 'Controle administrativo, financeiro e disciplinar do Judiciário; não funciona como recurso comum de mérito.',
    administrativeControl: true,
  },
}

export const judicialCaseLabels: Record<JudicialCaseType, string> = {
  'constitutional-review': 'Controle de constitucionalidade',
  administrative: 'Contencioso administrativo',
  fiscal: 'Controvérsia fiscal/orçamentária',
  'federal-dispute': 'Conflito federativo',
  electoral: 'Questão eleitoral',
  labor: 'Questão trabalhista',
  disciplinary: 'Procedimento administrativo/disciplinar',
}

export const judicialCaseDescriptions: Record<JudicialCaseType, string> = {
  'constitutional-review': 'Avalia a compatibilidade de uma norma com a Constituição dentro da competência judicial aplicável.',
  administrative: 'Discute a legalidade de ato ou procedimento administrativo.',
  fiscal: 'Discute dotação, compromisso, execução ou critério fiscal sem confundir autorização orçamentária com caixa.',
  'federal-dispute': 'Trata de controvérsia entre entes ou órgãos federativos.',
  electoral: 'Trata de matéria eleitoral; o calendário e os procedimentos completos serão aprofundados na fase eleitoral.',
  labor: 'Representa matéria trabalhista submetida à Justiça do Trabalho.',
  disciplinary: 'Representa apuração administrativa/disciplinar; não equivale a condenação criminal nem recurso comum de mérito.',
}

export const judicialStageLabels = {
  filed: 'Distribuído',
  admissibility: 'Admissibilidade',
  evidence: 'Instrução e elementos',
  'awaiting-decision': 'Conclusos para decisão',
  decision: 'Decisão publicada',
  appeal: 'Recurso em tramitação',
  final: 'Decisão final',
  dismissed: 'Encerrado sem julgamento de mérito',
} as const

export const judicialOutcomeLabels = {
  plaintiff: 'Pedido acolhido',
  government: 'Pedido rejeitado',
  partial: 'Pedido acolhido parcialmente',
  inadmissible: 'Pedido não admitido',
} as const

export const judicialOutcomeDescriptions = {
  plaintiff: 'O fundamento apresentado pelo requerente prevaleceu nos limites registrados no processo.',
  government: 'Os fundamentos não justificaram acolher o pedido contra o ente público demandado.',
  partial: 'O tribunal acolheu parte do pedido; a obrigação exata é descrita na fundamentação.',
  inadmissible: 'O caso não ultrapassou a admissibilidade; isso não significa julgamento do mérito.',
} as const
