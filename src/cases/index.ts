import type { CaseFile } from '../engine/types';
import { lindbergh1932 } from './lindbergh1932';
import { rojas1892 } from './rojas1892';
import { smith1915 } from './smith1915';

export const CASES: CaseFile[] = [rojas1892, smith1915, lindbergh1932];

/** Casos já pesquisados e planejados, mostrados como "em preparação". */
export const PLANNED: { number: number; title: string; place: string; year: number; technique: string }[] = [
  { number: 4, title: 'O caso Ruxton', place: 'Lancaster, Inglaterra', year: 1935, technique: 'Antropologia forense' },
  { number: 5, title: 'O manifesto', place: 'EUA', year: 1996, technique: 'Linguística forense' },
];

export function findCase(id: string): CaseFile | undefined {
  return CASES.find((c) => c.id === id);
}
