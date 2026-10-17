import { canvasToFinger, fingerToFraction, FULL_VIEW, type Point, type View } from '../../forensics/fingerprint';
import { checkMarks, expectedVerdict, type Verdict } from '../../forensics/match';
import { labScore } from '../../engine/scoring';
import type { Suspect } from '../../engine/types';
import { h } from '../dom';
import { INK_BLOOD, printCanvas } from '../prints';
import type { Screen } from './context';

let activeSuspect: string | null = null;
let activePoint: string | null = null;

function marker(view: View, p: Point, label: string, cls: string): HTMLElement {
  const f = fingerToFraction(view, p);
  return h('span', { class: `marker ${cls}`, style: `left:${f.x * 100}%;top:${f.y * 100}%` }, label);
}

export const laboratorio: Screen = ({ caseFile: c, store }) => {
  const s = store.get();
  const latentIds = c.latent.minutiaIds;
  const source = c.suspects.find((x) => x.id === c.latent.sourceSuspectId);
  if (!source) throw new Error(`Ficha de origem ${c.latent.sourceSuspectId} não existe no caso ${c.id}`);

  const suspect: Suspect = c.suspects.find((x) => x.id === activeSuspect) ?? c.suspects[0]!;
  activeSuspect = suspect.id;
  const marks = s.lab.marks[suspect.id] ?? {};
  if (!activePoint || !latentIds.includes(activePoint)) activePoint = latentIds[0] ?? null;
  const submitted = s.lab.submitted;

  // Latente com os pontos numerados.
  const latentWrap = h(
    'div',
    { class: 'print-frame latent' },
    printCanvas(source.print, { view: c.latent.view, ink: INK_BLOOD, degradation: 0.35 }),
    ...source.print.minutiae
      .filter((m) => latentIds.includes(m.id))
      .map((m) => marker(c.latent.view, m, m.id, `latent-point${m.id === activePoint ? ' is-active' : ''}`)),
  );

  // Ficha do suspeito: o clique posiciona o ponto ativo.
  const card = printCanvas(suspect.print);
  const results = submitted ? checkMarks(marks, suspect.print.minutiae) : [];
  const cardWrap = h(
    'div',
    { class: `print-frame card${submitted ? '' : ' is-clickable'}` },
    card,
    ...Object.entries(marks).map(([id, p]) => {
      const r = results.find((x) => x.minutiaId === id);
      return marker(FULL_VIEW, p, id, `mark${r ? (r.hit ? ' is-hit' : ' is-miss') : ''}`);
    }),
    ...(submitted && expectedVerdict(latentIds, suspect.print.minutiae) === 'identificada'
      ? suspect.print.minutiae.filter((m) => latentIds.includes(m.id)).map((m) => marker(FULL_VIEW, m, '', 'truth'))
      : []),
  );
  if (!submitted) {
    card.addEventListener('click', (ev) => {
      if (!activePoint) return;
      const p = canvasToFinger(card, FULL_VIEW, ev.clientX, ev.clientY);
      const placed = activePoint;
      const remaining = latentIds.filter((id) => id !== placed && !(id in marks));
      activePoint = remaining[0] ?? placed;
      store.update((st) => ({
        ...st,
        lab: { ...st.lab, marks: { ...st.lab.marks, [suspect.id]: { ...marks, [placed]: { x: p.x, y: p.y } } } },
      }));
    });
  }

  const setVerdict = (v: Verdict) =>
    store.update((st) => ({ ...st, lab: { ...st.lab, verdicts: { ...st.lab.verdicts, [suspect.id]: v } } }));

  const clearMarks = () =>
    store.update((st) => ({ ...st, lab: { ...st.lab, marks: { ...st.lab.marks, [suspect.id]: {} } } }));

  const allJudged = c.suspects.every((x) => s.lab.verdicts[x.id]);
  const score = submitted ? labScore(c, s) : null;

  return h(
    'section',
    { class: 'screen laboratorio' },
    h('h2', {}, 'Confronto datiloscópico'),
    h(
      'p',
      { class: 'lede' },
      'As duas fichas têm o mesmo tipo de desenho, então a classificação sozinha não resolve. Escolha um ponto da latente, clique no lugar correspondente da ficha e depois registre sua conclusão para cada pessoa.',
    ),
    h(
      'div',
      { class: 'lab-layout' },
      h(
        'figure',
        { class: 'lab-panel' },
        h('figcaption', { class: 'panel-title' }, 'Latente: marco da porta'),
        latentWrap,
        h('p', { class: 'caption' }, c.latent.caption),
        h(
          'div',
          { class: 'choice-row', role: 'group', 'aria-label': 'Ponto ativo' },
          ...latentIds.map((id) =>
            h(
              'button',
              {
                class: `chip${id === activePoint ? ' is-picked' : ''}`,
                disabled: submitted,
                onclick: () => {
                  activePoint = id;
                  store.update((st) => ({ ...st }));
                },
              },
              `Ponto ${id}${id in marks ? ' ✓' : ''}`,
            ),
          ),
        ),
      ),
      h(
        'figure',
        { class: 'lab-panel' },
        h(
          'div',
          { class: 'tabs', role: 'tablist' },
          ...c.suspects.map((x) =>
            h(
              'button',
              {
                role: 'tab',
                class: `tab${x.id === suspect.id ? ' is-active' : ''}`,
                'aria-selected': x.id === suspect.id ? 'true' : 'false',
                onclick: () => {
                  activeSuspect = x.id;
                  activePoint = latentIds[0] ?? null;
                  store.update((st) => ({ ...st }));
                },
              },
              x.name,
              s.lab.verdicts[x.id] ? h('span', { class: 'tab-state' }, ' · registrada') : null,
            ),
          ),
        ),
        h('figcaption', { class: 'panel-title' }, `Ficha: ${suspect.name}`),
        h('p', { class: 'caption' }, suspect.role),
        cardWrap,
        h(
          'div',
          { class: 'verdict-row' },
          h(
            'button',
            { class: `chip${s.lab.verdicts[suspect.id] === 'identificada' ? ' is-picked' : ''}`, disabled: submitted, onclick: () => setVerdict('identificada') },
            'Mesma origem',
          ),
          h(
            'button',
            { class: `chip${s.lab.verdicts[suspect.id] === 'excluida' ? ' is-picked' : ''}`, disabled: submitted, onclick: () => setVerdict('excluida') },
            'Excluída',
          ),
          h('button', { class: 'btn ghost', disabled: submitted || Object.keys(marks).length === 0, onclick: clearMarks }, 'Limpar pontos'),
        ),
      ),
    ),
    submitted && score
      ? h(
          'div',
          { class: 'result-box', 'aria-live': 'polite' },
          h('h3', {}, `Resultado do laboratório: ${score.points} de ${score.max} pontos`),
          ...c.suspects.map((x) => {
            const expected = expectedVerdict(latentIds, x.print.minutiae);
            const ok = s.lab.verdicts[x.id] === expected;
            return h(
              'p',
              {},
              h('strong', {}, `${x.name}: `),
              ok ? 'conclusão correta. ' : 'conclusão incorreta. ',
              expected === 'identificada'
                ? 'As minúcias da latente estão nesta ficha. Os anéis verdes mostram onde.'
                : 'Os pontos da latente não aparecem nesta ficha.',
            );
          }),
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
              disabled: !allJudged,
              onclick: () => store.update((st) => ({ ...st, lab: { ...st.lab, submitted: true } })),
            },
            allJudged ? 'Registrar laudo' : 'Registre uma conclusão para cada ficha',
          ),
    ),
  );
};
