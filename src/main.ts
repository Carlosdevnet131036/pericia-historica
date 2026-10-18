import './styles.css';
import { findCase } from './cases';
import { Store } from './engine/state';
import { STEPS, type CaseFile, type Step } from './engine/types';
import { h } from './ui/dom';
import type { Screen } from './ui/screens/context';
import { acusacao } from './ui/screens/acusacao';
import { expediente } from './ui/screens/expediente';
import { inicio } from './ui/screens/inicio';
import { investigacao } from './ui/screens/investigacao';
import { laboratorio } from './ui/screens/laboratorio';
import { revelacao } from './ui/screens/revelacao';
import { treino } from './ui/screens/treino';
import { caseChanged, firstTime } from './ui/view-state';
import { partnerBubble } from './ui/components/caso';
import { notebook } from './ui/components/diario';

const SCREENS: Record<Step, Screen> = { expediente, investigacao, treino, laboratorio, acusacao, revelacao };

const root = document.getElementById('app');
if (!root) throw new Error('#app não encontrado');

/** Mundo 3D montado agora (só no modo de exploração). */
let world: { dispose(): void } | null = null;

/** Caso aberto agora e o store dele; null na tela inicial. */
let current: { caseFile: CaseFile; store: Store; unsubscribe: () => void } | null = null;
let lastView = '';

function stepper(store: Store, step: Step, reached: Step[]): HTMLElement {
  return h(
    'nav',
    { class: 'stepper', 'aria-label': 'Etapas do caso' },
    h(
      'ol',
      {},
      ...STEPS.map((st, i) =>
        h(
          'li',
          {},
          h(
            'button',
            {
              class: `step${st.id === step ? ' is-current' : ''}`,
              disabled: !reached.includes(st.id),
              'aria-current': st.id === step ? 'step' : undefined,
              onclick: () => store.goTo(st.id),
            },
            h('span', { class: 'step-n' }, String(i + 1)),
            h('span', { class: 'step-label' }, st.label),
          ),
        ),
      ),
    ),
  );
}

function render(): void {
  const focusedId = document.activeElement?.id;
  let header: HTMLElement;
  let body: HTMLElement;
  let view: string;

  if (current) {
    const { caseFile, store } = current;
    const s = store.get();
    view = `${caseFile.id}/${s.step}`;
    header = h(
      'header',
      { class: 'masthead' },
      h(
        'div',
        { class: 'brand' },
        h('a', { class: 'brand-name', href: '#' }, 'Perícia Histórica'),
        h('span', { class: 'brand-case' }, `Caso ${caseFile.number} · ${caseFile.place.split(',')[0]}, ${caseFile.year}`),
        h('button', { class: 'btn ghost journal-btn', type: 'button', onclick: () => openJournal(caseFile, store) }, 'Diário'),
      ),
      stepper(store, s.step, s.reached),
    );
    const screen = SCREENS[s.step]({ caseFile, store });
    const bubble = partnerBubble(caseFile, s.step);
    body = bubble ? h('div', { class: 'with-partner' }, bubble, screen) : screen;
  } else {
    view = 'inicio';
    header = h('header', { class: 'masthead' }, h('div', { class: 'brand' }, h('a', { class: 'brand-name', href: '#' }, 'Perícia Histórica')));
    body = inicio();
  }

  root!.replaceChildren(
    header,
    h('main', { class: 'page' }, body),
    h('footer', { class: 'colophon' }, 'Baseado em fatos documentados. Elementos dramatizados são sinalizados em cada caso.'),
  );
  stamp(view);
  if (focusedId) document.getElementById(focusedId)?.focus();
  if (view !== lastView) {
    window.scrollTo({ top: 0 });
    lastView = view;
  }
}

/**
 * Diário em caderno num <dialog> modal: o navegador cuida do foco e do Esc.
 * Mostra uma foto do estado no momento em que abre.
 */
function openJournal(caseFile: CaseFile, store: Store): void {
  const dialog = h('dialog', { class: 'nb-dialog', 'aria-label': 'Diário de investigação' });
  dialog.append(notebook(caseFile, store.get(), { onClose: () => dialog.close() }));
  // Clique fora do caderno (no fundo escuro) também fecha.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}

/**
 * Carimbos: o laudo registrado e a avaliação final ganham um carimbo que
 * "bate" no papel. A animação roda só na primeira vez em cada caso.
 */
function stamp(view: string): void {
  const caseId = view.split('/')[0];
  const box = root!.querySelector('.result-box');
  if (box && !box.querySelector('.stamp')) {
    box.append(h('span', { class: `stamp${firstTime(`${caseId}:laudo`) ? ' stamp-in' : ''}`, 'aria-hidden': 'true' }, 'Laudo registrado'));
  }
  const card = root!.querySelector('.score-card');
  if (card && !card.querySelector('.stamp')) {
    card.append(h('span', { class: `stamp${firstTime(`${caseId}:arquivado`) ? ' stamp-in' : ''}`, 'aria-hidden': 'true' }, 'Caso arquivado'));
  }
}

/**
 * Rotas por hash: vazio = tela inicial; #smith-1915 = caso; #rojas-1892/3d =
 * exploração 3D do caso (só para lugares marcados com explore3d).
 */
function route(): void {
  const [id = '', mode] = location.hash.slice(1).split('/');
  world?.dispose();
  world = null;
  const caseFile = findCase(id);

  if (caseFile && mode === '3d' && caseFile.locations.some((l) => l.explore3d)) {
    current?.unsubscribe();
    current = null;
    caseChanged();
    void open3d(caseFile);
    return;
  }

  if (current?.caseFile.id === id && !mode) {
    render();
    return;
  }
  current?.unsubscribe();
  current = null;
  caseChanged();
  if (caseFile) {
    const store = new Store(caseFile.id);
    current = { caseFile, store, unsubscribe: store.subscribe(render) };
    document.title = `${caseFile.title} · Perícia Histórica`;
  } else {
    document.title = 'Perícia Histórica';
  }
  render();
}

/** Carrega o Three.js sob demanda; sem WebGL, explica e oferece a versão 2D. */
async function open3d(caseFile: CaseFile): Promise<void> {
  const place = caseFile.locations.find((l) => l.explore3d);
  const back = `#${caseFile.id}`;
  root!.replaceChildren(h('p', { class: 'world-loading' }, 'Carregando o cenário 3D…'));
  try {
    const mod = await import('./world');
    if (location.hash !== `#${caseFile.id}/3d`) return; // o jogador saiu durante o carregamento
    if (!mod.webglAvailable()) throw new Error('webgl');
    document.title = `${place?.name ?? caseFile.title} (3D) · Perícia Histórica`;
    if (!place) throw new Error('sem lugar 3D');
    // Texturas fotográficas (~3 MB): o progresso aparece na tela de carregamento.
    const status = root!.querySelector('.world-loading');
    const textures = await mod.loadTextures((done, total) => {
      if (status) status.textContent = `Carregando texturas… ${done} de ${total}`;
    });
    if (location.hash !== `#${caseFile.id}/3d`) return;
    // O 3D grava no mesmo save do caso: o que for achado lá aparece na versão 2D.
    const session = mod.createSession(new Store(caseFile.id), caseFile, place);
    world = mod.mountWorld(root!, { caseTitle: `Caso ${caseFile.number} · ${caseFile.title}`, locationName: place.name, backHref: back, session, textures });
  } catch (err) {
    const noWebgl = err instanceof Error && err.message === 'webgl';
    root!.replaceChildren(
      h(
        'section',
        { class: 'page world-error' },
        h('h2', {}, 'Não foi possível abrir o modo 3D'),
        h(
          'p',
          { class: 'lede' },
          noWebgl
            ? 'Este navegador ou computador não oferece WebGL, necessário para o 3D. O caso continua jogável na versão 2D.'
            : 'O cenário não carregou. Verifique a conexão e tente de novo; o caso continua jogável na versão 2D.',
        ),
        h('a', { class: 'btn primary', href: back }, 'Voltar para a versão 2D'),
      ),
    );
  }
}

window.addEventListener('hashchange', route);
route();
