import { labScore } from '../../engine/scoring';
import type { AnthropologyLab, OverlayCandidate } from '../../engine/types';
import { DY_RANGE, meanError, SCALE_RANGE, transform, type Landmark, type Overlay } from '../../forensics/superimposition';
import { h } from '../dom';
import { onCaseChange } from '../view-state';
import type { ScreenContext } from '../screens/context';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

let activeCandidate: string | null = null;
onCaseChange(() => {
  activeCandidate = null;
});

const DEFAULT_OVERLAY: Overlay = { scale: 1, dy: 0 };

const pt = (list: Landmark[], id: string): Landmark => {
  const p = list.find((x) => x.id === id);
  if (!p) throw new Error(`ponto ${id} ausente`);
  return p;
};

/** Contorno do rosto desenhado a partir dos pontos da foto (esquemático, não é uma foto real). */
function face(lm: Landmark[]): SVGGElement {
  const g = svg('g', { class: 'face' });
  const [zE, zD, gE, gD, gn, na] = ['zigE', 'zigD', 'gonE', 'gonD', 'gnatio', 'nasio'].map((id) => pt(lm, id)) as Landmark[];
  const top = na!.y - 0.62;
  g.append(
    svg('path', {
      class: 'face-outline',
      d: `M ${zE!.x} ${zE!.y} Q ${zE!.x - 0.04} ${top + 0.1} 0 ${top} Q ${zD!.x + 0.04} ${top + 0.1} ${zD!.x} ${zD!.y} L ${gD!.x} ${gD!.y} Q ${gD!.x * 0.5} ${gn!.y} 0 ${gn!.y} Q ${gE!.x * 0.5} ${gn!.y} ${gE!.x} ${gE!.y} Z`,
    }),
  );
  for (const id of ['olhoE', 'olhoD']) {
    const e = pt(lm, id);
    g.append(svg('ellipse', { class: 'face-feature', cx: e.x, cy: e.y, rx: 0.1, ry: 0.045 }));
  }
  const sn = pt(lm, 'subnasal');
  const st = pt(lm, 'estomio');
  g.append(
    svg('path', { class: 'face-feature', d: `M ${na!.x} ${na!.y + 0.05} L ${sn.x - 0.05} ${sn.y} L ${sn.x + 0.06} ${sn.y}` }),
    svg('path', { class: 'face-feature', d: `M ${st.x - 0.16} ${st.y} Q ${st.x} ${st.y + 0.03} ${st.x + 0.16} ${st.y}` }),
  );
  for (const p of lm) g.append(svg('circle', { class: 'photo-point', cx: p.x, cy: p.y, r: 0.018 }));
  return g;
}

/** Crânio esquemático em coordenadas do crânio; a escala e a posição vêm do transform do grupo. */
function skullDrawing(lm: Landmark[]): SVGGElement {
  const g = svg('g', { class: 'skull' });
  const [zE, zD, gE, gD, gn, na, sn] = ['zigE', 'zigD', 'gonE', 'gonD', 'gnatio', 'nasio', 'subnasal'].map((id) => pt(lm, id)) as Landmark[];
  const top = na!.y - 0.66;
  g.append(
    svg('path', {
      class: 'skull-line',
      d: `M ${zE!.x} ${zE!.y} Q ${zE!.x - 0.06} ${top + 0.1} 0 ${top} Q ${zD!.x + 0.06} ${top + 0.1} ${zD!.x} ${zD!.y}`,
    }),
    svg('path', { class: 'skull-line', d: `M ${zE!.x} ${zE!.y} L ${gE!.x} ${gE!.y} Q ${gE!.x * 0.45} ${gn!.y} 0 ${gn!.y} Q ${gD!.x * 0.45} ${gn!.y} ${gD!.x} ${gD!.y} L ${zD!.x} ${zD!.y}` }),
    svg('path', { class: 'skull-line', d: `M ${sn!.x - 0.09} ${sn!.y} L ${na!.x} ${na!.y + 0.17} L ${sn!.x + 0.09} ${sn!.y} Z` }),
  );
  for (const id of ['olhoE', 'olhoD']) {
    const e = pt(lm, id);
    g.append(svg('circle', { class: 'skull-line', cx: e.x, cy: e.y, r: 0.13 }));
  }
  for (const p of lm) {
    g.append(
      svg('path', { class: 'skull-point', d: `M ${p.x - 0.025} ${p.y} L ${p.x + 0.025} ${p.y} M ${p.x} ${p.y - 0.025} L ${p.x} ${p.y + 0.025}` }),
    );
  }
  return g;
}

function overlayScene(skull: Landmark[], cand: OverlayCandidate, initial: Overlay) {
  const root = svg('svg', { class: 'overlay-svg', viewBox: '-1 -0.85 2 2.15', role: 'img', 'aria-label': `Crânio sobreposto a: ${cand.name}` });
  root.append(face(cand.landmarks));
  const errors = svg('g', { class: 'overlay-errors' });
  const skullG = skullDrawing(skull);
  root.append(errors, skullG);
  const update = (o: Overlay) => {
    skullG.setAttribute('transform', `matrix(${o.scale} 0 0 ${o.scale} 0 ${o.dy})`);
    errors.replaceChildren(
      ...transform(skull, o).map((p) => {
        const q = pt(cand.landmarks, p.id);
        return svg('line', { class: 'error-line', x1: p.x, y1: p.y, x2: q.x, y2: q.y });
      }),
    );
  };
  update(initial);
  return { root, update };
}

export function anthropologyLab({ caseFile, store }: ScreenContext, c: AnthropologyLab): HTMLElement {
  const s = store.get();
  const submitted = s.lab.submitted;
  const { profile, overlay } = c;

  /* ---------- Parte 1: perfil biológico ---------- */

  const answer = (qid: string, oid: string) =>
    store.update((st) => ({ ...st, lab: { ...st.lab, answers: { ...st.lab.answers, [qid]: oid } } }));

  const profilePanel = h(
    'section',
    { class: 'lab-panel wide' },
    h('h3', { class: 'panel-title' }, profile.title),
    h('p', { class: 'caption' }, profile.lede),
    h(
      'ol',
      { class: 'questions profile' },
      ...profile.questions.map((q) => {
        const given = s.lab.answers[q.id];
        return h(
          'li',
          { class: 'question' },
          h('p', { class: 'statement' }, q.prompt),
          h('ul', { class: 'traits' }, ...q.traits.map((t) => h('li', {}, t))),
          h(
            'div',
            { class: 'choice-row', role: 'radiogroup', 'aria-label': q.prompt },
            ...q.options.map((o) => {
              const state = submitted ? (o.id === q.correct ? ' is-correct-chip' : given === o.id ? ' is-wrong' : '') : '';
              return h(
                'button',
                {
                  role: 'radio',
                  'aria-checked': given === o.id ? 'true' : 'false',
                  class: `chip${given === o.id ? ' is-picked' : ''}${state}`,
                  disabled: submitted,
                  onclick: () => answer(q.id, o.id),
                },
                o.text,
              );
            }),
          ),
          submitted ? h('p', { class: 'explanation' }, q.explanation) : null,
        );
      }),
    ),
  );

  /* ---------- Parte 2: superposição ---------- */

  const cand = overlay.candidates.find((x) => x.id === activeCandidate) ?? overlay.candidates[0]!;
  activeCandidate = cand.id;
  const current: Overlay = s.lab.overlay[cand.id] ?? DEFAULT_OVERLAY;
  const scene = overlayScene(overlay.skull, cand, current);
  const errorOut = h('output', { class: 'overlay-error' });
  const showError = (o: Overlay) => {
    const e = meanError(overlay.skull, cand.landmarks, o);
    const fits = e <= overlay.threshold;
    errorOut.textContent = `Erro médio: ${(e * 100).toFixed(1)} · limite para encaixe: ${(overlay.threshold * 100).toFixed(1)} · ${fits ? 'encaixa' : 'não encaixa'}`;
    errorOut.className = `overlay-error ${fits ? 'is-ok' : ''}`;
  };
  showError(current);

  const live: Overlay = { ...current };
  const commit = () => store.update((st) => ({ ...st, lab: { ...st.lab, overlay: { ...st.lab.overlay, [cand.id]: { ...live } } } }));
  const slider = (key: keyof Overlay, label: string, range: { min: number; max: number; step: number }) => {
    const id = `${key}-${cand.id}`;
    const input = h('input', { type: 'range', id, min: range.min, max: range.max, step: range.step, value: live[key], disabled: submitted });
    input.addEventListener('input', () => {
      live[key] = Number(input.value);
      scene.update(live);
      showError(live);
    });
    input.addEventListener('change', commit);
    return h('div', { class: 'overlay-control' }, h('label', { for: id }, label), input);
  };

  const verdict = s.lab.verdicts[cand.id];
  const setVerdict = (v: 'identificada' | 'excluida') =>
    store.update((st) => ({ ...st, lab: { ...st.lab, verdicts: { ...st.lab.verdicts, [cand.id]: v } } }));

  const overlayPanel = h(
    'section',
    { class: 'lab-panel wide' },
    h('h3', { class: 'panel-title' }, overlay.title),
    h('p', { class: 'caption' }, overlay.lede),
    h(
      'div',
      { class: 'tabs', role: 'tablist' },
      ...overlay.candidates.map((x) =>
        h(
          'button',
          {
            role: 'tab',
            class: `tab${x.id === cand.id ? ' is-active' : ''}`,
            'aria-selected': x.id === cand.id ? 'true' : 'false',
            onclick: () => {
              activeCandidate = x.id;
              store.update((st) => ({ ...st }));
            },
          },
          x.name,
          s.lab.verdicts[x.id] ? h('span', { class: 'tab-state' }, ' · registrada') : null,
        ),
      ),
    ),
    h('p', { class: 'caption' }, cand.description),
    h(
      'div',
      { class: 'overlay-layout' },
      h('div', { class: 'overlay-stage' }, scene.root),
      h(
        'div',
        { class: 'overlay-side' },
        slider('scale', 'Escala do crânio', SCALE_RANGE),
        slider('dy', 'Posição vertical', DY_RANGE),
        errorOut,
        h('p', { class: 'caption' }, 'Cruzes: pontos do crânio. Pontos cheios: os mesmos pontos na foto. As linhas finas mostram a distância entre eles.'),
        h(
          'div',
          { class: 'verdict-row' },
          h('button', { class: `chip${verdict === 'identificada' ? ' is-picked' : ''}`, disabled: submitted, onclick: () => setVerdict('identificada') }, 'Compatível'),
          h('button', { class: `chip${verdict === 'excluida' ? ' is-picked' : ''}`, disabled: submitted, onclick: () => setVerdict('excluida') }, 'Excluída'),
        ),
      ),
    ),
  );

  const ready = profile.questions.every((q) => s.lab.answers[q.id]) && overlay.candidates.every((x) => s.lab.verdicts[x.id]);
  const score = submitted ? labScore(caseFile, s) : null;
  const source = overlay.candidates.find((x) => x.id === overlay.sourceCandidateId);
  const sourceOverlay = source ? s.lab.overlay[source.id] : undefined;
  const fitted = source && sourceOverlay ? meanError(overlay.skull, source.landmarks, sourceOverlay) <= overlay.threshold : false;

  return h(
    'section',
    { class: 'screen laboratorio' },
    h('h2', {}, c.title),
    h('p', { class: 'lede' }, c.lede),
    profilePanel,
    overlayPanel,
    submitted && score
      ? h(
          'div',
          { class: 'result-box', 'aria-live': 'polite' },
          h('h3', {}, `Resultado do laboratório: ${score.points} de ${score.max} pontos`),
          h('p', {}, fitted ? 'Você deixou o crânio bem ajustado à foto certa. ' : 'O crânio não ficou bem ajustado à foto certa. ', overlay.explanation),
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
            ready ? 'Registrar laudo' : 'Responda o perfil e registre uma conclusão para cada foto',
          ),
    ),
  );
}
