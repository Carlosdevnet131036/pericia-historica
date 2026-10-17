import type { EvidenceKind } from '../../engine/types';
import { s } from './svg';

const PATHS: Record<EvidenceKind, string> = {
  documento: 'M 4 2 H 10 L 13 5 V 14 H 4 Z M 10 2 V 5 H 13 M 6 8 H 11 M 6 10.5 H 11',
  depoimento: 'M 2 4 Q 2 2 4 2 H 12 Q 14 2 14 4 V 9 Q 14 11 12 11 H 7 L 4 14 V 11 Q 2 11 2 9 Z',
  local: 'M 8 15 Q 3 9 3 6 A 5 5 0 0 1 13 6 Q 13 9 8 15 Z M 8 4.5 A 1.6 1.6 0 1 1 7.99 4.5',
  objeto: 'M 9.5 9.5 L 14 14 M 6.5 11 A 4.5 4.5 0 1 1 6.51 11',
};

/** Ícone de 16 px para o tipo de evidência, desenhado com a cor do texto. */
export function evidenceIcon(kind: EvidenceKind): SVGSVGElement {
  return s('svg', { viewBox: '0 0 16 16', class: 'icon', 'aria-hidden': 'true' }, s('path', { d: PATHS[kind] }));
}
