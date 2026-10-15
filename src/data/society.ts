import type { PressureGroupId, SocialClassId } from '../state/types'

export const socialClassCatalog: Array<{
  id: SocialClassId
  name: string
  orientationAdjustment: { left: number; right: number }
  priorities: string[]
  sectorIds: string[]
}> = [
  { id: 'low-income', name: 'População de baixa renda', orientationAdjustment: { left: 4, right: -1 }, priorities: ['Poder de compra', 'Saúde', 'Educação', 'Assistência e habitação'], sectorIds: ['health', 'education', 'social-housing'] },
  { id: 'middle-class', name: 'Classe média', orientationAdjustment: { left: 0, right: 1 }, priorities: ['Inflação e crédito', 'Emprego', 'Educação', 'Mobilidade'], sectorIds: ['education', 'infrastructure', 'industry-science'] },
  { id: 'wealthy-business', name: 'Ricos e empresários', orientationAdjustment: { left: -3, right: 4 }, priorities: ['Crescimento', 'Infraestrutura', 'Previsibilidade tributária', 'Crédito'], sectorIds: ['infrastructure', 'industry-science', 'executive'] },
  { id: 'millionaires', name: 'Milionários', orientationAdjustment: { left: -5, right: 4 }, priorities: ['Tributação sobre renda', 'Estabilidade', 'Investimentos', 'Segurança jurídica'], sectorIds: ['industry-science', 'infrastructure', 'executive'] },
  { id: 'billionaires', name: 'Bilionários', orientationAdjustment: { left: -6, right: 5 }, priorities: ['Ambiente de negócios', 'Comércio', 'Estabilidade fiscal', 'Regulação'], sectorIds: ['industry-science', 'infrastructure', 'executive'] },
]

export const pressureGroupCatalog: Array<{
  id: PressureGroupId
  name: string
  category: string
  influence: number
  orientationAdjustment: { left: number; right: number }
  sectorIds: string[]
  beneficiaryClass: SocialClassId
  interests: string[]
  demand: string
}> = [
  { id: 'unions', name: 'Sindicatos e centrais de trabalhadores', category: 'Trabalhadores', influence: 76, orientationAdjustment: { left: 5, right: -2 }, sectorIds: ['social-housing', 'health', 'education'], beneficiaryClass: 'low-income', interests: ['Emprego e renda', 'Serviços públicos', 'Proteção trabalhista'], demand: 'Abrir negociação sobre emprego, renda e continuidade dos serviços.' },
  { id: 'business-entities', name: 'Entidades empresariais', category: 'Atividade produtiva', influence: 79, orientationAdjustment: { left: -2, right: 5 }, sectorIds: ['industry-science', 'infrastructure', 'executive'], beneficiaryClass: 'wealthy-business', interests: ['Crédito e investimento', 'Infraestrutura', 'Previsibilidade tributária'], demand: 'Pedir previsibilidade regulatória, crédito e condições para investir.' },
  { id: 'students', name: 'Estudantes e organizações estudantis', category: 'Educação', influence: 55, orientationAdjustment: { left: 4, right: -1 }, sectorIds: ['education', 'social-housing'], beneficiaryClass: 'middle-class', interests: ['Acesso à educação', 'Permanência estudantil', 'Primeiro emprego'], demand: 'Cobrar acesso à educação, permanência estudantil e oportunidades.' },
  { id: 'public-employees', name: 'Servidores públicos', category: 'Serviço público', influence: 70, orientationAdjustment: { left: 3, right: -1 }, sectorIds: ['executive', 'health', 'education'], beneficiaryClass: 'middle-class', interests: ['Condições de trabalho', 'Calendário de pagamentos', 'Capacidade dos serviços'], demand: 'Negociar condições de trabalho, pagamentos e capacidade de atendimento.' },
  { id: 'rural-producers', name: 'Produtores rurais e cooperativas', category: 'Produção regional', influence: 66, orientationAdjustment: { left: -1, right: 4 }, sectorIds: ['industry-science', 'infrastructure'], beneficiaryClass: 'wealthy-business', interests: ['Logística e escoamento', 'Custos de produção', 'Crédito rural'], demand: 'Cobrar logística, previsibilidade de custos e crédito para produção.' },
  { id: 'environmental-movements', name: 'Movimentos socioambientais', category: 'Meio ambiente', influence: 48, orientationAdjustment: { left: 4, right: -2 }, sectorIds: ['environment', 'infrastructure'], beneficiaryClass: 'middle-class', interests: ['Proteção ambiental', 'Prevenção de desastres', 'Transparência'], demand: 'Cobrar compromissos ambientais verificáveis e prevenção de desastres.' },
  { id: 'health-communities', name: 'Conselhos de saúde e comunidades', category: 'Serviços essenciais', influence: 61, orientationAdjustment: { left: 3, right: 0 }, sectorIds: ['health', 'social-housing'], beneficiaryClass: 'low-income', interests: ['Acesso à saúde', 'Atendimento local', 'Assistência social'], demand: 'Cobrar acesso aos serviços essenciais e metas de atendimento.' },
]

export const societyRules = {
  dialogueActionPoints: 1,
  dialoguePoliticalCapital: 2,
  dialogueAdministrativeCapacity: 1,
  agreementActionPoints: 1,
  agreementPoliticalCapital: 3,
  agreementAdministrativeCapacity: 1,
  agreementBudget: 15,
  protestThreshold: 70,
  monthlyHistoryLimit: 30,
} as const
