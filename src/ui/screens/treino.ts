import type { PatternType } from '../../forensics/fingerprint';
import { h } from '../dom';
import { printCanvas } from '../prints';
import type { Screen } from './context';

export const treino: Screen = ({ caseFile: c, store }) => {
  const s = store.get();
  const allCorrect = c.training.every((t) => s.training.answers[t.id] === t.print.pattern);

  const answer = (id: string, type: PatternType, correct: PatternType) =>
    store.update((st) => ({
      ...st,
      training: {
        answers: { ...st.training.answers, [id]: type },
        firstTry: id in st.training.firstTry ? st.training.firstTry : { ...st.training.firstTry, [id]: type === correct },
      },
    }));

  const guide = h(
    'div',
    { class: 'pattern-guide' },
    ...c.patterns.map((p) =>
      h(
        'figure',
        { class: 'pattern' },
        printCanvas({ pattern: p.type, core: { x: 0, y: -0.05 }, minutiae: [], seed: 7 }, { scale: 60 }),
        h(
          'figcaption',
          {},
          h('strong', {}, p.name),
          h('span', { class: 'codes' }, `Polegar ${p.thumbCode} · demais dedos ${p.fingerCode}`),
          h('span', {}, p.description),
        ),
      ),
    ),
  );

  const samples = h(
    'div',
    { class: 'samples' },
    ...c.training.map((t, i) => {
      const given = s.training.answers[t.id];
      const ok = given === t.print.pattern;
      return h(
        'div',
        { class: `sample${given ? (ok ? ' is-ok' : ' is-wrong') : ''}` },
        h('p', { class: 'sample-label' }, `Ficha de treino ${i + 1}`),
        printCanvas(t.print, { scale: 90 }),
        h(
          'div',
          { class: 'choice-row', role: 'group', 'aria-label': `Tipo da ficha ${i + 1}` },
          ...c.patterns.map((p) =>
            h(
              'button',
              {
                class: `chip${given === p.type ? ' is-picked' : ''}`,
                disabled: ok,
                onclick: () => answer(t.id, p.type, t.print.pattern),
              },
              p.name,
            ),
          ),
        ),
        h(
          'p',
          { class: 'feedback', 'aria-live': 'polite' },
          given ? (ok ? 'Correto.' : 'Não é esse. Olhe para onde o laço se abre e quantos deltas aparecem.') : '',
        ),
      );
    }),
  );

  return h(
    'section',
    { class: 'screen treino' },
    h('h2', {}, 'O método de Vucetich'),
    h(
      'p',
      { class: 'lede' },
      'Antes de comparar a mancha, aprenda a classificar. Vucetich dividia as impressões em quatro tipos. Cada ficha de dez dedos virava uma fórmula, com letras para os polegares e números para os outros dedos, e assim podia ser arquivada e encontrada depressa.',
    ),
    guide,
    h('h3', { class: 'section-title' }, 'Classifique as fichas de treino'),
    samples,
    h(
      'div',
      { class: 'actions' },
      h(
        'button',
        { class: 'btn primary', disabled: !allCorrect, onclick: () => store.goTo('laboratorio') },
        allCorrect ? 'Ir para o laboratório' : 'Classifique todas corretamente para continuar',
      ),
    ),
  );
};
