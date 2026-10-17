import type { CaseFile } from '../engine/types';

/**
 * Caso 3: o sequestro Lindbergh, Nova Jersey e Nova York, 1932–1936.
 *
 * Caso com vítima criança: o texto é sóbrio e não descreve a morte. A culpa
 * de Hauptmann ainda é contestada por alguns autores; o jogo apresenta a
 * decisão da Justiça e registra a controvérsia na revelação.
 * Números de série, locais do livro de notas e medidas das tábuas são
 * ilustrativos e estão marcados como dramatizados.
 */
export const lindbergh1932: CaseFile = {
  id: 'lindbergh-1932',
  number: 3,
  title: 'A escada e o dinheiro',
  place: 'Hopewell, Nova Jersey, e Nova York, EUA',
  year: 1932,
  date: 'Março de 1932 a abril de 1936',
  technique: 'Rastreio de cédulas e análise de madeira (Arthur Koehler)',
  cover: 'escada',
  playerRole:
    'Você trabalha com Arthur Koehler no Laboratório de Produtos Florestais, em Madison, e acompanha também o rastreio das notas do resgate.',
  intro: [
    'Em 1927, Charles Lindbergh atravessou o Atlântico sozinho, sem escalas, e virou o homem mais famoso dos Estados Unidos. Cinco anos depois, o filho dele, de 20 meses, foi levado do quarto, no segundo andar da casa da família.',
    'O resgate foi pago, mas o bebê não voltou. Este jogo não descreve o que aconteceu com ele.',
    'A investigação teve duas pistas físicas: as notas do resgate, cujos números de série foram anotados antes do pagamento, e uma escada de madeira feita à mão, deixada perto da casa.',
  ],
  dispatch: {
    header: 'Circular policial · Nova Jersey · Março de 1932',
    body: 'PROCURAM-SE INFORMAÇÕES. FILHO DE CHARLES LINDBERGH, 20 MESES, LEVADO DA CASA DA FAMÍLIA EM HOPEWELL NA NOITE DE 1º DE MARÇO. ESCADA DE MADEIRA ABANDONADA NO LOCAL. BILHETE PEDE RESGATE.',
  },
  copy: {
    start: 'Abrir o arquivo do sequestro',
    investigationTitle: 'Duas pistas: o dinheiro e a madeira',
    toTraining: 'Levar a escada ao laboratório',
  },
  locations: [
    {
      id: 'hopewell',
      name: 'Hopewell, Nova Jersey · março de 1932',
      blurb: 'A casa da família e o que foi deixado do lado de fora.',
      scene: 'casa',
      evidenceIds: ['sequestro', 'escada', 'maio'],
    },
    {
      id: 'cemiterio',
      name: 'Cemitério de St. Raymond, Bronx · abril de 1932',
      blurb: 'Onde o resgate foi entregue.',
      scene: 'cemiterio',
      evidenceIds: ['condon'],
    },
    {
      id: 'madison',
      name: 'Laboratório de Produtos Florestais, Madison',
      blurb: 'Onde a escada é desmontada peça por peça.',
      scene: 'laboratorio',
      evidenceIds: ['koehler'],
    },
    {
      id: 'posto',
      name: 'Nova York · setembro de 1934',
      blurb: 'Dois anos e meio depois, uma nota de dez dólares.',
      scene: 'posto',
      evidenceIds: ['frentista', 'garagem'],
    },
  ],
  evidence: [
    {
      id: 'sequestro',
      title: 'O quarto vazio',
      kind: 'local',
      dramatized: false,
      paragraphs: [
        'Na noite de 1º de março de 1932, Charles Augustus Lindbergh Jr., de 20 meses, foi levado do quarto, no segundo andar. Havia um bilhete pedindo 50 mil dólares de resgate.',
      ],
    },
    {
      id: 'escada',
      title: 'A escada',
      kind: 'objeto',
      dramatized: false,
      paragraphs: [
        'Do lado de fora, perto da casa, a polícia encontrou uma escada de madeira feita à mão, quebrada. Ela foi usada para alcançar a janela do segundo andar.',
        'Ninguém sabe quem a construiu, mas cada tábua guarda as marcas das ferramentas e da árvore de onde veio.',
      ],
    },
    {
      id: 'maio',
      title: '12 de maio de 1932',
      kind: 'documento',
      dramatized: false,
      paragraphs: ['O corpo do bebê foi encontrado num bosque a poucos quilômetros da casa. O caso passou a ser investigado como homicídio.'],
    },
    {
      id: 'condon',
      title: 'O intermediário',
      kind: 'depoimento',
      dramatized: false,
      paragraphs: [
        'John F. Condon, professor aposentado do Bronx, ofereceu-se como intermediário. Em 2 de abril de 1932, ele entregou o resgate a um homem que se apresentou como "John", no Cemitério de St. Raymond.',
        'Antes do pagamento, os números de série das notas foram anotados. A maior parte era de certificados-ouro, um tipo de cédula que, a partir de 1933, o governo mandou recolher. Quem gastasse um certificado-ouro depois disso chamaria atenção.',
      ],
    },
    {
      id: 'koehler',
      title: 'Arthur Koehler',
      kind: 'documento',
      dramatized: false,
      paragraphs: [
        'Koehler, especialista em madeira do Laboratório de Produtos Florestais, examinou a escada ao microscópio. As marcas deixadas pela plaina mecânica nas tábuas permitiram rastrear a madeira até uma serraria na Carolina do Sul e, de lá, até um depósito de madeira no Bronx.',
        'Uma das peças, porém, era diferente: era uma tábua de piso reaproveitada, com furos de prego que não tinham função na escada.',
      ],
    },
    {
      id: 'frentista',
      title: 'O frentista',
      kind: 'depoimento',
      dramatized: false,
      paragraphs: [
        'Em setembro de 1934, um frentista de Nova York recebeu um certificado-ouro de 10 dólares. Desconfiado, ele anotou na nota a placa do carro do cliente.',
        'O carro estava registrado em nome de Bruno Richard Hauptmann, carpinteiro do Bronx, preso em 19 de setembro de 1934.',
      ],
    },
    {
      id: 'garagem',
      title: 'A garagem de Hauptmann',
      kind: 'objeto',
      dramatized: false,
      paragraphs: [
        'Na garagem de Hauptmann, a polícia encontrou cerca de 14 mil dólares do resgate escondidos. Hauptmann disse que o dinheiro tinha sido deixado com ele por um sócio que morrera.',
        'O sótão da casa dele também foi examinado. Faltava um pedaço de uma das tábuas do piso.',
      ],
    },
  ],
  training: {
    kind: 'raciocinio',
    title: 'Elo por elo',
    lede: 'Nenhuma prova deste caso, sozinha, mostra quem levou o bebê. O trabalho é entender o que cada elo prova e o que não prova.',
    items: [
      {
        id: 'banco',
        prompt: 'Uma nota do resgate aparece num banco de Manhattan em 1933.',
        options: [
          { id: 'mora', text: 'Prova que o sequestrador mora em Manhattan' },
          { id: 'circulou', text: 'Mostra onde a nota circulou; ela pode ter passado por várias mãos' },
          { id: 'nada', text: 'Não tem nenhum valor para a investigação' },
        ],
        correct: 'circulou',
        explanation: 'Dinheiro circula. Cada nota é um ponto num mapa; o padrão de muitos pontos é que aponta uma região.',
      },
      {
        id: 'posse',
        prompt: 'Havia notas do resgate escondidas na garagem de Hauptmann.',
        options: [
          { id: 'prova', text: 'Prova que ele fez o sequestro' },
          { id: 'liga', text: 'Liga Hauptmann ao dinheiro do resgate, mas sozinha não prova o sequestro' },
          { id: 'irrelevante', text: 'Não prova nada, porque ele explicou de onde veio' },
        ],
        correct: 'liga',
        explanation: 'Posse de dinheiro do resgate é um elo forte, mas a defesa podia alegar, como alegou, que outra pessoa o deixou lá.',
      },
      {
        id: 'plaina',
        prompt: 'As tábuas da escada têm marcas de uma plaina mecânica com uma lâmina defeituosa.',
        options: [
          { id: 'tabua', text: 'Identificam exatamente uma tábua' },
          { id: 'lote', text: 'Identificam a máquina, e com isso a serraria e um lote de madeira' },
          { id: 'arvore', text: 'Identificam a árvore de onde a madeira veio' },
        ],
        correct: 'lote',
        explanation: 'Todas as tábuas que passaram por aquela plaina têm a mesma marca. É uma característica de classe: estreita a busca, mas não individualiza.',
      },
      {
        id: 'encaixe',
        prompt: 'Os veios de uma peça da escada continuam nos veios de uma tábua de um sótão, e os furos de prego da peça caem sobre as vigas desse sótão.',
        options: [
          { id: 'mesma', text: 'Indica que as duas eram uma tábua só' },
          { id: 'comum', text: 'Qualquer tábua do mesmo lote teria esse padrão' },
          { id: 'autor', text: 'Prova quem subiu a escada' },
        ],
        correct: 'mesma',
        explanation: 'O desenho dos veios ao longo de uma tábua é único, como uma impressão digital. Mas mostrar de onde veio a madeira não mostra, por si só, quem usou a escada.',
      },
    ],
  },
  lab: {
    kind: 'cedulas-madeira',
    title: 'Laboratório: dinheiro e madeira',
    lede: 'Duas pistas independentes. Primeiro, ache as notas do resgate no livro de registros e a que leva a um suspeito. Depois, teste de onde saiu a peça da escada.',
    bills: {
      title: 'Livro de notas recolhidas',
      lede: 'Bancos e comerciantes receberam uma lista com os números do resgate. Confira cada número com atenção: há números quase iguais.',
      ransomList: ['A35517920A', 'A69718812A', 'A73003861A', 'A80114236A', 'B11873405A', 'B20945178A', 'B31260094A', 'B47712038A'],
      ledger: [
        { id: 'n1', serial: 'A35517920A', denomination: 10, kind: 'certificado-ouro', where: 'Banco em Manhattan', date: 'nov. 1933' },
        { id: 'n2', serial: 'A35517902A', denomination: 10, kind: 'certificado-ouro', where: 'Banco em Manhattan', date: 'dez. 1933' },
        { id: 'n3', serial: 'B11873405A', denomination: 20, kind: 'certificado-ouro', where: 'Loja em Yorkville', date: 'mar. 1934' },
        { id: 'n4', serial: 'K42290017A', denomination: 5, kind: 'nota-federal', where: 'Mercearia no Bronx', date: 'jul. 1934' },
        { id: 'n5', serial: 'A69718812A', denomination: 10, kind: 'certificado-ouro', where: 'Cinema na Rua 86', date: 'ago. 1934' },
        {
          id: 'n6',
          serial: 'B11873450A',
          denomination: 20,
          kind: 'certificado-ouro',
          where: 'Padaria no Bronx',
          date: 'ago. 1934',
          note: '"cliente com sotaque, pagou com pressa"',
        },
        {
          id: 'n7',
          serial: 'A73003861A',
          denomination: 10,
          kind: 'certificado-ouro',
          where: 'Posto de gasolina, Upper Manhattan',
          date: 'set. 1934',
          note: 'placa 4U-13-41, N.Y., escrita pelo frentista',
        },
      ],
      leadQuestion: 'Qual nota permite chegar a uma pessoa?',
      leadBillId: 'n7',
      leadExplanation:
        'Só a nota do posto é do resgate e traz algo que identifica alguém: a placa do carro. A nota da padaria tem anotação, mas o número não está na lista.',
    },
    wood: {
      title: 'Confronto da madeira: a peça com furos de prego',
      lede: 'Deslize a peça da escada no vão, gire se precisar, e veja se os furos caem sobre as vigas e se os veios continuam na tábua ao lado. Teste as duas tábuas.',
      setup: {
        boardWidth: 14,
        gapLength: 141,
        floorLength: 240,
        railLength: 110,
        kerf: 1.2,
        joistStart: 12,
        joistSpacing: 40.6,
        railSourceSeed: 1934,
        grainLines: 5,
      },
      candidates: [
        {
          id: 'sotao',
          name: 'Sótão de Hauptmann',
          description: 'Tábua de pinho do piso do sótão, ainda pregada, ao lado de um vão de onde falta um pedaço. Marcas de plaina compatíveis com as da escada.',
          grainSeed: 1934,
          joists: true,
        },
        {
          id: 'deposito',
          name: 'Depósito no Bronx',
          description: 'Tábua do mesmo lote, vendida pelo depósito de madeira do Bronx. Mesmas marcas de plaina, porque passou pela mesma máquina.',
          grainSeed: 777,
          joists: false,
        },
      ],
      explanation:
        'A peça da escada só se encaixa na tábua do sótão: os furos caem sobre as vigas e os veios continuam na emenda. A tábua do depósito tem a mesma marca de plaina, mas os veios não continuam. A marca da plaina aponta o lote; os veios e os furos apontam a tábua.',
    },
  },
  accusation: [
    {
      id: 'nota',
      prompt: 'O que a nota do posto de gasolina permitiu?',
      options: [
        { id: 'provar', text: 'Provar quem fez o sequestro' },
        { id: 'chegar', text: 'Chegar ao dono do carro e, a partir dele, ao dinheiro escondido' },
        { id: 'digital', text: 'Identificar uma impressão digital na nota' },
      ],
      correct: 'chegar',
      explanation: 'A placa levou a Hauptmann; a busca na casa dele encontrou o dinheiro. Um elo puxou o outro.',
    },
    {
      id: 'madeira',
      prompt: 'O que o confronto da madeira mostrou?',
      options: [
        { id: 'comprada', text: 'Que a escada foi comprada pronta' },
        { id: 'sotao', text: 'Que uma peça da escada saiu do piso do sótão da casa de Hauptmann' },
        { id: 'lindbergh', text: 'Que a madeira veio da casa dos Lindbergh' },
      ],
      correct: 'sotao',
      explanation: 'Veios contínuos e furos de prego alinhados com as vigas ligaram a peça a uma tábua específica do sótão.',
    },
    {
      id: 'conjunto',
      prompt: 'Nenhuma prova, sozinha, mostrava o sequestro. Por que o júri condenou?',
      options: [
        { id: 'confissao', text: 'Porque Hauptmann confessou' },
        { id: 'convergencia', text: 'Porque provas independentes apontavam na mesma direção: dinheiro, madeira, caligrafia dos bilhetes e o reconhecimento por Condon' },
        { id: 'testemunha', text: 'Porque uma testemunha viu o sequestro' },
      ],
      correct: 'convergencia',
      explanation: 'Foi uma condenação por provas circunstanciais que convergiam. Hauptmann negou até o fim, e é por isso que o caso ainda é discutido.',
    },
  ],
  reveal: {
    summary: [
      'O resgate foi entregue em abril de 1932, no Cemitério de St. Raymond, por meio de John F. Condon. Em maio, o corpo do bebê foi encontrado perto da casa.',
      'As notas do resgate foram aparecendo ao longo de dois anos, principalmente em Nova York. Em setembro de 1934, um frentista anotou a placa de um cliente que pagou com um certificado-ouro. O carro era de Bruno Richard Hauptmann, em cuja garagem havia cerca de 14 mil dólares do resgate. Ele disse que o dinheiro era de um sócio já falecido.',
      'Arthur Koehler rastreou as marcas de plaina da escada até uma serraria na Carolina do Sul e até um depósito no Bronx. No julgamento, mostrou que uma peça da escada encaixava numa tábua do piso do sótão de Hauptmann: os veios continuavam e os furos de prego coincidiam com as vigas.',
      'Hauptmann foi julgado em Flemington, Nova Jersey, entre janeiro e fevereiro de 1935. Além do dinheiro e da madeira, peritos compararam a caligrafia dele com a dos bilhetes, e Condon o reconheceu como "John". Ele foi condenado em fevereiro de 1935 e executado em 3 de abril de 1936. O caso levou à lei que tornou o sequestro um crime federal nos EUA, investigado pelo FBI.',
      'Hauptmann sempre se disse inocente. Desde então, alguns autores questionam a investigação, a confiabilidade de testemunhas e até a origem da tábua do sótão. Outros historiadores sustentam que as provas eram sólidas. O jogo mostra o que a Justiça decidiu e registra que a discussão continua.',
    ],
    fidelity: {
      documented: [
        'Sequestro em 1º de março de 1932, em Hopewell; resgate entregue por Condon no Cemitério de St. Raymond, com os números das notas anotados.',
        'Corpo encontrado em 12 de maio de 1932; prisão de Hauptmann em 19 de setembro de 1934, depois que um frentista anotou a placa do carro.',
        'Koehler rastreou a madeira até uma serraria na Carolina do Sul e um depósito no Bronx, e ligou uma peça da escada a uma tábua do sótão de Hauptmann.',
        'Condenação em fevereiro de 1935 e execução em 3 de abril de 1936.',
      ],
      divergent: [
        'Valor encontrado na garagem: as fontes falam em 13.750 dólares, cerca de 14 mil e mais de 14 mil.',
        'O resgate pedido subiu para 70 mil dólares depois do primeiro bilhete; o valor efetivamente pago aparece como 50 mil na maioria dos relatos.',
        'A placa 4U-13-41 aparece em relatos do caso, mas não a confirmei numa fonte primária.',
        'A culpa de Hauptmann: há autores que alegam provas forjadas, inclusive a tábua do sótão, e historiadores que as consideram sólidas.',
      ],
      dramatized: [
        'O papel do jogador e o texto da circular policial.',
        'Os números de série, os locais e as anotações do livro de notas, exceto a ideia da placa escrita pelo frentista.',
        'As medidas das tábuas, o espaçamento das vigas e o desenho dos veios, gerados por computador.',
      ],
    },
    today: [
      {
        title: 'A madeira ainda fala',
        text: 'A anatomia da madeira continua sendo usada na perícia: identificar a espécie, comparar peças e, com a dendrocronologia (a datação pelos anéis de crescimento), estimar idade e origem. O método de Koehler, de comparar características de classe e depois individuais, é o mesmo das outras áreas forenses.',
      },
      {
        title: 'Seguir o dinheiro, versão digital',
        text: 'Em 2021, depois do ataque de ransomware à Colonial Pipeline, o Departamento de Justiça dos EUA recuperou cerca de 63,7 bitcoins do resgate rastreando as transações. O blockchain é um livro de registros público: o mesmo princípio da lista de números de série, numa escala muito maior.',
      },
      {
        title: 'Cadeia de custódia',
        text: 'Boa parte da controvérsia sobre Hauptmann gira em torno de uma pergunta: a tábua do sótão estava lá antes da polícia chegar? Hoje, a documentação de quem encontrou, guardou e manuseou cada vestígio é obrigatória. No Brasil, a Lei 13.964/2019 incluiu regras de cadeia de custódia no Código de Processo Penal (arts. 158-A a 158-F).',
      },
    ],
    sources: [
      { label: 'FBI — Famous Cases: The Lindbergh Kidnapping', kind: 'museu', url: 'https://www.fbi.gov/history/famous-cases/lindbergh-kidnapping' },
      { label: 'PBS American Experience — Lindbergh: The Crime', kind: 'jornalístico', url: 'https://www.pbs.org/wgbh/amex/lindbergh/sfeature/crime.html' },
      { label: 'History.com — Bruno Hauptmann executed', kind: 'jornalístico', url: 'https://www.history.com/this-day-in-history/april-3/bruno-hauptmann-executed' },
      { label: 'Famous Trials (Douglas Linder, UMKC) — The Trial of Bruno Hauptmann', kind: 'jurídico', url: 'https://famous-trials.com/hauptmann' },
      { label: 'Arthur Koehler, "Techniques Used in Tracing the Lindbergh Kidnapping Ladder", Journal of Criminal Law and Criminology (1937)', kind: 'acadêmico' },
      { label: 'Jim Fisher, The Lindbergh Case (Rutgers University Press, 1987)', kind: 'livro' },
      { label: 'Wikipedia — Arthur Koehler (usada como índice de fontes)', kind: 'enciclopédia', url: 'https://en.wikipedia.org/wiki/Arthur_Koehler' },
    ],
  },
};
