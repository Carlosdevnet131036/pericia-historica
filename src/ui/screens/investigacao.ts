import type { Evidence } from '../../engine/types';
import { h } from '../dom';
import { onCaseChange } from '../view-state';
import type { Screen } from './context';

const KIND_LABEL: Record<Evidence['kind'], string> = {
  documento: 'Documento',
  depoimento: 'Depoimento',
  local: 'Local',
  objeto: 'Vestígio',
};

function evidenceCard(e: Evidence): HTMLElement {
  return h(
    'article',
    { class: 'evidence' },
    h(
      'div',
      { class: 'evidence-tags' },
      h('span', { class: 'tag' }, KIND_LABEL[e.kind]),
      h(
        'span',
        { class: e.dramatized ? 'tag tag-dram' : 'tag tag-doc' },
        e.dramatized ? 'Dramatizado' : 'Documentado',
      ),
    ),
    h('h3', {}, e.title),
    ...e.paragraphs.map((p) => h('p', {}, p)),
  );
}

let active: string | null = null;
onCaseChange(() => {
  active = null;
});

export const investigacao: Screen = ({ caseFile: c, store }) => {
  const s = store.get();
  const current = c.locations.find((l) => l.id === active) ?? null;
  const allVisited = c.locations.every((l) => s.visited.includes(l.id));

  const open = (id: string) => {
    active = id;
    store.update((st) => (st.visited.includes(id) ? { ...st } : { ...st, visited: [...st.visited, id] }));
  };

  return h(
    'section',
    { class: 'screen investigacao' },
    h('h2', {}, c.copy.investigationTitle),
    h('p', { class: 'lede' }, `Visite os ${c.locations.length} lugares e leia o que cada um tem. Os cartões dizem o que é fato documentado e o que foi dramatizado.`),
    h(
      'div',
      { class: 'investigation-layout' },
      h(
        'nav',
        { class: 'locations', 'aria-label': 'Lugares' },
        ...c.locations.map((l) =>
          h(
            'button',
            {
              class: `location${l.id === active ? ' is-active' : ''}`,
              'aria-pressed': l.id === active ? 'true' : 'false',
              onclick: () => open(l.id),
            },
            h('span', { class: 'location-name' }, l.name),
            h('span', { class: 'location-blurb' }, l.blurb),
            h('span', { class: 'location-state' }, s.visited.includes(l.id) ? 'Visitado' : 'Não visitado'),
          ),
        ),
      ),
      h(
        'div',
        { class: 'evidence-list' },
        current
          ? current.evidenceIds
              .map((id) => c.evidence.find((e) => e.id === id))
              .filter((e): e is Evidence => e !== undefined)
              .map(evidenceCard)
          : h('p', { class: 'empty' }, 'Escolha um lugar para começar.'),
      ),
    ),
    h(
      'div',
      { class: 'actions' },
      h(
        'button',
        { class: 'btn primary', disabled: !allVisited, onclick: () => store.goTo('treino') },
        allVisited ? c.copy.toTraining : `Visite todos os lugares (${s.visited.length}/${c.locations.length})`,
      ),
    ),
  );
};
