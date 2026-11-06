import { canvas, s } from '../ui/art/svg';
import { placedObject } from '../ui/art/objects';
import { h } from '../ui/dom';
import type { ExamineInfo } from './scenes/rancho';

/** Ilustração ampliável; não é uma fotografia nem uma reprodução da prova. */
export function examination(info: ExamineInfo): HTMLElement | null {
  if (!info.object && info.visual !== 'door-stain') return null;
  const art = canvas('-40 -40 80 80', `Ilustração de exame: ${info.title}`);
  const drawing = s('g');
  if (info.object) {
    drawing.append(placedObject(info.object, art.hatch, 0, 0, 0, 1.15));
  } else {
    // Mancha genérica: não inventa minúcias nem antecipa o confronto no laboratório.
    drawing.append(
      s('rect', { x: -13, y: -36, width: 26, height: 72, rx: 1, fill: '#ad9676' }),
      ...[-9, -4, 3, 9].map((x) => s('path', { d: `M${x} -35 q-3 18 0 35 t0 35`, fill: 'none', stroke: '#725a40', 'stroke-width': 0.5 })),
      s('path', { d: 'M-3 -17 Q9 -21 8 -9 Q14 -3 6 7 Q6 18 -2 22 Q-8 17 -7 8 Q-14 1 -8 -8 Q-10 -15 -3 -17Z', fill: '#48241c', opacity: 0.88 }),
    );
  }
  art.root.append(drawing);
  const viewport = h('div', { class: 'examination-viewport' }, art.root);
  const label = h('span', { class: 'examination-zoom', 'aria-live': 'polite' });
  const slider = h('input', { type: 'range', min: 100, max: 250, step: 10, value: 100, 'aria-label': 'Ampliação da ilustração' });
  const update = () => {
    const zoom = Number(slider.value);
    art.root.style.width = `${zoom}%`;
    art.root.style.height = `${zoom}%`;
    label.textContent = `${zoom}%`;
  };
  slider.addEventListener('input', update);
  update();
  const reset = h('button', { class: 'btn ghost', type: 'button', onclick: () => {
    slider.value = '100';
    update();
    viewport.scrollTo(0, 0);
  } }, 'Restaurar');
  return h('figure', { class: 'examination' },
    viewport,
    h('div', { class: 'examination-controls' }, h('span', {}, 'Ampliar'), slider, label, reset),
    h('figcaption', {}, 'Ilustração dramatizada para observação; não é uma imagem da prova original. Amplie e use as barras de rolagem para ver os detalhes.'),
  );
}
