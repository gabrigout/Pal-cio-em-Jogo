import type { NarrativeDecision } from '../state/types'

export const weeklyDecisions: NarrativeDecision[] = [
  {
    id: 'economic-priority',
    title: 'O primeiro recado da economia',
    prompt: 'A equipe pede uma prioridade clara para a semana: previsibilidade ou alívio imediato?',
    condition: { indicator: 'economicOutlook', operator: 'atMost', value: 54 },
    weight: 5,
    category: 'economia',
    options: [
      { id: 'predictability', label: 'Publicar calendário', description: 'Segurar mudanças e publicar um calendário de execução.', icon: 'clipboard', effects: { economicOutlook: 2, publicTrust: 1, politicalCapital: -1 }, resultText: 'O calendário reduziu dúvidas, mas exigiu capital político para alinhar a equipe.' },
      { id: 'relief', label: 'Anunciar alívio', description: 'Concentrar a comunicação em medidas de impacto rápido.', icon: 'coins', effects: { presidentialApproval: 2, economicOutlook: -1 }, uncertainConsequences: ['Pode gerar reação do mercado'], resultText: 'O anúncio teve retorno popular rápido e deixou menos espaço para previsibilidade.' },
      { id: 'technical', label: 'Ouvir a equipe técnica', description: 'Dar espaço para os técnicos alinharem cenários antes do anúncio.', icon: 'briefcase', effects: { administrativeCapacity: 2, presidentialApproval: -1 }, resultText: 'A equipe alinhou cenários e ganhou capacidade de execução; o anúncio demorou.' },
    ],
  },
  {
    id: 'congressional-coffee',
    title: 'Café com pauta, sem pauta e com ata',
    prompt: 'Lideranças querem saber o que entra na conversa antes de confirmar presença.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 49 },
    weight: 6,
    category: 'Congresso',
    options: [
      { id: 'small-agenda', label: 'Pauta curta', description: 'Buscar acordo em dois pontos de baixa resistência.', icon: 'landmark', effects: { congressSupport: 2, politicalCapital: -1 }, resultText: 'A conversa curta melhorou a disposição de negociar, com custo de capital político.' },
      { id: 'public-pressure', label: 'Prioridades em público', description: 'Mobilizar apoio público para dar contexto à negociação.', icon: 'megaphone', effects: { presidentialApproval: 2, polarization: 1, congressSupport: -1 }, uncertainConsequences: ['Pode gerar reação de lideranças'], resultText: 'A base respondeu ao chamado, mas parte das lideranças se afastou.' },
    ],
  },
  {
    id: 'trust-response',
    title: 'A nota oficial que ninguém pediu',
    prompt: 'A confiança está oscilando e três versões da nota circulam pelos corredores.',
    condition: { indicator: 'publicTrust', operator: 'atMost', value: 52 },
    weight: 5,
    category: 'imprensa',
    options: [
      { id: 'publish-data', label: 'Abrir os dados', description: 'Publicar informações verificáveis e indicar responsáveis por cada prazo.', icon: 'newspaper', effects: { publicTrust: 3, administrativeCapacity: -1 }, resultText: 'Os dados deram transparência, consumindo tempo de execução da equipe.' },
      { id: 'single-voice', label: 'Unificar a comunicação', description: 'Reduzir desencontros com uma única porta-voz.', icon: 'message', effects: { executiveSupport: 1, publicTrust: 1 }, resultText: 'A mensagem ficou mais consistente e a coordenação interna melhorou.' },
      { id: 'wait-review', label: 'Revisar antes de publicar', description: 'Evitar contradições, mesmo que a resposta demore.', icon: 'clipboard', effects: { publicTrust: -1, institutionalStability: 1 }, resultText: 'A revisão evitou ruído institucional, mas a espera reduziu a confiança.' },
    ],
  },
  {
    id: 'administrative-queue',
    title: 'A fila da fila prioritária',
    prompt: 'A administração relata que os pedidos urgentes também estão aguardando triagem.',
    condition: { indicator: 'administrativeCapacity', operator: 'atMost', value: 55 },
    weight: 4,
    category: 'administração',
    options: [
      { id: 'clear-backlog', label: 'Reforçar o atendimento', description: 'Realocar equipes para resolver demandas represadas antes de abrir novas frentes.', icon: 'users', effects: { administrativeCapacity: 3, publicTrust: 1 }, resultText: 'A fila andou e a confiança melhorou; outras frentes ficaram com menos equipe.' },
      { id: 'protect-projects', label: 'Manter os projetos', description: 'Evitar interrupções e aceitar uma espera maior no atendimento.', icon: 'briefcase', effects: { administrativeCapacity: -1, economicOutlook: 1 }, resultText: 'Os projetos preservaram ritmo, mas o atendimento perdeu capacidade no curto prazo.' },
    ],
  },
  {
    id: 'institutional-channel',
    title: 'Um canal, várias competências',
    prompt: 'O diálogo institucional pede clareza de limites e ninguém quer ser confundido com o outro poder.',
    condition: { indicator: 'judiciaryRelation', operator: 'atMost', value: 55 },
    weight: 4,
    category: 'Judiciário',
    options: [
      { id: 'technical-dialogue', label: 'Abrir diálogo técnico', description: 'Manter canais formais sem antecipar decisões que cabem ao Judiciário.', icon: 'scale', effects: { judiciaryRelation: 2, institutionalStability: 1 }, resultText: 'A interlocução institucional melhorou sem interferir na autonomia judicial.' },
      { id: 'public-boundaries', label: 'Explicar os limites', description: 'Reafirmar as competências institucionais com linguagem acessível.', icon: 'megaphone', effects: { publicTrust: 1, judiciaryRelation: 1, polarization: -1 }, resultText: 'A explicação reduziu ruído público e abriu espaço para diálogo respeitoso.' },
    ],
  },
  {
    id: 'cabinet-alignment',
    title: 'A reunião que virou reunião preparatória',
    prompt: 'A coordenação interna precisa decidir entre fechar prioridades ou ampliar a mesa.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 55 },
    weight: 4,
    category: 'ministros',
    options: [
      { id: 'set-priorities', label: 'Fechar três prioridades', description: 'Criar uma agenda curta para orientar a equipe de governo.', icon: 'clipboard', effects: { executiveSupport: 2, administrativeCapacity: 1 }, resultText: 'A equipe saiu com prioridades comuns e maior capacidade de coordenação.' },
      { id: 'expand-table', label: 'Ampliar a mesa', description: 'Convidar mais áreas para escuta, aceitando uma decisão mais lenta.', icon: 'users', effects: { executiveSupport: 1, publicTrust: 1, administrativeCapacity: -1 }, resultText: 'Mais áreas participaram; a escuta cresceu e o ritmo administrativo caiu.' },
    ],
  },

  {
    id: 'amendment-viral-backlash',
    title: 'A emenda que virou trend',
    prompt: 'Uma emenda parlamentar do governo viralizou. Um influenciador político acusa o Planalto de privilegiar aliados, enquanto prefeitos defendem o recurso para serviços locais.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 55 }, weight: 8, category: 'opinião pública',
    publicFigure: { name: 'Nico Gadelha', role: 'Influenciador político fictício', description: 'Personagem satírico de um deputado-influenciador que transforma decisões do Congresso em vídeos virais.' },
    options: [
      { id: 'publish-amendment-details', label: 'Abrir os dados da emenda', description: 'Publicar valor, destino, critérios e andamento da execução para reduzir suspeitas.', icon: 'newspaper', effects: { publicTrust: 2, publicIntegrity: 1, politicalCapital: -1 }, resultText: 'A transparência ajudou a explicar o gasto, mas a oposição continuou questionando a prioridade.' },
      { id: 'challenge-influencer', label: 'Responder publicamente', description: 'Contestar a crítica em vídeo e defender a negociação política.', icon: 'megaphone', effects: { presidentialApproval: 1, polarization: 2, publicTrust: -1, politicalCapital: 1 }, uncertainConsequences: ['A repercussão nas redes pode ampliar a controvérsia'], resultText: 'A resposta animou apoiadores, mas aumentou a polarização e manteve a emenda no centro do debate.', schedule: { eventId: 'viral-amendment-followup', delayWeeks: 1 } },
    ],
  },
  {
    id: 'six-by-one-pressure',
    title: 'A semana de trabalho virou debate nacional',
    prompt: 'Uma proposta para reduzir a escala 6x1 ganha força nas redes. Trabalhadores cobram mudança; setores empresariais alertam para custos, preços e necessidade de adaptação.',
    condition: { indicator: 'presidentialApproval', operator: 'atMost', value: 58 }, weight: 7, category: 'trabalho e economia',
    publicFigure: { name: 'Bia do Ponto', role: 'Criadora de conteúdo trabalhista fictícia', description: 'Influenciadora satírica que dá voz a relatos de trabalhadores e pressiona o governo por mudanças.' },
    options: [
      { id: 'negotiate-transition', label: 'Negociar transição gradual', description: 'Abrir mesa com trabalhadores, pequenas empresas e especialistas para estimar custos e prazos.', icon: 'users', effects: { publicTrust: 2, presidentialApproval: 1, politicalCapital: -2, administrativeCapacity: -1 }, resultText: 'A negociação reduziu a tensão imediata, mas criou custos de coordenação e não satisfez quem queria mudança imediata.' },
      { id: 'announce-immediate-change', label: 'Defender mudança imediata', description: 'Apoiar uma transição rápida, assumindo disputa política e pressão por compensações às empresas.', icon: 'megaphone', effects: { presidentialApproval: 2, polarization: 2, economicOutlook: -1, politicalCapital: -1 }, uncertainConsequences: ['Preços, contratações e produtividade podem reagir de formas diferentes'], resultText: 'A proposta agradou parte dos trabalhadores, enquanto empresas pediram prazo e medidas de compensação.', schedule: { eventId: 'workweek-cost-followup', delayWeeks: 1 } },
    ],
  },
  {
    id: 'fact-check-viral-claim',
    title: 'O vídeo de 30 segundos e a crise de 3 dias',
    prompt: 'Um recorte de fala presidencial circula sem contexto. Jornalistas, perfis de opinião e parlamentares disputam a narrativa antes de a equipe conseguir publicar a íntegra.',
    condition: { indicator: 'polarization', operator: 'atLeast', value: 42 }, weight: 6, category: 'comunicação pública',
    publicFigure: { name: 'Lara Nogueira', role: 'Jornalista política fictícia', description: 'Repórter satírica que cobra contexto, documentos e respostas verificáveis do governo.' },
    options: [
      { id: 'publish-full-context', label: 'Publicar íntegra e documentos', description: 'Divulgar o vídeo completo, a transcrição e os dados usados na fala.', icon: 'newspaper', effects: { publicTrust: 2, publicIntegrity: 1, presidentialApproval: -1 }, resultText: 'A íntegra esclareceu parte do caso, mas o recorte continuou circulando e a correção teve menos alcance.' },
      { id: 'attack-critics', label: 'Atacar quem compartilhou', description: 'Responder com confronto, tentando mobilizar a própria base.', icon: 'megaphone', effects: { polarization: 3, presidentialApproval: 1, publicTrust: -2 }, resultText: 'A base reagiu bem, mas jornalistas e grupos de oposição ampliaram a cobrança por transparência.' },
    ],
  },


  {
    id: 'court-congress-showdown',
    title: 'O Congresso ameaça comprar uma briga com o Supremo',
    prompt: 'Líderes recém-eleitos prometem endurecer contra decisões do Judiciário. A base do governo quer apoio legislativo, mas juristas alertam para o risco de transformar uma disputa institucional em crise.',
    condition: { indicator: 'institutionalStability', operator: 'atMost', value: 73 }, weight: 5, category: 'crise institucional',
    publicFigure: { name: 'Rogério do Plenário', role: 'Senador fictício', description: 'Personagem satírico de um articulador parlamentar que usa embates entre Poderes para mobilizar sua base.' },
    options: [
      { id: 'defend-institutional-dialogue', label: 'Defender diálogo entre os Poderes', description: 'Reafirmar competências constitucionais e abrir uma mesa institucional.', icon: 'scale', effects: { institutionalStability: 2, judiciaryRelation: 2, politicalCapital: -2, presidentialApproval: -1 }, resultText: 'A postura reduziu a tensão institucional, mas desagradou quem esperava confronto.' },
      { id: 'seek-legislative-confrontation', label: 'Apoiar a pressão do Congresso', description: 'Tentar transformar o conflito em moeda de negociação com a base parlamentar.', icon: 'landmark', effects: { congressSupport: 2, polarization: 2, institutionalStability: -3, judiciaryRelation: -2 }, resultText: 'A base legislativa se aproximou, mas a crise entre instituições ganhou força.', schedule: { eventId: 'institutional-crisis-followup', delayWeeks: 1 } },
    ],
  },
  {
    id: 'ai-campaign-chaos',
    title: 'A inteligência artificial entrou na campanha',
    prompt: 'Um vídeo e uma imagem gerados por IA circulam como se fossem registros reais. O conteúdo ganha milhares de compartilhamentos antes de a checagem ficar pronta.',
    condition: { indicator: 'polarization', operator: 'atLeast', value: 42 }, weight: 6, category: 'redes e eleições',
    publicFigure: { name: 'Pablo Marçalino', role: 'Influenciador e candidato fictício', description: 'Personagem satírico de um comunicador que transforma alcance digital e vídeos curtos em poder político.' },
    options: [
      { id: 'publish-verification', label: 'Publicar checagem e material original', description: 'Divulgar a origem do arquivo, os sinais de manipulação e uma versão verificável.', icon: 'newspaper', effects: { publicTrust: 2, publicIntegrity: 2, administrativeCapacity: -1 }, resultText: 'A checagem forneceu evidências, mas o conteúdo original continuou circulando em grupos fechados.' },
      { id: 'demand-platform-transparency', label: 'Cobrar transparência da plataforma', description: 'Solicitar explicações sobre alcance, anúncios e rotulagem de conteúdo sintético.', icon: 'message', effects: { publicIntegrity: 1, foreignRelations: -1, politicalCapital: -1, polarization: -1 }, resultText: 'A cobrança abriu uma frente de fiscalização, com resposta lenta e disputa sobre os limites da regulação.' },
    ],
  },

]