# PALÁCIO EM JOGO
## Documento mestre de contexto e requisitos

**Versão:** 1.1 — levantamento consolidado + catálogo adicional de personagens  
**Data:** 14 de outubro de 2026  
**Destino:** referência principal para implementação no Replit  
**Status:** planejamento consolidado; programação ainda não iniciada

> **Objetivo deste documento:** reunir em uma única referência as decisões tomadas para o jogo. Ele descreve o que o jogo deve fazer, suas regras e as prioridades de implementação. Não é código e não inicia a programação.


## 1. Visão geral

**Palácio em Jogo** é um simulador político de navegador, satírico e sistêmico, ambientado no Brasil contemporâneo fictício. O jogador começa em janeiro de 2027 já ocupando a Presidência da República. A experiência combina gestão de governo, negociação política, economia, políticas públicas, personagens com ambições próprias, crises, eleições e humor sobre os absurdos da política brasileira.

Referências de experiência: simuladores de presidência e governo, jogos de carreira e gerenciamento por turnos, além de navegação inspirada em menus de jogos de gestão. A interface será majoritariamente textual, com indicadores, cartões, feed de notícias, gráficos simples e decisões. Não é um jogo de combate nem exige gráficos 3D.

### 1.1 Objetivos de design

- Fazer o país parecer um sistema vivo, no qual decisões em uma área geram efeitos em outras.
- Respeitar as competências, limites e procedimentos fundamentais das instituições brasileiras.
- Manter o ritmo de jogo ágil: detalhes burocráticos rotineiros são resumidos; projetos, crises e decisões decisivas recebem mais profundidade.
- Criar campanhas diferentes por meio de contexto, regras, personagens, relações, eventos e geração procedural — sem depender de uma API de IA para funcionar.
- Permitir que corrupção, polarização, interesses e relações influenciem **todo o jogo**, e não apenas leis ou eleições.
- Preservar humor, caricatura e sátira sem tratar atributos ficcionais como alegações factuais sobre pessoas reais.

### 1.2 Princípio central

**Realismo institucional com simplificação de interface.** A simplificação reduz o número de cliques e cálculos visíveis; não transforma os poderes em departamentos subordinados ao presidente nem elimina requisitos legais essenciais.


## 2. Regras globais inegociáveis

### 2.1 Os três poderes são independentes

- O Executivo governa e administra dentro de suas competências.
- O Legislativo legisla, delibera sobre matérias de sua competência, aprova o orçamento e fiscaliza o Executivo.
- O Judiciário julga com independência, aplica a Constituição e as leis, e pode controlar juridicamente atos quando cabível.
- Nenhum poder pode ser tratado como botão de comando de outro. Relação política, afinidade ou influência não garantem decisões.

### 2.2 Instituições com competências próprias

O jogo deve respeitar as diferenças entre Congresso, STF, demais tribunais, Ministério Público, Polícia Federal, CGU, TCU, AGU e Justiça Eleitoral. Esses órgãos não são intercambiáveis e não formam poderes adicionais.

### 2.3 Corrupção e polarização são fatores sistêmicos

Não devem ficar restritas a uma barra nem aparecer apenas em eventos específicos. Influenciam, conforme o contexto:

- aprovação do governo, confiança pública e estabilidade política;
- coalizão, negociações, votações, composição partidária e agenda legislativa;
- contratos, licitações, obras, emendas, orçamento, ministérios e projetos;
- investigações, imprensa, rumores, respostas a crises e credibilidade;
- relações entre personagens, ambições, lealdades, traições e oportunidades;
- grupos sociais, manifestações, eleições, maré ideológica e resultados eleitorais;
- diplomacia, comércio, empréstimos, sanções e relações internacionais;
- funcionamento administrativo, desempenho de políticas e situação fiscal.

**Corrupção:** pode envolver interesses ocultos, troca ilícita de favores, irregularidades, conflitos de interesse e riscos de investigação. Benefícios aparentes não garantem sucesso; descoberta pode gerar consequências políticas, administrativas e judiciais. Suspeita, evidência, percepção pública e culpa comprovada são estados diferentes.

**Polarização:** pode fortalecer a base do governo e mobilizar seus apoiadores, mas também aumentar rejeição, dificultar acordos, intensificar protestos ou favorecer a oposição. Não determina automaticamente o lado vencedor.

**Interesses:** partidos, personagens, empresas, sindicatos, setores sociais, imprensa e atores estrangeiros podem perseguir objetivos próprios. Os resultados devem depender do contexto, e não apenas de sorte aleatória.

A corrupção como atributo ou evento de gameplay é ficcional. Não deve ser apresentada como acusação automática contra figuras reais reconhecíveis.


## 3. Início de campanha, partidos e identidade política

### 3.1 Início

- A campanha começa em **janeiro de 2027**, com o jogador já ocupando a Presidência.
- Antes de começar, o jogador escolhe **esquerda ou direita** como orientação política inicial.
- Em seguida, escolhe um partido ficcional existente ou cria um partido personalizado.
- Os valores iniciais devem variar dentro de intervalos equilibrados e coerentes entre campanhas. A variação não deve criar uma campanha impossível por puro azar.

### 3.2 Partido personalizado

O jogador define:

1. nome completo;
2. sigla;
3. orientação ideológica compatível com a escolha inicial;
4. exatamente **duas cores oficiais**, escolhidas de uma paleta e personalizáveis;
5. identidade inicial do partido.

O partido personalizado começa com **3% de popularidade**. Outros indicadores iniciais, como influência, apoio parlamentar, recursos e situação política, são sorteados em faixas equilibradas. O partido começa com poucas cadeiras e precisa construir alianças.

As cores oficiais serão usadas de forma consistente na interface: a cor primária em destaques, fundos e botões; a secundária em ícones, texto de destaque e bordas quando houver contraste suficiente. Superfícies neutras continuam disponíveis para legibilidade e não contam como cores partidárias.

### 3.3 Seis partidos ficcionais iniciais

1. **PTP — Partido da Taxa e da Picanha.** Inspiração satírica em partido de esquerda popular e trabalhista. Tendência a defender políticas sociais e mobilização popular; pode enfrentar críticas sobre gastos, impostos e execução do governo.
2. **PSÓ — Partido Socialista Óbvio.** Inspiração satírica na esquerda socialista e nos movimentos de direitos. **Pontos fortes:** mobilização social, defesa de direitos, pressão por mudanças e engajamento militante. **Dificuldades:** correntes internas, divergências sobre estratégia, alianças e prioridades; negociações com moderados podem ser mais trabalhosas. **Evento satírico:** “A Nota da Nota” — quatro correntes concordam com uma proposta governamental, discordam da justificativa, criam três comissões e publicam cinco notas antes que o Congresso vote. Paleta definida: roxo e laranja.
3. **PDTT — Partido do Discurso, da Tese e do Trabalhismo.** Inspiração satírica em tradição trabalhista e desenvolvimentista.
4. **PLIM — Partido da Live, Influência e Mobilização.** Inspiração satírica em política conservadora/populista guiada por comunicação e mobilização digital.
5. **PSSDB — Partido dos Senhores, Slides e Debates de Brasília.** Inspiração satírica em tradição social-democrata e política de centro.
6. **NOVA — Núcleo de Otimização, Valor e Austeridade.** Inspiração satírica em liberalismo econômico, gestão e austeridade. Uma das duas cores deve ser laranja; combinação de referência: laranja e azul-marinho.

As paletas completas dos partidos 1, 3, 4 e 5 ficam para a etapa de identidade visual. As inspirações orientam mecânicas ficcionais, não alegações sobre pessoas reais.

### 3.4 Introduções satíricas

A abertura narrativa muda conforme a orientação escolhida. A esquerda pode ter uma sátira envolvendo o “Sr. Picanha”, que desaparece durante um churrasco oficial, e uma fala absurda sobre verba de merenda. A direita pode ter uma história em torno do “Sr. Rachavoto”, de um governo fragmentado e de uma fuga caricatural ao exterior. São personagens e acontecimentos ficcionais; o tom deve ser incisivo, absurdo e reconhecivelmente brasileiro, sem afirmar como fato crimes não comprovados de pessoas reais.


## 4. Estrutura de tempo e ciclo principal

### 4.1 Calendário

- Quatro semanas por mês.
- Uma decisão narrativa por semana; ela é **gratuita**.
- Na quarta semana de cada mês há também um evento especial de encerramento mensal.
- Projetos avançam semanalmente; efeitos econômicos amplos e balanços mensais são calculados na virada do mês.
- Ações com efeito imediato mostram seus efeitos na hora. Ações pendentes, reações de personagens e progresso de projetos são processados ao avançar a semana.
- Ao finalizar a semana, o jogador recebe um resumo das principais consequências, indicadores alterados, acontecimentos e pendências. Crises relevantes têm relatório mais profundo.

### 4.2 Pontos de ação

- Base fixa: **2 pontos por semana**.
- +1 ponto se o indicador de apoio do Executivo/apoio interno estiver acima de 49%.
- +1 ponto se o indicador de apoio legislativo estiver acima de 49%.
- +1 ponto se o indicador de relação institucional com o Judiciário estiver acima de 49%. Esse indicador representa a relação institucional e o ambiente jurídico — nunca submissão dos magistrados.
- +1 ponto se a aprovação popular geral estiver acima de 49%.
- Máximo de **6 pontos novos por semana**.
- Até **2 pontos não utilizados** podem ser carregados para a semana seguinte. Se sobrarem mais de 2, o excedente expira.
- Os pontos renovam-se semanalmente. A soma da nova concessão com os pontos carregados pode permitir até 8 pontos disponíveis no início da semana.
- Navegação, consulta de estatísticas, leitura de notícias e inspeção de personagens/projetos são gratuitas.
- Ações relevantes custam normalmente 1 ou 2 pontos, conforme impacto. A ação também pode consumir dinheiro, capital político e/ou capacidade administrativa.
- Pontos de ação são recurso de ritmo de jogo, não dinheiro, capital político nem capacidade administrativa.

### 4.3 Recursos globais

1. **Dinheiro/recursos orçamentários:** gastos, receitas, dívida, financiamento de programas e projetos.
2. **Capital político:** capacidade de negociar, formar coalizões, sustentar propostas e gerir conflitos.
3. **Capacidade administrativa:** capacidade do Estado de executar programas, projetos, contratos e reformas.

Influência, lealdade ou popularidade de personagens são atributos individuais, não recursos globais adicionais.

### 4.4 Escassez de recursos

Ações comuns ficam bloqueadas quando faltar recurso necessário. Em situações excepcionais, o jogo pode oferecer alternativas de emergência com custos, riscos ou consequências futuras. Não deve criar dinheiro ilimitado automaticamente.


## 5. Interface e navegação

### 5.1 Cabeçalho

- Título: **PALÁCIO EM JOGO**.
- Subtítulo: **Palácio do Planalto · Brasília**.
- Mostrar mês/ano e semana do mês, por exemplo “Janeiro de 2027 — Semana 2/4”.
- Identificar o partido do jogador por nome, sigla e suas duas cores.

### 5.2 Navegação principal

Menu superior minimalista, com ícones e dicas por hover/foco; sem sidebar esquerda. Abas principais:

- **Brasil** — painel geral/dashboard.
- **Estado** — Poder Executivo, Poder Legislativo e Poder Judiciário.
- **Economia**.
- **Políticas Públicas**.
- **Sociedade**.
- **Relações** — Personagens e alianças; Diplomacia; Defesa e Inteligência.
- **Notícias/Histórico**.

### 5.3 Dashboard Brasil

Conteúdo vertical com rolagem. Deve apresentar indicadores principais, alertas, feed de opiniões/notícias/memes e decisão narrativa semanal. O botão **Avançar Semana** fica no final do dashboard, após o conteúdo, não no topo.

Cards de situação já planejados: “Em andamento”, “Aguardando resposta” e “Encerrado”. Notícias de pequenas variações podem ser resumidas; eventos relevantes recebem manchetes próprias. O feed reage ao estado atual do país, às decisões, aos personagens e às crises.

### 5.4 Indicadores principais no dashboard

Visíveis em resumo: aprovação presidencial, apoio no Congresso, situação econômica, recursos globais, estabilidade/alertas institucionais, polarização/confiança, integridade pública e relação externa. Dados detalhados permanecem em suas áreas específicas.

O dashboard mostra indicadores gerais de corrupção e polarização, mas não revela automaticamente interesses ocultos nem o conteúdo de investigações ainda não descobertas.


## 6. Poder Executivo

O presidente governa e administra dentro das atribuições constitucionais e legais. Pode nomear e exonerar ministros de Estado, coordenar prioridades, conduzir a política externa dentro de suas competências, propor leis, sancionar ou vetar projetos nos casos aplicáveis e orientar a administração.

### 6.1 Estrutura

- Presidência da República e órgãos de coordenação, articulação política, comunicação e assessoramento.
- Ministérios com áreas de competência definidas.
- Órgãos e entidades vinculados, incluindo autarquias, fundações e agências, representados de maneira simplificada.

A reorganização, criação, transformação ou extinção de estruturas deve utilizar o instrumento jurídico adequado. O jogador não poderá criar qualquer ministério ou órgão por simples botão quando a Constituição ou a lei exigirem atuação legislativa.

### 6.2 Ficha de ministério

Cada ministério terá:

- ministro responsável, partido e perfil;
- competências oficiais;
- orçamento disponível e execução;
- desempenho administrativo;
- programas e projetos;
- pendências, riscos e alertas.

Atributos do ministro: competência, lealdade, popularidade, integridade, influência, ambição e relações. O jogador pode negociar indicações politicamente, mas isso não elimina os requisitos legais do cargo.

### 6.3 Ações presidenciais

A interface diferencia:

- ação administrativa dentro da competência do Executivo;
- decreto/regulamento dentro dos limites constitucionais e legais;
- proposta que depende do Congresso;
- nomeação sujeita a aprovação de outra instituição;
- ato sujeito a controle jurídico ou orçamentário.

Ações diretas não substituem procedimentos legais. Uma reforma tributária que dependa de lei não altera os tributos apenas porque o presidente anunciou a medida.


## 7. Poder Legislativo

O Congresso Nacional é bicameral: Câmara dos Deputados e Senado Federal. As Casas têm composição, competências, regras de votação e mandatos próprios. A Câmara é eleita pelo sistema proporcional; o Senado, pelo sistema majoritário, com renovação alternada de um terço e dois terços das cadeiras por eleição.

### 7.1 Propostas de lei

Propostas podem partir de atores legitimados conforme a Constituição e a legislação: Executivo, parlamentares, comissões e outras iniciativas previstas. A agenda também é influenciada por crises, pesquisas, polarização, escândalos, grupos sociais e negociações.

A tramitação padrão é simplificada — apresentação, análise, negociação, votação e encaminhamento —, com mais detalhe nos projetos importantes. O sistema distingue:

- lei ordinária;
- lei complementar;
- proposta de emenda à Constituição (PEC);
- medida provisória;
- matérias orçamentárias e outros instrumentos quando forem relevantes.

Cada instrumento conserva requisitos próprios. PEC exige três quintos dos membros de cada Casa em dois turnos; não passa por sanção presidencial. Medida provisória exige relevância e urgência, tem força de lei nos termos constitucionais e fica sujeita à apreciação do Congresso. Leis sujeitas à sanção podem ser sancionadas ou vetadas conforme a Constituição; o Congresso pode apreciar vetos segundo os quóruns e procedimentos aplicáveis.

### 7.2 Negociação e apoio parlamentar

O presidente pode negociar com líderes, propor concessões políticas lícitas, negociar ministérios quando cabível, articular emendas e prioridades, conversar com grupos sociais e usar comunicação pública. Parlamentares podem discordar de acordos e votar contra o governo.

O sistema mostrará intenção provável de voto antes das votações importantes, incluindo surpresas e dissidências. Partidos possuem lideranças e correntes internas; nem todos os integrantes seguem automaticamente a orientação partidária.

### 7.3 Orçamento e emendas

O ciclo orçamentário distingue PPA (planejamento de médio prazo), LDO (diretrizes anuais) e LOA (orçamento anual). O Executivo propõe os instrumentos pertinentes; o Congresso analisa, delibera e fiscaliza conforme as regras constitucionais. A execução é acompanhada mês a mês.

Emendas parlamentares serão representadas por modalidades e procedimentos aplicáveis, recursos destinados, negociação, transparência, execução, limites e riscos de irregularidades. A exata regra operacional deve ser validada na data de implementação, porque legislação orçamentária e decisões judiciais podem evoluir.

### 7.4 Fiscalização, CPIs e impeachment

- Fiscalização do Executivo, convocação de ministros e pedidos de informação quando cabíveis.
- CPIs com fato determinado, poderes e duração conforme as regras aplicáveis.
- Auditorias, documentos, depoimentos, vazamentos e relatórios nos casos importantes.
- Investigação não equivale automaticamente a culpa ou condenação.
- Impeachment segue etapas institucionais, defesa, requisitos e quóruns. Não é consequência automática de baixa popularidade ou perda de apoio. Os procedimentos para crimes de responsabilidade e crimes comuns são distintos.


## 8. Poder Judiciário

O Judiciário é independente. O presidente não pode ordenar decisões judiciais nem cancelar decisões por simples vontade. A relação política ou a afinidade de um personagem não garantem voto ou resultado.

### 8.1 Estrutura de representação

O jogo representa STF, STJ, TSE, TST, STM e outras instâncias relevantes de maneira simplificada, conforme a matéria. O STF é a principal instituição judicial acompanhada na dimensão constitucional e tem onze ministros.

Uma vaga no STF exige indicação presidencial, requisitos constitucionais, aprovação prévia pelo Senado por maioria absoluta e nomeação. Outros cargos judiciais obedecem a seus próprios critérios; não são todos nomeados livremente pelo presidente.

### 8.2 Processos e decisões

Processos surgem de fontes plausíveis: leis, atos governamentais, investigações, conflitos federativos e ações apresentadas por atores legitimados. Casos importantes consideram competência do tribunal, argumentos, provas, precedentes, prazos, decisões provisórias e recursos cabíveis.

As decisões judiciais terão fundamentação e eventuais divergências em casos relevantes. A interface será resumida em processos rotineiros. Cumprir decisões, recorrer quando cabível ou reformular uma política serão opções possíveis dentro dos limites legais.

A reação pública será separada do mérito jurídico: uma decisão pode ser juridicamente fundamentada e ainda gerar reação política intensa.

### 8.3 CNJ

O Conselho Nacional de Justiça aparece como instituição de controle administrativo, financeiro e disciplinar do Judiciário dentro de suas competências. Não será tratado como tribunal comum de recursos para revisar o mérito de toda decisão judicial.


## 9. Instituições de controle e defesa

- **Ministério Público/PGR:** atua dentro de suas atribuições de investigação, persecução e ação judicial. O PGR tem indicação presidencial e aprovação do Senado, mandato e procedimentos próprios. O presidente não determina o resultado de investigações.
- **Polícia Federal:** polícia judiciária da União e outras atribuições previstas em lei. Casos importantes podem ter fases de investigação, evidências, depoimentos, vazamentos e encaminhamentos, sem permitir que o presidente fabrique provas ou controle ilegalmente o resultado.
- **CGU:** controle interno do Executivo federal, auditorias, avaliação de programas, correição, transparência e apuração de irregularidades dentro de suas competências.
- **TCU:** controle externo em auxílio ao Congresso, fiscalização contábil, financeira, orçamentária, operacional e patrimonial. Não substitui juízo criminal.
- **AGU:** representação judicial e extrajudicial da União e consultoria/assessoramento jurídico do Executivo. Orienta decisões e defende a União, mas não garante vitórias judiciais.
- **Justiça Eleitoral:** trata de questões eleitorais conforme suas competências. Casos importantes podem incluir evidências, decisões, recursos e consequências eleitorais.

Investigações e auditorias podem conectar emendas, contratos, obras, ministérios, personagens, financiamento eleitoral e crises de imagem. Suspeitas são diferenciadas de evidências e conclusões formais.


## 10. Economia

### 10.1 Indicadores

- receitas públicas;
- despesas públicas;
- déficit/superávit;
- dívida pública;
- crescimento econômico;
- inflação;
- desemprego;
- desigualdade de renda.

### 10.2 Orçamento e política tributária

O orçamento tem ciclo anual e execução mensal. O jogador distribui recursos por setores e depois por programas/projetos. O sistema tributário combina ajustes limitados em tributos com reformas maiores por negociação legislativa, quando exigidas.

O governo pode operar com déficit e tomar empréstimos dentro dos mecanismos simulados; endividamento elevado aumenta riscos fiscais, econômicos e políticos. Não haverá dinheiro ilimitado sem consequência.

### 10.3 Resultados

A economia reage ao contexto, não a uma única decisão. Políticas, execução, confiança, comércio exterior, inflação, produtividade, crise política e integridade poderão alterar os resultados. Ações diretas podem gerar efeitos imediatos limitados; a avaliação econômica mais ampla acontece na virada mensal.


## 11. Políticas Públicas e projetos

Setores iniciais:

1. saúde;
2. educação;
3. segurança pública;
4. infraestrutura e transportes;
5. assistência social e habitação;
6. meio ambiente;
7. indústria, ciência e tecnologia.

O jogador escolhe programas de um catálogo e personaliza investimento, duração e prioridade. Os projetos avançam automaticamente a cada semana; resultados de maior alcance são avaliados no fim do mês.

Possíveis acontecimentos: atrasos, aumento de custos, investigação, protestos, conflito político, sucesso antecipado ou mudança de prioridade. O jogador intervém principalmente em projetos estratégicos e crises, sem microgerenciar toda tarefa rotineira.

Cada projeto pode consumir dinheiro, capital político, capacidade administrativa ou uma combinação deles. Os efeitos podem atingir economia, grupos sociais, aprovação, Congresso, personagens, integridade e polarização.


## 12. Sociedade e grupos de pressão

### 12.1 Classes sociais representadas

- população de baixa renda;
- classe média;
- ricos/empresários;
- milionários;
- bilionários.

As classes são grupos econômicos simplificados, não categorias morais. Políticas podem produzir efeitos diferentes em cada classe.

### 12.2 Grupos organizados

Exemplos: sindicatos, entidades empresariais, estudantes, servidores públicos, grupos rurais e outros movimentos. Podem agir autonomamente, fazer pressão, apoiar propostas, organizar manifestações e negociar com o governo.

O dashboard mostra aprovação geral e alertas de grupos que geram crise ou pressão; a área Sociedade oferece mais detalhes. As ações têm causas reconhecíveis, mas eventos extraordinários também podem ocorrer.


## 13. Relações internacionais, defesa e inteligência

### 13.1 Relações e parceiros

A simulação inclui Estados Unidos, China, Rússia, União Europeia, América Latina, ONU, Mercosul, FMI, bancos e países credores. Um bloco internacional fictício inspirado em agrupamentos multipolares será criado com nome a definir.

Indicadores centrais: relação diplomática, cooperação comercial e tensão. A ideologia, as decisões econômicas e eventos secretos poderão influenciar reações externas.

### 13.2 Empréstimos e pressão externa

Ofertas de empréstimo podem surgir automaticamente; empréstimos maiores podem exigir negociação. Cada oferta deve registrar valor, juros, prazo e condições, e afetar dívida, orçamento e relação externa. O jogo também pode representar comércio, investimento, sanções, embargos, espionagem narrativa e pressão/interferência estrangeira sem transformar espionagem em minijogo operacional.

### 13.3 Defesa e inteligência

Escopo intermediário: orçamento de defesa, aquisição de equipamentos, cooperação estratégica internacional e decisões de alto nível. Não haverá simulação detalhada de batalhas ou operações militares na primeira versão. Tensões militares e de segurança podem surgir como eventos narrativos.


## 14. Maré Ideológica Nacional

A Maré Ideológica é um sistema global para esquerda, centro e direita, separado da aprovação presidencial e da força eleitoral dos partidos.

### 14.1 Três conceitos distintos

1. **Aprovação presidencial:** como a população avalia o governo.
2. **Tendência ideológica nacional:** inclinação relativa da opinião pública para esquerda, centro ou direita.
3. **Força eleitoral:** capacidade de partidos e candidatos converterem apoio em votos e cargos.

Esses conceitos influenciam uns aos outros, mas não são equivalentes. Uma aprovação baixa não força automaticamente todos os eleitores a mudarem de ideologia.

### 14.2 Fatores que influenciam a Maré

Economia, emprego, serviços públicos, corrupção, polarização, comunicação, crises, confiança institucional, força da oposição, candidatos, alianças, grupos sociais e diferenças regionais. Problemas persistentes acumulam efeitos; crises graves podem acelerar mudanças.

Existe uma tendência nacional e diferenças entre estados, regiões e grupos sociais. A atualização pode oscilar semanalmente e os efeitos mais amplos se consolidam ao longo do mês.

### 14.3 Estratégia presidencial

O jogador pode buscar apoio por políticas públicas, reformas, execução de projetos, comunicação, alianças e gestão de crises. Estratégias clandestinas, desinformação e corrupção podem ser escolhas ficcionais de alto risco, com resultados incertos e consequências se descobertas. Nenhuma opção deve garantir sucesso.

### 14.4 Conversão eleitoral

A Maré influencia pesquisas e resultados, mas não decide automaticamente cadeiras. Candidatos, partidos, candidaturas competitivas, alianças, contexto regional e regras eleitorais continuam importantes. Uma onda nacional pode favorecer um campo sem garantir vitória em todo estado ou em toda disputa.


## 15. Personagens e relações

### 15.1 Elenco

Atores possíveis: políticos, ministros, parlamentares, magistrados, jornalistas, empresários, lideranças sociais e personagens internacionais. O catálogo satírico de 150 personagens é utilizado conforme cargos e acontecimentos; todos não precisam aparecer desde o início.

O catálogo adicional foi recebido e estruturado em arquivo próprio: 150 novas entradas com nome de referência, nome satírico e descrição, mais 8 personagens anteriores mantidos separadamente. Consultar `Palacio_em_Jogo_Catalogo_Personagens.md`, `.csv` ou `.json`.

### 15.2 Atributos comuns

- competência;
- lealdade;
- popularidade;
- integridade;
- influência;
- ambição;
- relações e histórico.

Cada função recebe atributos específicos: ministros têm desempenho administrativo; parlamentares, capacidade de articulação e posição de voto; jornalistas, alcance e credibilidade; magistrados, perfil jurídico e histórico profissional. A influência política não garante decisão judicial.

### 15.3 Memória e autonomia

Personagens lembram acontecimentos importantes: promessas cumpridas/quebradas, nomeações, favores, traições, ameaças e humilhações. Agem autonomamente de acordo com interesses, ideologia, cargo, lealdade, relações e oportunidade. Saindo do governo, continuam no mundo político e podem ir à oposição, formar alianças, disputar eleições ou voltar a ocupar cargos quando elegíveis.

### 15.4 Alianças e partidos

- alianças dinâmicas baseadas em interesses, acordos, confiança e objetivos compatíveis;
- traições e rupturas podem ocorrer autonomamente, mas precisam de causas plausíveis;
- pessoas de ideologias opostas podem cooperar em certas pautas; outras podem recusar;
- compromissos importantes ficam registrados e o cumprimento/quebra altera a confiança futura;
- partidos têm lideranças e correntes internas; parlamentares podem divergir;
- mudanças de cargo respeitam eleições, indicações, requisitos e competências legais.

### 15.5 Geração procedural

Personagens secundários são gerados por regras que consideram cargo, ideologia, região, perfil, interesses, relações e contexto. Cada um pode receber objetivos e lealdades próprios. Não é necessário criar biografia completa para todo personagem; a profundidade aumenta quando ele passa a importar para a campanha.

### 15.6 Elenco judicial

Magistrados relevantes terão personagens fictícios ou compostos, trajetória e perfil jurídico. A geração do elenco do STF respeita o número de onze ministros e o procedimento de indicação e aprovação. Não se deve inventar acusações de corrupção ou decisões vendidas contra pessoas reais.


## 16. Imprensa, comunicação e crises de imagem

### 16.1 Veículos e jornalistas

Veículos ficcionais terão linhas editoriais, alcance, credibilidade, proprietários/interesses e disputas internas. Jornalistas importantes terão perfil, fontes, relações e conflitos editoriais. A imprensa independente não é subordinada ao presidente.

### 16.2 Comunicação do governo

Ferramentas incluem comunicados, pronunciamentos, entrevistas, coletivas, prestação de contas, campanhas institucionais e estratégias de imagem em acontecimentos relevantes, sempre respeitando as regras aplicáveis à publicidade pública e à independência da imprensa.

### 16.3 Rumores e desinformação

A disseminação depende de polarização, credibilidade da fonte, rede de influência, alcance dos veículos e confiança institucional. Um rumor pode causar dano antes de ser esclarecido, mas repetição e popularidade não são evidência de verdade.

### 16.4 Crises

O jogador poderá esclarecer, apresentar documentos, afastar envolvidos quando cabível ou esperar novas informações. Uma crise importante avança por etapas com cobertura da imprensa, reações de atores políticos, evidências e consequências. Tentar encobrir irregularidade pode agravar a crise se for descoberto.


## 17. Eleições e continuidade da simulação

### 17.1 Pesquisas e campanha

Pesquisas periódicas nacionais e estaduais mostram tendência, rejeição e cenários de segundo turno. Partidos e lideranças negociam candidaturas e alianças antes da campanha oficial; convenções, registro, propaganda e financiamento respeitam a legislação eleitoral vigente.

O financiamento usa orçamento eleitoral, despesas, recursos partidários e prestação de contas simplificada. Casos relevantes recebem auditoria, investigação e consequências. A Justiça Eleitoral resolve disputas dentro de sua competência e sem ficar sob controle do presidente.

### 17.2 Calendário da campanha

- O jogo começa em janeiro de 2027.
- A eleição geral seguinte no calendário de jogo ocorre em 2030.
- A campanha inclui ações, debates, alianças, promessas, eventos e possibilidade de segundo turno.
- O resultado é apresentado como manchete de jornal ficcional e gráfico de barras por candidato.
- Se o jogador perde a eleição presidencial, a campanha atual termina com mensagem satírica.
- Resultados estaduais incluem governadores, assembleias e forças partidárias como informação estratégica, sem simular integralmente cada governo estadual.

### 17.3 Renovação e mandatos

A composição da Câmara e do Senado é atualizada apenas quando a eleição correspondente acontece. A Câmara segue o sistema proporcional; a eleição para o Senado, o sistema majoritário. A cada eleição geral, a renovação do Senado alterna um terço e dois terços das cadeiras. O número de cadeiras legislativas e a regra de distribuição devem ser configuráveis e validados antes de implementar cada ciclo, em vez de hardcode permanente.

O presidente pode ser reeleito para **um único período consecutivo**. Depois de dois mandatos consecutivos, o mesmo personagem não pode concorrer a um terceiro mandato presidencial consecutivo. O jogo pode continuar com um novo personagem do mesmo partido, como sucessor político, conforme a mecânica de ciclos de oito anos.

### 17.4 Ciclo de oito anos e finais

A simulação pode continuar indefinidamente enquanto houver interesse do jogador. Cada ciclo de personagem cobre até oito anos de trajetória presidencial/partidária, com eleições no calendário real.

Ao completar o ciclo e escolher continuar, o jogador seleciona outro personagem do mesmo partido para o novo ciclo. Como mecânica de progressão, atributos e recursos variáveis sofrem redução de 15%, conforme definido no design. Isso é uma regra do jogo, não uma regra constitucional.

A derrota eleitoral encerra a campanha do personagem; a continuação por sucessor partidário ocorre conforme a opção de continuidade prevista no jogo. Revolução/mudança de regime ou impeachment concluído também encerra a campanha atual com mensagem satírica. Crises recuperáveis não encerram automaticamente a campanha.

### 17.5 Relação entre Maré e resultados

A onda altera tendências, pesquisas e probabilidades políticas. As cadeiras só mudam após a eleição correspondente. A composição pós-eleitoral é calculada conforme as regras aplicáveis, os votos, os candidatos, as vagas e os resultados por estado. Não se deve remover cadeiras da oposição imediatamente quando o governo melhora.


## 18. Salvamento e requisitos técnicos para o Replit

### 18.1 Decisões de produto

- Jogo de navegador.
- Sem banco de dados na primeira versão.
- Salvamento automático no `LocalStorage` do navegador.
- Múltiplas campanhas: continuar uma campanha existente ou começar outra.
- Não há sincronização automática entre dispositivos; limpar dados do navegador pode remover os salvamentos.
- Eventos e narrativas usam catálogo escrito combinado com regras e geração procedural. O jogo não depende de API externa de IA para funcionar.

### 18.2 Abordagem técnica recomendada

**Recomendação de implementação, ainda sujeita à escolha de stack no Replit:** React + TypeScript + Vite para interface e estado do jogo; persistência local versionada; motor de simulação separado dos componentes visuais; dados de conteúdo em arquivos JSON/TypeScript; funções explícitas para resolver turno semanal, virada mensal e transições eleitorais.

A interface não deve conter toda a lógica política em componentes. Separar:

- estado serializável de campanha;
- regras e funções de simulação;
- catálogos de partidos, ministérios, personagens, políticas e eventos;
- componentes de interface;
- persistência e migração do formato de salvamento.

### 18.3 Estado de campanha: campos conceituais

- versão do save e identificador da campanha;
- data do jogo, semana do mês e ano/ciclo;
- partido, ideologia e personagem presidencial;
- indicadores nacionais, regionais e sociais;
- pontos de ação e recursos globais;
- orçamento, receitas, despesas, dívida e indicadores econômicos;
- ministérios, ministros, projetos e programas;
- Câmara, Senado, coalizões e projetos legislativos;
- processos, investigações e eventos institucionais ativos;
- personagens, atributos, relações, promessas e memória de acontecimentos importantes;
- veículos de imprensa, notícias, rumores e crises;
- Maré Ideológica, pesquisas, candidatos e histórico eleitoral;
- relações internacionais, empréstimos e defesa;
- registros resumidos de acontecimentos relevantes.

### 18.4 Integridade e equilíbrio do sistema

- Salvar automaticamente após ações relevantes e avanço temporal.
- Versionar o formato de save e prever migração básica para atualizações futuras.
- Não depender de aleatoriedade sem contexto: eventos devem ser selecionados por condições e pesos plausíveis.
- Registrar razões resumidas para resultados importantes, para permitir explicações ao jogador.
- Evitar simular cada eleitor ou cada burocrata: utilizar agregados regionais e grupos.
- Manter acesso gratuito a navegação e consulta; gastar pontos apenas em ações com impacto.
- Garantir que nenhum indicador político seja capaz de subordinar automaticamente outro poder.


## 19. Plano de implementação recomendado

Este plano é uma ordem de trabalho, não uma alteração no escopo já confirmado.

### Fase 1 — Fundação jogável

- estrutura de navegação e dashboard;
- criação de campanha e seleção de partido;
- calendário semanal/mensal;
- recursos e pontos de ação;
- salvamento local com múltiplas campanhas;
- feed de notícias e decisão narrativa semanal.

**Critério de aceite:** o jogador consegue criar uma campanha, tomar decisões, avançar semanas, ver consequências e fechar/reabrir a campanha sem perder o estado salvo.

### Fase 2 — Governo e execução

- Executivo, ministérios e ministros;
- economia, orçamento anual e execução mensal;
- catálogo de políticas e projetos;
- sociedade, classes e grupos de pressão.

**Critério de aceite:** decisões de gasto e projetos alteram recursos, desempenho, grupos sociais e indicadores ao longo das semanas e meses.

### Fase 3 — Instituições e crises

- Congresso, projetos de lei, votações, orçamento e emendas;
- Judiciário, decisões, recursos e indicações;
- MP/PGR, PF, CGU, TCU, AGU e Justiça Eleitoral em suas funções;
- investigações, fiscalização, impeachment e crises entre poderes.

**Critério de aceite:** propostas passam por procedimentos coerentes, resultados têm requisitos e nenhum poder pode ser controlado pelo jogador fora de suas competências.

### Fase 4 — Política viva

- personagens, atributos, relações, memória e autonomia;
- alianças, promessas, dissidências e geração procedural;
- imprensa, comunicação, rumores e crises de imagem;
- sistema global de corrupção, polarização e interesses.

**Critério de aceite:** eventos e decisões conectam diferentes sistemas e produzem consequências compreensíveis.

### Fase 5 — Eleições e Maré Ideológica

- pesquisas nacionais/estaduais;
- candidatos, coligações permitidas, financiamento e Justiça Eleitoral;
- cálculo de resultados conforme os sistemas eleitorais;
- composição da Câmara, Senado, governos estaduais e assembleias;
- Maré Ideológica e ciclo político de oito anos.

**Critério de aceite:** a tendência influencia as eleições, mas não predetermina o resultado nem altera cadeiras fora de eleições.

### Fase 6 — Conteúdo, balanceamento e revisão

- importar o catálogo original dos 150 personagens;
- completar a identidade visual e paletas partidárias;
- ampliar narrativas satíricas e eventos;
- testar campanhas longas, migração de saves, equilíbrio econômico e efeitos entre sistemas;
- revisar procedimentos legais e eleitorais vigentes na data de lançamento.

**Critério de aceite:** campanhas distintas produzem histórias diferentes sem quebrar regras institucionais ou gerar contradições óbvias.


## 20. Diretrizes de conteúdo, sátira e factualidade

- Os partidos iniciais são ficcionais e satíricos, com inspiração ampla em tradições políticas reais.
- O jogo pode usar humor ácido, memes, situações absurdas e personagens caricatos.
- Se personagens forem reconhecíveis como figuras reais, não apresentar acusações criminais não verificadas como fatos. Denúncia, investigação, acusação formal, condenação e absolvição são estados diferentes.
- Preferir nomes compostos/fictícios para magistrados e autoridades quando o personagem tiver atributos de corrupção, ambição secreta ou conduta ilegal.
- A ficção pode mostrar eventos inventados, mas a interface/narrativa não deve confundi-los com fatos noticiosos reais.
- A sátira pode ser ideologicamente inclinada em tom e contexto, mas as regras centrais de governo e eleições não devem dar vantagem mecânica permanente à esquerda ou à direita.


## 21. Pendências de conteúdo para resolver durante a implementação

O levantamento principal está encerrado. As pendências abaixo são conteúdos operacionais que podem ser preenchidos sem reabrir a arquitetura principal:

1. Validar o catálogo adicional de 150 personagens e integrar as oito entradas anteriores; revisar a semelhança entre os aliases “Eduarda CampoMinado” e “Ana CampoMinado” e manter ambos conforme fornecidos, salvo decisão editorial posterior.
2. Definir as cores oficiais que faltam nos partidos PTP, PDTT, PLIM e PSSDB.
3. Definir o nome e a identidade do bloco internacional fictício inspirado em agrupamentos multipolares.
4. Montar o catálogo de ministérios de referência da campanha de janeiro de 2027, com funções resumidas e dados iniciais fictícios.
5. Ajustar valores iniciais e faixas de balanceamento para recursos, indicadores e probabilidades.
6. Criar catálogos de políticas públicas e eventos semanais/mensais.
7. Validar regras eleitorais e orçamentárias vigentes antes de implementar cada sistema e antes da publicação, especialmente para ciclos futuros.

Essas pendências não impedem a construção da fundação jogável. Não devem gerar novas rodadas extensas de perguntas; usar soluções coerentes com as decisões já registradas.


## 22. Checklist de consistência antes de considerar uma versão pronta

- [ ] Três poderes independentes e com competências próprias.
- [ ] Regras de tramitação diferentes para lei ordinária, complementar, PEC e medida provisória.
- [ ] Sanção, veto, orçamento, emendas e fiscalização funcionam com procedimentos adequados.
- [ ] Nomeações e aprovações obedecem aos requisitos de cada cargo.
- [ ] Judiciário não pode ser controlado diretamente pelo presidente.
- [ ] Investigação não equivale automaticamente a culpa.
- [ ] Corrupção e polarização afetam todas as áreas e geram consequências coerentes.
- [ ] Aprovação, Maré Ideológica e força eleitoral são indicadores distintos.
- [ ] Cadeiras legislativas só mudam quando a eleição pertinente acontece.
- [ ] Resultados eleitorais respeitam sistema majoritário/proporcional e vagas em disputa.
- [ ] Recursos e pontos de ação são distintos e corretamente aplicados.
- [ ] Projetos evoluem semanalmente e resultados econômicos amplos fecham mensalmente.
- [ ] Personagens guardam memória de acontecimentos importantes e agem autonomamente.
- [ ] Narrativa mistura conteúdo escrito e geração procedural, sem depender de API de IA.
- [ ] Múltiplas campanhas são salvas localmente e podem ser reabertas.
- [ ] Cada consequência importante apresenta razões compreensíveis ao jogador.
- [ ] Tom satírico não transforma atributos ficcionais em alegações factuais sobre pessoas reais.


## 23. Fontes oficiais para validação institucional

As regras abaixo devem ser conferidas novamente antes da publicação. A simulação não substitui orientação jurídica; estes são pontos de referência para o design institucional.

1. **Constituição Federal de 1988 — texto compilado, Tribunal Superior Eleitoral.** Organização dos poderes, competências do Congresso, processo legislativo, orçamento, STF, Ministério Público e polícia.  
   https://www.tse.jus.br/legislacao/codigo-eleitoral/constituicao-federal/constituicao-da-republica-federativa-do-brasil
2. **Constituição Federal — Portal do Planalto.** Texto constitucional oficial compilado.  
   https://www.planalto.gov.br/ccivil_03/constituicao/constituicaocompilado.htm
3. **Lei das Eleições — Lei nº 9.504/1997, TSE.** Regras de candidatura, campanhas, propaganda, eleições e prestação de contas.  
   https://www.tse.jus.br/legislacao/codigo-eleitoral/lei-das-eleicoes/lei-das-eleicoes-lei-nb0-9.504-de-30-de-setembro-de-1997/
4. **Lei dos Partidos Políticos — Lei nº 9.096/1995, TSE.** Partidos, federações e regras partidárias.  
   https://www.tse.jus.br/legislacao/codigo-eleitoral/lei-dos-partidos-politicos/lei-dos-partidos-politicos-lei-nb0-9.096-de-19-de-setembro-de-1995
5. **Diferença entre coligações e federações partidárias — TSE.** Atualização publicada em 2025 e atualizada em 2026.  
   https://www.tse.jus.br/comunicacao/noticias/2025/Dezembro/saiba-a-diferenca-entre-coligacoes-e-federacoes-partidarias
6. **Tribunal de Contas da União — Lei Orgânica, Lei nº 8.443/1992, Câmara dos Deputados.** Competências de controle externo.  
   https://www2.camara.leg.br/legin/fed/lei/1992/lei-8443-16-julho-1992-365298-normaatualizada-pl.html
7. **Sistema de Controle Interno — CGU.** Finalidades do controle interno do Executivo federal.  
   https://www.gov.br/cgu/pt-br/assuntos/auditoria-e-fiscalizacao/sistema-de-controle-interno
8. **Competências da AGU.** Representação judicial e extrajudicial e assessoramento jurídico do Executivo.  
   https://www.gov.br/agu/pt-br/acesso-a-informacao/institucional/competencias
9. **Competências da Polícia Federal.** Referência ao artigo 144 da Constituição e às atribuições legais da PF.  
   https://www.gov.br/pf/pt-br/acesso-a-informacao/institucional/base-juridica-da-estrutura-organizacional-e-das-competencias

**Nota de atualização:** legislação eleitoral, regras orçamentárias, composição de cadeiras e decisões judiciais podem mudar. Validar as regras aplicáveis ao ano de cada eleição e manter os números de cadeiras e requisitos parametrizados, em vez de incorporá-los como constantes imutáveis no código.


## 24. Registro resumido das decisões consolidadas

Este registro agrupa as respostas já aprovadas ao longo do planejamento.

- **1–4 — Processo legislativo:** propostas de múltiplos atores e acontecimentos; fluxo comum simplificado; projetos importantes detalhados; negociação ampla; derrotas e novas tentativas conforme regras aplicáveis.
- **5–7 — Orçamento e fiscalização:** emendas detalhadas; ciclo orçamentário aprofundado; fiscalização, CPIs e investigações com evidências e consequências.
- **8–10 — Procedimentos:** tipos legislativos com requisitos próprios; agenda dinâmica; investigações que evoluem conforme evidências e fatos.
- **11–13 — Conflitos entre poderes:** sanção/veto, decisões judiciais e impeachment com procedimentos aprofundados nos casos importantes.
- **14–17 — Controle e defesa:** MP/PGR, PF, CGU/TCU e AGU representados de acordo com competências e autonomia.
- **18–21 — Judiciário:** estrutura relevante simplificada; processos com origem plausível; decisões fundamentadas nos casos importantes; prazos e recursos representados conforme aplicáveis.
- **22–25 — Magistrados:** personagens individuais relevantes; nomeações segundo regras; CNJ em sua função administrativa/disciplinar; consequências sociais e políticas das decisões.
- **26–29 — Integração:** painel de indicadores essenciais; corrupção/polarização com níveis visíveis e fatores ocultos; cálculo contextual; explicações proporcionais à importância do resultado.
- **30–33 — Campanha inicial:** base nacional coerente com variações; tensões administráveis; dificuldade equilibrada; eventos escritos combinados com geração procedural.
- **34–37 — Personagens:** interações contextuais; memória dos acontecimentos importantes; autonomia; permanência após perda de cargo.
- **38–41 — Imprensa:** veículos e jornalistas individualizados quando relevantes; comunicação avançada em crises; desinformação sistêmica; crises de imagem com desdobramentos.
- **42–45 — Catálogo:** elenco amplo; 150 personagens usados conforme o contexto; atributos comuns e especializados; geração procedural contextual.
- **46–49 — Carreiras:** distribuição inicial coerente; mudanças de cargo conforme requisitos; correntes internas; carreira autônoma.
- **50–53 — Alianças:** alianças dinâmicas; traições com causas; cooperação ideológica contextual; memória de promessas e acordos.
- **54–57 — Maré Ideológica:** cálculo por fatores amplos; diferenças regionais/sociais; estratégias presidenciais de risco; conversão eleitoral por regras e candidatos.
- **58–61 — Evolução da Maré:** painel esquerda-centro-direita; atualização semanal com consolidação mensal; efeitos persistentes e crises aceleradoras; preparação eleitoral antecipada dentro da lei.
- **62–65 — Eleições:** pesquisas nacionais/estaduais; negociações de candidaturas; orçamento eleitoral simplificado; Justiça Eleitoral detalhada em casos relevantes.
- **66–69 — Pós-eleição:** cadeiras por partido e Casa; coalizão reavaliada; panorama dos estados; continuidade entre mandatos com a Maré influenciando força eleitoral, respeitando limites de reeleição.
- **70–73 — Ciclo semanal:** decisão narrativa gratuita; efeitos diretos imediatos e pendências no avanço da semana; relatório semanal; recursos insuficientes bloqueiam ações comuns, com opções excepcionais de risco.
- **74–77 — Primeira versão:** todas as áreas principais acessíveis com profundidade seletiva; catálogo inteiro disponível com fichas aprofundadas para figuras centrais; múltiplos saves locais; narrativa escrita combinada com geração procedural sem dependência de API externa.


**Fim do documento mestre.** O levantamento de requisitos está encerrado. O próximo passo é transformar este documento em tarefas e arquitetura de implementação no Replit; nenhuma programação foi iniciada nesta etapa.

## Apêndice A — Catálogo adicional de personagens recebido

O usuário forneceu 150 personagens adicionais em seis grupos, cada um com uma figura pública de referência, um nome satírico e uma descrição de gameplay. Além deles, devem permanecer no elenco oito personagens definidos anteriormente. O catálogo completo foi normalizado em três formatos para facilitar leitura e implementação:

- `Palacio_em_Jogo_Catalogo_Personagens.md` — leitura por grupos;
- `Palacio_em_Jogo_Catalogo_Personagens.csv` — importação e edição tabular;
- `Palacio_em_Jogo_Catalogo_Personagens.json` — estrutura adequada à aplicação.

**Contagem:** 150 personagens adicionais + 8 personagens anteriores separados. Os personagens adicionais estão organizados em seis grupos de 25: novos políticos/MBL/candidatos; direita digital/liberais; esquerda/movimentos sociais; eleições municipais/lideranças regionais; influenciadores/comentaristas; ex-candidatos/veteranos/figuras institucionais.

**Atenção para importação:** o nome satírico “Eduarda CampoMinado” (nº 2) e “Ana CampoMinado” (nº 8) são nomes parecidos, mas distintos; preservar ambos conforme fornecidos e confirmar se a semelhança é intencional antes da publicação. Os IDs `NEW-001` a `NEW-150` e `PREV-001` a `PREV-008` são IDs de catálogo provisórios e estáveis para importação.

**Princípio editorial:** a referência a uma pessoa pública identifica a inspiração da sátira; atributos de gameplay são ficcionais e não devem ser apresentados como fatos biográficos, prova de corrupção ou acusação criminal. Antes da publicação, conferir cargos, partido, competências e contexto atual de cada referência.

