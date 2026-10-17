import './styles.css';
import { rojas1892 } from './cases/rojas1892';
import { Store } from './engine/state';
import { STEPS, type Step } from './engine/types';
import { h } from './ui/dom';
import type { Screen } from './ui/screens/context';
import { acusacao } from './ui/screens/acusacao';
import { expediente } from './ui/screens/expediente';
import { investigacao } from './ui/screens/investigacao';
import { laboratorio } from './ui/screens/laboratorio';
import { revelacao } from './ui/screens/revelacao';
import { treino } from './ui/screens/treino';

const SCREENS: Record<Step, Screen> = { expediente, investigacao, treino, laboratorio, acusacao, revelacao };

const caseFile = rojas1892;
const store = new Store(caseFile.id);
const root = document.getElementById('app');
if (!root) throw new Error('#app não encontrado');

function stepper(current: Step, reached: Step[]): HTMLElement {
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
              class: `step${st.id === current ? ' is-current' : ''}`,
              disabled: !reached.includes(st.id),
              'aria-current': st.id === current ? 'step' : undefined,
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

let lastStep: Step | null = null;

function render(): void {
  const s = store.get();
  const focusedId = document.activeElement?.id;
  root!.replaceChildren(
    h(
      'header',
      { class: 'masthead' },
      h('div', { class: 'brand' }, h('span', { class: 'brand-name' }, 'Perícia Histórica'), h('span', { class: 'brand-case' }, `Caso ${caseFile.number} · ${caseFile.place.split(',')[0]}, 1892`)),
      stepper(s.step, s.reached),
    ),
    h('main', { class: 'page' }, SCREENS[s.step]({ caseFile, store })),
    h('footer', { class: 'colophon' }, 'Baseado em fatos documentados. Elementos dramatizados são sinalizados em cada caso.'),
  );
  if (focusedId) document.getElementById(focusedId)?.focus();
  if (lastStep !== s.step) {
    window.scrollTo({ top: 0 });
    lastStep = s.step;
  }
}

store.subscribe(render);
render();
