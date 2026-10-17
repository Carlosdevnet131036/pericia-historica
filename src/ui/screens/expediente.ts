import { cover } from '../art/covers';
import { drawIn } from '../art/svg';
import { h } from '../dom';
import { firstTime } from '../view-state';
import type { Screen } from './context';

export const expediente: Screen = ({ caseFile: c, store }) => {
  const art = cover(c.cover, `Ilustração do caso ${c.number}`);
  if (art instanceof SVGSVGElement && firstTime(`${c.id}:capa`)) drawIn(art);
  return h(
    'section',
    { class: 'screen expediente' },
    h(
      'header',
      { class: 'case-head' },
      h('p', { class: 'eyebrow' }, `Caso ${c.number} · ${c.technique}`),
      h('h1', {}, c.title),
      h('p', { class: 'meta' }, `${c.place} — ${c.date}`),
    ),
    h(
      'div',
      { class: 'two-col' },
      h('div', { class: 'prose' }, ...c.intro.map((p) => h('p', {}, p)), h('p', { class: 'role' }, c.playerRole)),
      h(
        'div',
        { class: 'opening' },
        h('figure', { class: 'hero-art' }, art),
        h(
        'aside',
        { class: 'telegram', 'aria-label': 'Documento de abertura do caso' },
        h('p', { class: 'telegram-head' }, c.dispatch.header),
        h('p', { class: 'telegram-body' }, c.dispatch.body),
        h('p', { class: 'telegram-foot' }, 'Texto reconstruído para o jogo'),
      ),
      ),
    ),
    h(
      'div',
      { class: 'actions' },
      h('button', { class: 'btn primary', onclick: () => store.goTo('investigacao') }, c.copy.start),
    ),
  );
};
