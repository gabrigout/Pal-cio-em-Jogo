export interface MinistryDefinition {
  id: string
  name: string
  area: string
  competences: string[]
  annualBudget: number
}

export const ministryCatalog: MinistryDefinition[] = [
  { id: 'health', name: 'Ministério da Saúde', area: 'Saúde', competences: ['Coordenação do SUS', 'Vigilância em saúde', 'Atenção e campanhas nacionais'], annualBudget: 420 },
  { id: 'education', name: 'Ministério da Educação', area: 'Educação', competences: ['Política nacional de educação', 'Apoio à educação básica', 'Ensino técnico e superior'], annualBudget: 390 },
  { id: 'finance', name: 'Ministério da Fazenda', area: 'Economia', competences: ['Política fiscal', 'Administração tributária federal', 'Gestão do Tesouro'], annualBudget: 260 },
  { id: 'planning', name: 'Ministério do Planejamento e Orçamento', area: 'Economia', competences: ['Planejamento governamental', 'Elaboração do orçamento', 'Avaliação de programas'], annualBudget: 180 },
  { id: 'justice', name: 'Ministério da Justiça e Cidadania', area: 'Segurança', competences: ['Política nacional de justiça', 'Coordenação de segurança pública', 'Proteção de direitos'], annualBudget: 150 },
  { id: 'defense', name: 'Ministério da Defesa', area: 'Defesa', competences: ['Política de defesa', 'Coordenação civil das Forças Armadas', 'Proteção de fronteiras'], annualBudget: 230 },
  { id: 'environment', name: 'Ministério do Meio Ambiente e Clima', area: 'Meio ambiente', competences: ['Política ambiental', 'Proteção da biodiversidade', 'Coordenação climática'], annualBudget: 110 },
  { id: 'infrastructure', name: 'Ministério da Infraestrutura e Mobilidade', area: 'Infraestrutura', competences: ['Planejamento de transportes', 'Integração logística', 'Acompanhamento de obras federais'], annualBudget: 210 },
  { id: 'development', name: 'Ministério do Desenvolvimento Social', area: 'Assistência social', competences: ['Proteção social', 'Transferência de renda', 'Segurança alimentar'], annualBudget: 200 },
  { id: 'labor', name: 'Ministério do Trabalho e Renda', area: 'Trabalho', competences: ['Política de emprego', 'Qualificação profissional', 'Fiscalização das relações de trabalho'], annualBudget: 100 },
  { id: 'agriculture', name: 'Ministério da Agricultura e Abastecimento', area: 'Agricultura', competences: ['Política agrícola', 'Defesa agropecuária', 'Abastecimento alimentar'], annualBudget: 130 },
  { id: 'industry', name: 'Ministério da Indústria e Comércio', area: 'Economia', competences: ['Política industrial', 'Comércio e competitividade', 'Apoio à inovação produtiva'], annualBudget: 120 },
  { id: 'science', name: 'Ministério da Ciência e Tecnologia', area: 'Ciência e tecnologia', competences: ['Pesquisa e desenvolvimento', 'Política de inovação', 'Infraestrutura científica'], annualBudget: 140 },
  { id: 'culture', name: 'Ministério da Cultura e Patrimônio', area: 'Cultura', competences: ['Política cultural', 'Fomento à produção artística', 'Preservação do patrimônio'], annualBudget: 85 },
  { id: 'foreign-affairs', name: 'Ministério das Relações Exteriores', area: 'Relações exteriores', competences: ['Política externa', 'Serviço diplomático', 'Cooperação internacional'], annualBudget: 95 },
  { id: 'cities', name: 'Ministério das Cidades e Habitação', area: 'Habitação', competences: ['Política habitacional', 'Saneamento e desenvolvimento urbano', 'Apoio à mobilidade urbana'], annualBudget: 160 },
  { id: 'communications', name: 'Ministério das Comunicações e Conectividade', area: 'Comunicações', competences: ['Política de telecomunicações', 'Inclusão digital', 'Serviços postais'], annualBudget: 75 },
]
