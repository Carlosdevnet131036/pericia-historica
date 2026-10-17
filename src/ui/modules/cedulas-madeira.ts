import { labScore } from '../../engine/scoring';
import type { MoneyWoodLab, WoodCandidate } from '../../engine/types';
import { compare, grainY, isFullMatch, joistPositions, maxOffset, railGrainY, railHoles, type Placement, type WoodSetup } from '../../forensics/wood';
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

const FLOOR_Y = 12;

function grainPath(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
}

/** Desenho do piso (ou da tábua solta) com o trilho posicionável por cima. */
function woodScene(s: WoodSetup, cand: WoodCandidate, initial: Placement) {
  const W = s.boardWidth;
  const root = svg('svg', {
    class: 'wood-svg',
    viewBox: `-6 0 ${s.floorLength + 12} ${W + FLOOR_Y * 2 + 8}`,
    role: 'img',
    'aria-label': `Trilho da escada posicionado sobre: ${cand.name}`,
  });

  if (cand.joists) {
    for (const j of joistPositions(s)) {
      root.append(
        svg('rect', { class: 'joist', x: j - 2.5, y: FLOOR_Y - 7, width: 5, height: W + 14 }),
        svg('circle', { class: 'nail-hole', cx: j, cy: FLOOR_Y + W / 2, r: 0.9 }),
      );
    }
    root.append(svg('line', { class: 'wall', x1: 0, y1: FLOOR_Y - 8, x2: 0, y2: FLOOR_Y + W + 8 }));
  }

  // Tábua candidata, começando onde termina o vão.
  root.append(svg('rect', { class: 'board', x: s.gapLength, y: FLOOR_Y, width: s.floorLength - s.gapLength, height: W }));
  for (let i = 0; i < s.grainLines; i++) {
    const pts: [number, number][] = [];
    for (let x = s.gapLength; x <= s.floorLength; x += 1) pts.push([x, FLOOR_Y + grainY(cand.grainSeed, i, x, s)]);
    root.append(svg('path', { class: 'grain', d: grainPath(pts) }));
  }

  // Trilho: desenhado em coordenadas locais e deslocado com transform.
  const rail = svg('g', { class: 'rail' });
  const drawRail = (flip: boolean) => {
    rail.replaceChildren(svg('rect', { class: 'rail-body', x: 0, y: FLOOR_Y, width: s.railLength, height: W }));
    for (let i = 0; i < s.grainLines; i++) {
      const pts: [number, number][] = [];
      for (let u = 0; u <= s.railLength; u += 1) pts.push([u, FLOOR_Y + railGrainY(s, i, u, flip)]);
      rail.append(svg('path', { class: 'grain', d: grainPath(pts) }));
    }
    for (const hole of railHoles(s)) {
      rail.append(svg('circle', { class: 'rail-hole', cx: flip ? s.railLength - hole : hole, cy: FLOOR_Y + W / 2, r: 0.9 }));
    }
  };
  const move = (offset: number) => rail.setAttribute('transform', `translate(${offset.toFixed(2)} 0)`);
  drawRail(initial.flip);
  move(initial.offset);
  root.append(rail);

  const label = (x: number, text: string, anchor = 'start') => {
    const t = svg('text', { class: 'wood-label', x, y: FLOOR_Y + W + 13, 'text-anchor': anchor });
    t.textContent = text;
    return t;
  };
  root.append(label(0, cand.joists ? 'vão no piso' : 'bancada'), label(s.floorLength, cand.joists ? 'tábua que ficou no piso' : 'tábua do lote', 'end'));

  return { root, move, drawRail };
}

function readoutText(cmp: ReturnType<typeof compare>, cand: WoodCandidate): { label: string; value: string; ok: boolean | null }[] {
  return [
    {
      label: 'Furos de prego sobre vigas',
      value: cand.joists ? `${cmp.holesAligned} de ${cmp.holesTotal}` : 'sem vigas para comparar',
      ok: cand.joists ? cmp.holesAligned === cmp.holesTotal : null,
    },
    { label: 'Trilho encosta na tábua', value: cmp.abuts ? 'sim' : 'não', ok: cmp.abuts },
    { label: 'Veios continuam na emenda', value: cmp.abuts ? (cmp.grainContinuous ? 'sim' : 'não') : '—', ok: cmp.abuts ? cmp.grainContinuous : null },
  ];
}

export function moneyWoodLab({ caseFile, store }: ScreenContext, c: MoneyWoodLab): HTMLElement {
  const s = store.get();
  const submitted = s.lab.submitted;
  const { bills, wood } = c;
  const marked = new Set(s.lab.bills);
  const ransom = new Set(bills.ransomList);

  /* ---------- Parte 1: cédulas ---------- */

  const toggleBill = (id: string) =>
    store.update((st) => {
      const set = new Set(st.lab.bills);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...st, lab: { ...st.lab, bills: [...set] } };
    });

  const billsPanel = h(
    'section',
    { class: 'lab-panel wide' },
    h('h3', { class: 'panel-title' }, bills.title),
    h('p', { class: 'caption' }, bills.lede),
    h(
      'div',
      { class: 'ransom-list', 'aria-label': 'Lista de números de série do resgate' },
      h('p', { class: 'found-label' }, 'Lista do resgate (trecho)'),
      h('ul', {}, ...bills.ransomList.map((n) => h('li', {}, n))),
    ),
    h(
      'div',
      { class: 'table-scroll' },
      h(
        'table',
        { class: 'pattern-table bills-table' },
        h(
          'thead',
          {},
          h(
            'tr',
            {},
            h('th', { scope: 'col' }, 'Número de série'),
            h('th', { scope: 'col' }, 'Nota'),
            h('th', { scope: 'col' }, 'Onde apareceu'),
            h('th', { scope: 'col', class: 'center' }, 'Do resgate?'),
          ),
        ),
        h(
          'tbody',
          {},
          ...bills.ledger.map((b) => {
            const id = `bill-${b.id}`;
            const right = marked.has(b.id) === ransom.has(b.serial);
            return h(
              'tr',
              { class: submitted ? (right ? 'is-correct' : 'is-wrong') : '' },
              h('td', {}, h('label', { for: id, class: 'serial' }, b.serial)),
              h('td', {}, `US$ ${b.denomination} · ${b.kind === 'certificado-ouro' ? 'certificado-ouro' : 'nota federal'}`),
              h('td', {}, `${b.where}, ${b.date}`, b.note ? h('p', { class: 'row-note' }, `Anotação: ${b.note}`) : null),
              h(
                'td',
                { class: 'center' },
                h('input', { type: 'checkbox', id, checked: marked.has(b.id), disabled: submitted, onchange: () => toggleBill(b.id) }),
              ),
            );
          }),
        ),
      ),
    ),
    h('p', { class: 'statement' }, bills.leadQuestion),
    h(
      'div',
      { class: 'choice-row', role: 'radiogroup', 'aria-label': bills.leadQuestion },
      ...bills.ledger.map((b) =>
        h(
          'button',
          {
            role: 'radio',
            'aria-checked': s.lab.lead === b.id ? 'true' : 'false',
            class: `chip mono${s.lab.lead === b.id ? ' is-picked' : ''}`,
            disabled: submitted,
            onclick: () => store.update((st) => ({ ...st, lab: { ...st.lab, lead: b.id } })),
          },
          b.serial,
        ),
      ),
    ),
  );

  /* ---------- Parte 2: madeira ---------- */

  const cand = wood.candidates.find((x) => x.id === activeCandidate) ?? wood.candidates[0]!;
  activeCandidate = cand.id;
  const setup = wood.setup;
  const placement: Placement = s.lab.align[cand.id] ?? { offset: 0, flip: false };
  const scene = woodScene(setup, cand, placement);
  const readout = h('dl', { class: 'readout' });
  const renderReadout = (p: Placement) => {
    readout.replaceChildren(
      ...readoutText(compare(setup, cand.grainSeed, cand.joists, p), cand).flatMap((r) => [
        h('dt', {}, r.label),
        h('dd', { class: r.ok === null ? '' : r.ok ? 'is-ok' : 'is-wrong' }, r.value),
      ]),
    );
  };
  renderReadout(placement);

  const commit = (p: Placement) =>
    store.update((st) => ({ ...st, lab: { ...st.lab, align: { ...st.lab.align, [cand.id]: p } } }));

  const slider = h('input', {
    type: 'range',
    id: `offset-${cand.id}`,
    min: 0,
    max: maxOffset(setup),
    step: 0.2,
    value: placement.offset,
    disabled: submitted,
    'aria-label': 'Posição do trilho ao longo do piso, em centímetros',
  });
  // Durante o arraste só o desenho muda; o estado é gravado ao soltar.
  slider.addEventListener('input', () => {
    const p = { ...placement, offset: Number(slider.value) };
    scene.move(p.offset);
    renderReadout(p);
    offsetValue.textContent = `${p.offset.toFixed(1)} cm`;
  });
  slider.addEventListener('change', () => commit({ ...placement, offset: Number(slider.value) }));
  const offsetValue = h('output', { for: slider.id, class: 'offset-value' }, `${placement.offset.toFixed(1)} cm`);

  const verdict = s.lab.verdicts[cand.id];
  const setVerdict = (v: 'identificada' | 'excluida') =>
    store.update((st) => ({ ...st, lab: { ...st.lab, verdicts: { ...st.lab.verdicts, [cand.id]: v } } }));

  const woodPanel = h(
    'section',
    { class: 'lab-panel wide' },
    h('h3', { class: 'panel-title' }, wood.title),
    h('p', { class: 'caption' }, wood.lede),
    h(
      'div',
      { class: 'tabs', role: 'tablist' },
      ...wood.candidates.map((x) =>
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
    h('div', { class: 'wood-stage' }, scene.root),
    h(
      'div',
      { class: 'wood-controls' },
      h('label', { for: slider.id }, 'Posição do trilho'),
      slider,
      offsetValue,
      h(
        'button',
        { class: 'btn ghost', disabled: submitted, onclick: () => commit({ ...placement, flip: !placement.flip }) },
        placement.flip ? 'Desvirar o trilho' : 'Girar o trilho 180°',
      ),
    ),
    readout,
    h(
      'div',
      { class: 'verdict-row' },
      h('button', { class: `chip${verdict === 'identificada' ? ' is-picked' : ''}`, disabled: submitted, onclick: () => setVerdict('identificada') }, 'Mesma tábua'),
      h('button', { class: `chip${verdict === 'excluida' ? ' is-picked' : ''}`, disabled: submitted, onclick: () => setVerdict('excluida') }, 'Excluída'),
    ),
  );

  const ready = s.lab.lead !== null && wood.candidates.every((x) => s.lab.verdicts[x.id]);
  const score = submitted ? labScore(caseFile, s) : null;
  const source = wood.candidates.find((x) => x.grainSeed === setup.railSourceSeed);
  const sourcePlacement = source ? s.lab.align[source.id] : undefined;
  const aligned = source && sourcePlacement ? isFullMatch(compare(setup, source.grainSeed, source.joists, sourcePlacement)) : false;

  return h(
    'section',
    { class: 'screen laboratorio' },
    h('h2', {}, c.title),
    h('p', { class: 'lede' }, c.lede),
    billsPanel,
    woodPanel,
    submitted && score
      ? h(
          'div',
          { class: 'result-box', 'aria-live': 'polite' },
          h('h3', {}, `Resultado do laboratório: ${score.points} de ${score.max} pontos`),
          h('p', {}, s.lab.lead === bills.leadBillId ? 'Nota certa. ' : 'Não era essa nota. ', bills.leadExplanation),
          h('p', {}, aligned ? 'Você encaixou o trilho na posição exata. ' : 'O trilho não ficou na posição exata. ', wood.explanation),
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
            ready ? 'Registrar laudo' : 'Escolha a nota-chave e registre uma conclusão para cada tábua',
          ),
    ),
  );
}
