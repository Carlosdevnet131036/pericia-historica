/**
 * Primitivas das ilustrações em estilo de gravura: traço de tinta (`ink`),
 * hachura para sombras (`hatch`) e pequenos detalhes em vermelho (`accent`).
 * As cores vêm do CSS (tokens do tema), então funcionam no modo claro e escuro.
 */

const NS = 'http://www.w3.org/2000/svg';

type Attrs = Record<string, string | number>;

export function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: SVGElement[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  el.append(...children);
  return el;
}

let patternCount = 0;

/**
 * Cria o <svg> com um padrão de hachura próprio. Cada ilustração tem um id de
 * padrão único, porque vários SVGs convivem na mesma página.
 */
export function canvas(viewBox: string, label: string): { root: SVGSVGElement; hatch: string } {
  const id = `hatch-${++patternCount}`;
  const root = s('svg', { viewBox, role: 'img', 'aria-label': label, class: 'art' });
  root.append(
    s(
      'defs',
      {},
      s(
        'pattern',
        { id, patternUnits: 'userSpaceOnUse', width: 4, height: 4, patternTransform: 'rotate(45)' },
        s('line', { x1: 0, y1: 0, x2: 0, y2: 4, class: 'hatch-line' }),
      ),
    ),
  );
  return { root, hatch: `url(#${id})` };
}

/** Traço de tinta. `pathLength=1` permite a animação de "desenhar" o traço. */
export const ink = (tag: 'path' | 'line' | 'rect' | 'circle' | 'ellipse' | 'polyline', attrs: Attrs) =>
  s(tag, { ...attrs, class: `art-ink ${attrs.class ?? ''}`.trim(), pathLength: 1 });

export const accent = (tag: 'path' | 'line' | 'rect' | 'circle' | 'ellipse' | 'polyline', attrs: Attrs) =>
  s(tag, { ...attrs, class: 'art-accent', pathLength: 1 });

/** Área sombreada com hachura (sem contorno). */
export const shade = (tag: 'path' | 'rect' | 'circle' | 'ellipse', hatch: string, attrs: Attrs) =>
  s(tag, { ...attrs, class: 'art-hatch', fill: hatch });

/** Superfície opaca na cor do papel, para esconder o que fica atrás. */
export const paper = (tag: 'path' | 'rect' | 'circle' | 'ellipse', attrs: Attrs) => s(tag, { ...attrs, class: 'art-paper' });

/** Linha do chão comum às cenas. */
export const ground = (y = 130) => ink('path', { d: `M 8 ${y} H 312` });

/**
 * Ativa a animação de traço: cada elemento entra com um pequeno atraso, como
 * se a gravura fosse desenhada na hora.
 */
export function drawIn(root: SVGSVGElement): SVGSVGElement {
  root.classList.add('draw-in');
  root.querySelectorAll<SVGElement>('.art-ink, .art-accent').forEach((el, i) => {
    el.style.setProperty('--d', String(Math.min(i * 35, 900)));
  });
  return root;
}
