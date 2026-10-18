import { progressScore, searchStars, unlockedEvidence } from '../../engine/search';
import { STEPS, type CaseFile, type GameState } from '../../engine/types';
import { OBJECT_NAMES } from '../art/objects';
import { cover } from '../art/covers';
import { portrait } from '../art/portraits';
import { s as svg } from '../art/svg';
import { h } from '../dom';
import { evidenceCard, revealedTraits } from './caso';

/**
 * Diário de investigação em forma de caderno, usado na versão 2D (botão no
 * cabeçalho) e no 3D (tecla J). Abas à esquerda; cada aba ocupa as duas
 * páginas abertas. Mostra só o que o jogador já liberou, com as mesmas regras
 * das telas do caso: evidências por lugar investigado e suspeitos depois de
 * todos os lugares.
 */
export type NotebookTab = 'caso' | 'evidencias' | 'suspeitos' | 'objetos';

const TABS: { id: NotebookTab; label: string; icon: string }[] = [
  { id: 'caso', label: 'Caso', icon: 'M3 2h8l2 2v10H3z M5 6h6 M5 9h6 M5 12h4' },
  { id: 'evidencias', label: 'Evidências', icon: 'M7 3a4 4 0 1 1 0 8a4 4 0 0 1 0-8z M10 10l4 4' },
  { id: 'suspeitos', label: 'Suspeitos', icon: 'M8 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6z M2 15c0-4 3-6 6-6s6 2 6 6' },
  { id: 'objetos', label: 'Objetos', icon: 'M2 6h12v8H2z M5 6V4h6v2' },
];

const MARK = { sim: '✓', nao: '✗', '?': '?' } as const;

export interface NotebookOptions {
  initial?: NotebookTab;
  onClose(): void;
  /** Texto do botão de fechar (o 3D mostra a tecla J). */
  closeLabel?: string;
}

function tabIcon(d: string): SVGSVGElement {
  return svg('svg', { viewBox: '0 0 16 16', class: 'nb-tab-icon', 'aria-hidden': 'true' }, svg('path', { d }));
}

const hand = (tag: 'h2' | 'h3' | 'p', text: string, cls = '') => h(tag, { class: `nb-hand ${cls}`.trim() }, text);

function casePages(c: CaseFile, st: GameState): [HTMLElement, HTMLElement] {
  const step = STEPS.find((x) => x.id === st.step)?.label ?? '';
  const visited = c.locations.filter((l) => st.visited.includes(l.id)).length;
  return [
    h(
      'div',
      {},
      h('p', { class: 'nb-date' }, `${c.place.split(',')[0]}, ${c.date}`),
      h('figure', { class: 'nb-photo' }, cover(c.cover, `Capa do caso: ${c.title}`), h('figcaption', { class: 'nb-hand' }, c.title)),
    ),
    h(
      'div',
      {},
      hand('h2', 'Caso'),
      h('p', {}, c.dispatch.body),
      h(
        'ul',
        { class: 'nb-facts' },
        h('li', {}, h('strong', {}, 'Seu papel: '), c.playerRole),
        h('li', {}, h('strong', {}, 'Técnica: '), c.technique),
        h('li', {}, h('strong', {}, 'Etapa atual: '), step),
        h('li', {}, h('strong', {}, 'Lugares investigados: '), `${visited} de ${c.locations.length}`),
      ),
      h(
        'p',
        { class: 'nb-legend' },
        h('span', { class: 'tag tag-doc' }, 'Documentado'),
        ' consta das fontes do caso. ',
        h('span', { class: 'tag tag-dram' }, 'Dramatizado'),
        ' foi criado ou suposto para o jogo.',
      ),
    ),
  ];
}

function evidencePages(c: CaseFile, st: GameState): [HTMLElement, HTMLElement] {
  const list = unlockedEvidence(c, st);
  if (!list.length) {
    return [
      h('div', {}, hand('h2', 'Evidências'), hand('p', 'Nada anotado ainda.', 'nb-note')),
      h('div', {}, h('p', { class: 'caption' }, 'Investigue os lugares do caso: cada lugar concluído acrescenta os cartões dele aqui.')),
    ];
  }
  const half = Math.ceil(list.length / 2);
  return [
    h('div', {}, hand('h2', `Evidências (${list.length})`), ...list.slice(0, half).map((e, i) => evidenceCard(e, i, false))),
    h('div', {}, ...list.slice(half).map((e, i) => evidenceCard(e, i, false))),
  ];
}

function suspectPages(c: CaseFile, st: GameState): [HTMLElement, HTMLElement] {
  if (!c.suspects?.length) {
    return [h('div', {}, hand('h2', 'Suspeitos')), h('div', {}, h('p', { class: 'caption' }, 'Este caso não tem quadro de suspeitos.'))];
  }
  if (!c.locations.every((l) => st.visited.includes(l.id))) {
    return [
      h('div', {}, hand('h2', 'Suspeitos'), hand('p', 'Ainda é cedo para apontar alguém.', 'nb-note')),
      h('div', {}, h('p', { class: 'caption' }, 'O quadro de suspeitos abre quando todos os lugares do caso forem investigados.')),
    ];
  }
  const traits = revealedTraits(c, st);
  return [
    h(
      'div',
      {},
      hand('h2', 'Perfil do responsável'),
      traits.length
        ? h('ol', { class: 'nb-traits' }, ...traits.map((t) => h('li', {}, h('strong', {}, t.label), h('span', { class: 'caption' }, ` · ${t.source}`))))
        : hand('p', 'Nenhuma pista ainda: as análises do laboratório vão revelar o perfil.', 'nb-note'),
      h('p', { class: 'caption nb-illus' }, 'Retratos: ilustrações genéricas de época, não semelhanças das pessoas reais.'),
    ),
    h(
      'div',
      {},
      hand('h2', 'Suspeitos'),
      h(
        'div',
        { class: 'nb-suspects' },
        ...c.suspects.map((sp, i) =>
          h(
            'figure',
            { class: 'nb-suspect', style: `--tilt:${[-2, 1.5, -1, 2][i % 4]}deg` },
            portrait(sp.portrait ?? 'desconhecido', `Ilustração: ${sp.name}`),
            h('figcaption', {}, h('span', { class: 'nb-hand nb-name' }, sp.name), h('span', { class: 'caption' }, sp.role)),
            sp.dramatized ? h('span', { class: 'tag tag-dram' }, 'Dramatizado') : h('span', { class: 'tag tag-doc' }, 'Documentado'),
            traits.length
              ? h(
                  'ul',
                  { class: 'suspect-traits' },
                  ...traits.map((t) => {
                    const v = sp.traits[t.id] ?? '?';
                    return h('li', { class: `mark-${v === '?' ? 'unknown' : v}` }, h('span', { class: 'mark' }, MARK[v]), t.label);
                  }),
                )
              : null,
          ),
        ),
      ),
    ),
  ];
}

function objectPages(c: CaseFile, st: GameState): [HTMLElement, HTMLElement] {
  const scenes = c.locations.filter((l) => l.search);
  if (!scenes.length) {
    return [h('div', {}, hand('h2', 'Objetos')), h('div', {}, h('p', { class: 'caption' }, 'Este caso não tem cenas de busca.'))];
  }
  const block = (l: (typeof scenes)[number]) => {
    const p = st.search[l.id];
    const found = p?.found ?? [];
    const done = (p?.elapsedMs ?? null) !== null;
    return h(
      'section',
      { class: 'nb-scene' },
      h('h3', { class: 'nb-hand' }, l.name),
      h(
        'p',
        { class: 'caption' },
        done && p ? `Concluída · ${'★'.repeat(searchStars(progressScore(p)))}${'☆'.repeat(5 - searchStars(progressScore(p)))}` : `${found.length} de ${l.search!.targets.length} encontrados`,
      ),
      h('ul', { class: 'search-list' }, ...l.search!.targets.map((id) => h('li', { class: found.includes(id) ? 'is-found' : '' }, OBJECT_NAMES[id]))),
    );
  };
  const half = Math.ceil(scenes.length / 2);
  return [
    h('div', {}, hand('h2', 'Objetos das buscas'), ...scenes.slice(0, half).map(block), h('p', { class: 'caption' }, 'Peças de cena: liberam os cartões de cada lugar, mas não são indícios do caso.')),
    h('div', {}, ...scenes.slice(half).map(block)),
  ];
}

const PAGES: Record<NotebookTab, (c: CaseFile, st: GameState) => [HTMLElement, HTMLElement]> = {
  caso: casePages,
  evidencias: evidencePages,
  suspeitos: suspectPages,
  objetos: objectPages,
};

export function notebook(c: CaseFile, st: GameState, opts: NotebookOptions): HTMLElement {
  let tab: NotebookTab = opts.initial ?? 'caso';
  const tabs = h('div', { class: 'nb-tabs', role: 'tablist', 'aria-label': 'Seções do diário' });
  const spread = h('div', { class: 'nb-spread', role: 'tabpanel' });
  const root = h(
    'div',
    { class: 'notebook' },
    tabs,
    spread,
    h('button', { class: 'nb-close', type: 'button', onclick: () => opts.onClose(), 'aria-label': opts.closeLabel ?? 'Fechar o diário', title: opts.closeLabel ?? 'Fechar o diário' }, '✕'),
  );

  const render = () => {
    tabs.replaceChildren(
      ...TABS.map((t) =>
        h(
          'button',
          {
            class: `nb-tab nb-tab-${t.id}${t.id === tab ? ' is-active' : ''}`,
            type: 'button',
            role: 'tab',
            'aria-selected': t.id === tab ? 'true' : 'false',
            onclick: () => {
              tab = t.id;
              render();
            },
          },
          tabIcon(t.icon),
          h('span', { class: 'nb-tab-label' }, t.label),
        ),
      ),
    );
    const [left, right] = PAGES[tab](c, st);
    left.className = 'nb-page nb-left';
    right.className = 'nb-page nb-right';
    spread.replaceChildren(left, h('div', { class: 'nb-rings', 'aria-hidden': 'true' }), right);
  };
  render();
  return root;
}
