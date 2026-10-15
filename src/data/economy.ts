import type { EconomicTax } from '../state/types'

export const budgetSectorCatalog = [
  { id: 'health', name: 'Saúde', initialShare: 18, ministryIds: ['health'] },
  { id: 'education', name: 'Educação', initialShare: 16, ministryIds: ['education'] },
  { id: 'security', name: 'Segurança pública', initialShare: 13, ministryIds: ['justice', 'defense'] },
  { id: 'infrastructure', name: 'Infraestrutura e transportes', initialShare: 15, ministryIds: ['infrastructure'] },
  { id: 'social-housing', name: 'Assistência social e habitação', initialShare: 14, ministryIds: ['development', 'labor', 'cities'] },
  { id: 'environment', name: 'Meio ambiente', initialShare: 6, ministryIds: ['environment'] },
  { id: 'industry-science', name: 'Indústria, ciência e tecnologia', initialShare: 10, ministryIds: ['agriculture', 'industry', 'science', 'communications'] },
  { id: 'executive', name: 'Máquina do Executivo', initialShare: 8, ministryIds: ['finance', 'planning', 'culture', 'foreign-affairs'] },
] as const

export const initialTaxes: EconomicTax[] = [
  {
    id: 'income',
    name: 'Contribuição sobre renda (faixa executiva)',
    rate: 15,
    minimumRate: 5,
    maximumRate: 25,
    adjustmentStep: 0.5,
    revenueSensitivity: 0.22,
    affectedGroups: ['trabalhadores formais', 'profissionais autônomos'],
  },
  {
    id: 'consumption',
    name: 'Ajuste administrativo sobre consumo essencial',
    rate: 8,
    minimumRate: 4,
    maximumRate: 12,
    adjustmentStep: 0.5,
    revenueSensitivity: 0.18,
    affectedGroups: ['famílias consumidoras', 'comércio varejista'],
  },
  {
    id: 'corporate',
    name: 'Contribuição setorial sobre atividade produtiva',
    rate: 10,
    minimumRate: 5,
    maximumRate: 18,
    adjustmentStep: 0.5,
    revenueSensitivity: 0.16,
    affectedGroups: ['pequenas empresas', 'setores produtivos'],
  },
]

export const sectorEconomicWeights: Record<string, {
  growth: number
  inequality: number
  costMultiplier: number
}> = {
  health: { growth: 0.2, inequality: 0.4, costMultiplier: 1.04 },
  education: { growth: 0.45, inequality: 0.55, costMultiplier: 0.98 },
  security: { growth: 0.08, inequality: 0.1, costMultiplier: 1.05 },
  infrastructure: { growth: 0.75, inequality: 0.08, costMultiplier: 1.12 },
  'social-housing': { growth: 0.22, inequality: 0.72, costMultiplier: 1.02 },
  environment: { growth: 0.28, inequality: 0.08, costMultiplier: 1.03 },
  'industry-science': { growth: 0.82, inequality: 0.05, costMultiplier: 1.08 },
  executive: { growth: 0.05, inequality: 0.02, costMultiplier: 0.96 },
}

export const taxReformProposal = 'Reforma tributária estrutural'
