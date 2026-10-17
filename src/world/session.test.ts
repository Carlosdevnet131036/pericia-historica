import { describe, expect, it } from 'vitest';
import { rojas1892 } from '../cases/rojas1892';
import { Store } from '../engine/state';
import { createSession } from './session';

// Sem localStorage no Node: o Store segue só em memória, como numa aba anônima.
const rancho = rojas1892.locations.find((l) => l.id === 'rancho')!;

describe('sessão de exploração 3D', () => {
  it('grava no mesmo progresso da busca 2D', () => {
    const store = new Store(rojas1892.id);
    const session = createSession(store, rojas1892, rancho);
    session.begin();
    expect(session.find('chave')).toEqual({ isNew: true, completed: false });
    expect(store.get().search.rancho?.found).toEqual(['chave']);
    expect(session.isFound('chave')).toBe(true);
    expect(session.find('chave').isNew).toBe(false);
    expect(session.foundCount()).toBe(1);
  });

  it('os 8 objetos concluem a cena, liberam os 2 cartões e marcam o lugar como visitado', () => {
    const store = new Store(rojas1892.id);
    const session = createSession(store, rojas1892, rancho);
    session.begin();
    let last = session.find(rancho.search!.targets[0]!);
    for (const id of rancho.search!.targets.slice(1)) last = session.find(id);
    expect(last.completed).toBe(true);
    expect(last.released?.map((e) => e.id)).toEqual(['cena', 'mancha']);
    expect(session.isComplete()).toBe(true);
    expect(store.get().visited).toContain('rancho');
    expect(session.unlocked().map((e) => e.id)).toEqual(['cena', 'mancha']);
  });

  it('só expõe cartões do próprio lugar', () => {
    const session = createSession(new Store(rojas1892.id), rojas1892, rancho);
    expect(session.evidence('mancha')?.title).toBe('Mancha no marco da porta');
    expect(session.evidence('relatorio')).toBeUndefined();
  });
});
