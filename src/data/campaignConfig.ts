import type { PoliticalOrientation } from '../state/types'

export interface ValueRange {
  min: number
  max: number
}

export const partyPalette = [
  { name: 'Verde cívico', color: '#8bd4af' },
  { name: 'Laranja solar', color: '#e5a05c' },
  { name: 'Roxo mobilizador', color: '#9872dc' },
  { name: 'Azul horizonte', color: '#6bb9dc' },
  { name: 'Coral popular', color: '#e97969' },
  { name: 'Dourado público', color: '#d6bd5d' },
  { name: 'Rosa coletivo', color: '#dd8ab0' },
  { name: 'Azul-marinho', color: '#416488' },
]

export const partyColors = {
  ptp: ['#8bd4af', '#e5bd75'],
  pso: ['#9872dc', '#e5a05c'],
  pdtt: ['#6bb9dc', '#d6bd5d'],
  plim: ['#e97969', '#6bb9dc'],
  pssdb: ['#8bd4af', '#6bb9dc'],
  nova: ['#e5a05c', '#23364d'],
} as const

export const countryRanges = {
  presidentialApproval: { min: 47, max: 58 },
  congressSupport: { min: 42, max: 54 },
  executiveSupport: { min: 46, max: 56 },
  judiciaryRelation: { min: 46, max: 56 },
  economicOutlook: { min: 48, max: 62 },
  budget: { min: 280, max: 520 },
  politicalCapital: { min: 45, max: 64 },
  administrativeCapacity: { min: 47, max: 66 },
  institutionalStability: { min: 58, max: 73 },
  polarization: { min: 38, max: 55 },
  publicTrust: { min: 47, max: 59 },
  publicIntegrity: { min: 55, max: 72 },
  foreignRelations: { min: 53, max: 71 },
} satisfies Record<string, ValueRange>

export const actionPointRules = {
  weeklyBase: 2,
  supportThreshold: 49,
  maximumNewPerWeek: 6,
  maximumCarryOver: 2,
} as const

export const economyRules = {
  regularRevenue: 60,
  operatingExpense: 50,
  revenuePerEconomicBand: 300,
  expensePerCapacityBand: 400,
  maximumBudget: 1000,
} as const

export const economicRanges = {
  publicRevenue: { min: 480, max: 580 },
  publicExpenses: { min: 500, max: 620 },
  publicDebt: { min: 6200, max: 10500 },
  growth: { min: -1.2, max: 2.4 },
  inflation: { min: 3.2, max: 7.8 },
  unemployment: { min: 7.5, max: 12.5 },
  incomeInequality: { min: 46, max: 56 },
  availableFunds: { min: 280, max: 520 },
} satisfies Record<string, ValueRange>

export const economicRules = {
  sectorBudgetShare: 0.85,
  minimumSectorShare: 4,
  maximumSectorShare: 35,
  budgetRevisionMonths: ['Janeiro', 'Abril', 'Julho', 'Outubro'],
  budgetRevisionActionPoints: 2,
  budgetRevisionPoliticalCapital: 3,
  maximumDebtToAnnualRevenue: 5,
  emergencyLoanAmount: 240,
  emergencyLoanAnnualInterestRate: 9.5,
  emergencyLoanTermMonths: 12,
  emergencyLoanActionPoints: 1,
  emergencyLoanPoliticalCapital: 3,
  emergencyCashThreshold: 150,
  deferredPaymentAmount: 80,
  deferredPaymentActionPoints: 1,
  deferredPaymentPoliticalCapital: 2,
  taxAdjustmentActionPoints: 1,
  taxAdjustmentPoliticalCapital: 2,
  taxReformActionPoints: 2,
  taxReformPoliticalCapital: 4,
  monthlyHistoryLimit: 12,
} as const

export const dashboardStatusBands = {
  criticalBelow: 35,
  attentionBelow: 50,
} as const

export const indicatorLabels = {
  presidentialApproval: 'Aprovação presidencial',
  congressSupport: 'Apoio no Congresso',
  executiveSupport: 'Apoio interno do Executivo',
  judiciaryRelation: 'Relação institucional com o Judiciário',
  economicOutlook: 'Situação econômica',
  budget: 'Caixa disponível',
  politicalCapital: 'Capital político',
  administrativeCapacity: 'Capacidade administrativa',
  institutionalStability: 'Estabilidade institucional',
  polarization: 'Polarização',
  publicTrust: 'Confiança pública',
  publicIntegrity: 'Integridade pública',
  foreignRelations: 'Relação externa',
} as const

export const partyRanges = {
  popularity: { min: 14, max: 28 },
  influence: { min: 24, max: 48 },
  parliamentarySupport: { min: 30, max: 48 },
  resources: { min: 38, max: 62 },
  seats: { min: 2, max: 8 },
  customInfluence: { min: 18, max: 35 },
  customParliamentarySupport: { min: 8, max: 20 },
  customResources: { min: 28, max: 48 },
  customSeats: { min: 1, max: 5 },
} satisfies Record<string, ValueRange>

export const satiricalIntroductions: Record<PoliticalOrientation, { title: string; text: string }> = {
  left: {
    title: 'O sumiço no churrasco oficial',
    text: 'No meio do churrasco oficial, o Sr. Picanha desaparece entre o discurso e a sobremesa. A comissão do espeto pede prazo, a do pão de alho exige uma ata e alguém pergunta se a verba da merenda cobria farofa. Brasília suspende o almoço para abrir uma sindicância sobre o paradeiro do convidado.',
  },
  right: {
    title: 'A coalizão que saiu do grupo',
    text: 'O Sr. Rachavoto leva o mapa da coalizão para uma reunião e volta com três mapas, nenhum igual. O governo fragmentado agora tem quatro líderes, cinco grupos de mensagens e uma planilha chamada “base_final_agora_vai”. Antes do primeiro café, todos já pediram uma reunião para discutir quem ainda faz parte do governo.',
  },
}

export const politicalOrientationLabels: Record<PoliticalOrientation, string> = {
  left: 'Esquerda',
  right: 'Direita',
}

// Paletas temporárias: PTP, PDTT, PLIM e PSSDB aguardam identidade visual definitiva.