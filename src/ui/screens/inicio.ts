import { CASES, PLANNED } from '../../cases';
import { computeScore } from '../../engine/scoring';
import { loadSaved } from '../../engine/state';
import { STEPS, type CaseFile } from '../../engine/types';
import { h } from '../dom';

function status(c: CaseFile): string {
  const s = loadSaved(c.id);
  if (!s) return 'Não iniciado';
  if (s.step === 'revelacao') {
    const score = computeScore(c, s);
    return `Concluído · ${score.total}/${score.max} pontos`;
  }
  const step = STEPS.find((x) => x.id === s.step);
  return `Em andamento · ${step?.label ?? ''}`;
}

export function inicio(): HTMLElement {
  return h(
    'section',
    { class: 'screen inicio' },
    h(
      'header',
      { class: 'case-head' },
      h('p', { class: 'eyebrow' }, 'Casos reais · Perícia forense'),
      h('h1', {}, 'Arquivo de casos'),
      h(
        'p',
        { class: 'lede' },
        'Cada caso é um crime real, encerrado com condenação ou confissão, em que uma técnica forense foi decisiva. Você aprende a técnica, investiga e só no final descobre o que realmente aconteceu, com as fontes.',
      ),
    ),
    h(
      'ol',
      { class: 'case-list' },
      ...CASES.map((c) =>
        h(
          'li',
          {},
          h(
            'a',
            { class: 'case-card', href: `#${c.id}` },
            h('span', { class: 'case-number' }, `Caso ${c.number}`),
            h('span', { class: 'case-title' }, c.title),
            h('span', { class: 'case-meta' }, `${c.place} · ${c.year}`),
            h('span', { class: 'case-tech' }, c.technique),
            h('span', { class: 'case-status' }, status(c)),
          ),
        ),
      ),
      ...PLANNED.map((p) =>
        h(
          'li',
          {},
          h(
            'div',
            { class: 'case-card is-locked', 'aria-disabled': 'true' },
            h('span', { class: 'case-number' }, `Caso ${p.number}`),
            h('span', { class: 'case-title' }, p.title),
            h('span', { class: 'case-meta' }, `${p.place} · ${p.year}`),
            h('span', { class: 'case-tech' }, p.technique),
            h('span', { class: 'case-status' }, 'Em preparação'),
          ),
        ),
      ),
    ),
  );
}
