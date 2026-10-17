import type { CaseFile } from '../engine/types';

/**
 * Caso 2: as "noivas da banheira", Inglaterra, 1912–1915.
 *
 * Mesmo critério do caso 1: `documented` traz o que aparece de forma
 * consistente em fontes independentes; `divergent`, onde elas discordam ou
 * onde não encontrei confirmação; `dramatized`, o que foi criado para o jogo.
 * As medidas de profundidade da banheira e da água são estimativas do jogo.
 */
export const smith1915: CaseFile = {
  id: 'smith-1915',
  number: 2,
  title: 'As noivas da banheira',
  place: 'Herne Bay, Blackpool e Londres, Inglaterra',
  year: 1915,
  date: 'Julho de 1912 a julho de 1915',
  technique: 'Patologia forense (Bernard Spilsbury)',
  cover: 'banheira',
  playerRole:
    'Você é um jovem detetive da Polícia Metropolitana designado para ajudar o inspetor Arthur Neil, que recebeu duas cartas com recortes de jornal sobre mortes no banho.',
  intro: [
    'No começo do século XX, morrer na banheira era visto como acidente doméstico comum. Um médico examinava o corpo, o inquérito ouvia o marido e o caso era encerrado em poucos dias.',
    'Bernard Spilsbury, patologista do Home Office, ficou conhecido em 1910 ao depor no caso Crippen. Para ele, um corpo sem marcas não era um corpo sem respostas.',
    'O problema deste caso é justamente esse: três mulheres mortas, nenhum sinal de violência e três inquéritos que já concluíram que foi acidente.',
  ],
  dispatch: {
    header: 'Memorando · Scotland Yard · Janeiro de 1915',
    body: 'RECEBIDAS DUAS CARTAS COM RECORTES DE JORNAL. O SR. CHARLES BURNHAM E O SR. JOSEPH CROSSLEY APONTAM SEMELHANÇA ENTRE A MORTE DA SRA. LLOYD EM HIGHGATE E A DE ALICE BURNHAM EM BLACKPOOL, UM ANO ANTES. AMBAS MORRERAM NO BANHO LOGO APÓS O CASAMENTO. INVESTIGAR.',
  },
  copy: {
    start: 'Abrir o arquivo das mortes',
    investigationTitle: 'Três cidades, três noivas',
    toTraining: 'Levar o caso a Spilsbury',
  },
  locations: [
    {
      id: 'highgate',
      name: 'Highgate, Londres · dezembro de 1914',
      blurb: 'A morte mais recente, noticiada pelos jornais.',
      scene: 'cidade',
      evidenceIds: ['jornal', 'lofty'],
    },
    {
      id: 'blackpool',
      name: 'Blackpool · dezembro de 1913',
      blurb: 'Uma pensão à beira-mar e um pai que não esqueceu a filha.',
      scene: 'litoral',
      evidenceIds: ['burnham', 'cartas'],
    },
    {
      id: 'herne-bay',
      name: 'Herne Bay · julho de 1912',
      blurb: 'A primeira morte, dois anos antes de alguém desconfiar.',
      scene: 'casa',
      evidenceIds: ['mundy', 'french'],
    },
    {
      id: 'yard',
      name: 'Scotland Yard',
      blurb: 'Onde os registros de casamento são cruzados.',
      scene: 'arquivo',
      evidenceIds: ['nomes'],
    },
  ],
  evidence: [
    {
      id: 'jornal',
      title: 'Notícia de jornal',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'O News of the World noticia a morte de uma recém-casada encontrada na banheira de uma pensão em Highgate, um dia depois do casamento.',
        'O inquérito concluiu que foi acidente.',
      ],
    },
    {
      id: 'lofty',
      title: 'Margaret Lofty',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'Margaret Elizabeth Lofty, 38 anos, casou-se com um homem que se apresentava como John Lloyd. Ela foi encontrada morta no banho em dezembro de 1914.',
        'O corpo não tinha sinais de violência.',
      ],
    },
    {
      id: 'burnham',
      title: 'Alice Burnham',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'Alice Burnham casou-se em Portsmouth, em novembro de 1913, com um homem chamado George Smith. Em 12 de dezembro de 1913, um mês depois, ela morreu na banheira de uma pensão em Blackpool.',
        'O inquérito também concluiu que foi acidente.',
      ],
    },
    {
      id: 'cartas',
      title: 'As duas cartas',
      kind: 'depoimento',
      dramatized: false,
      paragraphs: [
        'Charles Burnham, pai de Alice, leu sobre a morte em Highgate e reconheceu a história da filha. Ele recortou as notícias e as mandou à polícia.',
        'Joseph Crossley, ligado à pensão de Blackpool onde Alice morreu, também mandou recortes. As fontes divergem sobre o papel exato de Crossley, mas concordam que as duas cartas chegaram à Scotland Yard.',
      ],
    },
    {
      id: 'mundy',
      title: 'Bessie Mundy',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'Bessie Mundy casou-se em Weymouth, em agosto de 1910, com um homem que se apresentava como Henry Williams. Em julho de 1912, em Herne Bay, os dois fizeram testamentos deixando seus bens um para o outro. O dela somava cerca de 2.579 libras.',
        'Dias depois, ela foi encontrada morta na banheira.',
      ],
    },
    {
      id: 'french',
      title: 'O depoimento do Dr. French',
      kind: 'depoimento',
      dramatized: false,
      paragraphs: [
        'Pouco antes da morte, o marido levou Bessie ao Dr. Frank French dizendo que ela tinha tido um ataque. Ao ser chamado de novo, o médico encontrou o corpo com a cabeça debaixo d’água, as pernas esticadas e os pés para fora da água.',
        'Sem sinais de violência, ele atribuiu a morte a um ataque epiléptico. O inquérito registrou morte acidental.',
      ],
    },
    {
      id: 'nomes',
      title: 'Henry Williams, George Smith, John Lloyd',
      kind: 'documento',
      dramatized: true,
      paragraphs: [
        'Cruzando certidões, fotografias e testemunhas, a investigação de Neil conclui que os três maridos são a mesma pessoa: George Joseph Smith, um bígamo que usava nomes diferentes a cada casamento.',
        'A conclusão é documentada. A cena da descoberta, como está escrita aqui, é dramatizada.',
      ],
    },
  ],
  training: {
    kind: 'raciocinio',
    title: 'O raciocínio de Spilsbury',
    lede: 'Spilsbury não encontrou veneno nem ferimentos. O trabalho dele foi separar o que cada fato realmente prova. Classifique cada afirmação.',
    items: [
      {
        id: 'sem-marcas',
        prompt: 'Nenhum dos três corpos tinha marcas de violência.',
        options: [
          { id: 'acidente', text: 'Prova que foram acidentes' },
          { id: 'neutro', text: 'Não distingue acidente de homicídio' },
          { id: 'homicidio', text: 'Prova que foi homicídio' },
        ],
        correct: 'neutro',
        explanation: 'Ausência de marcas é compatível com as duas hipóteses. Um afogamento rápido pode não deixar nenhuma lesão.',
      },
      {
        id: 'tamanho',
        prompt: 'Bessie media cerca de 1,70 m e a banheira tinha cerca de 1,52 m de fundo.',
        options: [
          { id: 'irrelevante', text: 'Não tem relação com a morte' },
          { id: 'improvavel', text: 'Torna difícil ela afundar inteira por conta própria' },
          { id: 'prova', text: 'Prova que ela foi estrangulada' },
        ],
        correct: 'improvavel',
        explanation: 'Mais alta que a banheira, ela não conseguiria ficar deitada por inteiro. Para a cabeça ir para o fundo, algo precisa mudar a posição do corpo.',
      },
      {
        id: 'epilepsia',
        prompt: 'A informação de que Bessie tinha ataques epilépticos veio do marido.',
        options: [
          { id: 'fato', text: 'É um fato médico confirmado' },
          { id: 'checar', text: 'É o relato de quem lucrou com a morte e precisa ser checado' },
          { id: 'mentira', text: 'Prova que o marido mentiu' },
        ],
        correct: 'checar',
        explanation: 'O médico viu Bessie depois do suposto ataque, mas a história veio do marido, o herdeiro dela. Relato de parte interessada é hipótese, não fato.',
      },
      {
        id: 'repeticao',
        prompt: 'Três mulheres casadas com o mesmo homem morreram afogadas no banho, depois de arranjos financeiros a favor dele.',
        options: [
          { id: 'isolado', text: 'Cada morte deve ser analisada isoladamente; a repetição não importa' },
          { id: 'relevante', text: 'A repetição torna a coincidência muito improvável e é relevante' },
          { id: 'basta', text: 'A repetição sozinha prova cada um dos homicídios' },
        ],
        correct: 'relevante',
        explanation: 'Uma morte assim pode ser acidente. Três, com o mesmo marido e o mesmo benefício, dificilmente são. Mas o padrão reforça a prova; não a substitui.',
      },
    ],
  },
  lab: {
    kind: 'patologia-banho',
    title: 'Laboratório de patologia',
    lede: 'Duas tarefas: primeiro, separar o que se repete nas três mortes; depois, testar na simulação qual hipótese explica a posição em que Bessie Mundy foi encontrada.',
    pattern: {
      title: 'Quadro das três mortes',
      lede: 'Marque apenas as características que aparecem nas três mortes.',
      cases: [
        { id: 'mundy', label: 'Herne Bay, 1912' },
        { id: 'burnham', label: 'Blackpool, 1913' },
        { id: 'lofty', label: 'Highgate, 1914' },
      ],
      features: [
        {
          id: 'mesmo-homem',
          text: 'Casamento recente com o mesmo homem, usando nomes diferentes',
          inAll: true,
          note: 'Henry Williams, George Smith e John Lloyd eram George Joseph Smith.',
        },
        {
          id: 'dinheiro',
          text: 'Arranjo financeiro a favor do marido pouco antes da morte',
          inAll: true,
          note: 'Testamento no caso Mundy. Nos outros dois, os relatos falam em seguro de vida.',
        },
        {
          id: 'banho',
          text: 'Morte na banheira, sem testemunhas',
          inAll: true,
          note: 'As três foram encontradas mortas no banho, com o marido como única pessoa por perto.',
        },
        {
          id: 'inquerito',
          text: 'Inquérito concluiu que foi acidente',
          inAll: true,
          note: 'Nenhuma das três mortes foi tratada como crime na época.',
        },
        {
          id: 'luta',
          text: 'Marcas de luta ou ferimentos no corpo',
          inAll: false,
          note: 'Nenhum dos corpos tinha sinais de violência. Essa ausência é o centro do caso.',
        },
        {
          id: 'testemunha',
          text: 'Alguém viu o marido dentro do banheiro',
          inAll: false,
          note: 'Não houve testemunha ocular em nenhuma das mortes.',
        },
        {
          id: 'casa-familia',
          text: 'Morte na casa da família da vítima',
          inAll: false,
          note: 'As mortes ocorreram em casas ou quartos alugados pelo casal, longe da família.',
        },
        {
          id: 'veneno',
          text: 'Veneno ou arma encontrados',
          inAll: false,
          note: 'Nada disso foi encontrado. Foi por isso que a patologia teve de explicar o mecanismo da morte.',
        },
      ],
    },
    bath: {
      title: 'Simulação: a banheira de Herne Bay',
      lede: 'Teste cada hipótese e compare o resultado com o que o médico descreveu. O modelo é simplificado: ele mostra a geometria, não reproduz a biomecânica real.',
      bathLength: 152,
      bathDepth: 50,
      waterDepth: 30,
      victimHeight: 170,
      foundDescription:
        'Segundo o Dr. Frank French: cabeça debaixo d’água, pernas esticadas e pés para fora da água, na ponta da banheira.',
      found: { headUnderwater: true, legsStraight: true, feetOut: true },
      hypotheses: [
        {
          id: 'desmaio',
          name: 'Desmaio',
          description: 'Ela perde os sentidos sentada e escorrega o quanto a banheira permite.',
          pose: { torso: 60, thigh: 40, shin: -45, hipX: 40 },
          outcome: 'Mais alta que a banheira, ela não consegue deitar por inteiro. O corpo fica sentado e a cabeça fica fora da água.',
        },
        {
          id: 'epilepsia',
          name: 'Ataque epiléptico',
          description: 'Na fase de rigidez de um ataque, o corpo inteiro se estica.',
          pose: { torso: 50, thigh: 10, shin: 10, hipX: 63 },
          outcome: 'Numa banheira mais curta que ela, os pés batem na ponta e o tronco é empurrado para cima pela cabeceira. A cabeça sobe, em vez de afundar.',
        },
        {
          id: 'puxada',
          name: 'Pernas puxadas',
          description: 'Alguém de pé na ponta da banheira levanta os pés dela de repente.',
          pose: { torso: 5, thigh: 30, shin: 30, hipX: 70 },
          outcome: 'Com os pés erguidos, o tronco escorrega pelo fundo e a cabeça afunda de uma vez. As pernas ficam esticadas e os pés, fora da água.',
        },
      ],
      correct: 'puxada',
      explanation:
        'Só essa hipótese reproduz a posição descrita pelo médico. Foi a tese que Spilsbury levou ao julgamento. Ele sustentou ainda que a submersão súbita podia fazer a vítima perder a consciência quase de imediato, o que explicaria a falta de sinais de luta.',
    },
  },
  accusation: [
    {
      id: 'causa',
      prompt: 'Segundo a perícia, como Bessie Mundy morreu?',
      options: [
        { id: 'epilepsia', text: 'Ataque epiléptico seguido de afogamento acidental' },
        { id: 'puxada', text: 'Afogamento provocado: alguém puxou as pernas dela e a cabeça submergiu' },
        { id: 'veneno', text: 'Envenenamento antes do banho' },
      ],
      correct: 'puxada',
      explanation: 'A posição do corpo, a altura de Bessie e o tamanho da banheira só fazem sentido se alguém ergueu as pernas dela.',
    },
    {
      id: 'padrao',
      prompt: 'Smith foi julgado apenas pela morte de Bessie. Por que as mortes de Alice e Margaret puderam ser apresentadas ao júri?',
      options: [
        { id: 'confissao', text: 'Porque Smith confessou as três' },
        { id: 'improvavel', text: 'Porque três afogamentos iguais ligados ao mesmo marido afastam a tese de acidente' },
        { id: 'conjunto', text: 'Porque a lei permitia julgar os três crimes no mesmo processo' },
      ],
      correct: 'improvavel',
      explanation:
        'É a chamada prova de fatos semelhantes. Na apelação, R v Smith (1915), o tribunal confirmou que as outras mortes podiam ser usadas para mostrar que a de Bessie não foi acidente.',
    },
    {
      id: 'contribuicao',
      prompt: 'Qual foi a contribuição central da patologia forense neste caso?',
      options: [
        { id: 'veneno', text: 'Encontrar veneno nos corpos exumados' },
        { id: 'mecanismo', text: 'Explicar como uma morte sem marcas podia ser homicídio, e testar essa explicação' },
        { id: 'digitais', text: 'Identificar Smith pelas impressões digitais' },
      ],
      correct: 'mecanismo',
      explanation: 'Spilsbury propôs um mecanismo compatível com os achados e a polícia o testou. A ciência transformou "nenhuma marca" em uma explicação.',
    },
  ],
  reveal: {
    summary: [
      'A notícia sobre Margaret Lofty fez Charles Burnham reconhecer a morte da filha, e Joseph Crossley também escreveu à polícia. O inspetor Arthur Neil descobriu que Henry Williams, George Smith e John Lloyd eram o mesmo homem: George Joseph Smith, um bígamo.',
      'Bernard Spilsbury examinou os corpos exumados e não encontrou sinais de violência. Ele propôs que Smith puxava os pés da vítima, fazendo a cabeça afundar de repente. Neil testou a ideia na delegacia, com banheiras e uma voluntária que sabia nadar; segundo os relatos, ela perdeu os sentidos e precisou ser reanimada.',
      'Smith foi julgado em junho de 1915 apenas pela morte de Bessie Mundy. A acusação apresentou as outras duas mortes para mostrar que não houve acidente. Mesmo com a defesa de Edward Marshall Hall, um dos advogados mais famosos da época, Smith foi condenado em 1º de julho de 1915.',
      'A apelação confirmou que as outras mortes podiam ser usadas como prova, no precedente R v Smith (1915), ainda citado no direito inglês. Smith foi enforcado em 13 de agosto de 1915. O caso fez de Spilsbury a maior autoridade da patologia forense britânica.',
    ],
    fidelity: {
      documented: [
        'Três mulheres morreram no banho entre 1912 e 1914, todas casadas com George Joseph Smith, que usava nomes diferentes.',
        'Bessie Mundy fez testamento a favor do marido; o Dr. French atribuiu a morte a epilepsia e o inquérito concluiu que foi acidente.',
        'A investigação começou com as cartas de Charles Burnham e de Joseph Crossley; o inspetor Arthur Neil liderou o caso.',
        'Spilsbury propôs que as pernas eram puxadas; Smith foi julgado só pela morte de Bessie, com as outras duas mortes admitidas como prova (R v Smith, 1915), e foi enforcado em 13 de agosto de 1915.',
      ],
      divergent: [
        'Margaret Lofty aparece também como Margaret Lloyd, o sobrenome de casada sob o nome falso de Smith.',
        'Crossley: as fontes divergem sobre o primeiro nome e sobre se era o dono ou a dona da pensão de Blackpool.',
        'O experimento: os relatos variam sobre quantas voluntárias participaram e o que exatamente aconteceu.',
        'Seguros de vida de Alice e Margaret: aparecem em vários relatos, mas não confirmei os valores.',
        'O argumento de que a rigidez de um ataque epiléptico empurraria o corpo para cima é atribuído a Spilsbury, mas não o encontrei na transcrição do julgamento.',
      ],
      dramatized: [
        'O papel do jogador como assistente de Neil e o texto do memorando.',
        'A cena em que os três nomes são ligados ao mesmo homem.',
        'A simulação: a altura de 1,70 m e a banheira de 1,52 m vêm de relatos; a profundidade da água e da banheira e o modelo do corpo são estimativas do jogo.',
      ],
    },
    today: [
      {
        title: 'A autópsia hoje',
        text: 'Além do exame do corpo, a patologia forense usa toxicologia, histologia (análise de tecidos ao microscópio) e tomografia pós-morte. Nos afogamentos, testes como o de diatomáceas, algas microscópicas que entram no sangue de quem ainda respirava, ajudam, mas têm limitações conhecidas.',
      },
      {
        title: 'Autoridade não é prova',
        text: 'Depois deste caso, os júris passaram a tratar a palavra de Spilsbury como quase definitiva. Com o tempo, laudos dele em outros julgamentos, como o de Norman Thorne em 1925, passaram a ser citados como exemplos de conclusões apresentadas com certeza demais. A perícia vale pelo método, não pelo nome de quem assina.',
      },
      {
        title: 'Quando o padrão engana',
        text: 'O argumento "três coincidências são improváveis demais" funcionou aqui porque havia outras provas. Em 1999, a britânica Sally Clark foi condenada pela morte de dois filhos depois que um pediatra estimou a chance de duas mortes súbitas naturais em "1 em 73 milhões". O cálculo estava errado e ela foi absolvida em 2003. Probabilidade em tribunal exige estatística feita direito.',
      },
    ],
    sources: [
      { label: 'History Today — Serial killer Smith convicted', kind: 'jornalístico', url: 'https://www.historytoday.com/archive/serial-killer-smith-convicted' },
      { label: 'HeinOnline Blog — Crime of the Century: The Brides in the Bath', kind: 'jurídico', url: 'https://heinonline.com/blog/2022/09/crime-of-the-century-the-brides-in-the-bath/' },
      { label: 'History by the Yard — George Joseph Smith and the "Brides in the Bath" case', kind: 'museu', url: 'https://www.historybytheyard.co.uk/brides_in_bath.htm' },
      { label: 'Mental Floss — The "Brides in the Bath" Murders', kind: 'jornalístico', url: 'https://www.mentalfloss.com/crime/brides-in-the-bath-murders' },
      { label: 'Eric R. Watson (org.), Trial of George Joseph Smith, série Notable British Trials (1922)', kind: 'livro' },
      { label: 'Wikipedia — R v Smith (usada como índice de fontes)', kind: 'enciclopédia', url: 'https://en.wikipedia.org/wiki/R_v_Smith' },
      { label: 'Wikipedia — George Joseph Smith (usada como índice de fontes)', kind: 'enciclopédia', url: 'https://en.wikipedia.org/wiki/George_Joseph_Smith' },
    ],
  },
};
