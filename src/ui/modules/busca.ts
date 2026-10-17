import { EMPTY_SEARCH, HIT_RADIUS, SEARCH_H, SEARCH_W, hitTarget, layoutSearch, progressScore, searchScore, searchStars } from '../../engine/search';
import type { Location, SearchProgress } from '../../engine/types';
import { ALL_OBJECTS, OBJECT_NAMES, placedObject } from '../art/objects';
import { scene } from '../art/scenes';
import { canvas, s } from '../art/svg';
import { h } from '../dom';
import { onCaseChange } from '../view-state';
import type { ScreenContext } from '../screens/context';

const EMPTY: SearchProgress = EMPTY_SEARCH;

/* Estado só de tela: último erro (para o X vermelho) e alvo da dica. */
let lastMiss: { x: number; y: number; at: number } | null = null;
let hintTarget: string | null = null;
onCaseChange(() => {
  lastMiss = null;
  hintTarget = null;
});

// Um único relógio para todas as cenas: atualiza o texto sem redesenhar a tela.
setInterval(() => {
  document.querySelectorAll<HTMLElement>('.search-timer[data-start]').forEach((el) => {
    el.textContent = formatTime(Date.now() - Number(el.dataset.start));
  });
}, 500);

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export const stars = (n: number, max = 5) => '★'.repeat(n) + '☆'.repeat(max - n);

export function searchProgress(ctx: ScreenContext, loc: Location): SearchProgress {
  return ctx.store.get().search[loc.id] ?? EMPTY;
}

export function isSearchDone(ctx: ScreenContext, loc: Location): boolean {
  return !loc.search || searchProgress(ctx, loc).elapsedMs !== null;
}

export function searchPanel(ctx: ScreenContext, loc: Location): HTMLElement {
  const spec = loc.search;
  if (!spec) throw new Error(`${loc.id} não tem cena de busca`);
  const { store } = ctx;
  const p = searchProgress(ctx, loc);
  const placements = layoutSearch(spec.seed, spec.targets, ALL_OBJECTS, spec.clutter);
  const started = p.startedAt !== null;
  const done = p.elapsedMs !== null;

  const save = (next: Partial<SearchProgress>) =>
    store.update((st) => ({ ...st, search: { ...st.search, [loc.id]: { ...(st.search[loc.id] ?? EMPTY), ...next } } }));

  /* ---------- Cena ---------- */

  const { root, hatch } = canvas(`0 0 ${SEARCH_W} ${SEARCH_H}`, `Cena de busca: ${loc.name}`);
  root.classList.add('search-svg');
  const backdrop = scene(loc.scene, '');
  backdrop.setAttribute('x', '0');
  backdrop.setAttribute('y', '0');
  backdrop.setAttribute('width', String(SEARCH_W));
  backdrop.setAttribute('height', String(SEARCH_H));
  backdrop.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  backdrop.classList.add('search-backdrop');
  root.append(backdrop);
  for (const o of placements) {
    const g = placedObject(o.id, hatch, o.x, o.y, o.rotation, o.scale);
    if (o.target && p.found.includes(o.id)) g.classList.add('is-found');
    root.append(g);
  }
  if (hintTarget && !p.found.includes(hintTarget)) {
    const t = placements.find((o) => o.id === hintTarget && o.target);
    if (t) root.append(s('circle', { class: 'hint-ring', cx: t.x, cy: t.y, r: HIT_RADIUS * t.scale + 8 }));
  }
  if (lastMiss && Date.now() - lastMiss.at < 700) {
    const { x, y } = lastMiss;
    root.append(s('path', { class: 'miss-mark', d: `M ${x - 10} ${y - 10} L ${x + 10} ${y + 10} M ${x + 10} ${y - 10} L ${x - 10} ${y + 10}` }));
  }

  if (started && !done) {
    root.addEventListener('click', (ev) => {
      const m = root.getScreenCTM();
      if (!m) return;
      const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
      const hit = hitTarget(placements, p.found, pt.x, pt.y);
      if (!hit) {
        lastMiss = { x: pt.x, y: pt.y, at: Date.now() };
        save({ misclicks: p.misclicks + 1 });
        return;
      }
      if (hintTarget === hit.id) hintTarget = null;
      const found = [...p.found, hit.id];
      if (found.length < spec.targets.length) {
        save({ found });
        return;
      }
      const elapsedMs = Date.now() - (p.startedAt ?? Date.now());
      const score = searchScore(elapsedMs / 1000, p.misclicks, p.hints);
      save({ found, elapsedMs, completedIn: '2d', bestStars: Math.max(p.bestStars, searchStars(score)) });
      // Completar a cena conta como visitar o lugar.
      store.update((st) => (st.visited.includes(loc.id) ? st : { ...st, visited: [...st.visited, loc.id] }));
    });
  }

  /* ---------- Lista de objetos, relógio e dica ---------- */

  const list = h(
    'ul',
    { class: 'search-list' },
    ...spec.targets.map((id) => h('li', { class: p.found.includes(id) ? 'is-found' : '' }, OBJECT_NAMES[id])),
  );

  const hint = () => {
    const remaining = spec.targets.filter((id) => !p.found.includes(id));
    hintTarget = remaining[0] ?? null;
    save({ hints: p.hints + 1 });
  };

  const sideBar = h(
    'aside',
    { class: 'search-side' },
    h('p', { class: 'found-label' }, `Encontre os ${spec.targets.length} objetos`),
    list,
    started && !done
      ? h(
          'div',
          { class: 'search-stats' },
          h('span', { class: 'search-timer', 'data-start': String(p.startedAt) }, formatTime(Date.now() - (p.startedAt ?? Date.now()))),
          h('span', {}, `Erros: ${p.misclicks}`),
          h('button', { class: 'btn ghost', onclick: hint }, 'Dica (−120)'),
        )
      : null,
  );

  const overlay = !started
    ? h(
        'div',
        { class: 'search-overlay' },
        h('p', {}, 'Ache os objetos da lista o mais rápido que puder. Cliques errados e dicas custam pontos.'),
        h('button', { class: 'btn primary', onclick: () => save({ startedAt: Date.now() }) }, p.bestStars ? 'Investigar de novo' : 'Iniciar busca'),
      )
    : null;

  const summary = done
    ? (() => {
        const score = progressScore(p);
        return h(
          'div',
          { class: 'search-summary' },
          h('p', { class: 'search-stars', 'aria-label': `${searchStars(score)} de 5 estrelas` }, stars(searchStars(score))),
          h(
            'p',
            {},
            p.completedIn === '3d'
              ? `Concluída na exploração 3D · tempo ${formatTime(p.elapsedMs ?? 0)} · ${score} pontos`
              : `Tempo ${formatTime(p.elapsedMs ?? 0)} · ${p.misclicks} erros · ${p.hints} dicas · ${score} pontos`,
          ),
          p.bestStars > searchStars(score) ? h('p', { class: 'caption' }, `Seu recorde nesta cena: ${stars(p.bestStars)}`) : null,
          h(
            'button',
            {
              class: 'btn ghost',
              onclick: () => {
                hintTarget = null;
                save({ found: [], misclicks: 0, hints: 0, startedAt: null, elapsedMs: null, completedIn: undefined });
              },
            },
            'Jogar a cena de novo',
          ),
        );
      })()
    : null;

  return h(
    'section',
    { class: `search${done ? ' is-done' : ''}` },
    h('div', { class: 'search-stage' }, root, overlay),
    sideBar,
    summary,
  );
}
