import { beginSearch, EMPTY_SEARCH, progressScore, registerFind, searchStars, unlockedEvidence } from '../engine/search';
import type { Store } from '../engine/state';
import type { CaseFile, Evidence, Location, ObjectId, SearchProgress } from '../engine/types';

/**
 * Ponte entre o mundo 3D e o estado do jogo. O 3D não lê nem grava o Store
 * diretamente: pede por aqui, e tudo cai no mesmo progresso da busca 2D
 * (`state.search[lugar]`), salvo no mesmo localStorage. Por isso um objeto
 * achado num modo aparece como achado no outro.
 */
export interface ExploreSession {
  readonly location: Location;
  readonly targets: readonly ObjectId[];
  isFound(id: ObjectId): boolean;
  foundCount(): number;
  /** A cena deste lugar está concluída (os cartões dele estão liberados). */
  isComplete(): boolean;
  /** Liga o relógio da cena, se ainda não estiver ligado. */
  begin(): void;
  find(id: ObjectId): FindOutcome;
  /** Cartões deste lugar (para a mancha no marco, por exemplo). */
  evidence(id: string): Evidence | undefined;
  /** Todas as evidências liberadas no caso, para o diário. */
  unlocked(): Evidence[];
}

export interface FindOutcome {
  isNew: boolean;
  completed: boolean;
  /** Na conclusão: estrelas desta partida e tempo. */
  stars?: number;
  elapsedMs?: number;
  /** Cartões liberados pela conclusão. */
  released?: Evidence[];
}

export function createSession(store: Store, caseFile: CaseFile, location: Location): ExploreSession {
  const spec = location.search;
  if (!spec) throw new Error(`${location.id} não tem busca para explorar em 3D`);
  const progress = (): SearchProgress => store.get().search[location.id] ?? EMPTY_SEARCH;
  const save = (p: SearchProgress) => store.update((s) => ({ ...s, search: { ...s.search, [location.id]: p } }));
  const ownEvidence = () => location.evidenceIds.map((id) => caseFile.evidence.find((e) => e.id === id)).filter((e): e is Evidence => !!e);

  return {
    location,
    targets: spec.targets,
    isFound: (id) => progress().found.includes(id),
    foundCount: () => progress().found.filter((id) => spec.targets.includes(id as ObjectId)).length,
    isComplete: () => progress().elapsedMs !== null,
    begin() {
      const p = progress();
      const next = beginSearch(p, Date.now());
      if (next !== p) save(next);
    },
    find(id) {
      const r = registerFind(progress(), spec.targets, id, Date.now());
      if (!r.isNew) return { isNew: false, completed: false };
      save(r.progress);
      if (!r.completed) return { isNew: true, completed: false };
      // Concluir a cena conta como visitar o lugar, como na busca 2D.
      store.update((s) => (s.visited.includes(location.id) ? s : { ...s, visited: [...s.visited, location.id] }));
      return {
        isNew: true,
        completed: true,
        stars: searchStars(progressScore(r.progress)),
        elapsedMs: r.progress.elapsedMs ?? 0,
        released: ownEvidence(),
      };
    },
    evidence: (id) => (location.evidenceIds.includes(id) ? caseFile.evidence.find((e) => e.id === id) : undefined),
    unlocked: () => unlockedEvidence(caseFile, store.get()),
  };
}
