import type { GameState, Step } from './types';
import { STEPS } from './types';

// v2: o formato do estado mudou com os módulos de perícia; saves v1 são ignorados.
const KEY_PREFIX = 'pericia-historica:v2:';

export function initialState(caseId: string): GameState {
  return {
    version: 2,
    caseId,
    step: 'expediente',
    reached: ['expediente'],
    visited: [],
    training: { answers: {}, firstTry: {} },
    lab: { marks: {}, verdicts: {}, features: [], hypothesis: null, bills: [], lead: null, align: {}, answers: {}, overlay: {}, submitted: false },
    accusation: { answers: {}, submitted: false },
  };
}

/** localStorage pode não existir ou lançar exceção (aba anônima, iframe). */
export function loadSaved(caseId: string): GameState | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + caseId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== 2 || parsed.caseId !== caseId) return null;
    // Campos novos ganham o valor padrão; assim um save antigo continua válido.
    const base = initialState(caseId);
    return { ...base, ...parsed, lab: { ...base.lab, ...parsed.lab } };
  } catch {
    return null;
  }
}

function save(state: GameState): void {
  try {
    localStorage.setItem(KEY_PREFIX + state.caseId, JSON.stringify(state));
  } catch {
    // Sem persistência: o jogo continua funcionando na sessão atual.
  }
}

type Listener = (state: GameState) => void;

/**
 * Store mínimo: estado imutável + assinantes. Cada mudança passa por
 * `update`, que gera um novo objeto, salva e notifica a UI.
 */
export class Store {
  private state: GameState;
  private listeners = new Set<Listener>();

  constructor(caseId: string) {
    this.state = loadSaved(caseId) ?? initialState(caseId);
  }

  get(): GameState {
    return this.state;
  }

  update(fn: (draft: GameState) => GameState): void {
    this.state = fn(this.state);
    save(this.state);
    this.listeners.forEach((l) => l(this.state));
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  goTo(step: Step): void {
    this.update((s) => ({
      ...s,
      step,
      reached: s.reached.includes(step) ? s.reached : [...s.reached, step],
    }));
  }

  /** Registra uma resposta de treino; só a primeira tentativa conta pontos. */
  answerTraining(id: string, answer: string, correct: string): void {
    this.update((s) => ({
      ...s,
      training: {
        answers: { ...s.training.answers, [id]: answer },
        firstTry: id in s.training.firstTry ? s.training.firstTry : { ...s.training.firstTry, [id]: answer === correct },
      },
    }));
  }

  reset(): void {
    this.update((s) => initialState(s.caseId));
  }
}

export function nextStep(step: Step): Step | null {
  const i = STEPS.findIndex((s) => s.id === step);
  return STEPS[i + 1]?.id ?? null;
}
