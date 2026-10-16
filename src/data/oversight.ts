import type { OversightBodyId, OversightCaseType, OversightFinding, OversightTargetKind } from '../state/types'

export const oversightRules = {
  weeklyDays: 7,
  stageWeeks: {
    received: 1,
    screening: 1,
    evidence: 2,
    analysis: 1,
  },
  requestActionPoints: 1,
  requestAdministrativeCapacity: 1,
  minimumSourceEvidenceForReferral: 68,
  administrativeFindingThreshold: 48,
  inconclusiveUpperThreshold: 67,
  automaticTriggerThreshold: 62,
  maximumCases: 80,
  maximumHistory: 60,
  maximumEvidenceRecords: 8,
  minimumAuditSourceAmount: 5,
  cpiHouseSignatureThreshold: Math.ceil(513 / 3),
  cpiSenateSignatureThreshold: Math.ceil(81 / 3),
  cpiMaximumWeeks: 12,
  responsibilityCrimeHouseQuorum: Math.ceil(513 * 2 / 3),
  responsibilityCrimeSenateQuorum: Math.ceil(81 * 2 / 3),
} as const

export interface OversightBodyDefinition {
  id: OversightBodyId
  name: string
  shortName: string
  role: string
  independence: 'independent' | 'internal-control' | 'legal-advisory' | 'legislative'
  mayInvestigate: boolean
  mayReferProsecution: boolean
}

export const oversightBodies: Record<OversightBodyId, OversightBodyDefinition> = {
  mpf: {
    id: 'mpf',
    name: 'Ministério Público Federal / PGR',
    shortName: 'MPF/PGR',
    role: 'Avalia elementos, atua dentro de suas atribuições e decide autonomamente sobre encaminhamentos e persecução. Uma referência não equivale a denúncia ou condenação.',
    independence: 'independent',
    mayInvestigate: true,
    mayReferProsecution: true,
  },
  pf: {
    id: 'pf',
    name: 'Polícia Federal',
    shortName: 'PF',
    role: 'Apura fatos de competência federal por procedimento próprio, com coleta e análise de elementos. Não recebe ordens para fabricar ou suprimir provas.',
    independence: 'independent',
    mayInvestigate: true,
    mayReferProsecution: true,
  },
  cgu: {
    id: 'cgu',
    name: 'Controladoria-Geral da União',
    shortName: 'CGU',
    role: 'Controle interno federal: auditoria, transparência, correição e avaliação de programas e atos administrativos do Executivo.',
    independence: 'internal-control',
    mayInvestigate: true,
    mayReferProsecution: true,
  },
  tcu: {
    id: 'tcu',
    name: 'Tribunal de Contas da União',
    shortName: 'TCU',
    role: 'Fiscalização contábil, financeira, orçamentária, operacional e patrimonial em auxílio ao Congresso. Um apontamento de auditoria não é condenação criminal.',
    independence: 'independent',
    mayInvestigate: true,
    mayReferProsecution: true,
  },
  agu: {
    id: 'agu',
    name: 'Advocacia-Geral da União',
    shortName: 'AGU',
    role: 'Assessora juridicamente e representa a União. Não é órgão policial nem garante vitória judicial.',
    independence: 'legal-advisory',
    mayInvestigate: false,
    mayReferProsecution: false,
  },
  tse: {
    id: 'tse',
    name: 'Justiça Eleitoral',
    shortName: 'TSE / Justiça Eleitoral',
    role: 'Julga matérias eleitorais em suas competências. O motor eleitoral completo é da Fase 5; este painel não antecipa culpa nem muda resultados eleitorais.',
    independence: 'independent',
    mayInvestigate: false,
    mayReferProsecution: false,
  },
  congress: {
    id: 'congress',
    name: 'Congresso Nacional / Comissões',
    shortName: 'Congresso / CPI',
    role: 'Fiscaliza o Executivo dentro de suas competências. Uma CPI exige fato determinado, prazo certo e apoio mínimo configurado; a instituição detalhada será completada na próxima parte.',
    independence: 'legislative',
    mayInvestigate: true,
    mayReferProsecution: true,
  },
}

export const oversightCaseTypeLabels: Record<OversightCaseType, string> = {
  'internal-audit': 'Auditoria de controle interno',
  'external-audit': 'Fiscalização de contas/execução',
  'federal-investigation': 'Apuração de possível ilícito federal',
  'prosecutorial-review': 'Análise independente do Ministério Público',
  'legal-opinion': 'Consulta jurídica não vinculante',
  'electoral-proceeding': 'Procedimento eleitoral',
}

export const oversightTargetKindLabels: Record<OversightTargetKind, string> = {
  project: 'Projeto público',
  ministry: 'Ministério',
  budget: 'Execução orçamentária',
  bill: 'Norma aprovada',
  general: 'Relato geral',
}

export const oversightFindingLabels: Record<OversightFinding, string> = {
  inconclusive: 'Elementos insuficientes para conclusão',
  'no-irregularity-found': 'Sem irregularidade constatada nesta análise',
  'administrative-recommendation': 'Recomendação de correção administrativa',
  'accounting-adjustment': 'Ajuste contábil/financeiro recomendado',
  'referred-to-mpf': 'Encaminhado para avaliação independente do MPF',
  'referred-to-pf': 'Encaminhado para apuração própria da PF',
  'electoral-referral': 'Encaminhamento à Justiça Eleitoral',
  'legal-opinion-issued': 'Parecer jurídico emitido',
}

export const oversightFindingDescriptions: Record<OversightFinding, string> = {
  inconclusive: 'Os elementos disponíveis não permitem afirmar irregularidade nem encerrar definitivamente outras linhas de apuração.',
  'no-irregularity-found': 'Nesta análise, as evidências disponíveis não sustentaram o apontamento. Isso não implica certeza universal sobre todo o assunto.',
  'administrative-recommendation': 'Foi registrada recomendação de ajuste administrativo. Recomendação não é condenação de pessoa ou prova automática de dolo.',
  'accounting-adjustment': 'Há necessidade de conciliar ou corrigir registros contábeis/financeiros. Isso, por si só, não demonstra crime.',
  'referred-to-mpf': 'Elementos foram enviados ao Ministério Público para avaliação autônoma. O encaminhamento não é denúncia formal, acusação comprovada nem condenação.',
  'referred-to-pf': 'A matéria foi encaminhada para avaliação de apuração pela Polícia Federal. A remessa não equivale a culpa ou condenação.',
  'electoral-referral': 'O tema foi encaminhado à autoridade eleitoral competente; o processo e o resultado dependem de decisão própria.',
  'legal-opinion-issued': 'A AGU emitiu análise consultiva de legalidade/risco para a União. O parecer não obriga órgão independente nem garante vitória judicial.',
}
