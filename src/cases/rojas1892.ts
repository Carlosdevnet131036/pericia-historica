import type { CaseFile } from '../engine/types';

/**
 * Caso 1: Necochea, 1892.
 *
 * Critério de fidelidade: o que está em `reveal.fidelity.documented` aparece
 * de forma consistente em fontes independentes. Pontos em que as fontes
 * discordam ficam em `divergent`. Tudo o que foi criado para o jogo (diálogos,
 * a figura do jogador, as impressões desenhadas) é marcado como dramatizado.
 */
export const rojas1892: CaseFile = {
  id: 'rojas-1892',
  number: 1,
  title: 'A marca na porta',
  place: 'Necochea, Província de Buenos Aires, Argentina',
  year: 1892,
  date: 'Junho a julho de 1892',
  technique: 'Datiloscopia (sistema de Vucetich)',
  cover: 'digital',
  playerRole:
    'Você é auxiliar da Oficina de Identificação da polícia da Província de Buenos Aires, em La Plata, onde Juan Vucetich mantém desde 1891 um arquivo de fichas com impressões digitais.',
  intro: [
    'Em 1892, a polícia identifica criminosos pelo método de Alphonse Bertillon: medidas do crânio, dos braços e das orelhas anotadas em fichas. Digitais ainda são uma curiosidade científica.',
    'Juan Vucetich, um imigrante croata que chefia a seção de estatística da polícia em La Plata, discorda. Ele vem classificando impressões digitais em quatro tipos básicos e treinando alguns policiais no método.',
    'Uma das pessoas treinadas por ele é o inspetor Eduardo Álvarez, enviado agora para um caso parado no litoral sul da província.',
  ],
  dispatch: {
    header: 'Telégrafo da Província · Urgente',
    body: 'NECOCHEA. DOIS FILHOS DE FRANCISCA ROJAS ENCONTRADOS MORTOS EM SEU RANCHO. MÃE FERIDA ACUSA VIZINHO PEDRO RAMÓN VELÁZQUEZ. DETIDO NEGA TUDO. INVESTIGAÇÃO SEM AVANÇO. SOLICITA-SE INSPETOR.',
  },
  copy: {
    start: 'Seguir com Álvarez para Necochea',
    investigationTitle: 'Investigação em Necochea',
    toTraining: 'Levar a mancha para análise',
  },
  locations: [
    {
      id: 'rancho',
      name: 'O rancho de Francisca Rojas',
      blurb: 'A casa onde as crianças foram encontradas, já revistada pela polícia local.',
      scene: 'casa',
      explore3d: true,
      search: { targets: ['lamparina', 'chave', 'xicara', 'vela', 'chapeu', 'moeda', 'pente', 'botao'], clutter: 20, seed: 1892 },
      evidenceIds: ['cena', 'mancha'],
    },
    {
      id: 'delegacia',
      name: 'A delegacia de Necochea',
      blurb: 'Onde estão os depoimentos e o detido.',
      scene: 'delegacia',
      search: { targets: ['pena', 'carta', 'oculos', 'relogio', 'livro', 'lupa', 'cachimbo', 'cadeado'], clutter: 20, seed: 7 },
      evidenceIds: ['depoimento-rojas', 'depoimento-velazquez', 'relatorio'],
    },
    {
      id: 'vizinhanca',
      name: 'A vizinhança',
      blurb: 'Ranchos espalhados pelos arredores, onde todos se conhecem.',
      scene: 'campo',
      search: { targets: ['ferradura', 'garrafa', 'luva', 'colher', 'fosforos', 'tesoura', 'chave', 'lamparina'], clutter: 20, seed: 33 },
      evidenceIds: ['vizinhos'],
    },
  ],
  evidence: [
    {
      id: 'cena',
      title: 'O quarto',
      kind: 'local',
      dramatized: false,
      paragraphs: [
        'Ponciano, de 6 anos, e Teresa, de 4, foram encontrados mortos no quarto. Francisca Rojas, a mãe, de cerca de 27 anos, foi encontrada com um ferimento no pescoço.',
        'A polícia local revistou a casa. Nenhuma arma foi apontada como prova e ninguém viu um estranho entrar ou sair.',
      ],
    },
    {
      id: 'mancha',
      title: 'Mancha no marco da porta',
      kind: 'objeto',
      dramatized: false,
      paragraphs: [
        'No marco de madeira da porta do quarto há uma mancha escura de sangue seco. A polícia local não deu importância a ela.',
        'Olhando de perto, com a luz da janela, aparecem linhas finas e curvas dentro da mancha.',
      ],
    },
    {
      id: 'depoimento-rojas',
      title: 'Depoimento de Francisca Rojas',
      kind: 'depoimento',
      dramatized: false,
      paragraphs: [
        'Francisca afirma que o vizinho Pedro Ramón Velázquez a perseguia com investidas que ela recusava, e que ele a ameaçou.',
        'Segundo ela, Velázquez entrou na casa, matou as crianças e a atacou. Ela diz que, ferida, não tocou nos corpos dos filhos.',
      ],
    },
    {
      id: 'depoimento-velazquez',
      title: 'Depoimento de Pedro Ramón Velázquez',
      kind: 'depoimento',
      dramatized: false,
      paragraphs: [
        'Velázquez está detido e nega qualquer participação. Mesmo sob interrogatórios duros, ele mantém a mesma versão.',
      ],
    },
    {
      id: 'relatorio',
      title: 'Relatório do comissário local',
      kind: 'documento',
      dramatized: true,
      paragraphs: [
        '"O detido não confessa. A mulher sustenta a acusação. Não há testemunhas. Considero o caso sem saída pelos meios ordinários."',
        'O texto deste relatório é uma reconstrução para o jogo. O impasse da investigação local, porém, é documentado.',
      ],
    },
    {
      id: 'vizinhos',
      title: 'O que dizem os vizinhos',
      kind: 'depoimento',
      dramatized: true,
      paragraphs: [
        'Uma vizinha comenta que Francisca vinha sendo cortejada por um homem que, dizem, não queria se casar com uma mulher que já tinha filhos.',
        'Outro morador garante que Velázquez estava longe do rancho naquela noite.',
        'Estas falas são dramatizadas. Relatos posteriores do caso mencionam esse possível motivo e um álibi para Velázquez, mas não encontrei esses pontos em fonte primária.',
      ],
    },
  ],
  partner: {
    name: 'Inspetor Eduardo Álvarez',
    lines: {
      expediente: 'Dizem em La Plata que este caso não tem saída. Vamos ver o que a casa tem a dizer.',
      investigacao: 'A polícia local já passou por aqui e não viu nada. Olhe com calma: o que importa costuma estar à vista.',
      treino: 'Vucetich me ensinou assim: primeiro classificar, depois comparar.',
      laboratorio: 'Se aquela mancha for mesmo uma digital, ela tem dono.',
      acusacao: 'Confira o quadro. Só afirme o que a prova sustenta.',
      revelacao: 'Foi a primeira vez que uma digital resolveu um crime. Não vai ser a última.',
    },
  },
  suspects: [
    {
      id: 'rojas',
      name: 'Francisca Rojas',
      role: 'Mãe das crianças; acusa o vizinho',
      portrait: 'mulher',
      dramatized: false,
      traits: { local: 'sim', tipo: 'sim', digital: 'sim' },
    },
    {
      id: 'velazquez',
      name: 'Pedro Ramón Velázquez',
      role: 'Vizinho acusado; detido, nega tudo',
      portrait: 'homem',
      dramatized: false,
      traits: { local: '?', tipo: 'sim', digital: 'nao' },
    },
    {
      id: 'pretendente',
      name: 'O pretendente',
      portrait: 'desconhecido',
      role: 'Homem que cortejaria Francisca, citado em relatos posteriores; nome desconhecido',
      dramatized: true,
      traits: { local: '?', tipo: '?', digital: '?' },
    },
  ],
  profile: [
    { id: 'local', label: 'Estava no rancho naquela noite', revealedAt: 'investigacao', source: 'cena e depoimentos' },
    { id: 'tipo', label: 'Polegar com desenho de presilha externa', revealedAt: 'laboratorio', source: 'classificação das fichas (no jogo)' },
    { id: 'digital', label: 'Deixou a digital ensanguentada no marco da porta', revealedAt: 'acusacao', source: 'confronto no laboratório' },
  ],
  training: {
    kind: 'datiloscopia',
    title: 'O método de Vucetich',
    lede: 'Antes de comparar a mancha, aprenda a classificar. Vucetich dividia as impressões em quatro tipos. Cada ficha de dez dedos virava uma fórmula, com letras para os polegares e números para os outros dedos, e assim podia ser arquivada e encontrada depressa.',
    patterns: [
      {
        type: 'arco',
        name: 'Arco',
        thumbCode: 'A',
        fingerCode: '1',
        description: 'As cristas atravessam o dedo de um lado ao outro e sobem no meio, como uma ponte. Não há delta.',
      },
      {
        type: 'presilla-interna',
        name: 'Presilha interna',
        thumbCode: 'I',
        fingerCode: '2',
        description: 'As cristas fazem um laço que se abre para a esquerda de quem olha a ficha. O delta fica à direita.',
      },
      {
        type: 'presilla-externa',
        name: 'Presilha externa',
        thumbCode: 'E',
        fingerCode: '3',
        description: 'O mesmo laço, aberto para a direita de quem olha a ficha. O delta fica à esquerda.',
      },
      {
        type: 'verticilo',
        name: 'Verticilo',
        thumbCode: 'V',
        fingerCode: '4',
        description: 'As cristas giram em círculos ou espiral em torno de um centro. Há dois deltas, um de cada lado.',
      },
    ],
    samples: [
      {
        id: 't1',
        print: { pattern: 'verticilo', core: { x: 0.04, y: -0.02 }, seed: 11, minutiae: [{ id: 'a', x: -0.3, y: 0.4, polarity: 1 }] },
      },
      {
        id: 't2',
        print: { pattern: 'presilla-interna', core: { x: 0.05, y: -0.1 }, seed: 22, minutiae: [{ id: 'a', x: 0.3, y: 0.3, polarity: -1 }] },
      },
      {
        id: 't3',
        print: { pattern: 'arco', core: { x: -0.05, y: 0 }, seed: 33, minutiae: [{ id: 'a', x: 0.2, y: -0.4, polarity: 1 }] },
      },
      {
        id: 't4',
        print: { pattern: 'presilla-externa', core: { x: -0.04, y: -0.05 }, seed: 44, minutiae: [{ id: 'a', x: -0.25, y: 0.5, polarity: 1 }] },
      },
    ],
  },
  lab: {
    kind: 'confronto-digital',
    title: 'Confronto datiloscópico',
    lede: 'As duas fichas têm o mesmo tipo de desenho, então a classificação sozinha não resolve. Escolha um ponto da latente, clique no lugar correspondente da ficha e depois registre sua conclusão para cada pessoa.',
    latentTitle: 'Latente: marco da porta',
    suspects: [
      {
        id: 'rojas',
        name: 'Francisca Rojas',
        role: 'Mãe das vítimas, que acusa o vizinho',
        print: {
          pattern: 'presilla-externa',
          core: { x: 0.02, y: -0.08 },
          seed: 1892,
          minutiae: [
            { id: '1', x: 0.24, y: 0.16, polarity: 1 },
            { id: '2', x: -0.2, y: 0.3, polarity: -1 },
            { id: '3', x: 0.08, y: 0.56, polarity: 1 },
            { id: 'r4', x: -0.36, y: -0.48, polarity: 1 },
            { id: 'r5', x: 0.42, y: -0.32, polarity: -1 },
          ],
        },
      },
      {
        id: 'velazquez',
        name: 'Pedro Ramón Velázquez',
        role: 'Vizinho acusado, detido',
        print: {
          pattern: 'presilla-externa',
          core: { x: -0.05, y: -0.13 },
          seed: 629,
          minutiae: [
            { id: 'v1', x: 0.32, y: 0.04, polarity: -1 },
            { id: 'v2', x: -0.27, y: 0.18, polarity: 1 },
            { id: 'v3', x: 0.12, y: 0.62, polarity: -1 },
            { id: 'v4', x: -0.08, y: -0.56, polarity: 1 },
          ],
        },
      },
    ],
    latent: {
      sourceSuspectId: 'rojas',
      view: { x0: -0.5, y0: -0.25, x1: 0.6, y1: 0.75 },
      minutiaIds: ['1', '2', '3'],
      caption: 'Fragmento recortado do marco da porta. Os pontos 1, 2 e 3 marcam minúcias legíveis.',
    },
  },
  accusation: [
    {
      id: 'autoria',
      prompt: 'De quem é a impressão ensanguentada no marco da porta?',
      options: [
        { id: 'rojas', text: 'Francisca Rojas' },
        { id: 'velazquez', text: 'Pedro Ramón Velázquez' },
        { id: 'inconclusivo', text: 'O fragmento não permite concluir' },
      ],
      correct: 'rojas',
      explanation:
        'As três minúcias legíveis do fragmento aparecem na mesma posição na ficha de Francisca Rojas e não existem na de Velázquez.',
    },
    {
      id: 'contradicao',
      prompt: 'Por que essa impressão derruba a versão de Francisca?',
      options: [
        { id: 'casa', text: 'Prova que ela estava em casa naquela noite' },
        { id: 'sangue', text: 'Foi deixada com sangue, e ela disse que não tocou nos corpos dos filhos' },
        { id: 'luvas', text: 'Prova que Velázquez usou luvas' },
      ],
      correct: 'sangue',
      explanation:
        'Ela morava ali, então suas digitais pela casa não provariam nada. O que pesa é a digital estar no sangue das vítimas, contrariando o que ela declarou.',
    },
    {
      id: 'metodo',
      prompt: 'Qual o papel de cada etapa do método de Vucetich?',
      options: [
        { id: 'tipo-basta', text: 'O tipo (arco, presilha, verticilo) já identifica a pessoa sozinho' },
        { id: 'tipo-filtra', text: 'O tipo reduz o número de fichas a comparar; as minúcias individualizam' },
        { id: 'muda', text: 'O tipo muda com a idade, por isso só as minúcias contam' },
      ],
      correct: 'tipo-filtra',
      explanation:
        'Rojas e Velázquez tinham o mesmo tipo neste jogo, e mesmo assim só um deles combinava. A classificação organiza o arquivo; a identificação depende dos detalhes.',
    },
  ],
  reveal: {
    summary: [
      'O inspetor Eduardo Álvarez, treinado por Vucetich, examinou a casa e encontrou uma impressão digital ensanguentada no batente de uma porta. Ele recortou a parte da madeira com a marca.',
      'A impressão foi comparada com as de Francisca Rojas e de Pedro Ramón Velázquez. Ela correspondia ao polegar direito de Francisca.',
      'Confrontada com a prova, Francisca confessou ter matado os dois filhos e ter ferido a si mesma para simular o ataque. Velázquez foi libertado.',
      'O caso é citado como o primeiro crime resolvido por impressão digital no mundo. Nos anos seguintes, a polícia argentina trocou as medições de Bertillon pelo sistema de Vucetich, que depois se espalhou pela América Latina, inclusive pelo Brasil.',
    ],
    fidelity: {
      documented: [
        'Necochea, 1892; duas crianças mortas; a mãe, Francisca Rojas, ferida no pescoço.',
        'Ela acusou o vizinho Velázquez, que foi detido e negou.',
        'Uma impressão digital ensanguentada numa porta foi encontrada, recortada e comparada pelo método de Vucetich.',
        'A impressão era de Francisca, que confessou diante da prova.',
      ],
      divergent: [
        'Nomes: as fontes variam entre Caraballo e Carballo para as crianças, e entre Ramón e Pedro Ramón Velázquez.',
        'Quem fez a comparação: algumas fontes dizem que o próprio Álvarez comparou em Necochea; outras, que ele levou a madeira a La Plata para Vucetich.',
        'Pena: há relatos de prisão perpétua, mas não encontrei uma segunda fonte confiável que confirme.',
        'Motivo e álibi: o pretendente que não queria as crianças e o álibi de Velázquez aparecem em relatos posteriores, sem fonte primária localizada.',
      ],
      dramatized: [
        'O papel do jogador como auxiliar da Oficina de Identificação, as falas do inspetor Álvarez e as cenas de busca de objetos.',
        'O pretendente no quadro de suspeitos: aparece em relatos posteriores, sem nome nem fonte primária.',
        'O texto do telegrama, do relatório do comissário e das falas dos vizinhos.',
        'As impressões digitais mostradas: são geradas por computador. A ficha original de Francisca Rojas existe, mas o desenho do jogo não a reproduz.',
      ],
    },
    today: [
      {
        title: 'De gavetas a algoritmos',
        text: 'Os quatro tipos de Vucetich ainda servem de base para a classificação. Hoje, sistemas automatizados (AFIS, e no Brasil o ABIS da Polícia Federal) comparam uma latente contra milhões de registros em segundos e devolvem uma lista de candidatos.',
      },
      {
        title: 'A decisão continua humana',
        text: 'O sistema só sugere. O perito confirma pelo método ACE-V: Análise da latente, Comparação com o candidato, Avaliação do resultado e Verificação independente por outro perito.',
      },
      {
        title: 'Quando a digital erra',
        text: 'Em 2004, o FBI identificou por engano o advogado americano Brandon Mayfield como dono de uma digital ligada aos atentados de Madri. Outros peritos confirmaram a conclusão, influenciados pela primeira. A polícia espanhola depois identificou o verdadeiro dono da digital. O caso, e o relatório de 2009 da Academia Nacional de Ciências dos EUA, mostraram que viés de confirmação é um risco real na perícia.',
      },
    ],
    sources: [
      {
        label: 'U.S. National Library of Medicine — Visible Proofs: Juan Vucetich',
        kind: 'museu',
        url: 'https://www.nlm.nih.gov/exhibition/visibleproofs/galleries/cases/vucetich.html',
      },
      { label: 'JSTOR Daily — Fingerprints and Crime', kind: 'jornalístico', url: 'https://daily.jstor.org/fingerprints-and-crime' },
      { label: 'Pensamiento Penal — artigo sobre Juan Vucetich (PDF)', kind: 'acadêmico', url: 'https://mail.pensamientopenal.com.ar/system/files/vusetich.pdf' },
      { label: 'Juan Vucetich, Dactiloscopía comparada (La Plata, 1904)', kind: 'livro' },
      { label: 'Francis Galton, Finger Prints (Londres, 1892)', kind: 'livro' },
      { label: 'Wikipedia — Francisca Rojas (usada como índice de fontes)', kind: 'enciclopédia', url: 'https://en.wikipedia.org/wiki/Francisca_Rojas' },
    ],
  },
};
