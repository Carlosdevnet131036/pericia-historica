import { h } from '../dom';
import type { Screen } from './context';

export const expediente: Screen = ({ caseFile: c, store }) =>
  h(
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
        'aside',
        { class: 'telegram', 'aria-label': 'Telegrama recebido' },
        h('p', { class: 'telegram-head' }, 'Telégrafo da Província · Urgente'),
        h('p', { class: 'telegram-body' }, c.telegram),
        h('p', { class: 'telegram-foot' }, 'Texto reconstruído para o jogo'),
      ),
    ),
    h(
      'div',
      { class: 'actions' },
      h('button', { class: 'btn primary', onclick: () => store.goTo('investigacao') }, 'Seguir com Álvarez para Necochea'),
    ),
  );
