import { afterEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_SEARCH, searchElapsed } from './search';
import { initialState, loadSaved } from './state';

const KEY = 'pericia-historica:v2:rojas-1892';

function stubStorage(data: Record<string, string>) {
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => void (data[k] = v),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('carregar o save', () => {
  it('relógio que ficou "rodando" (página fechada à força) volta pausado, sem somar o trecho órfão', () => {
    const state = initialState('rojas-1892');
    state.search = { rancho: { ...EMPTY_SEARCH, startedAt: 0, activeMs: 12_000, runningSince: 50_000 } };
    stubStorage({ [KEY]: JSON.stringify(state) });
    const p = loadSaved('rojas-1892')!.search.rancho!;
    expect(p.runningSince).toBeNull();
    expect(searchElapsed(p, 10_000_000)).toBe(12_000);
  });

  it('save sem relógio rodando é carregado como estava', () => {
    const state = initialState('rojas-1892');
    state.search = { rancho: { ...EMPTY_SEARCH, startedAt: 0, activeMs: 12_000, runningSince: null } };
    stubStorage({ [KEY]: JSON.stringify(state) });
    expect(loadSaved('rojas-1892')!.search.rancho).toEqual(state.search.rancho);
  });
});
