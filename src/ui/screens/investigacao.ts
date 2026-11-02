import type { Evidence } from '../../engine/types';
import { scene } from '../art/scenes';
import { drawIn } from '../art/svg';
import { isTouchOnly } from '../device';
import { h } from '../dom';
import { firstTime, onCaseChange } from '../view-state';
import { evidenceCard, suspectsBoard } from '../components/caso';
import { isSearchDone, searchPanel, searchProgress, stars } from '../modules/busca';
import type { Screen } from './context';

let active: string | null = null;
onCaseChange(() => {
  active = null;
});

export const investigacao: Screen = (ctx) => {
  const { caseFile: c, store } = ctx;
  const s = store.get();
  const current = c.locations.find((l) => l.id === active) ?? null;
  const allVisited = c.locations.every((l) => s.visited.includes(l.id));
  const hasSearch = c.locations.some((l) => l.search);
  const searchDone = current ? isSearchDone(ctx, current) : false;
  // Cartões entram animados na primeira vez que ficam visíveis.
  const fresh = current && searchDone ? firstTime(`${c.id}:${current.id}`) : false;
  const art = current && !current.search ? scene(current.scene, `Ilustração: ${current.name}`) : null;
  if (art && fresh) drawIn(art);

  const open = (id: string) => {
    active = id;
    const loc = c.locations.find((l) => l.id === id);
    // Lugares com cena de busca só contam como visitados quando a cena é completada.
    store.update((st) => (st.visited.includes(id) || loc?.search ? { ...st } : { ...st, visited: [...st.visited, id] }));
  };

  const stateLabel = (l: (typeof c.locations)[number]) => {
    if (!l.search) return s.visited.includes(l.id) ? 'Visitado' : 'Não visitado';
    const best = searchProgress(ctx, l).bestStars;
    return best ? stars(best) : 'Não investigado';
  };

  const cards = current
    ? current.evidenceIds
        .map((id) => c.evidence.find((e) => e.id === id))
        .filter((e): e is Evidence => e !== undefined)
        .map((e, i) => evidenceCard(e, i, fresh))
    : [];

  return h(
    'section',
    { class: 'screen investigacao' },
    h('h2', {}, c.copy.investigationTitle),
    h(
      'p',
      { class: 'lede' },
      hasSearch
        ? `Investigue os ${c.locations.length} lugares: ache os objetos de cada cena para liberar as evidências. Os cartões dizem o que é fato documentado e o que foi dramatizado.`
        : `Visite os ${c.locations.length} lugares e leia o que cada um tem. Os cartões dizem o que é fato documentado e o que foi dramatizado.`,
    ),
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
            h('span', { class: 'location-state' }, stateLabel(l)),
          ),
        ),
      ),
      h(
        'div',
        { class: 'evidence-list' },
        !current
          ? h('p', { class: 'empty' }, 'Escolha um lugar para começar.')
          : current.search
            ? [
                current.explore3d
                  ? isTouchOnly()
                    ? h('p', { class: 'caption explore3d-note' }, 'Há uma versão 3D deste lugar, mas ela precisa de teclado e mouse. Neste aparelho, a busca abaixo é a versão completa.')
                    : h(
                        'a',
                        { class: 'btn ghost explore3d', href: `#${c.id}/3d` },
                        'Explorar este lugar em 3D (protótipo, computador com teclado e mouse)',
                      )
                  : null,
                searchPanel(ctx, current),
                ...(searchDone ? cards : []),
              ]
            : [h('figure', { class: 'scene-frame' }, art, h('figcaption', {}, current.name)), ...cards],
      ),
    ),
    allVisited ? suspectsBoard(c, s) : null,
    h(
      'div',
      { class: 'actions' },
      h(
        'button',
        { class: 'btn primary', disabled: !allVisited, onclick: () => store.goTo('treino') },
        allVisited ? c.copy.toTraining : `${hasSearch ? 'Investigue' : 'Visite'} todos os lugares (${s.visited.length}/${c.locations.length})`,
      ),
    ),
  );
};
