import { STEPS, type CaseFile, type Evidence, type GameState, type Step } from '../../engine/types';
import { evidenceIcon } from '../art/icons';
import { canvas, ink, paper, shade } from '../art/svg';
import { h } from '../dom';

/** Retrato do parceiro: busto esquemático de chapéu, no estilo das gravuras. */
function portrait(): SVGSVGElement {
  const { root, hatch } = canvas('0 0 60 60', '');
  root.classList.add('partner-portrait');
  root.setAttribute('aria-hidden', 'true');
  root.append(
    paper('circle', { cx: 30, cy: 30, r: 28 }),
    ink('circle', { cx: 30, cy: 30, r: 28 }),
    paper('path', { d: 'M 10 56 Q 12 40 30 40 Q 48 40 50 56 Z' }),
    shade('path', hatch, { d: 'M 10 56 Q 12 40 30 40 Q 48 40 50 56 Z' }),
    ink('path', { d: 'M 10 56 Q 12 40 30 40 Q 48 40 50 56 M 26 40 L 30 48 L 34 40' }),
    paper('ellipse', { cx: 30, cy: 30, rx: 9, ry: 11 }),
    ink('ellipse', { cx: 30, cy: 30, rx: 9, ry: 11 }),
    ink('path', { d: 'M 25 34 Q 30 37 35 34' }),
    shade('path', hatch, { d: 'M 20 20 H 40 V 12 Q 30 8 20 12 Z' }),
    ink('path', { d: 'M 20 20 H 40 V 12 Q 30 8 20 12 Z M 14 21 Q 30 17 46 21' }),
  );
  return root;
}

export function partnerBubble(c: CaseFile, step: Step): HTMLElement | null {
  const line = c.partner?.lines[step];
  if (!c.partner || !line) return null;
  return h(
    'aside',
    { class: 'partner', 'aria-label': `Comentário de ${c.partner.name}` },
    portrait(),
    h('div', { class: 'partner-bubble' }, h('p', { class: 'partner-name' }, c.partner.name), h('p', {}, line), h('p', { class: 'partner-note' }, 'Fala dramatizada')),
  );
}

const stepIndex = (step: Step) => STEPS.findIndex((x) => x.id === step);

/** Características já reveladas: as da etapa atual e das anteriores alcançadas. */
export function revealedTraits(c: CaseFile, s: GameState) {
  const furthest = Math.max(...s.reached.map(stepIndex));
  return (c.profile ?? []).filter((t) => stepIndex(t.revealedAt) <= furthest);
}

const MARK = { sim: '✓', nao: '✗', '?': '?' } as const;

/** Quadro de suspeitos, com o perfil do responsável conferido em cada um. */
export function suspectsBoard(c: CaseFile, st: GameState): HTMLElement | null {
  if (!c.suspects?.length) return null;
  const traits = revealedTraits(c, st);
  const total = (c.profile ?? []).length;
  return h(
    'section',
    { class: 'suspects' },
    h('h3', { class: 'section-title' }, 'Quadro de suspeitos'),
    h(
      'div',
      { class: 'profile' },
      h('p', { class: 'found-label' }, `Perfil do responsável · ${traits.length} de ${total} pistas`),
      traits.length
        ? h('ul', {}, ...traits.map((t) => h('li', {}, h('strong', {}, t.label), h('span', { class: 'caption' }, ` · ${t.source}`))))
        : h('p', { class: 'caption' }, 'Nenhuma pista ainda. As análises do laboratório vão revelar o perfil.'),
    ),
    h(
      'div',
      { class: 'suspect-grid' },
      ...c.suspects.map((sp) =>
        h(
          'article',
          { class: 'suspect' },
          h('p', { class: 'suspect-name' }, sp.name),
          h('p', { class: 'caption' }, sp.role),
          sp.dramatized ? h('span', { class: 'tag tag-dram' }, 'Dramatizado') : h('span', { class: 'tag tag-doc' }, 'Documentado'),
          traits.length
            ? h(
                'ul',
                { class: 'suspect-traits' },
                ...traits.map((t) => {
                  const v = sp.traits[t.id] ?? '?';
                  return h('li', { class: `mark-${v === '?' ? 'unknown' : v}` }, h('span', { class: 'mark' }, MARK[v]), t.label);
                }),
              )
            : null,
        ),
      ),
    ),
  );
}

const KIND_LABEL: Record<Evidence['kind'], string> = {
  documento: 'Documento',
  depoimento: 'Depoimento',
  local: 'Local',
  objeto: 'Vestígio',
};

/** Cartão de evidência, com o tipo e a etiqueta documentado/dramatizado. */
export function evidenceCard(e: Evidence, i: number, fresh: boolean): HTMLElement {
  return h(
    'article',
    { class: `evidence${fresh ? ' rise' : ''}`, style: `--i:${i + 1}` },
    h(
      'div',
      { class: 'evidence-tags' },
      h('span', { class: 'tag tag-kind' }, evidenceIcon(e.kind), KIND_LABEL[e.kind]),
      h(
        'span',
        { class: e.dramatized ? 'tag tag-dram' : 'tag tag-doc' },
        e.dramatized ? 'Dramatizado' : 'Documentado',
      ),
    ),
    h('h3', {}, e.title),
    ...e.paragraphs.map((p) => h('p', {}, p)),
  );
}
