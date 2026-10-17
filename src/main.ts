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

const SCREENS: Record<Step, Screen> = { expediente, investigacao, treino, laboratorio, acusacao, revelacao };

const root = document.getElementById('app');
if (!root) throw new Error('#app não encontrado');

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
      ),
      stepper(store, s.step, s.reached),
    );
    body = SCREENS[s.step]({ caseFile, store });
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

/** A rota é só o id do caso no hash (#smith-1915); vazio = tela inicial. */
function route(): void {
  const id = location.hash.slice(1);
  if (current?.caseFile.id === id) return;
  current?.unsubscribe();
  current = null;
  caseChanged();
  const caseFile = findCase(id);
  if (caseFile) {
    const store = new Store(caseFile.id);
    current = { caseFile, store, unsubscribe: store.subscribe(render) };
    document.title = `${caseFile.title} · Perícia Histórica`;
  } else {
    document.title = 'Perícia Histórica';
  }
  render();
}

window.addEventListener('hashchange', route);
route();
