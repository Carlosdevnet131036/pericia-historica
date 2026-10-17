import type { CaseFile } from '../engine/types';

/**
 * Caso 5: os restos de Moffat, Escócia e Inglaterra, 1935–1936.
 *
 * Os corpos foram mutilados para impedir a identificação; o jogo menciona
 * isso uma vez, sem detalhes, porque é o centro do problema pericial.
 * Temperaturas, totais de graus-dia e a tabela de estágios são ilustrativos,
 * calibrados para reproduzir a estimativa de Mearns (larvas de 12 a 14 dias).
 */
export const ruxton1935: CaseFile = {
  id: 'ruxton-1935',
  number: 5,
  title: 'Os embrulhos de Moffat',
  place: 'Moffat, Escócia, e Lancaster, Inglaterra',
  year: 1935,
  date: 'Setembro de 1935 a maio de 1936',
  technique: 'Entomologia forense (Alexander Mearns)',
  playerRole:
    'Você é assistente do professor John Glaister, na Universidade de Glasgow, e recebe os vestígios encontrados perto de Moffat.',
  intro: [
    'Em 1935 não existe DNA. Para dar nome a um corpo, a perícia depende de anatomia, impressões digitais, fotografias e roupas.',
    'Neste caso, quem escondeu os corpos tentou eliminar justamente essas pistas: os restos foram mutilados para impedir a identificação. O jogo não descreve isso; o que importa aqui é como a ciência contornou o problema.',
    'Duas perguntas guiam o trabalho: quando os restos foram deixados ali, e de onde vieram.',
  ],
  dispatch: {
    header: 'Polícia de Dumfriesshire · 30 de setembro de 1935',
    body: 'RESTOS HUMANOS ENCONTRADOS EM RAVINA PERTO DE MOFFAT, EMBRULHADOS EM LENÇÓIS, ROUPAS E JORNAIS. LARVAS DE MOSCA PRESENTES. IDENTIDADE E DATA DESCONHECIDAS. SOLICITA-SE APOIO DA UNIVERSIDADE.',
  },
  copy: {
    start: 'Abrir o comunicado da polícia escocesa',
    investigationTitle: 'Da ravina escocesa a Lancaster',
    toTraining: 'Levar larvas e jornais ao laboratório',
  },
  locations: [
    {
      id: 'moffat',
      name: 'Gardenholme Linn, perto de Moffat · setembro de 1935',
      blurb: 'Uma ravina ao lado da estrada entre Edimburgo e Carlisle.',
      evidenceIds: ['achado', 'larvas'],
    },
    {
      id: 'embrulho',
      name: 'Os embrulhos',
      blurb: 'Lençóis, roupas e jornais, examinados um a um.',
      evidenceIds: ['jornais', 'roupas'],
    },
    {
      id: 'lancaster',
      name: 'Lancaster, Dalton Square',
      blurb: 'A casa de um médico conhecido na cidade.',
      evidenceIds: ['desaparecidas', 'casa'],
    },
    {
      id: 'universidades',
      name: 'Universidades de Glasgow e Edimburgo',
      blurb: 'Onde anatomistas e legistas montam o quebra-cabeça.',
      evidenceIds: ['especialistas'],
    },
  ],
  evidence: [
    {
      id: 'achado',
      title: 'A ravina',
      kind: 'local',
      dramatized: false,
      paragraphs: [
        'No fim de setembro de 1935, uma pessoa que passava por uma ponte perto de Moffat viu embrulhos presos nas pedras do riacho. Eram restos humanos, de mais de uma pessoa.',
        'Os restos tinham sido mutilados para impedir a identificação.',
      ],
    },
    {
      id: 'larvas',
      title: 'As larvas',
      kind: 'objeto',
      dramatized: false,
      paragraphs: [
        'Havia larvas de mosca nos restos. Elas foram recolhidas e enviadas ao entomologista Alexander Mearns, que identificou a espécie: Calliphora vicina, uma mosca-varejeira azul.',
      ],
    },
    {
      id: 'jornais',
      title: 'Os jornais',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'Entre os jornais do embrulho havia exemplares do Daily Herald de agosto, um Sunday Chronicle e um Sunday Graphic de 15 de setembro de 1935.',
        'Aquele Sunday Graphic era uma edição especial, com notícia local, distribuída só numa pequena região do noroeste da Inglaterra.',
      ],
    },
    {
      id: 'roupas',
      title: 'As roupas',
      kind: 'objeto',
      dramatized: false,
      paragraphs: [
        'Algumas peças de roupa dos embrulhos foram depois reconhecidas por pessoas que as tinham dado ou costurado. Cada reconhecimento ligava o embrulho a uma casa.',
      ],
    },
    {
      id: 'desaparecidas',
      title: 'Duas mulheres desaparecidas',
      kind: 'depoimento',
      dramatized: false,
      paragraphs: [
        'Em Lancaster, Isabella Ruxton, companheira do médico Buck Ruxton, e Mary Jane Rogerson, de 20 anos, que trabalhava na casa, não eram vistas desde 14 de setembro de 1935.',
        'O médico deu explicações diferentes para a ausência das duas.',
      ],
    },
    {
      id: 'casa',
      title: 'A casa de Dalton Square',
      kind: 'local',
      dramatized: false,
      paragraphs: [
        'A polícia examinou a casa e recolheu impressões digitais deixadas em objetos que Mary Rogerson costumava manusear.',
      ],
    },
    {
      id: 'especialistas',
      title: 'A equipe',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'O professor John Glaister, de Glasgow, e o anatomista James Couper Brash, de Edimburgo, lideraram a análise, com Sydney Smith, Gilbert Millar e outros. Cada especialista cuidou de uma parte do quebra-cabeça.',
      ],
    },
  ],
  training: {
    kind: 'raciocinio',
    title: 'O relógio das moscas',
    lede: 'Moscas chegam a um corpo exposto muito rápido e seus filhotes crescem num ritmo previsível. Antes de usar esse relógio, entenda o que ele mede.',
    items: [
      {
        id: 'minimo',
        prompt: 'As larvas mais velhas encontradas num corpo têm cerca de 13 dias.',
        options: [
          { id: 'hora', text: 'A morte aconteceu exatamente 13 dias antes' },
          { id: 'minimo', text: 'O corpo estava exposto às moscas havia pelo menos uns 13 dias' },
          { id: 'nada', text: 'A idade das larvas não diz nada sobre a morte' },
        ],
        correct: 'minimo',
        explanation: 'As larvas medem desde quando as moscas tiveram acesso ao corpo. A morte pode ter sido antes, se o corpo ficou escondido ou fechado.',
      },
      {
        id: 'frio',
        prompt: 'No frio, larvas crescem mais devagar.',
        options: [
          { id: 'graus', text: 'Por isso a idade é calculada em graus-dia, somando o calor de cada dia' },
          { id: 'ignorar', text: 'Por isso a temperatura deve ser ignorada' },
          { id: 'dias', text: 'Por isso basta contar os dias no calendário' },
        ],
        correct: 'graus',
        explanation: 'Treze dias frios e treze dias quentes produzem larvas de tamanhos diferentes. O que se soma é o calor disponível.',
      },
      {
        id: 'jornal',
        prompt: 'Um dos jornais do embrulho é de 15 de setembro.',
        options: [
          { id: 'dia', text: 'Os restos foram embrulhados no dia 15' },
          { id: 'antes', text: 'Os restos não podem ter sido embrulhados antes de 15 de setembro' },
          { id: 'leitor', text: 'Quem embrulhou é assinante daquele jornal' },
        ],
        correct: 'antes',
        explanation: 'O papel mais recente marca a data mínima. Ninguém embrulha algo num jornal que ainda não foi impresso.',
      },
      {
        id: 'edicao',
        prompt: 'Aquela edição do jornal só foi vendida numa pequena região.',
        options: [
          { id: 'autor', text: 'Prova quem embrulhou os restos' },
          { id: 'regiao', text: 'Aponta a região de onde o embrulho provavelmente saiu' },
          { id: 'irrelevante', text: 'Não importa: jornais viajam' },
        ],
        correct: 'regiao',
        explanation: 'Jornal viaja, mas pouco. Uma edição local, a mais de 100 quilômetros dali, é uma pista forte de origem, não de autoria.',
      },
    ],
  },
  lab: {
    kind: 'entomologia',
    title: 'Laboratório: larvas e embrulho',
    lede: 'Primeiro, date a chegada das moscas pelos graus-dia. Depois, use os jornais do embrulho para achar de onde ele veio e a data mínima.',
    larvae: {
      title: 'Graus-dia acumulados',
      lede: 'A tabela de estágios e as temperaturas são ilustrativas, calibradas para o jogo. O método é o usado hoje.',
      measured: 'Larvas de Calliphora vicina com 14 a 16 mm, ainda se alimentando. Coletadas na manhã de 29 de setembro.',
      stages: [
        { id: 'l1', name: '1º estágio', length: '2 a 5 mm', degreeDays: 30 },
        { id: 'l2', name: '2º estágio', length: '5 a 10 mm', degreeDays: 60 },
        { id: 'l3', name: '3º estágio, alimentando', length: '10 a 17 mm', degreeDays: 117 },
        { id: 'pos', name: 'Pós-alimentação', length: '17 a 20 mm, já sem comer', degreeDays: 170 },
      ],
      correctStage: 'l3',
      baseTemp: 2,
      monthLabel: 'setembro de 1935',
      lastDay: 28,
      temps: [
        { day: 12, temp: 14 },
        { day: 13, temp: 14 },
        { day: 14, temp: 13 },
        { day: 15, temp: 13 },
        { day: 16, temp: 12 },
        { day: 17, temp: 12 },
        { day: 18, temp: 11 },
        { day: 19, temp: 12 },
        { day: 20, temp: 11 },
        { day: 21, temp: 10 },
        { day: 22, temp: 11 },
        { day: 23, temp: 12 },
        { day: 24, temp: 11 },
        { day: 25, temp: 10 },
        { day: 26, temp: 10 },
        { day: 27, temp: 11 },
        { day: 28, temp: 10 },
      ],
      explanation:
        'Somando o calor de cada dia, as larvas de 3º estágio indicam postura por volta de 16 de setembro: uns 12 a 14 dias antes da coleta, como Mearns estimou. Isso é compatível com o desaparecimento das duas mulheres no dia 14 e com o descarte logo depois.',
    },
    wrapping: {
      title: 'Os jornais do embrulho',
      lede: 'Cada jornal tem uma data e uma área de venda. Juntos, eles respondem de onde e desde quando.',
      papers: [
        { id: 'herald6', title: 'Daily Herald', date: '6 de agosto de 1935', distribution: 'Todo o país' },
        { id: 'herald31', title: 'Daily Herald', date: '31 de agosto de 1935', distribution: 'Todo o país' },
        { id: 'chronicle', title: 'Sunday Chronicle', date: 'data não legível', distribution: 'Todo o país' },
        { id: 'graphic', title: 'Sunday Graphic, edição especial local', date: '15 de setembro de 1935', distribution: 'Só em Lancaster e Morecambe' },
      ],
      leadQuestion: 'Qual jornal aponta uma cidade?',
      leadPaperId: 'graphic',
      dateQuestion: 'Qual a data mais cedo em que os restos podem ter sido embrulhados?',
      dateOptions: [
        { id: '6ago', text: '6 de agosto' },
        { id: '31ago', text: '31 de agosto' },
        { id: '15set', text: '15 de setembro' },
        { id: '29set', text: '29 de setembro' },
      ],
      correctDate: '15set',
      explanation:
        'Jornais vendidos no país inteiro não apontam lugar nenhum. A edição local do Sunday Graphic levou a investigação a Lancaster, e a data dela, 15 de setembro, é o limite mínimo para o embrulho. As duas pistas, larvas e jornal, concordam.',
    },
  },
  accusation: [
    {
      id: 'ligacao',
      prompt: 'Como a investigação foi de uma ravina na Escócia até Lancaster?',
      options: [
        { id: 'testemunha', text: 'Uma testemunha viu o carro na estrada' },
        { id: 'jornal', text: 'Pela edição local do jornal usado no embrulho' },
        { id: 'confissao', text: 'Pela confissão do médico' },
      ],
      correct: 'jornal',
      explanation: 'A edição especial do Sunday Graphic só circulou na região de Lancaster e Morecambe. A partir daí, a polícia chegou às duas mulheres desaparecidas.',
    },
    {
      id: 'datacao',
      prompt: 'O que a entomologia forense mostrou?',
      options: [
        { id: 'hora', text: 'A hora exata das mortes' },
        { id: 'janela', text: 'Que as moscas chegaram por volta de 16 de setembro, compatível com o desaparecimento no dia 14' },
        { id: 'causa', text: 'A causa das mortes' },
      ],
      correct: 'janela',
      explanation: 'As larvas tinham de 12 a 14 dias. Foi um dos primeiros usos da entomologia num julgamento.',
    },
    {
      id: 'identidade',
      prompt: 'Como as vítimas foram identificadas, apesar da mutilação?',
      options: [
        { id: 'visual', text: 'Por reconhecimento visual dos parentes' },
        { id: 'convergencia', text: 'Pela convergência de digitais, superposição crânio-foto, moldes dos pés nos sapatos e roupas reconhecidas' },
        { id: 'dna', text: 'Por exame de DNA' },
      ],
      correct: 'convergencia',
      explanation: 'Em 1935 não havia DNA. Uma digital parcial ligou restos a Mary Rogerson; a superposição de Brash e moldes dos pés feitos de gelatina reforçaram a identificação de Isabella Ruxton.',
    },
  ],
  reveal: {
    summary: [
      'Os restos encontrados perto de Moffat estavam embrulhados, entre outras coisas, numa edição local do Sunday Graphic de 15 de setembro de 1935, vendida só na região de Lancaster e Morecambe. Em Lancaster, a polícia soube que Isabella Ruxton e Mary Jane Rogerson não eram vistas desde o dia 14.',
      'Alexander Mearns identificou as larvas como Calliphora vicina, com 12 a 14 dias de idade: as moscas tinham chegado por volta de 16 de setembro. A datação batia com o desaparecimento.',
      'A identificação juntou várias técnicas. Uma impressão digital parcial dos restos coincidiu com marcas deixadas por Mary Rogerson em objetos da casa. James Couper Brash sobrepôs fotografias de um dos crânios a um retrato de Isabella Ruxton e fez moldes de gelatina dos pés, que entraram nos sapatos dela. Roupas do embrulho foram reconhecidas.',
      'Buck Ruxton foi julgado em Manchester, em março de 1936, pela morte de Isabella; o júri levou pouco mais de uma hora para condená-lo. Ele foi enforcado na prisão de Strangeways em 12 de maio de 1936. Depois da execução, foi publicada uma confissão assinada por ele.',
    ],
    fidelity: {
      documented: [
        'Restos encontrados no fim de setembro de 1935 em Gardenholme Linn, perto de Moffat, embrulhados em lençóis, roupas e jornais.',
        'Uma edição especial local do Sunday Graphic de 15 de setembro ligou o embrulho à região de Lancaster; as duas mulheres não eram vistas desde 14 de setembro.',
        'Mearns identificou larvas de Calliphora vicina com 12 a 14 dias, um dos primeiros usos da entomologia forense no Reino Unido.',
        'Digitais, superposição crânio-foto e moldes dos pés foram usados na identificação; Ruxton foi condenado em Manchester e enforcado em 12 de maio de 1936.',
      ],
      divergent: [
        'Data do achado: a maioria dos relatos dá 29 de setembro de 1935; uma fonte fala em "domingo, 25 de setembro", mas aquele 25 de setembro caiu numa quarta-feira.',
        'Onde Mearns trabalhava: Glasgow na maioria das fontes, Edimburgo em uma delas.',
        'A área exata de venda da edição especial do Sunday Graphic aparece com pequenas variações nos relatos.',
        'A confissão publicada depois da execução é citada por várias fontes, mas não li o texto original.',
      ],
      dramatized: [
        'O papel do jogador e o texto do comunicado da polícia escocesa.',
        'As temperaturas diárias, a temperatura-base, a tabela de estágios e os totais de graus-dia, calibrados para reproduzir a estimativa de Mearns.',
        'A data do Sunday Chronicle e a forma como as áreas de venda aparecem na tabela.',
      ],
    },
    today: [
      {
        title: 'Graus-dia com dados reais',
        text: 'Hoje, o entomologista usa curvas de desenvolvimento publicadas para cada espécie e as temperaturas de estações meteorológicas próximas, corrigidas para o local do corpo. No Brasil, moscas como Chrysomya megacephala e Chrysomya albiceps estão entre as mais estudadas para esse fim.',
      },
      {
        title: 'Entomotoxicologia',
        text: 'Larvas que se alimentam de um corpo absorvem substâncias presentes nos tecidos. Quando não há mais sangue para analisar, elas podem revelar drogas ou venenos, e algumas drogas aceleram ou atrasam o crescimento, o que o perito precisa levar em conta.',
      },
      {
        title: 'De Moffat a Embu',
        text: 'A superposição crânio-foto que Brash usou neste caso, em 1935, é a mesma ideia que Richard Helmer aplicou em vídeo no caso de Embu, cinquenta anos depois. A técnica evoluiu; o princípio de procurar pontos anatômicos que coincidem continua.',
      },
    ],
    sources: [
      { label: 'Moffat Museum — The Ruxton Maggots', kind: 'museu', url: 'https://moffatmuseum.co.uk/?p=2017' },
      { label: 'University of Glasgow — Forensic medicine case files: Dr Buck Ruxton (1935)', kind: 'acadêmico', url: 'https://www.gla.ac.uk/myglasgow/library/collections/medicalhumanities/forensicmedicine/casefiles/drbuckruxton1935' },
      { label: 'Natural History Museum — Murder, maggots and forensic entomology', kind: 'museu', url: 'https://www.nhm.ac.uk/discover/murder-maggots-forensic-entomology.html' },
      { label: 'Historic UK — The Birth of Forensics: Dr Buck Ruxton', kind: 'jornalístico', url: 'https://www.historic-uk.com/cultureuk/birth-of-forensics-buck-ruxton' },
      { label: 'R. H. Blundell e G. Haswell Wilson (org.), Trial of Buck Ruxton, série Notable British Trials (1937), transcrição no Internet Archive', kind: 'livro', url: 'https://archive.org/details/in.ernet.dli.2015.173614' },
      { label: 'John Glaister e James Couper Brash, Medico-Legal Aspects of the Ruxton Case (1937)', kind: 'livro' },
      { label: 'Wikipedia — A. G. Mearns (usada como índice de fontes)', kind: 'enciclopédia', url: 'https://en.wikipedia.org/wiki/A._G._Mearns' },
    ],
  },
};
