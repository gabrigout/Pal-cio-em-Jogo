import type { NarrativeDecision } from '../state/types'

export const additionalDecisions: NarrativeDecision[] = [
  {
    id: 'freight-costs', title: 'O frete da planilha', category: 'economia', weight: 5,
    prompt: 'O custo logístico subiu e cada setor trouxe uma planilha com uma causa diferente.',
    condition: { indicator: 'economicOutlook', operator: 'atMost', value: 58 },
    options: [
      { id: 'map-bottlenecks', label: 'Mapear gargalos', description: 'Pedir diagnóstico técnico antes de priorizar corredores.', icon: 'clipboard', effects: { administrativeCapacity: 1, economicOutlook: 1, presidentialApproval: -1 }, resultText: 'O diagnóstico orientou a equipe; o público esperava resposta mais rápida.' },
      { id: 'call-carriers', label: 'Chamar setores logísticos', description: 'Negociar compromissos voluntários e publicar os prazos.', icon: 'users', effects: { economicOutlook: 2, politicalCapital: -1 }, uncertainConsequences: ['A adesão dos setores é incerta'], resultText: 'A mesa produziu compromissos, mas exigiu capital político para mantê-los.' },
    ],
  },
  {
    id: 'committee-calendar', title: 'A agenda da comissão', category: 'Congresso', weight: 6,
    prompt: 'A comissão quer reservar espaço para a pauta do governo, sem abrir mão de sua própria agenda.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 52 },
    options: [
      { id: 'negotiate-time', label: 'Negociar espaço na pauta', description: 'Conversar com lideranças; a decisão sobre a agenda continua no Legislativo.', icon: 'landmark', effects: { congressSupport: 2, politicalCapital: -1 }, resultText: 'Lideranças abriram espaço para negociar, sem compromisso de votação.' },
      { id: 'offer-technical-team', label: 'Oferecer equipe técnica', description: 'Disponibilizar dados para a comissão deliberar com autonomia.', icon: 'briefcase', effects: { administrativeCapacity: -1, publicTrust: 1, congressSupport: 1 }, resultText: 'A equipe prestou informações; a comissão manteve sua independência.' },
    ],
  },
  {
    id: 'coalition-dinner', title: 'Jantar de coalizão', category: 'Congresso', weight: 4,
    prompt: 'Os líderes aceitam conversar, mas ninguém concorda sobre a ordem dos pronunciamentos.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 50 },
    options: [
      { id: 'small-table', label: 'Mesa menor', description: 'Ouvir poucas lideranças para fechar uma pauta realista.', icon: 'users', effects: { congressSupport: 2, publicTrust: -1 }, resultText: 'A mesa menor agilizou a conversa, embora a ausência de outros grupos gerasse cobrança.' },
      { id: 'open-invitation', label: 'Convite aberto', description: 'Ampliar a escuta e aceitar mais divergências públicas.', icon: 'message', effects: { congressSupport: 1, polarization: -1, administrativeCapacity: -1 }, resultText: 'Mais grupos participaram; o consenso demorou, mas a temperatura baixou.' },
    ],
  },
  {
    id: 'committee-amendments', title: 'A emenda da emenda', category: 'Congresso', weight: 4,
    prompt: 'A proposta recebeu sugestões de bancadas que ainda precisam ser negociadas e deliberadas.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 47 },
    options: [
      { id: 'technical-round', label: 'Rodada técnica', description: 'Comparar sugestões com a equipe antes de voltar aos líderes.', icon: 'clipboard', effects: { administrativeCapacity: -1, congressSupport: 2 }, resultText: 'A rodada organizou as sugestões, mas consumiu tempo de equipe.' },
      { id: 'preserve-draft', label: 'Defender o texto-base', description: 'Explicar as prioridades do governo sem prometer aprovação.', icon: 'landmark', effects: { presidentialApproval: 1, congressSupport: -1, politicalCapital: 1 }, uncertainConsequences: ['Pode gerar reação de bancadas'], resultText: 'A defesa mobilizou apoiadores, mas endureceu parte da negociação.' },
    ],
  },
  {
    id: 'judicial-calendar', title: 'Calendário institucional', category: 'Judiciário', weight: 3,
    prompt: 'Uma decisão judicial está sendo aguardada por todos; o Executivo só pode organizar seus próprios prazos.',
    condition: { indicator: 'judiciaryRelation', operator: 'atMost', value: 54 },
    options: [
      { id: 'prepare-compliance', label: 'Preparar cumprimento', description: 'Organizar cenários para cumprir decisões pelos canais legais.', icon: 'scale', effects: { judiciaryRelation: 1, administrativeCapacity: -1, institutionalStability: 1 }, resultText: 'A administração se preparou sem antecipar o conteúdo de decisão judicial.' },
      { id: 'explain-process', label: 'Explicar o rito', description: 'Informar a população sobre competências e prazos institucionais.', icon: 'newspaper', effects: { publicTrust: 1, polarization: -1 }, resultText: 'A explicação reduziu especulações e preservou a autonomia dos poderes.' },
    ],
  },
  {
    id: 'institutional-note', title: 'A nota das competências', category: 'Judiciário', weight: 3,
    prompt: 'Uma nota oficial precisa explicar o papel do governo sem sugerir influência sobre magistrados.',
    condition: { indicator: 'institutionalStability', operator: 'atMost', value: 66 },
    options: [
      { id: 'joint-facts', label: 'Publicar fatos e limites', description: 'Separar providências do Executivo de decisões que cabem ao Judiciário.', icon: 'scale', effects: { institutionalStability: 2, publicTrust: 1, politicalCapital: -1 }, resultText: 'A nota esclareceu competências e reduziu ruído, com custo de articulação.' },
      { id: 'technical-channel', label: 'Abrir canal técnico', description: 'Usar interlocução formal sem discutir o mérito de processos.', icon: 'message', effects: { judiciaryRelation: 2, executiveSupport: -1 }, resultText: 'O canal facilitou comunicação institucional sem interferência em julgamentos.' },
    ],
  },
  {
    id: 'press-briefing', title: 'Coletiva de perguntas longas', category: 'imprensa', weight: 5,
    prompt: 'Jornalistas pedem respostas sobre a economia; cada resposta vira uma manchete diferente.',
    condition: { indicator: 'presidentialApproval', operator: 'atMost', value: 54 },
    options: [
      { id: 'publish-figures', label: 'Mostrar números', description: 'Apresentar indicadores e limites com uma ficha de dados pública.', icon: 'newspaper', effects: { publicTrust: 2, presidentialApproval: -1, administrativeCapacity: -1 }, resultText: 'Os dados aumentaram a confiança na transparência, mas a explicação foi pouco popular.' },
      { id: 'short-answers', label: 'Responder em tópicos', description: 'Fazer uma coletiva breve e manter espaço para perguntas posteriores.', icon: 'message', effects: { presidentialApproval: 1, publicTrust: -1 }, uncertainConsequences: ['Pode gerar novas perguntas'], resultText: 'A fala foi direta, mas deixou perguntas sem resposta imediata.' },
    ],
  },
  {
    id: 'headline-cycle', title: 'A manchete das sete', category: 'imprensa', weight: 4,
    prompt: 'Uma manchete resumiu uma medida complexa a uma frase que ninguém da equipe reconhece.',
    condition: { indicator: 'publicTrust', operator: 'atMost', value: 54 },
    options: [
      { id: 'release-context', label: 'Publicar contexto', description: 'Disponibilizar documentos, dados e porta-vozes técnicos.', icon: 'newspaper', effects: { publicTrust: 2, administrativeCapacity: -1 }, resultText: 'O contexto circulou com mais clareza e exigiu trabalho adicional da equipe.' },
      { id: 'let-cycle-pass', label: 'Aguardar o próximo ciclo', description: 'Evitar amplificar a manchete e acompanhar a repercussão.', icon: 'cloud', effects: { politicalCapital: 1, presidentialApproval: -1 }, resultText: 'O governo preservou capital político, mas a aprovação sentiu a espera.' },
    ],
  },
  {
    id: 'ministerial-portfolio', title: 'A pasta e a planilha', category: 'ministros', weight: 4,
    prompt: 'Uma equipe ministerial quer ampliar a meta; outra lembra que a capacidade administrativa não é infinita.',
    condition: { indicator: 'administrativeCapacity', operator: 'atMost', value: 58 },
    options: [
      { id: 'narrow-target', label: 'Reduzir a meta inicial', description: 'Concentrar execução em entregas que a equipe consegue acompanhar.', icon: 'briefcase', effects: { administrativeCapacity: 2, presidentialApproval: -1 }, resultText: 'A meta ficou executável, com menos impacto de comunicação imediata.' },
      { id: 'coordinate-teams', label: 'Compartilhar equipes', description: 'Coordenar áreas diferentes e aceitar disputa por prioridades.', icon: 'users', effects: { executiveSupport: 1, administrativeCapacity: -1, publicTrust: 1 }, resultText: 'A coordenação ampliou a entrega e aumentou a pressão sobre a equipe.' },
    ],
  },
  {
    id: 'cabinet-disagreement', title: 'O ministro e o microfone', category: 'ministros', weight: 5,
    prompt: 'Dois ministros deram declarações diferentes sobre uma prioridade do governo.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 52 },
    options: [
      { id: 'align-private', label: 'Alinhar em reunião', description: 'Reunir a equipe e publicar uma orientação comum depois.', icon: 'message', effects: { executiveSupport: 2, administrativeCapacity: -1 }, resultText: 'A reunião alinhou responsabilidades sem transformar a divergência em exposição pública.' },
      { id: 'clarify-public', label: 'Esclarecer em público', description: 'Explicar que diferentes áreas têm atribuições próprias.', icon: 'megaphone', effects: { publicTrust: 1, executiveSupport: -1, polarization: 1 }, resultText: 'A explicação deu transparência, mas a divergência ganhou mais visibilidade.' },
    ],
  },
  {
    id: 'workers-council', title: 'Conselho de escuta', category: 'grupos sociais', weight: 4,
    prompt: 'Representantes de trabalhadores pedem uma mesa para tratar do impacto de uma mudança econômica.',
    condition: { indicator: 'publicTrust', operator: 'atMost', value: 55 },
    options: [
      { id: 'open-social-table', label: 'Abrir mesa social', description: 'Ouvir entidades e deixar registradas as divergências.', icon: 'users', effects: { publicTrust: 2, polarization: -1, politicalCapital: -1 }, resultText: 'A escuta reduziu tensões, sem apagar divergências sobre a proposta.' },
      { id: 'publish-impact', label: 'Publicar análise de impacto', description: 'Apresentar dados e receber comentários por prazo definido.', icon: 'clipboard', effects: { administrativeCapacity: -1, economicOutlook: 1, publicTrust: 1 }, resultText: 'A análise ofereceu uma base comum e consumiu capacidade de trabalho.' },
    ],
  },
  {
    id: 'regional-producers', title: 'A feira dos produtores', category: 'grupos sociais', weight: 4,
    prompt: 'Produtores de diferentes regiões pedem previsibilidade; consumidores cobram preço acessível.',
    condition: { indicator: 'economicOutlook', operator: 'atMost', value: 57 },
    options: [
      { id: 'regional-listening', label: 'Ouvir por região', description: 'Reunir demandas locais antes de definir prioridades federais.', icon: 'users', effects: { publicTrust: 1, administrativeCapacity: -1, foreignRelations: 1 }, resultText: 'A escuta trouxe diferenças regionais à mesa e ampliou o trabalho de coordenação.' },
      { id: 'focus-supply', label: 'Focar no abastecimento', description: 'Priorizar informação e logística sem fixar preços por decreto.', icon: 'briefcase', effects: { economicOutlook: 2, presidentialApproval: -1 }, resultText: 'A coordenação logística melhorou a expectativa, mas não produziu alívio imediato.' },
    ],
  },
  {
    id: 'rain-response', title: 'Chuva, mapa e três sirenes', category: 'crise', weight: 7,
    prompt: 'Governos estaduais pedem coordenação enquanto os boletins mudam a cada hora.',
    condition: { indicator: 'institutionalStability', operator: 'atMost', value: 69 },
    options: [
      { id: 'federative-coordination', label: 'Coordenar com estados', description: 'Organizar apoio entre entes federativos e publicar responsabilidades.', icon: 'cloud', effects: { institutionalStability: 2, publicTrust: 1, budget: -2 }, schedule: { eventId: 'rain-follow-up', delayWeeks: 2 }, resultText: 'A coordenação começou com estados e deixou uma rodada de acompanhamento agendada.' },
      { id: 'publish-guidance', label: 'Publicar orientações', description: 'Concentrar informações úteis e manter canal para atualizações locais.', icon: 'newspaper', effects: { publicTrust: 2, administrativeCapacity: -1, presidentialApproval: -1 }, uncertainConsequences: ['A situação pode mudar rapidamente'], resultText: 'As orientações chegaram ao público; as equipes precisaram acompanhar atualizações.' },
    ],
  },
  {
    id: 'energy-supply', title: 'A previsão de energia', category: 'crise', weight: 5,
    prompt: 'Uma previsão de oferta preocupa setores produtivos, embora ainda existam cenários diferentes.',
    condition: { indicator: 'economicOutlook', operator: 'atMost', value: 53 },
    options: [
      { id: 'publish-scenarios', label: 'Publicar cenários', description: 'Explicar hipóteses e limites do monitoramento da oferta.', icon: 'cloud', effects: { publicTrust: 1, economicOutlook: 1, polarization: -1 }, resultText: 'A comunicação reduziu especulações sem prometer um cenário único.' },
      { id: 'coordinate-suppliers', label: 'Coordenar fornecedores', description: 'Reunir agentes do setor para compartilhar informações de oferta.', icon: 'briefcase', effects: { economicOutlook: 2, politicalCapital: -1 }, resultText: 'O diálogo trouxe informações melhores e cobrou articulação política.' },
    ],
  },
  {
    id: 'opposition-hearing', title: 'Convite da oposição', category: 'Congresso', weight: 3,
    prompt: 'Parlamentares da oposição pedem dados para uma audiência pública sobre a execução de uma política.',
    condition: { indicator: 'congressSupport', operator: 'atMost', value: 55 },
    options: [
      { id: 'attend-hearing', label: 'Enviar equipe técnica', description: 'Comparecer com dados e responder dentro das competências do Executivo.', icon: 'landmark', effects: { publicTrust: 1, administrativeCapacity: -1, congressSupport: 1 }, resultText: 'A equipe prestou informações e a audiência manteve seu papel fiscalizador.' },
      { id: 'publish-before', label: 'Publicar dados antes', description: 'Abrir os documentos e manter a participação da equipe na audiência.', icon: 'newspaper', effects: { publicTrust: 2, politicalCapital: -1 }, resultText: 'Os dados foram publicados; a interlocução política ficou mais exigente.' },
    ],
  },
  {
    id: 'public-contracting', title: 'O edital em linguagem humana', category: 'administração', weight: 3,
    prompt: 'Uma contratação importante tem documentos longos e perguntas simples sem resposta curta.',
    condition: { indicator: 'publicIntegrity', operator: 'atMost', value: 62 },
    options: [
      { id: 'simplify-documents', label: 'Criar guia público', description: 'Explicar etapas e critérios sem alterar as regras do processo.', icon: 'clipboard', effects: { publicTrust: 1, administrativeCapacity: -1, publicIntegrity: 1 }, resultText: 'O guia facilitou a consulta e a equipe reforçou a documentação.' },
      { id: 'technical-review', label: 'Fazer revisão técnica', description: 'Revisar clareza documental antes de ampliar a divulgação.', icon: 'briefcase', effects: { publicIntegrity: 2, administrativeCapacity: -1, presidentialApproval: -1 }, resultText: 'A revisão melhorou a clareza dos controles e levou mais tempo.' },
    ],
  },
  {
    id: 'official-barbecue', title: 'A ata do churrasco', category: 'sátira', weight: 3,
    prompt: 'O comitê do churrasco oficial não consegue decidir se a ata registra a lista de convidados ou a de acompanhamentos.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 56 },
    options: [
      { id: 'publish-menu', label: 'Publicar o cardápio', description: 'Tornar público o que foi servido e encerrar a discussão culinária.', icon: 'newspaper', effects: { publicTrust: 1, presidentialApproval: -1, polarization: -1 }, resultText: 'A discussão perdeu temperatura, embora o cardápio não fosse a prioridade da semana.' },
      { id: 'appoint-minutes-team', label: 'Criar equipe de ata', description: 'Registrar pauta e encaminhamentos em documento de uma página.', icon: 'clipboard', effects: { executiveSupport: 1, administrativeCapacity: -1 }, resultText: 'A equipe produziu uma ata concisa e pediu um modelo para a próxima reunião.' },
    ],
  },
  {
    id: 'picanha-dispatch', title: 'O despacho do Sr. Picanha', category: 'sátira', weight: 3,
    prompt: 'O Sr. Picanha reaparece com um mapa desenhado num guardanapo e uma pergunta sobre a pauta da semana.',
    condition: { indicator: 'publicTrust', operator: 'atLeast', value: 48 },
    options: [
      { id: 'frame-map', label: 'Transformar em mapa', description: 'Pedir à equipe que converta o guardanapo em prioridades verificáveis.', icon: 'clipboard', effects: { administrativeCapacity: 1, presidentialApproval: 1 }, uncertainConsequences: ['A escala do mapa pode estar errada'], resultText: 'A equipe extraiu prioridades do guardanapo, ainda com algumas lacunas.' },
      { id: 'serve-coffee', label: 'Oferecer café e contexto', description: 'Ouvir a história completa antes de incluir o mapa na agenda.', icon: 'message', effects: { publicTrust: 1, politicalCapital: -1 }, resultText: 'A conversa trouxe contexto, mas não fechou todas as prioridades.' },
    ],
  },
  {
    id: 'budget-spreadsheet', title: 'A planilha finalíssima', category: 'economia', weight: 5,
    prompt: 'A planilha de despesas tem uma aba chamada “final”, outra “final 2” e uma terceira que ninguém admite ter criado.',
    condition: { indicator: 'budget', operator: 'atMost', value: 76 },
    options: [
      { id: 'consolidate-sheets', label: 'Consolidar números', description: 'Conferir valores antes de anunciar compromissos de gasto.', icon: 'coins', effects: { publicIntegrity: 1, administrativeCapacity: -1, politicalCapital: 1 }, resultText: 'A equipe consolidou as versões e ganhou clareza sobre o orçamento disponível.' },
      { id: 'protect-reserve', label: 'Preservar reserva', description: 'Adiar compromissos novos até fechar o mês.', icon: 'shield', effects: { budget: 2, presidentialApproval: -1, economicOutlook: 1 }, resultText: 'A reserva foi preservada e a expectativa econômica melhorou; o anúncio perdeu apelo popular.' },
    ],
  },
  {
    id: 'press-room-coffee', title: 'Café na sala de imprensa', category: 'imprensa', weight: 3,
    prompt: 'A equipe de imprensa pede um encontro informal; os jornalistas pedem que o informal tenha pauta pública.',
    condition: { indicator: 'foreignRelations', operator: 'atLeast', value: 50 },
    options: [
      { id: 'open-briefing', label: 'Fazer briefing aberto', description: 'Compartilhar informações não sigilosas e registrar perguntas.', icon: 'newspaper', effects: { publicTrust: 2, administrativeCapacity: -1 }, resultText: 'O briefing ampliou acesso e exigiu preparação adicional da equipe.' },
      { id: 'publish-faq', label: 'Publicar perguntas frequentes', description: 'Responder dúvidas recorrentes em documento atualizado.', icon: 'message', effects: { administrativeCapacity: 1, presidentialApproval: -1 }, resultText: 'O documento organizou respostas, com menos impacto imediato.' },
    ],
  },
  {
    id: 'school-calendar', title: 'O calendário das aulas', category: 'grupos sociais', weight: 4,
    prompt: 'Gestores e famílias pedem previsibilidade para o calendário de atendimento escolar.',
    condition: { indicator: 'administrativeCapacity', operator: 'atMost', value: 60 },
    options: [
      { id: 'hear-local-managers', label: 'Ouvir gestores locais', description: 'Reunir relatos antes de definir apoio administrativo.', icon: 'users', effects: { publicTrust: 1, administrativeCapacity: -1, executiveSupport: 1 }, resultText: 'A escuta identificou necessidades locais e demandou coordenação adicional.' },
      { id: 'publish-timeline', label: 'Publicar cronograma', description: 'Divulgar etapas e responsáveis para acompanhamento público.', icon: 'clipboard', effects: { publicTrust: 2, politicalCapital: -1 }, resultText: 'O cronograma aumentou previsibilidade e exigiu negociação entre áreas.' },
    ],
  },
  {
    id: 'water-use', title: 'A reunião sobre a água', category: 'crise', weight: 5,
    prompt: 'Regiões diferentes pedem respostas para a oferta de água; os dados chegam em formatos que não conversam.',
    condition: { indicator: 'institutionalStability', operator: 'atMost', value: 68 },
    options: [
      { id: 'unify-monitoring', label: 'Unificar monitoramento', description: 'Coordenar dados e responsabilidades entre os órgãos competentes.', icon: 'cloud', effects: { administrativeCapacity: -1, institutionalStability: 2, publicTrust: 1 }, schedule: { eventId: 'water-monitoring-review', delayWeeks: 2 }, resultText: 'Os órgãos alinharam o monitoramento; uma revisão de dados ficou agendada.' },
      { id: 'regional-updates', label: 'Publicar boletins regionais', description: 'Manter informações locais atualizadas sem prometer uniformidade.', icon: 'newspaper', effects: { publicTrust: 2, polarization: -1 }, uncertainConsequences: ['Os boletins podem divergir entre regiões'], resultText: 'A informação local chegou mais rápido, com diferenças de formato entre regiões.' },
    ],
  },
  {
    id: 'governor-call', title: 'A chamada dos governadores', category: 'relações federativas', weight: 5,
    prompt: 'Governadores pedem uma conversa conjunta, mas cada um quer falar primeiro e por mais tempo.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 54 },
    options: [
      { id: 'shared-agenda', label: 'Propor pauta comum', description: 'Limitar o encontro a prioridades e responsabilidades partilhadas.', icon: 'users', effects: { executiveSupport: 1, institutionalStability: 1, politicalCapital: -1 }, resultText: 'A pauta comum reduziu dispersão e consumiu capital de coordenação.' },
      { id: 'bilateral-rounds', label: 'Fazer rodadas bilaterais', description: 'Ouvir demandas específicas antes de uma reunião coletiva.', icon: 'message', effects: { publicTrust: 1, administrativeCapacity: -1, executiveSupport: 1 }, resultText: 'As conversas esclareceram diferenças, com mais trabalho para organizar os retornos.' },
    ],
  },
  {
    id: 'public-transport', title: 'O ponto de ônibus sem placa', category: 'grupos sociais', weight: 4,
    prompt: 'Usuários relatam mudanças no transporte e as informações oficiais estão espalhadas por quatro canais.',
    condition: { indicator: 'publicTrust', operator: 'atMost', value: 56 },
    options: [
      { id: 'unify-information', label: 'Unificar informações', description: 'Organizar canais de consulta e responsabilidades de cada órgão.', icon: 'message', effects: { publicTrust: 2, administrativeCapacity: -1 }, resultText: 'A consulta ficou mais simples e as áreas precisaram reorganizar informações.' },
      { id: 'hear-riders', label: 'Ouvir usuários', description: 'Abrir uma rodada de escuta sem prometer mudanças imediatas.', icon: 'users', effects: { publicTrust: 1, polarization: -1, politicalCapital: -1 }, resultText: 'A escuta trouxe relatos úteis e expectativas que ainda exigem negociação.' },
    ],
  },
  {
    id: 'foreign-delegation', title: 'A delegação e o fuso', category: 'relações exteriores', weight: 3,
    prompt: 'Uma delegação estrangeira propõe cooperação técnica; a equipe está tentando encaixar três fusos na mesma agenda.',
    condition: { indicator: 'foreignRelations', operator: 'atMost', value: 65 },
    options: [
      { id: 'technical-agenda', label: 'Abrir agenda técnica', description: 'Explorar cooperação sem assumir compromissos financeiros ainda não avaliados.', icon: 'briefcase', effects: { foreignRelations: 2, administrativeCapacity: -1 }, resultText: 'A agenda técnica avançou e ficou condicionada a avaliação interna.' },
      { id: 'send-briefing', label: 'Enviar nota de prioridades', description: 'Apresentar interesses nacionais e aguardar uma proposta detalhada.', icon: 'newspaper', effects: { foreignRelations: 1, politicalCapital: 1 }, resultText: 'A nota organizou prioridades e preservou margem de negociação.' },
    ],
  },
  {
    id: 'cabinet-rotation', title: 'A cadeira musical do gabinete', category: 'ministros', weight: 3,
    prompt: 'Uma troca de equipes é sugerida para acelerar entregas; os ministérios pedem tempo para transição.',
    condition: { indicator: 'executiveSupport', operator: 'atMost', value: 50 },
    options: [
      { id: 'staged-transition', label: 'Transição por etapas', description: 'Preservar serviços enquanto a equipe atualiza prioridades.', icon: 'briefcase', effects: { administrativeCapacity: 1, executiveSupport: 1, presidentialApproval: -1 }, resultText: 'A transição preservou continuidade, sem produzir uma virada instantânea.' },
      { id: 'review-deliverables', label: 'Revisar entregas', description: 'Definir metas curtas antes de decidir mudanças de equipe.', icon: 'clipboard', effects: { administrativeCapacity: 2, politicalCapital: -1 }, resultText: 'As metas esclareceram gargalos, e a equipe pediu uma rodada de negociação.' },
    ],
  },
]