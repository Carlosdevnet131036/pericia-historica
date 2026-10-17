import { computeScore } from '../../engine/scoring';
import { h } from '../dom';
import type { Screen } from './context';

const list = (items: string[]) => h('ul', {}, ...items.map((i) => h('li', {}, i)));

export const revelacao: Screen = ({ caseFile: c, store }) => {
  const score = computeScore(c, store.get());
  const { fidelity } = c.reveal;

  return h(
    'section',
    { class: 'screen revelacao' },
    h(
      'div',
      { class: 'score-card' },
      h('p', { class: 'eyebrow' }, 'Avaliação do caso'),
      h('p', { class: 'rank' }, score.rank),
      h('p', { class: 'score-total' }, `${score.total} / ${score.max} pontos`),
      h(
        'table',
        { class: 'score-table' },
        h('tbody', {}, ...score.lines.map((l) => h('tr', {}, h('td', {}, l.label), h('td', { class: 'num' }, `${l.points}/${l.max}`)))),
      ),
    ),
    h('h2', {}, 'O que realmente aconteceu'),
    h('div', { class: 'prose' }, ...c.reveal.summary.map((p) => h('p', {}, p))),
    h('h3', { class: 'section-title' }, 'O que é fato e o que é jogo'),
    h(
      'div',
      { class: 'fidelity' },
      h('div', { class: 'fid fid-doc' }, h('h4', {}, 'Documentado'), list(fidelity.documented)),
      h('div', { class: 'fid fid-div' }, h('h4', {}, 'As fontes divergem'), list(fidelity.divergent)),
      h('div', { class: 'fid fid-dram' }, h('h4', {}, 'Dramatizado no jogo'), list(fidelity.dramatized)),
    ),
    h('h3', { class: 'section-title' }, 'A perícia hoje'),
    h(
      'div',
      { class: 'today' },
      ...c.reveal.today.map((t) => h('article', {}, h('h4', {}, t.title), h('p', {}, t.text))),
    ),
    h('h3', { class: 'section-title' }, 'Fontes'),
    h(
      'ul',
      { class: 'sources' },
      ...c.reveal.sources.map((src) =>
        h(
          'li',
          {},
          h('span', { class: 'tag' }, src.kind),
          ' ',
          src.url ? h('a', { href: src.url, target: '_blank', rel: 'noopener noreferrer' }, src.label) : src.label,
        ),
      ),
    ),
    h(
      'div',
      { class: 'actions' },
      h('button', { class: 'btn ghost', onclick: () => store.reset() }, 'Jogar o caso de novo'),
    ),
  );
};
