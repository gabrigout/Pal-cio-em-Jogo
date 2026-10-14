import { partyColors } from './campaignConfig'

export const parties = [
  {
    id: 'ptp',
    acronym: 'PTP',
    fullName: 'Partido da Taxa e da Picanha',
    ideology: 'left',
    description: 'Defende políticas sociais e mobilização popular; pode enfrentar críticas sobre gastos, impostos e execução.',
    colors: partyColors.ptp,
  },
  {
    id: 'pso',
    acronym: 'PSÓ',
    fullName: 'Partido Socialista Óbvio',
    ideology: 'left',
    description: 'Mobiliza movimentos e defende direitos, mas correntes internas podem transformar uma proposta em cinco notas e três comissões.',
    colors: partyColors.pso,
  },
  {
    id: 'pdtt',
    acronym: 'PDTT',
    fullName: 'Partido do Discurso, da Tese e do Trabalhismo',
    ideology: 'left',
    description: 'Tradição trabalhista e desenvolvimentista; toda ideia importante merece uma tese, um discurso e um seminário.',
    colors: partyColors.pdtt,
  },
  {
    id: 'plim',
    acronym: 'PLIM',
    fullName: 'Partido da Live, Influência e Mobilização',
    ideology: 'right',
    description: 'Política conservadora e mobilização digital; uma transmissão ao vivo pode virar a pauta do dia.',
    colors: partyColors.plim,
  },
  {
    id: 'pssdb',
    acronym: 'PSSDB',
    fullName: 'Partido dos Senhores, Slides e Debates de Brasília',
    ideology: 'center',
    description: 'Tradição social-democrata e de centro; prefere uma apresentação bem diagramada antes de fechar qualquer acordo.',
    colors: partyColors.pssdb,
  },
  {
    id: 'nova',
    acronym: 'NOVA',
    fullName: 'Núcleo de Otimização, Valor e Austeridade',
    ideology: 'right',
    description: 'Liberalismo econômico, gestão e austeridade; toda reunião começa com uma planilha de eficiência.',
    colors: partyColors.nova,
  },
] as const