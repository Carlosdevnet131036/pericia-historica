import { labScore } from '../../engine/scoring';
import type { BathPose, PathologyLab } from '../../engine/types';
import { assess, bodyPoints, lerpPose, type BathDims } from '../../forensics/bath';
import { h } from '../dom';
import { onCaseChange } from '../view-state';
import type { ScreenContext } from '../screens/context';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/* Estado de visualização (não vai para o save): hipótese em teste e pose desenhada. */
let previewId: string | null = null;
let drawnPose: BathPose | null = null;
let animation = 0;
onCaseChange(() => {
  previewId = null;
  drawnPose = null;
  cancelAnimationFrame(animation);
});

/** Banheira em corte lateral. y do modelo cresce para cima; no SVG, para baixo. */
function bathScene(dims: BathDims) {
  // Espaço acima da borda para a cabeça de quem está sentado.
  const top = dims.bathDepth + 32;
  const Y = (y: number) => top - y;
  const slope = 18; // a cabeceira é inclinada, como nas banheiras de ferro da época
  const root = svg('svg', {
    class: 'bath-svg',
    viewBox: `${-slope - 12} 0 ${dims.bathLength + slope + 30} ${top + 14}`,
    role: 'img',
    'aria-label': 'Corte lateral da banheira com a posição do corpo',
  });

  const waterAt = (y: number) => -slope * (y / dims.bathDepth);
  root.append(
    svg('line', { class: 'bath-floor', x1: -slope - 12, y1: Y(-4), x2: dims.bathLength + 18, y2: Y(-4) }),
    svg('path', {
      class: 'bath-wall',
      d: `M ${-slope} ${Y(dims.bathDepth)} L 0 ${Y(0)} L ${dims.bathLength} ${Y(0)} L ${dims.bathLength} ${Y(dims.bathDepth)}`,
    }),
  );

  const limbs = {
    torso: svg('line', { class: 'body-limb' }),
    neck: svg('line', { class: 'body-limb' }),
    thigh: svg('line', { class: 'body-limb' }),
    shin: svg('line', { class: 'body-limb' }),
  };
  const head = svg('circle', { class: 'body-head' });
  root.append(limbs.torso, limbs.neck, limbs.thigh, limbs.shin, head);

  // A água é desenhada por cima do corpo: o que está submerso fica tingido.
  root.append(
    svg('polygon', {
      class: 'water',
      points: `${waterAt(dims.waterDepth)},${Y(dims.waterDepth)} 0,${Y(0)} ${dims.bathLength},${Y(0)} ${dims.bathLength},${Y(dims.waterDepth)}`,
    }),
    svg('line', { class: 'water-line', x1: waterAt(dims.waterDepth), y1: Y(dims.waterDepth), x2: dims.bathLength, y2: Y(dims.waterDepth) }),
  );

  const label = (x: number, y: number, text: string, anchor = 'middle') => {
    const t = svg('text', { class: 'bath-label', x, y, 'text-anchor': anchor });
    t.textContent = text;
    return t;
  };
  root.append(
    label(dims.bathLength / 2, Y(-4) + 8, `${dims.bathLength} cm de fundo`),
    label(-slope, Y(-4) + 8, 'cabeceira', 'start'),
    label(dims.bathLength, Y(-4) + 8, 'pés', 'end'),
  );

  const set = (el: SVGElement, a: Record<string, number>) => {
    for (const [k, v] of Object.entries(a)) el.setAttribute(k, v.toFixed(2));
  };
  const draw = (pose: BathPose) => {
    const b = bodyPoints(pose, dims);
    set(limbs.torso, { x1: b.hip.x, y1: Y(b.hip.y), x2: b.shoulder.x, y2: Y(b.shoulder.y) });
    set(limbs.neck, { x1: b.shoulder.x, y1: Y(b.shoulder.y), x2: b.head.x, y2: Y(b.head.y) });
    set(limbs.thigh, { x1: b.hip.x, y1: Y(b.hip.y), x2: b.knee.x, y2: Y(b.knee.y) });
    set(limbs.shin, { x1: b.knee.x, y1: Y(b.knee.y), x2: b.foot.x, y2: Y(b.foot.y) });
    set(head, { cx: b.head.x, cy: Y(b.head.y), r: b.headRadius });
  };
  return { root, draw };
}

function animateTo(draw: (p: BathPose) => void, target: BathPose): void {
  cancelAnimationFrame(animation);
  const from = drawnPose;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!from || reduce) {
    drawnPose = target;
    draw(target);
    return;
  }
  draw(from);
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 700);
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    drawnPose = lerpPose(from, target, eased);
    draw(drawnPose);
    if (t < 1) animation = requestAnimationFrame(step);
  };
  animation = requestAnimationFrame(step);
}

const yesNo = (v: boolean, yes: string, no: string) => (v ? yes : no);

export function pathologyLab({ caseFile, store }: ScreenContext, c: PathologyLab): HTMLElement {
  const s = store.get();
  const { bath, pattern } = c;
  const submitted = s.lab.submitted;
  const marked = new Set(s.lab.features);

  /* ---------- Parte 1: quadro dos três casamentos ---------- */

  const toggleFeature = (id: string) =>
    store.update((st) => {
      const set = new Set(st.lab.features);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...st, lab: { ...st.lab, features: [...set] } };
    });

  const board = h(
    'section',
    { class: 'lab-panel wide' },
    h('h3', { class: 'panel-title' }, pattern.title),
    h('p', { class: 'caption' }, pattern.lede),
    h(
      'div',
      { class: 'table-scroll' },
      h(
        'table',
        { class: 'pattern-table' },
        h(
          'thead',
          {},
          h('tr', {}, h('th', { scope: 'col' }, 'Característica'), h('th', { scope: 'col', class: 'center' }, 'Nos três casos?')),
        ),
        h(
          'tbody',
          {},
          ...pattern.features.map((f) => {
            const id = `feat-${f.id}`;
            const right = marked.has(f.id) === f.inAll;
            return h(
              'tr',
              { class: submitted ? (right ? 'is-correct' : 'is-wrong') : '' },
              h(
                'td',
                {},
                h('label', { for: id }, f.text),
                submitted ? h('p', { class: 'row-note' }, f.note) : null,
              ),
              h(
                'td',
                { class: 'center' },
                h('input', { type: 'checkbox', id, checked: marked.has(f.id), disabled: submitted, onchange: () => toggleFeature(f.id) }),
              ),
            );
          }),
        ),
      ),
    ),
    h('p', { class: 'caption' }, `Casos no quadro: ${pattern.cases.map((x) => x.label).join(' · ')}`),
  );

  /* ---------- Parte 2: simulação da banheira ---------- */

  const dims: BathDims = bath;
  const shown = bath.hypotheses.find((x) => x.id === previewId) ?? null;
  const scene = bathScene(dims);
  const readout = h('dl', { class: 'readout' });
  if (shown) {
    const a = assess(shown.pose, dims);
    readout.append(
      h('dt', {}, 'Cabeça'),
      h('dd', {}, yesNo(a.headUnderwater, 'submersa', 'fora da água')),
      h('dt', {}, 'Pernas'),
      h('dd', {}, yesNo(a.legsStraight, 'esticadas', 'dobradas')),
      h('dt', {}, 'Pés'),
      h('dd', {}, yesNo(a.feetOut, 'fora da água', 'dentro da água')),
    );
    queueMicrotask(() => animateTo(scene.draw, shown.pose));
  } else {
    drawnPose = null;
  }

  const sim = h(
    'section',
    { class: 'lab-panel wide' },
    h('h3', { class: 'panel-title' }, bath.title),
    h('p', { class: 'caption' }, bath.lede),
    h(
      'blockquote',
      { class: 'found' },
      h('p', { class: 'found-label' }, 'Como o corpo foi encontrado'),
      h('p', {}, bath.foundDescription),
    ),
    h(
      'p',
      { class: 'measures' },
      `Banheira: ${bath.bathLength} cm de fundo · Vítima: ${bath.victimHeight} cm de altura · Água: cerca de ${bath.waterDepth} cm`,
    ),
    h(
      'div',
      { class: 'choice-row', role: 'group', 'aria-label': 'Testar hipótese' },
      ...bath.hypotheses.map((x) =>
        h(
          'button',
          {
            class: `chip${x.id === previewId ? ' is-picked' : ''}`,
            onclick: () => {
              previewId = x.id;
              store.update((st) => ({ ...st }));
            },
          },
          `Testar: ${x.name}`,
        ),
      ),
    ),
    h('div', { class: 'bath-stage' }, scene.root),
    shown
      ? h('div', { class: 'sim-result' }, h('p', {}, h('strong', {}, `${shown.name}. `), shown.description), readout, h('p', { class: 'caption' }, shown.outcome))
      : h('p', { class: 'empty' }, 'Escolha uma hipótese para ver a simulação.'),
    h('p', { class: 'statement' }, 'Qual hipótese reproduz a posição em que o corpo foi encontrado?'),
    h(
      'div',
      { class: 'choice-row', role: 'radiogroup', 'aria-label': 'Sua conclusão' },
      ...bath.hypotheses.map((x) =>
        h(
          'button',
          {
            role: 'radio',
            'aria-checked': s.lab.hypothesis === x.id ? 'true' : 'false',
            class: `chip${s.lab.hypothesis === x.id ? ' is-picked' : ''}`,
            disabled: submitted,
            onclick: () => store.update((st) => ({ ...st, lab: { ...st.lab, hypothesis: x.id } })),
          },
          x.name,
        ),
      ),
    ),
  );

  const score = submitted ? labScore(caseFile, s) : null;

  return h(
    'section',
    { class: 'screen laboratorio' },
    h('h2', {}, c.title),
    h('p', { class: 'lede' }, c.lede),
    board,
    sim,
    submitted && score
      ? h(
          'div',
          { class: 'result-box', 'aria-live': 'polite' },
          h('h3', {}, `Resultado do laboratório: ${score.points} de ${score.max} pontos`),
          h('p', {}, s.lab.hypothesis === bath.correct ? 'Hipótese correta. ' : 'Hipótese incorreta. ', bath.explanation),
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
              disabled: !s.lab.hypothesis,
              onclick: () => store.update((st) => ({ ...st, lab: { ...st.lab, submitted: true } })),
            },
            s.lab.hypothesis ? 'Registrar laudo' : 'Escolha uma hipótese para registrar o laudo',
          ),
    ),
  );
}
