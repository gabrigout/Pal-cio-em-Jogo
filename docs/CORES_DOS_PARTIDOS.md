# Pesquisa e aplicação das cores partidárias

Atualizado em: 2026-10-16  
Escopo: identidade de cores das seis legendas ficcionais e aplicação no tema principal do Palácio em Jogo.

## Como a pesquisa foi aplicada

As siglas e os nomes do jogo são paródias de partidos reais, não cópias integrais. A paleta tenta preservar o reconhecimento por meio de duas cores, com a seguinte convenção: **primeira cor = destaque e fundo dos botões de ação; segunda cor = ícones, bordas e grafismos**. Os botões principais usam o HEX primário da legenda e texto com contraste calculado; o tema deriva variantes legíveis para textos pequenos e indicadores no fundo escuro. A cor institucional original permanece armazenada e aparece nos seletores/cartões da legenda.

Há uma distinção importante: alguns manuais publicam valores RGB/HEX; outros confirmam apenas os elementos cromáticos do símbolo. Onde não encontrei valor digital oficial acessível, usei uma aproximação inspirada pela marca, indicada como tal — não como código oficial do partido real.

## Paletas aplicadas

| Partido ficcional | Inspiração | Cor primária | Cor secundária | Como foi escolhida |
|---|---|---|---|---|
| PTP — Partido da Taxa e da Picanha | PT | **#E4142C — vermelho** | **#FFFFFF — branco** | A marca PT Digital define vermelho e branco como cores oficiais; o tom vermelho digital segue o valor do manual de marca disponível publicamente. É a combinação mais explicitamente solicitada: vermelho e branco. |
| PSÓ — Partido Socialista Óbvio | PSOL | **#E02028 — vermelho** | **#FEDF00 — amarelo** | O estatuto do PSOL descreve uma bandeira vermelha com um sol amarelo; o manual oficial de aplicação do logotipo publica esses valores RGB/HEX para mídia digital. |
| PDTT — Partido do Discurso, da Tese e do Trabalhismo | PDT | **#E4002B — vermelho** | **#005AB2 — azul** | O estatuto do PDT define vermelho, branco e azul, com rosa vermelha e bandeira nas três cores. A paleta digital do diretório do PDT-RS publica esses valores de vermelho e azul; são usados como referência visual para distinguir o PDTT do PTP vermelho/branco. |
| PLIM — Partido da Live, Influência e Mobilização | PL | **#004F9F — azul** | **#009640 — verde** | O manual do PL publica esses dois valores RGB: azul (0, 79, 159) e verde (0, 150, 64). O manual também inclui amarelo (255, 213, 0); o jogo escolhe azul e verde para caber no par de cores e distinguir o PLIM do PSSDB. |
| PSSDB — Partido dos Senhores, Slides e Debates de Brasília | PSDB | **#004C94 — azul** | **#FFD600 — amarelo** | O PSDB reafirmou azul e amarelo como cores oficiais ao modernizar sua marca em 2023. O manual de marca publicado pelo partido fornece azul RGB (0, 76, 148) e amarelo (255, 214, 0). |
| NOVA — Núcleo de Otimização, Valor e Austeridade | NOVO | **#EC671C — laranja** | **#1A2644 — azul-marinho** | O brandbook mais recente consultado, hospedado pelo NOVO em 2024, apresenta laranja #EC671C e azul-escuro #1A2644 na paleta da marca. O laranja permanece a primeira cor. |

## Fontes consultadas

1. **PT:** [site oficial do PT](https://pt.org.br/) e [manual de marca PT Digital — cópia pública consultável](https://pt.scribd.com/document/829898441/Partido-Dos-Trabalhadores-Pt-Seeklogo). A cópia do manual descreve vermelho e branco como cores oficiais e lista o tom vermelho #E4142C. Como a cópia está hospedada por terceiro, o valor HEX é tratado como referência de identidade digital, não como arquivo oficial hospedado pelo partido.
2. **PSOL:** [estatuto no site oficial](https://psol50.org.br/partido/estatuto/), art. 3º: bandeira vermelha com sol amarelo, e [manual oficial de aplicação do logotipo](https://psol50.org.br/wp-content/uploads/2018/11/manual-logotipo.pdf), que informa RGB 224/31/41 (#E02028) e RGB 254/223/0 (#FEDF00) para mídia digital.
3. **PDT:** [notícia do PDT Nacional de 4 de maio de 2026](https://pdt.org.br/index.php/pdt-renova-sua-identidade-visual/), que confirma a rosa vermelha na identidade atual; [estatuto do PDT (2024)](https://pdt.org.br/wp-content/uploads/2024/07/estatuto-2024.pdf), que registra vermelho, branco e azul como cores históricas; [cartela de cores PDT-RS 2025](https://www.pdtrs.org.br/_files/ugd/835f28_4968db375c5046f58519fbea1642ab8c.pdf), que publica vermelho #E4002B e azul #005AB2 entre seus códigos RGB/HEX.
4. **PL:** [manual de marca do Partido Liberal (2023)](https://partidoliberal.org.br/wp-content/uploads/2023/03/manual-da-marca-pl-2023.pdf), página de escala de cores.
5. **PSDB:** [notícia oficial de 24 de agosto de 2023 sobre a marca renovada](https://www.psdb.org.br/acompanhe/noticias/psdb-moderniza-sua-marca/), que confirma a manutenção de azul e amarelo, e [manual de uso da marca hospedado pelo partido (junho de 2012)](https://www.psdb.org.br/sc/files/2016/04/Manual-da-Marca-PSDB-Como-Usar.pdf), que publica azul RGB (0, 76, 148) e amarelo (255, 214, 0). Como o manual de códigos disponível é mais antigo que a marca lançada em 2023, o par mantém a família cromática comprovada, não afirma que os HEX de 2012 sejam necessariamente a especificação digital do novo logotipo.
6. **NOVO:** [brandbook hospedado pelo partido em 2024](https://novo.org.br/wp-content/uploads/2024/11/NOVO_brandbook2023.pdf), tabela de cores.

## Onde as cores entram no jogo

- O catálogo **src/data/campaignConfig.ts** é a fonte única dos pares.
- **src/data/parties.ts** usa o catálogo; o seletor de partido mostra as duas amostras de cor.
- **src/engine/campaign.ts** cria o tema da campanha a partir do par escolhido.
- O componente de configuração descreve como as duas cores afetam os destaques e os grafismos.
- Campanhas já salvas continham suas próprias cores e tema no estado serializado. Por isso, a versão de save passa de 8 para **9** e migra as cores dos seis partidos predefinidos, incluindo as correções de código de PSOL e NOVO. O tema também é recalculado; assim, o jogo principal se atualiza tanto para campanhas novas quanto para campanhas antigas abertas após a migração.
- Partidos personalizados mantêm as cores escolhidas pelo jogador; a migração não sobrescreve a paleta personalizada.

## Contraste e limite de fidelidade

O jogo possui interface escura. O tema deriva variantes contrastantes para textos/ícones quando a cor institucional original tem pouco contraste com o fundo. A amostra de cor e o tema oficial guardam os valores pesquisados, enquanto elementos de interface podem usar uma variante mais clara para legibilidade. Isso é intencional: reproduzir o HEX literalmente em todo texto pequeno pioraria a acessibilidade.

A cartela foi revisada com fontes atualizadas em 16/10/2026; a marca nacional mais recente do PDT foi considerada (maio de 2026) e a renovação do PSDB em 2023 foi considerada na escolha das famílias de cor. O projeto usa apenas dois tons por legenda na interface. Portanto, a aplicação não reproduz todas as cores secundárias de cada manual — por exemplo, o amarelo adicional do PL ou as cores auxiliares do NOVO. O objetivo é um reconhecimento consistente no jogo, sem copiar integralmente logotipos e materiais partidários.
