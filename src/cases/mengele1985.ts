import type { CaseFile } from '../engine/types';

/**
 * Caso 4: a ossada de Embu, São Paulo, 1979–1992.
 *
 * Diferente dos outros casos, não houve julgamento: Mengele morreu antes de
 * ser encontrado. O caso entra no arquivo como identificação encerrada,
 * confirmada por DNA em 1992. Os crimes de Auschwitz são citados com
 * sobriedade, sem detalhes. Achados do esqueleto, medida do fêmur e os
 * rostos esquemáticos são ilustrativos e marcados como dramatizados.
 */
const SKULL = [
  { id: 'olhoE', name: 'centro da órbita esquerda', x: -0.32, y: 0 },
  { id: 'olhoD', name: 'centro da órbita direita', x: 0.32, y: 0 },
  { id: 'nasio', name: 'násio (raiz do nariz)', x: 0, y: -0.06 },
  { id: 'subnasal', name: 'base do nariz', x: 0, y: 0.42 },
  { id: 'estomio', name: 'linha da boca', x: 0, y: 0.62 },
  { id: 'gnatio', name: 'ponta do queixo', x: 0, y: 0.95 },
  { id: 'zigE', name: 'maçã do rosto esquerda', x: -0.62, y: 0.12 },
  { id: 'zigD', name: 'maçã do rosto direita', x: 0.62, y: 0.12 },
  { id: 'gonE', name: 'ângulo da mandíbula esquerdo', x: -0.48, y: 0.72 },
  { id: 'gonD', name: 'ângulo da mandíbula direito', x: 0.48, y: 0.72 },
];

export const mengele1985: CaseFile = {
  id: 'mengele-1985',
  number: 4,
  title: 'A ossada de Embu',
  place: 'Embu das Artes e Bertioga, São Paulo, Brasil',
  year: 1985,
  date: 'Fevereiro de 1979 a abril de 1992',
  technique: 'Antropologia forense (Muñoz, Snow e Helmer)',
  playerRole:
    'Você integra a equipe do Instituto Médico Legal de São Paulo que recebe, em junho de 1985, uma ossada exumada no cemitério de Embu.',
  intro: [
    'Josef Mengele foi médico da SS em Auschwitz. Ele selecionava prisioneiros para as câmaras de gás e fazia experimentos com eles, especialmente com gêmeos. Depois da guerra, tornou-se um dos criminosos nazistas mais procurados do mundo.',
    'Ele fugiu para a Argentina em 1949 e passou depois pelo Paraguai e pelo Brasil. Por décadas, circularam boatos de que estava vivo e escondido em algum lugar da América do Sul.',
    'Em 1985, a pista levou a um túmulo comum num cemitério de Embu, na Grande São Paulo, com outro nome na lápide. A pergunta da equipe é simples de formular e difícil de responder: de quem são estes ossos?',
  ],
  dispatch: {
    header: 'Ofício · Polícia Federal, São Paulo · Junho de 1985',
    body: 'SOLICITA-SE EXAME DE OSSADA EXUMADA NO CEMITÉRIO DE EMBU, SEPULTADA EM 1979 SOB O NOME DE WOLFGANG GERHARD. HÁ INDÍCIOS DE QUE SE TRATA DE JOSEF MENGELE. DETERMINAR SEXO, IDADE, ESTATURA E IDENTIDADE.',
  },
  copy: {
    start: 'Abrir o ofício da Polícia Federal',
    investigationTitle: 'Da Alemanha a Embu',
    toTraining: 'Levar a ossada ao IML',
  },
  locations: [
    {
      id: 'alemanha',
      name: 'Günzburg, Alemanha · maio de 1985',
      blurb: 'A cidade natal de Mengele, onde a família tinha uma empresa.',
      evidenceIds: ['cartas'],
    },
    {
      id: 'bertioga',
      name: 'Bertioga · fevereiro de 1979',
      blurb: 'Uma praia do litoral paulista, seis anos antes.',
      evidenceIds: ['afogamento', 'abrigo'],
    },
    {
      id: 'embu',
      name: 'Cemitério de Embu · junho de 1985',
      blurb: 'Um túmulo comum, com um nome austríaco na lápide.',
      evidenceIds: ['lapide', 'exumacao'],
    },
    {
      id: 'iml',
      name: 'IML de São Paulo',
      blurb: 'Onde peritos brasileiros, americanos e alemães trabalham juntos.',
      evidenceIds: ['equipe'],
    },
  ],
  evidence: [
    {
      id: 'cartas',
      title: 'As cartas',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'Em 1985, a polícia alemã apreendeu cartas na casa de um conhecido da família Mengele, em Günzburg. Elas indicavam que Mengele tinha vivido no Brasil e que estava morto.',
        'As cartas apontavam onde procurar. Não identificavam corpo nenhum.',
      ],
    },
    {
      id: 'afogamento',
      title: 'O afogamento',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'Em 7 de fevereiro de 1979, um homem idoso morreu afogado na praia da Enseada, em Bertioga. Ele foi enterrado em Embu com os documentos de Wolfgang Gerhard.',
      ],
    },
    {
      id: 'abrigo',
      title: 'Quem o abrigava',
      kind: 'depoimento',
      dramatized: false,
      paragraphs: [
        'Mengele viveu seus últimos anos na região de São Paulo com ajuda de conhecidos de origem austríaca e húngara. Wolfgang Gerhard, um austríaco simpatizante do nazismo, cedeu a ele a própria identidade.',
        'Confrontados pela polícia em 1985, os que o abrigavam indicaram o túmulo.',
      ],
    },
    {
      id: 'lapide',
      title: 'A lápide',
      kind: 'objeto',
      dramatized: false,
      paragraphs: [
        'A lápide e os registros do sepultamento diziam Wolfgang Gerhard. O documento de Gerhard indicava um homem de cerca de 54 anos em 1979.',
        'Mengele, nascido em 1911, teria 67 anos.',
      ],
    },
    {
      id: 'exumacao',
      title: 'A exumação',
      kind: 'local',
      dramatized: false,
      paragraphs: [
        'Em junho de 1985, por ordem do superintendente da Polícia Federal em São Paulo, Romeu Tuma, o túmulo foi aberto diante da imprensa. A ossada foi levada ao Instituto Médico Legal.',
        'Segundo alguns relatos, o crânio foi danificado durante a exumação, o que dificultou parte do trabalho.',
      ],
    },
    {
      id: 'equipe',
      title: 'A equipe',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'O exame foi conduzido no IML paulista por uma equipe liderada pelo médico-legista Daniel Romero Muñoz, com especialistas estrangeiros como o antropólogo forense americano Clyde Snow e o alemão Richard Helmer.',
        'Helmer usou uma técnica de superposição em vídeo: a imagem do crânio sobre fotografias do rosto de Mengele.',
      ],
    },
  ],
  training: {
    kind: 'raciocinio',
    title: 'Ossos não têm nome',
    lede: 'Um esqueleto não traz documento. A antropologia forense constrói a identidade em camadas: primeiro o perfil, depois as características individuais. Classifique cada informação.',
    items: [
      {
        id: 'lapide',
        prompt: 'A lápide e o registro do sepultamento dizem "Wolfgang Gerhard".',
        options: [
          { id: 'prova', text: 'Prova que o morto é Wolfgang Gerhard' },
          { id: 'declarado', text: 'Registra só o nome declarado no enterro, que pode ser falso' },
          { id: 'mengele', text: 'Prova que o morto é Mengele' },
        ],
        correct: 'declarado',
        explanation: 'Documentos podem ser emprestados ou falsificados. É justamente por isso que se examina o corpo.',
      },
      {
        id: 'cartas',
        prompt: 'Cartas apreendidas na Alemanha dizem que Mengele morreu no Brasil.',
        options: [
          { id: 'identifica', text: 'Identificam o corpo de Embu' },
          { id: 'onde', text: 'Indicam onde procurar, mas não identificam corpo nenhum' },
          { id: 'inuteis', text: 'Não servem para nada sem confissão' },
        ],
        correct: 'onde',
        explanation: 'Informação documental orienta a busca. A identificação precisa vir do próprio corpo.',
      },
      {
        id: 'superposicao',
        prompt: 'O crânio se sobrepõe bem a fotografias de Mengele.',
        options: [
          { id: 'definitiva', text: 'É prova definitiva de identidade' },
          { id: 'forte', text: 'É forte compatibilidade; a técnica é mais segura para excluir do que para confirmar' },
          { id: 'inutil', text: 'Não tem valor pericial' },
        ],
        correct: 'forte',
        explanation: 'Se o crânio não encaixa na foto, a pessoa está excluída. Se encaixa, outras pessoas com proporções parecidas também poderiam encaixar. Por isso a superposição soma, mas não fecha sozinha.',
      },
      {
        id: 'dna',
        prompt: 'Em 1992, o DNA dos ossos foi comparado com o de Rolf, filho de Mengele. Por que o filho?',
        options: [
          { id: 'identico', text: 'Porque o DNA de pai e filho é idêntico' },
          { id: 'metade', text: 'Porque metade do DNA do filho vem do pai, o que permite testar o parentesco' },
          { id: 'enterro', text: 'Porque Rolf tinha estado no enterro' },
        ],
        correct: 'metade',
        explanation: 'Sem uma amostra do próprio Mengele em vida, compara-se com parentes. Um filho herda metade do DNA de cada genitor.',
      },
    ],
  },
  lab: {
    kind: 'antropologia',
    title: 'Laboratório de antropologia forense',
    lede: 'Primeiro, monte o perfil biológico do esqueleto e compare com o documento da lápide. Depois, faça a superposição do crânio sobre duas fotografias.',
    profile: {
      title: 'Perfil biológico',
      lede: 'Os achados abaixo são exemplos de livro-texto do que se observa num esqueleto; não são a transcrição do laudo de 1985.',
      questions: [
        {
          id: 'sexo',
          prompt: 'Sexo',
          traits: ['Crânio robusto, com processos mastoides grandes', 'Pelve com ângulo subpúbico estreito', 'Mandíbula com ângulo bem marcado'],
          options: [
            { id: 'masculino', text: 'Masculino' },
            { id: 'feminino', text: 'Feminino' },
            { id: 'indeterminado', text: 'Indeterminado' },
          ],
          correct: 'masculino',
          explanation: 'Pelve e crânio são as regiões mais confiáveis para estimar o sexo de um adulto, e todos os traços apontam na mesma direção.',
        },
        {
          id: 'idade',
          prompt: 'Faixa de idade',
          traits: ['Suturas do crânio quase todas fechadas', 'Sinais de artrose na coluna e nas articulações', 'Vários dentes perdidos ainda em vida'],
          options: [
            { id: '20-30', text: '20 a 30 anos' },
            { id: '40-50', text: '40 a 50 anos' },
            { id: '60-70', text: '60 a 70 anos' },
          ],
          correct: '60-70',
          explanation: 'Isolados, esses sinais são imprecisos. Juntos, indicam um adulto idoso.',
        },
        {
          id: 'estatura',
          prompt: 'Estatura',
          traits: ['Fêmur com 47,3 cm (medida ilustrativa)', 'Fórmula de Trotter e Gleser para homens: estatura = 2,38 × fêmur + 61,41 cm (±3,3 cm)'],
          options: [
            { id: '152', text: 'Cerca de 1,52 m' },
            { id: '174', text: 'Cerca de 1,74 m' },
            { id: '193', text: 'Cerca de 1,93 m' },
          ],
          correct: '174',
          explanation: '2,38 × 47,3 + 61,41 ≈ 174 cm. A margem de erro de cerca de 3 cm faz da estatura um filtro, não uma identificação.',
        },
        {
          id: 'documento',
          prompt: 'O documento de Wolfgang Gerhard indicava cerca de 54 anos em 1979. O esqueleto é compatível com ele?',
          traits: ['Perfil que você acabou de montar', 'Idade de Mengele em 1979: 67 anos'],
          options: [
            { id: 'sim', text: 'Sim, é compatível' },
            { id: 'nao', text: 'Não: o esqueleto é de alguém bem mais velho' },
            { id: 'impossivel', text: 'Não é possível comparar' },
          ],
          correct: 'nao',
          explanation: 'Um homem de 60 a 70 anos não combina com o documento de um homem de 54. O perfil, por outro lado, é compatível com Mengele.',
        },
      ],
    },
    overlay: {
      title: 'Superposição crânio-foto',
      lede: 'Ajuste a escala e a posição do crânio até o menor erro possível em cada foto, e registre se ela é compatível. Os rostos são esquemas, não fotos reais.',
      skull: SKULL,
      candidates: [
        {
          id: 'mengele',
          name: 'Fotos de Mengele',
          description: 'Fotografias de Josef Mengele de antes de 1945, de frente.',
          landmarks: [
            { id: 'olhoE', name: 'centro da órbita esquerda', x: -0.336, y: 0.1 },
            { id: 'olhoD', name: 'centro da órbita direita', x: 0.336, y: 0.105 },
            { id: 'nasio', name: 'násio (raiz do nariz)', x: 0, y: 0.045 },
            { id: 'subnasal', name: 'base do nariz', x: 0, y: 0.569 },
            { id: 'estomio', name: 'linha da boca', x: 0, y: 0.78 },
            { id: 'gnatio', name: 'ponta do queixo', x: 0, y: 1.151 },
            { id: 'zigE', name: 'maçã do rosto esquerda', x: -0.69, y: 0.23 },
            { id: 'zigD', name: 'maçã do rosto direita', x: 0.69, y: 0.23 },
            { id: 'gonE', name: 'ângulo da mandíbula esquerdo', x: -0.538, y: 0.878 },
            { id: 'gonD', name: 'ângulo da mandíbula direito', x: 0.538, y: 0.878 },
          ],
        },
        {
          id: 'gerhard',
          name: 'Foto do documento de Gerhard',
          description: 'A fotografia da carteira de identidade de Wolfgang Gerhard.',
          landmarks: [
            { id: 'olhoE', name: 'centro da órbita esquerda', x: -0.275, y: 0.06 },
            { id: 'olhoD', name: 'centro da órbita direita', x: 0.275, y: 0.06 },
            { id: 'nasio', name: 'násio (raiz do nariz)', x: 0, y: 0.009 },
            { id: 'subnasal', name: 'base do nariz', x: 0, y: 0.427 },
            { id: 'estomio', name: 'linha da boca', x: 0, y: 0.672 },
            { id: 'gnatio', name: 'ponta do queixo', x: 0, y: 1.141 },
            { id: 'zigE', name: 'maçã do rosto esquerda', x: -0.53, y: 0.203 },
            { id: 'zigD', name: 'maçã do rosto direita', x: 0.53, y: 0.203 },
            { id: 'gonE', name: 'ângulo da mandíbula esquerdo', x: -0.449, y: 0.876 },
            { id: 'gonD', name: 'ângulo da mandíbula direito', x: 0.449, y: 0.876 },
          ],
        },
      ],
      sourceCandidateId: 'mengele',
      threshold: 0.03,
      explanation:
        'Com o ajuste certo, o crânio encaixa nas fotos de Mengele: órbitas, nariz, queixo e mandíbula ficam sobre os pontos do rosto. Na foto de Gerhard, nenhuma combinação de escala e posição alinha todos os pontos ao mesmo tempo, porque as proporções do rosto são outras.',
    },
  },
  accusation: [
    {
      id: 'quem',
      prompt: 'Quem estava enterrado em Embu?',
      options: [
        { id: 'gerhard', text: 'Wolfgang Gerhard, como dizia a lápide' },
        { id: 'mengele', text: 'Josef Mengele' },
        { id: 'indeterminado', text: 'Não é possível saber' },
      ],
      correct: 'mengele',
      explanation: 'Perfil biológico, superposição e, depois, radiografias e DNA convergem para Mengele.',
    },
    {
      id: 'nome',
      prompt: 'Por que o túmulo tinha o nome de Wolfgang Gerhard?',
      options: [
        { id: 'morreu', text: 'Porque Gerhard morreu e foi enterrado ali' },
        { id: 'identidade', text: 'Porque Mengele vivia com os documentos de Gerhard, que lhe cedeu a identidade' },
        { id: 'erro', text: 'Por um erro do cemitério' },
      ],
      correct: 'identidade',
      explanation: 'Gerhard, um austríaco simpatizante do nazismo, entregou seus documentos a Mengele. A diferença de idade entre o documento e o esqueleto foi uma das primeiras pistas.',
    },
    {
      id: 'metodo',
      prompt: 'Antes do DNA de 1992, o que sustentava a identificação?',
      options: [
        { id: 'unica', text: 'Uma única prova decisiva' },
        { id: 'convergencia', text: 'A convergência de perfil biológico, superposição crânio-foto e comparação com radiografias' },
        { id: 'depoimento', text: 'Apenas o depoimento de quem o abrigava' },
      ],
      correct: 'convergencia',
      explanation: 'Cada exame, sozinho, deixava dúvida. Juntos, permitiram concluir com "certeza científica razoável" em 1985. O DNA, sete anos depois, fechou a questão.',
    },
  ],
  reveal: {
    summary: [
      'Mengele viveu escondido na região de São Paulo e morreu afogado em Bertioga em 7 de fevereiro de 1979. Foi enterrado em Embu com os documentos de Wolfgang Gerhard.',
      'Em 1985, cartas apreendidas na Alemanha apontaram para o Brasil. A Polícia Federal, sob o comando de Romeu Tuma em São Paulo, exumou a ossada em junho. A equipe do IML liderada por Daniel Romero Muñoz, com Clyde Snow, Richard Helmer e outros especialistas, concluiu que os ossos eram compatíveis com Mengele: sexo, idade, estatura e a superposição do crânio com fotografias dele.',
      'Em março de 1986, uma comparação com radiografias reforçou a identificação. Em 1992, o geneticista britânico Alec Jeffreys comparou o DNA dos ossos com o de Rolf, filho de Mengele, e confirmou a identidade.',
      'Mengele nunca foi julgado. A identificação encerrou décadas de buscas e boatos. Desde 2016, a ossada é usada em aulas de medicina legal da Universidade de São Paulo.',
    ],
    fidelity: {
      documented: [
        'Mengele morreu afogado em Bertioga em 7 de fevereiro de 1979 e foi enterrado em Embu como Wolfgang Gerhard.',
        'Cartas apreendidas na Alemanha levaram à exumação, em junho de 1985, ordenada pela Polícia Federal em São Paulo.',
        'A equipe do IML liderada por Daniel Romero Muñoz, com Clyde Snow e Richard Helmer, usou perfil biológico e superposição crânio-foto.',
        'O DNA, comparado em 1992 com o do filho Rolf, confirmou a identidade; a ossada é usada no ensino na USP desde 2016.',
      ],
      divergent: [
        'Idade no documento de Gerhard: as fontes falam em 53 ou 54 anos.',
        'Quando a identificação ficou "definitiva": alguns relatos citam o laudo de 1985, outros a radiografia de 1986 ou o DNA de 1992.',
        'Diastema: o espaço entre os incisivos é citado em alguns relatos como visível nas fotos de Mengele e contestado em outros.',
        'Dano ao crânio na exumação: relatado por uma das fontes que consultei.',
      ],
      dramatized: [
        'O papel do jogador como membro da equipe do IML e o texto do ofício.',
        'Os achados do esqueleto no perfil biológico e a medida do fêmur, que são exemplos de livro-texto.',
        'Os rostos e pontos da superposição, que são esquemas gerados para o jogo, não fotografias.',
      ],
    },
    today: [
      {
        title: 'Antropologia forense no Brasil hoje',
        text: 'A mesma ciência é usada para identificar desaparecidos políticos da ditadura. Desde a abertura da vala clandestina do Cemitério Dom Bosco, em Perus (São Paulo), em 1990, equipes de antropologia e genética trabalham para devolver nomes às ossadas.',
      },
      {
        title: 'Os identificadores primários',
        text: 'Pelos protocolos da Interpol para identificação de vítimas, três métodos são considerados primários: impressões digitais, odontologia e DNA. A superposição crânio-foto é hoje tratada como método de apoio, útil sobretudo para excluir.',
      },
      {
        title: 'Bancos de perfis genéticos',
        text: 'Comparar o DNA de uma ossada com o de parentes virou rotina. No Brasil, a Rede Integrada de Bancos de Perfis Genéticos, criada em 2013, reúne perfis de vestígios, de pessoas desaparecidas e de familiares que doam amostras para ajudar na busca.',
      },
    ],
    sources: [
      { label: 'Band Jornalismo — Como a ossada de Mengele virou material didático no Brasil (2025)', kind: 'jornalístico', url: 'https://www.band.com.br/noticias/como-a-ossada-de-mengele-descoberta-ha-40-anos-virou-material-didatico-no-brasil-202506170900' },
      { label: 'UPI — Genetic fingerprint proves Mengele’s death in Brazil (1992)', kind: 'jornalístico', url: 'https://www.upi.com/Archives/1992/04/09/Genetic-fingerprint-proves-Mengeles-death-in-Brazil/2698702792000/' },
      { label: 'ADST — CSI São Paulo: identifying Josef Mengele', kind: 'museu', url: 'https://adst.org/2012/08/csi-sao-paolo/' },
      { label: 'Histoire de la médecine — odontologia legal e as identificações de Mengele e Bormann', kind: 'acadêmico', url: 'https://www.histoire-medecine.fr/odontologie-medico-legale-the-truth-on-the-forensic-identifications-of-dr-mengele-and-martin-bormann.php' },
      { label: 'Deutsches Historisches Museum (LeMO) — Josef Mengele 1911–1979', kind: 'museu', url: 'https://www.dhm.de/lemo/biografie/josef-mengele' },
      { label: 'Gerald L. Posner e John Ware, Mengele: The Complete Story (1986)', kind: 'livro' },
      { label: 'Wikipedia — Josef Mengele (usada como índice de fontes)', kind: 'enciclopédia', url: 'https://en.wikipedia.org/wiki/Josef_Mengele' },
    ],
  },
};
