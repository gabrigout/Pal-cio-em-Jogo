# Pesquisa e aplicação das cores partidárias

Atualizado em: 2026-10-16  
Escopo: identidade de cores das seis legendas ficcionais e aplicação no tema principal do Palácio em Jogo.

## Como a pesquisa foi aplicada

As siglas e os nomes do jogo são paródias de partidos reais, não cópias integrais. A paleta tenta preservar o reconhecimento por meio de duas cores, com a seguinte convenção: **primeira cor = destaque e botões; segunda cor = ícones, bordas e grafismos**. O tema calcula variantes com contraste adequado ao fundo escuro. A cor institucional original permanece armazenada e aparece nos seletores/cartões da legenda.

Há uma distinção importante: alguns manuais publicam valores RGB/HEX; outros confirmam apenas os elementos cromáticos do símbolo. Onde não encontrei valor digital oficial acessível, usei uma aproximação inspirada pela marca, indicada como tal — não como código oficial do partido real.

## Paletas aplicadas

| Partido ficcional | Inspiração | Cor primária | Cor secundária | Como foi escolhida |
|---|---|---|---|---|
| PTP — Partido da Taxa e da Picanha | PT | **#E4142C — vermelho** | **#FFFFFF — branco** | A marca PT Digital define vermelho e branco como cores oficiais; o tom vermelho digital segue o valor do manual de marca disponível publicamente. É a combinação mais explicitamente solicitada: vermelho e branco. |
| PSÓ — Partido Socialista Óbvio | PSOL | **#D71920 — vermelho** | **#FFD52B — amarelo** | O estatuto do PSOL descreve uma bandeira vermelha com um sol amarelo. Os HEX do jogo são aproximações digitais para essas duas cores, não HEX oficiais declarados pelo estatuto. |
| PDTT — Partido do Discurso, da Tese e do Trabalhismo | PDT | **#C8102E — vermelho** | **#009640 — verde** | A identidade do PDT mantém a rosa vermelha. O par vermelho/verde é uma aproximação do motivo da rosa e folhagem para distinguir visualmente a legenda do PTP. Os códigos digitais não são apresentados como HEX oficiais do PDT. |
| PLIM — Partido da Live, Influência e Mobilização | PL | **#004F9F — azul** | **#009640 — verde** | O manual do PL publica esses dois valores RGB: azul (0, 79, 159) e verde (0, 150, 64). O manual também inclui amarelo (255, 213, 0); o jogo escolhe azul e verde para caber no par de cores e distinguir o PLIM do PSSDB. |
| PSSDB — Partido dos Senhores, Slides e Debates de Brasília | PSDB | **#004C94 — azul** | **#FFD600 — amarelo** | O PSDB reafirmou azul e amarelo como cores oficiais ao modernizar sua marca em 2023. O manual de marca publicado pelo partido fornece azul RGB (0, 76, 148) e amarelo (255, 214, 0). |
| NOVA — Núcleo de Otimização, Valor e Austeridade | NOVO | **#F17021 — laranja** | **#1A2948 — azul-marinho** | O manual de marca do NOVO publica laranja #F17021 e azul #1A2948 como cores primárias. O laranja permanece a primeira cor, conforme a preferência já definida para esta paródia. |

## Fontes consultadas

1. **PT:** [site oficial do PT](https://pt.org.br/) e [manual de marca PT Digital — cópia pública consultável](https://pt.scribd.com/document/829898441/Partido-Dos-Trabalhadores-Pt-Seeklogo). A cópia do manual descreve vermelho e branco como cores oficiais e lista o tom vermelho #E4142C. Como a cópia está hospedada por terceiro, o valor HEX é tratado como referência de identidade digital, não como arquivo oficial hospedado pelo partido.
2. **PSOL:** [estatuto no site oficial](https://psol50.org.br/partido/estatuto/), art. 3º: bandeira vermelha com sol amarelo.
3. **PDT:** [página oficial de identidade visual do PDT-RS](https://www.pdtrs.org.br/identidadevisual), que oferece o manual e o logo de 2026; [notícia do PDT sobre a renovação de identidade](https://pdt.org.br/index.php/pdt-renova-sua-identidade-visual/), que confirma a permanência da rosa vermelha no símbolo.
4. **PL:** [manual de marca do Partido Liberal (2023)](https://partidoliberal.org.br/wp-content/uploads/2023/03/manual-da-marca-pl-2023.pdf), página de escala de cores.
5. **PSDB:** [notícia oficial sobre a marca renovada](https://www.psdb.org.br/acompanhe/noticias/psdb-moderniza-sua-marca/) e [manual de uso da marca](https://www.psdb.org.br/sc/files/2016/04/Manual-da-Marca-PSDB-Como-Usar.pdf), que publica azul RGB (0, 76, 148) e amarelo (255, 214, 0).
6. **NOVO:** [guia de marca hospedado pelo partido](https://novo.org.br/wp-content/uploads/2021/07/NOVO_Manual-de-marca-2021-2.pdf), seção de cores primárias.

## Onde as cores entram no jogo

- O catálogo **src/data/campaignConfig.ts** é a fonte única dos pares.
- **src/data/parties.ts** usa o catálogo; o seletor de partido mostra as duas amostras de cor.
- **src/engine/campaign.ts** cria o tema da campanha a partir do par escolhido.
- O componente de configuração descreve como as duas cores afetam os destaques e os grafismos.
- Campanhas já salvas continham suas próprias cores e tema no estado serializado. Por isso, a versão de save passa de 7 para **8** e migra as cores dos seis partidos predefinidos. O tema também é recalculado; assim, o jogo principal se atualiza tanto para campanhas novas quanto para campanhas antigas abertas após a migração.
- Partidos personalizados mantêm as cores escolhidas pelo jogador; a migração não sobrescreve a paleta personalizada.

## Contraste e limite de fidelidade

O jogo possui interface escura. O tema deriva variantes contrastantes para textos/ícones quando a cor institucional original tem pouco contraste com o fundo. A amostra de cor e o tema oficial guardam os valores pesquisados, enquanto elementos de interface podem usar uma variante mais clara para legibilidade. Isso é intencional: reproduzir o HEX literalmente em todo texto pequeno pioraria a acessibilidade.

O projeto usa apenas dois tons por legenda na interface. Portanto, a aplicação não reproduz todas as cores secundárias de cada manual — por exemplo, o amarelo adicional do PL ou as cores auxiliares do NOVO. O objetivo é um reconhecimento consistente no jogo, sem copiar integralmente logotipos e materiais partidários.
