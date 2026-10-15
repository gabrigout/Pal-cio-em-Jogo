import type { NarrativeDecision } from '../state/types'

export const executiveDecisions: NarrativeDecision[] = [
  {
    id: 'minister-controversy',
    title: 'A entrevista recortada do ministro',
    prompt: 'Um trecho de entrevista de uma autoridade fictícia circula fora de contexto. A apuração sobre o episódio ainda não concluiu nada.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 100 },
    weight: 3,
    category: 'ministros',
    options: [
      { id: 'controversy-dismiss', label: 'Exonerar o ministro', description: 'Abrir a vaga e assumir a reação do partido, da base e da imprensa. Custa 1 PA e 4 de capital político.', icon: 'briefcase', effects: {}, executiveEffect: { kind: 'dismiss', ministryId: 'infrastructure' }, resultText: 'A exoneração foi uma decisão política; a apuração do episódio continua independente.' },
      { id: 'controversy-defend', label: 'Defender e pedir esclarecimentos', description: 'Dar espaço para uma resposta pública sem declarar o caso encerrado.', icon: 'message', effects: { executiveSupport: 1, publicTrust: -1 }, executiveEffect: { kind: 'defend', ministryId: 'infrastructure' }, resultText: 'O governo manifestou apoio à equipe, sem tratar a investigação como prova de culpa ou inocência.' },
      { id: 'controversy-wait', label: 'Aguardar a apuração', description: 'Evitar prejulgamento e manter a rotina administrativa sob acompanhamento.', icon: 'scale', effects: { publicTrust: 1, executiveSupport: -1 }, executiveEffect: { kind: 'wait', ministryId: 'infrastructure' }, resultText: 'A apuração segue em curso e não equivale a uma conclusão sobre responsabilidade.' },
    ],
  },
  {
    id: 'minister-budget-threat',
    title: 'A ameaça de saída por falta de verba',
    prompt: 'A ministra da Saúde diz que não consegue cumprir o calendário sem recomposição de recursos. O pedido precisa respeitar a disponibilidade orçamentária.',
    condition: { indicator: 'budget', operator: 'atMost', value: 100 },
    weight: 3,
    category: 'ministros',
    options: [
      { id: 'health-negotiate-budget', label: 'Negociar prioridades', description: 'Reorganizar o calendário com a equipe sem prometer verba fora do orçamento.', icon: 'coins', effects: { executiveSupport: 1, administrativeCapacity: 1 }, executiveEffect: { kind: 'negotiate-budget', ministryId: 'health' } },
      { id: 'health-mediate', label: 'Abrir mesa de mediação', description: 'Ouvir a equipe e as áreas afetadas antes de rever compromissos.', icon: 'users', effects: { politicalCapital: -1, executiveSupport: 1 }, executiveEffect: { kind: 'mediate', ministryId: 'health' } },
      { id: 'health-dismiss', label: 'Aceitar a saída', description: 'Exonerar a ministra, abrir a vaga e lidar com as reações. Custa 1 PA e 4 de capital político.', icon: 'briefcase', effects: {}, executiveEffect: { kind: 'dismiss', ministryId: 'health' } },
    ],
  },
  {
    id: 'minister-procurement-review',
    title: 'A revisão de um contrato ministerial',
    prompt: 'Uma auditoria de rotina apontou inconsistências formais em um contrato; a revisão não é uma conclusão de culpa.',
    condition: { indicator: 'publicIntegrity', operator: 'atMost', value: 100 },
    weight: 3,
    category: 'ministros',
    options: [
      { id: 'procurement-investigate', label: 'Aguardar a apuração técnica', description: 'Preservar documentos e garantir análise independente, sem antecipar conclusões.', icon: 'scale', effects: { publicIntegrity: 1, publicTrust: 1 }, executiveEffect: { kind: 'investigate', ministryId: 'planning' }, resultText: 'A apuração técnica continuará; uma inconsistência em revisão não comprova irregularidade.' },
      { id: 'procurement-defend', label: 'Defender a equipe e publicar dados', description: 'Explicar o procedimento e divulgar os documentos que possam ser publicados.', icon: 'newspaper', effects: { publicTrust: 1, executiveSupport: 1 }, executiveEffect: { kind: 'defend', ministryId: 'planning' } },
      { id: 'procurement-dismiss', label: 'Exonerar a autoridade', description: 'Exonerar o ministro sem interromper a revisão independente. Custa 1 PA e 4 de capital político.', icon: 'briefcase', effects: {}, executiveEffect: { kind: 'dismiss', ministryId: 'planning' } },
    ],
  },
  {
    id: 'minister-coalition-dispute',
    title: 'A cobrança do partido aliado',
    prompt: 'Uma liderança aliada condiciona a permanência do ministro da Agricultura a uma nova rodada de diálogo.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 100 },
    weight: 3,
    category: 'ministros',
    options: [
      { id: 'agriculture-mediate', label: 'Negociar uma agenda pública', description: 'Ouvir a bancada e registrar prioridades sem prometer cargos ou resultados legislativos.', icon: 'users', effects: { congressSupport: 1, politicalCapital: -1 }, executiveEffect: { kind: 'mediate', ministryId: 'agriculture' } },
      { id: 'agriculture-defend', label: 'Manter o ministro e explicar critérios', description: 'Reafirmar que indicações não substituem requisitos técnicos do cargo.', icon: 'clipboard', effects: { executiveSupport: 1, congressSupport: -1 }, executiveEffect: { kind: 'defend', ministryId: 'agriculture' } },
      { id: 'agriculture-dismiss', label: 'Exonerar e reabrir a indicação', description: 'A mudança não garante apoio futuro nem dispensa os requisitos do cargo. Custa 1 PA e 4 de capital político.', icon: 'briefcase', effects: {}, executiveEffect: { kind: 'dismiss', ministryId: 'agriculture' } },
    ],
  },
  {
    id: 'minister-leak-review',
    title: 'A planilha que saiu da pasta',
    prompt: 'Dados preliminares de uma revisão interna foram divulgados antes da validação. A origem e o conteúdo ainda estão sendo apurados.',
    condition: { indicator: 'publicTrust', operator: 'atMost', value: 100 },
    weight: 3,
    category: 'ministros',
    options: [
      { id: 'communications-investigate', label: 'Aguardar a verificação', description: 'Pedir preservação de registros e verificar a autenticidade antes de agir.', icon: 'scale', effects: { publicTrust: 1, institutionalStability: 1 }, executiveEffect: { kind: 'investigate', ministryId: 'communications' }, resultText: 'A verificação não presume culpa e não transforma dados preliminares em fatos confirmados.' },
      { id: 'communications-defend', label: 'Publicar o que já foi validado', description: 'Separar dados confirmados de hipóteses e explicar o que segue pendente.', icon: 'newspaper', effects: { publicTrust: 2, executiveSupport: -1 }, executiveEffect: { kind: 'defend', ministryId: 'communications' } },
      { id: 'communications-wait', label: 'Esperar a revisão interna', description: 'Evitar pronunciamentos até concluir a checagem, mantendo o canal de informação aberto.', icon: 'clipboard', effects: { publicTrust: -1, administrativeCapacity: 1 }, executiveEffect: { kind: 'wait', ministryId: 'communications' } },
    ],
  },
  {
    id: 'minister-ambition',
    title: 'A agenda própria do ministro',
    prompt: 'O ministro da Fazenda divulga prioridades antes da coordenação do gabinete; a equipe teme uma disputa interna por protagonismo.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 100 },
    weight: 3,
    category: 'ministros',
    options: [
      { id: 'finance-mediate', label: 'Reunir a equipe e alinhar a agenda', description: 'Combinar responsabilidades e preservar a autonomia técnica da pasta.', icon: 'users', effects: { executiveSupport: 2, administrativeCapacity: 1 }, executiveEffect: { kind: 'mediate', ministryId: 'finance' } },
      { id: 'finance-defend', label: 'Defender a iniciativa pública', description: 'Reconhecer o debate e pedir alinhamento pelos canais internos.', icon: 'message', effects: { executiveSupport: -1, presidentialApproval: 1 }, executiveEffect: { kind: 'defend', ministryId: 'finance' } },
      { id: 'finance-dismiss', label: 'Exonerar o ministro', description: 'Abrir nova indicação e enfrentar as reações políticas. Custa 1 PA e 4 de capital político.', icon: 'briefcase', effects: {}, executiveEffect: { kind: 'dismiss', ministryId: 'finance' } },
    ],
  },
]
