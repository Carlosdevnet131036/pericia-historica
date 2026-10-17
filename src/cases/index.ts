import type { CaseFile } from '../engine/types';
import { lindbergh1932 } from './lindbergh1932';
import { mengele1985 } from './mengele1985';
import { rojas1892 } from './rojas1892';
import { ruxton1935 } from './ruxton1935';
import { smith1915 } from './smith1915';

export const CASES: CaseFile[] = [rojas1892, smith1915, lindbergh1932, mengele1985, ruxton1935];

/** Casos já pesquisados e planejados, mostrados como "em preparação". */
export const PLANNED: { number: number; title: string; place: string; year: number; technique: string }[] = [
  { number: 6, title: 'Os Romanov', place: 'Ecaterimburgo, Rússia', year: 1991, technique: 'DNA mitocondrial' },
  { number: 7, title: 'As ossadas de Perus', place: 'São Paulo, Brasil', year: 1990, technique: 'Antropologia forense e DNA' },
  { number: 8, title: 'O manifesto', place: 'EUA', year: 1996, technique: 'Linguística forense' },
];

export function findCase(id: string): CaseFile | undefined {
  return CASES.find((c) => c.id === id);
}
