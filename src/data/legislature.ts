import type { LegislativeBillType, LegislativeChamber } from '../state/types'

export const legislativeRules = {
  chambers: {
    house: { id: 'house', name: 'Câmara dos Deputados', seats: 513 },
    senate: { id: 'senate', name: 'Senado Federal', seats: 81 },
    joint: { id: 'joint', name: 'Sessão conjunta do Congresso', seats: 594 },
  } satisfies Record<LegislativeChamber, { id: LegislativeChamber; name: string; seats: number }>,
  ordinaryPresenceQuorumNumerator: 1,
  ordinaryPresenceQuorumDenominator: 2,
  complementaryMajorityNumerator: 1,
  complementaryMajorityDenominator: 2,
  amendmentMajorityNumerator: 3,
  amendmentMajorityDenominator: 5,
  constitutionalAmendmentRoundsPerChamber: 2,
  mpInitialValidityDays: 60,
  mpExtensionDays: 60,
  mpUrgencyAfterDays: 45,
  weeklyDays: 7,
  standardAttendanceRate: 0.91,
  maximumNegotiatedSupport: 35,
  negotiationSupportStep: 10,
  annualFiscalImpactLimit: 500,
  creditProposalLimit: 800,
  minimumLoaMultiplier: 0.7,
  maximumLoaMultiplier: 1.3,
  proposalActionCosts: {
    ordinary: { actionPoints: 1, politicalCapital: 2 },
    complementary: { actionPoints: 1, politicalCapital: 3 },
    pec: { actionPoints: 2, politicalCapital: 4 },
    mp: { actionPoints: 1, politicalCapital: 3 },
    ppa: { actionPoints: 2, politicalCapital: 3 },
    ldo: { actionPoints: 2, politicalCapital: 3 },
    loa: { actionPoints: 2, politicalCapital: 3 },
    credit: { actionPoints: 1, politicalCapital: 2 },
    amendment: { actionPoints: 1, politicalCapital: 2 },
  } satisfies Record<LegislativeBillType, { actionPoints: number; politicalCapital: number }>,
} as const

export const legislativePartySeatWeights: Record<string, number> = {
  ptp: 19,
  pso: 9,
  pdtt: 12,
  plim: 24,
  pssdb: 20,
  nova: 16,
  custom: 3,
}

export const legislativeTypeLabels: Record<LegislativeBillType, string> = {
  ordinary: 'Projeto de lei ordinária (PL)',
  complementary: 'Projeto de lei complementar (PLP)',
  pec: 'Proposta de emenda à Constituição (PEC)',
  mp: 'Medida provisória (MP)',
  ppa: 'Plano Plurianual (PPA)',
  ldo: 'Lei de Diretrizes Orçamentárias (LDO)',
  loa: 'Lei Orçamentária Anual (LOA)',
  credit: 'Crédito adicional',
  amendment: 'Emenda parlamentar de remanejamento',
}

export const legislativeTypeDescriptions: Record<LegislativeBillType, string> = {
  ordinary: 'Regra geral: deliberação por maioria dos votos, presente a maioria absoluta da Casa.',
  complementary: 'Exige maioria absoluta dos membros da Casa em cada deliberação.',
  pec: 'Exige três quintos dos membros de cada Casa, em dois turnos por Casa; não passa por sanção presidencial.',
  mp: 'Exige fundamentação de relevância e urgência, produz efeitos provisórios e passa por análise da Câmara e do Senado.',
  ppa: 'Instrumento de planejamento plurianual, de iniciativa do Executivo e deliberação orçamentária conjunta.',
  ldo: 'Define diretrizes para a elaboração e execução do orçamento, com deliberação orçamentária conjunta.',
  loa: 'Propõe o montante do orçamento anual; o valor informado é o total proposto, em R$ bilhões.',
  credit: 'Solicita crédito adicional direcionado a um setor; depende de deliberação legislativa e não cria caixa automaticamente.',
  amendment: 'Remaneja uma dotação de um setor para outro: o orçamento total não aumenta e o dinheiro não é criado.',
}
