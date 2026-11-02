import type { Store } from '../../engine/state';
import {
  beginSearch,
  EMPTY_SEARCH,
  finishSearch,
  HINT_PENALTY,
  HIT_RADIUS,
  hitTarget,
  isRunning,
  layoutSearch,
  MISS_PENALTY,
  pauseSearch,
  progressScore,
  resumeSearch,
  SEARCH_H,
  SEARCH_W,
  searchElapsed,
  searchScore,
  searchStars,
} from '../../engine/search';
import type { Location, SearchProgress } from '../../engine/types';
import { ALL_OBJECTS, OBJECT_NAMES, placedObject } from '../art/objects';
import { scene } from '../art/scenes';
import { canvas, s } from '../art/svg';
import { h } from '../dom';
import { onCaseChange } from '../view-state';
import type { ScreenContext } from '../screens/context';

const EMPTY: SearchProgress = EMPTY_SEARCH;

/* Estado só de tela: último erro (para o X vermelho), alvo da dica e o
   último achado, que anima uma vez só na renderização seguinte ao clique. */
let lastMiss: { x: number; y: number; at: number } | null = null;
let hintTarget: string | null = null;
let lastFound: { locId: string; id: string; completed: boolean } | null = null;
/** Mensagem para leitores de tela (região aria-live), da última ação. */
let announcement = '';
onCaseChange(() => {
  lastMiss = null;
  hintTarget = null;
  lastFound = null;
  announcement = '';
});

/**
 * Texto flutuante na cena (o helper `s` só aceita elementos como filhos).
 * Perto das bordas, muda de alinhamento para não sair da cena.
 */
function svgText(cls: string, x: number, y: number, text: string): SVGTextElement {
  const anchor = x < 80 ? 'start' : x > SEARCH_W - 80 ? 'end' : 'middle';
  const t = s('text', { class: cls, x: Math.min(Math.max(x, 8), SEARCH_W - 8), y, 'text-anchor': anchor });
  t.textContent = text;
  return t;
}

// Um único relógio para todas as cenas: atualiza o texto sem redesenhar a tela.
// O tempo mostrado é o tempo ativo (base acumulada + trecho atual).
setInterval(() => {
  document.querySelectorAll<HTMLElement>('.search-timer[data-base]').forEach((el) => {
    const since = el.dataset.since ? Number(el.dataset.since) : null;
    el.textContent = formatTime(Number(el.dataset.base) + (since !== null ? Math.max(0, Date.now() - since) : 0));
  });
}, 500);

/* ---------- Relógio de tempo ativo (ver engine/search.ts) ---------- */

/** Cena de busca em andamento que está na tela nesta renderização. */
let visibleScene: { store: Store; locId: string } | null = null;
let syncing = false;

/** Chamado por main.ts antes de cada renderização. */
export function beginSearchRender(): void {
  visibleScene = null;
}

/**
 * Chamado depois de cada renderização e quando a aba aparece ou some: só o
 * relógio da cena visível roda, e só com a aba à mostra. Grava apenas se algo
 * mudou, então a renderização disparada por esta gravação não muda mais nada.
 */
export function syncSearchClocks(store: Store | null | undefined): void {
  if (!store || syncing) return;
  const now = Date.now();
  const pageVisible = document.visibilityState === 'visible';
  const st = store.get();
  let changed = false;
  const next = Object.fromEntries(
    Object.entries(st.search).map(([id, p]) => {
      const shouldRun = pageVisible && visibleScene?.store === store && visibleScene.locId === id;
      const q = shouldRun ? resumeSearch(p, now) : pauseSearch(p, now);
      if (q !== p) changed = true;
      return [id, q];
    }),
  );
  if (!changed) return;
  syncing = true;
  try {
    store.update((s) => ({ ...s, search: next }));
  } finally {
    syncing = false;
  }
}

/** Pausa todas as cenas (troca de rota, saída da página). */
export function pauseAllSearches(store: Store | null | undefined): void {
  visibleScene = null;
  syncSearchClocks(store);
}

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
  if (started && !done) visibleScene = { store, locId: loc.id };
  // Consome o achado: só esta renderização anima (a próxima já mostra o estado final).
  const fx = lastFound?.locId === loc.id ? lastFound : null;
  if (fx) lastFound = null;
  const missFresh = lastMiss !== null && Date.now() - lastMiss.at < 700;

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
    if (o.target && fx?.id === o.id) g.classList.add('just-found');
    root.append(g);
  }
  // Achado: círculo de tinta desenhado em volta do objeto e o nome subindo.
  const foundAt = fx ? placements.find((o) => o.target && o.id === fx.id) : undefined;
  if (foundAt) {
    const r = HIT_RADIUS * foundAt.scale + 6;
    root.append(
      s('circle', { class: 'found-ring', cx: foundAt.x, cy: foundAt.y, r, pathLength: 1 }),
      // Perto da borda de cima, o nome vai abaixo do objeto.
      svgText('found-float', foundAt.x, foundAt.y - r - 6 < 24 ? foundAt.y + r + 20 : foundAt.y - r - 6, `${OBJECT_NAMES[foundAt.id]} ✓`),
    );
  }
  if (hintTarget && !p.found.includes(hintTarget)) {
    const t = placements.find((o) => o.id === hintTarget && o.target);
    if (t) root.append(s('circle', { class: 'hint-ring', cx: t.x, cy: t.y, r: HIT_RADIUS * t.scale + 8 }));
  }
  if (lastMiss && missFresh) {
    const { x, y } = lastMiss;
    root.append(
      s('path', { class: 'miss-mark', d: `M ${x - 10} ${y - 10} L ${x + 10} ${y + 10} M ${x + 10} ${y - 10} L ${x - 10} ${y + 10}` }),
      // O custo aparece no lugar do erro: ensina a regra sem precisar de texto.
      svgText('miss-cost', x, y - 16 < 20 ? y + 30 : y - 16, `−${MISS_PENALTY}`),
    );
  }

  if (started && !done) {
    root.addEventListener('click', (ev) => {
      const m = root.getScreenCTM();
      if (!m) return;
      const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
      const hit = hitTarget(placements, p.found, pt.x, pt.y);
      if (!hit) {
        lastMiss = { x: pt.x, y: pt.y, at: Date.now() };
        announcement = `Nada aqui. Menos ${MISS_PENALTY} pontos.`;
        save({ misclicks: p.misclicks + 1 });
        return;
      }
      if (hintTarget === hit.id) hintTarget = null;
      const found = [...p.found, hit.id];
      const completed = found.length === spec.targets.length;
      lastFound = { locId: loc.id, id: hit.id, completed };
      // Forma neutra: o gênero muda de objeto para objeto (a chave, o botão).
      announcement = `Achou: ${OBJECT_NAMES[hit.id]}. ${found.length} de ${spec.targets.length}.`;
      if (!completed) {
        save({ found });
        return;
      }
      const done = finishSearch({ ...p, found }, Date.now(), '2d');
      const score = searchScore((done.elapsedMs ?? 0) / 1000, p.misclicks, p.hints);
      announcement += ` Busca concluída: ${searchStars(score)} de 5 estrelas.`;
      // Uma gravação só (resultado + lugar visitado): uma segunda renderização
      // logo em seguida apagaria a animação do último achado.
      store.update((st) => ({
        ...st,
        search: { ...st.search, [loc.id]: { ...done, bestStars: Math.max(p.bestStars, searchStars(score)) } },
        visited: st.visited.includes(loc.id) ? st.visited : [...st.visited, loc.id],
      }));
    });
  }

  /* ---------- Lista de objetos, relógio e dica ---------- */

  const list = h(
    'ul',
    { class: 'search-list' },
    ...spec.targets.map((id) => h('li', { class: `${p.found.includes(id) ? 'is-found' : ''}${fx?.id === id ? ' just-found' : ''}`.trim() }, OBJECT_NAMES[id])),
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
          h(
            'span',
            { class: 'search-timer', 'data-base': String(p.activeMs ?? 0), 'data-since': isRunning(p) ? String(p.runningSince) : undefined },
            formatTime(searchElapsed(p, Date.now())),
          ),
          h('span', { class: `search-misses${missFresh ? ' just-missed' : ''}` }, `Erros: ${p.misclicks}`),
          h('button', { class: 'btn ghost', onclick: hint }, `Dica (−${HINT_PENALTY})`),
        )
      : null,
  );

  const overlay = !started
    ? h(
        'div',
        { class: 'search-overlay' },
        h('p', {}, 'Ache os objetos da lista o mais rápido que puder. Cliques errados e dicas custam pontos.'),
        h('button', { class: 'btn primary', onclick: () => save(beginSearch(p, Date.now())) }, p.bestStars ? 'Investigar de novo' : 'Iniciar busca'),
      )
    : null;

  const summary = done
    ? (() => {
        const score = progressScore(p);
        return h(
          'div',
          // Acabou de concluir nesta renderização: o resultado entra com animação.
          { class: `search-summary${fx?.completed ? ' rise' : ''}` },
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
                save({ found: [], misclicks: 0, hints: 0, startedAt: null, elapsedMs: null, completedIn: undefined, activeMs: undefined, runningSince: undefined });
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
    // Leitores de tela ouvem o resultado de cada clique.
    h('p', { class: 'sr-only', 'aria-live': 'polite', role: 'status' }, announcement),
  );
}
