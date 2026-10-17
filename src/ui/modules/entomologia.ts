import { expectedOvipositionDay, labScore } from '../../engine/scoring';
import type { EntomologyLab } from '../../engine/types';
import { accumulated, dayDegrees } from '../../forensics/entomology';
import { h } from '../dom';
import type { ScreenContext } from '../screens/context';

export function entomologyLab({ caseFile, store }: ScreenContext, c: EntomologyLab): HTMLElement {
  const s = store.get();
  const submitted = s.lab.submitted;
  const a = s.lab.answers;
  const { larvae, wrapping } = c;

  const answer = (key: string, value: string) =>
    store.update((st) => ({ ...st, lab: { ...st.lab, answers: { ...st.lab.answers, [key]: value } } }));

  const choiceRow = (key: string, label: string, options: { id: string; text: string }[], correct: string, mono = false) =>
    h(
      'div',
      { class: 'choice-row', role: 'radiogroup', 'aria-label': label },
      ...options.map((o) => {
        const state = submitted ? (o.id === correct ? ' is-correct-chip' : a[key] === o.id ? ' is-wrong' : '') : '';
        return h(
          'button',
          {
            role: 'radio',
            'aria-checked': a[key] === o.id ? 'true' : 'false',
            class: `chip${mono ? ' mono' : ''}${a[key] === o.id ? ' is-picked' : ''}${state}`,
            disabled: submitted,
            onclick: () => answer(key, o.id),
          },
          o.text,
        );
      }),
    );

  /* ---------- Parte 1: larvas e graus-dia ---------- */

  const stage = larvae.stages.find((x) => x.id === a.estagio) ?? null;
  const pickedDay = a.dia ? Number(a.dia) : null;
  const sum = pickedDay !== null ? accumulated(larvae.temps, larvae.baseTemp, pickedDay, larvae.lastDay) : null;
  const expected = expectedOvipositionDay(c);

  const calendar = h(
    'div',
    { class: 'calendar', role: 'radiogroup', 'aria-label': 'Dia da postura dos ovos' },
    ...larvae.temps.map((d) => {
      const inRange = pickedDay !== null && d.day >= pickedDay && d.day <= larvae.lastDay;
      const state = submitted ? (d.day === expected ? ' is-correct-day' : d.day === pickedDay ? ' is-wrong-day' : '') : '';
      return h(
        'button',
        {
          role: 'radio',
          'aria-checked': d.day === pickedDay ? 'true' : 'false',
          class: `day${inRange ? ' in-range' : ''}${d.day === pickedDay ? ' is-picked' : ''}${state}`,
          disabled: submitted || !stage || d.day > larvae.lastDay,
          onclick: () => answer('dia', String(d.day)),
        },
        h('span', { class: 'day-n' }, String(d.day)),
        h('span', { class: 'day-t' }, `${d.temp} °C`),
        h('span', { class: 'day-gd' }, `+${dayDegrees(d.temp, larvae.baseTemp)}`),
      );
    }),
  );

  const larvaePanel = h(
    'section',
    { class: 'lab-panel wide' },
    h('h3', { class: 'panel-title' }, larvae.title),
    h('p', { class: 'caption' }, larvae.lede),
    h('blockquote', { class: 'found' }, h('p', { class: 'found-label' }, 'Larvas coletadas'), h('p', {}, larvae.measured)),
    h('p', { class: 'statement' }, '1. Em que estágio estão as larvas?'),
    h(
      'div',
      { class: 'table-scroll' },
      h(
        'table',
        { class: 'pattern-table' },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Estágio'), h('th', { scope: 'col' }, 'Comprimento'), h('th', { scope: 'col' }, 'Graus-dia desde a postura'))),
        h('tbody', {}, ...larvae.stages.map((x) => h('tr', {}, h('td', {}, x.name), h('td', {}, x.length), h('td', { class: 'num' }, String(x.degreeDays))))),
      ),
    ),
    choiceRow('estagio', 'Estágio das larvas', larvae.stages.map((x) => ({ id: x.id, text: x.name })), larvae.correctStage),
    h('p', { class: 'statement' }, `2. Em que dia de ${larvae.monthLabel} os ovos foram postos?`),
    h(
      'p',
      { class: 'caption' },
      `Temperatura-base da espécie: ${larvae.baseTemp} °C. Cada dia soma (temperatura média − ${larvae.baseTemp}) graus-dia. As larvas foram coletadas na manhã seguinte ao dia ${larvae.lastDay}.`,
    ),
    calendar,
    h(
      'p',
      { class: `degree-readout${stage && sum !== null && Math.abs(sum - stage.degreeDays) <= 6 ? ' is-ok' : ''}`, 'aria-live': 'polite' },
      !stage
        ? 'Escolha primeiro o estágio das larvas.'
        : sum === null
          ? `Estágio escolhido exige ${stage.degreeDays} graus-dia. Clique no dia em que você acha que os ovos foram postos.`
          : `Do dia ${pickedDay} ao dia ${larvae.lastDay}: ${sum} graus-dia acumulados. O estágio escolhido exige ${stage.degreeDays}.`,
    ),
  );

  /* ---------- Parte 2: o embrulho ---------- */

  const wrappingPanel = h(
    'section',
    { class: 'lab-panel wide' },
    h('h3', { class: 'panel-title' }, wrapping.title),
    h('p', { class: 'caption' }, wrapping.lede),
    h(
      'div',
      { class: 'table-scroll' },
      h(
        'table',
        { class: 'pattern-table' },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Jornal'), h('th', { scope: 'col' }, 'Data'), h('th', { scope: 'col' }, 'Onde era vendido'))),
        h('tbody', {}, ...wrapping.papers.map((p) => h('tr', {}, h('td', {}, p.title), h('td', {}, p.date), h('td', {}, p.distribution)))),
      ),
    ),
    h('p', { class: 'statement' }, wrapping.leadQuestion),
    choiceRow('jornal', wrapping.leadQuestion, wrapping.papers.map((p) => ({ id: p.id, text: `${p.title}, ${p.date}` })), wrapping.leadPaperId),
    h('p', { class: 'statement' }, wrapping.dateQuestion),
    choiceRow('data', wrapping.dateQuestion, wrapping.dateOptions, wrapping.correctDate),
  );

  const ready = ['estagio', 'dia', 'jornal', 'data'].every((k) => a[k]);
  const score = submitted ? labScore(caseFile, s) : null;

  return h(
    'section',
    { class: 'screen laboratorio' },
    h('h2', {}, c.title),
    h('p', { class: 'lede' }, c.lede),
    larvaePanel,
    wrappingPanel,
    submitted && score
      ? h(
          'div',
          { class: 'result-box', 'aria-live': 'polite' },
          h('h3', {}, `Resultado do laboratório: ${score.points} de ${score.max} pontos`),
          h('p', {}, pickedDay === expected ? `Dia ${expected}, correto. ` : `O dia esperado era ${expected}. `, larvae.explanation),
          h('p', {}, wrapping.explanation),
        )
      : null,
    h(
      'div',
      { class: 'actions' },
      submitted
        ? h('button', { class: 'btn primary', onclick: () => store.goTo('acusacao') }, 'Redigir a conclusão')
        : h(
            'button',
            {
              class: 'btn primary',
              disabled: !ready,
              onclick: () => store.update((st) => ({ ...st, lab: { ...st.lab, submitted: true } })),
            },
            ready ? 'Registrar laudo' : 'Responda as quatro perguntas para registrar o laudo',
          ),
    ),
  );
}
