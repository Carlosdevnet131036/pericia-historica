import type { FingerprintSpec, PatternType, View } from '../forensics/fingerprint';
import type { Verdict } from '../forensics/match';

export type Step = 'expediente' | 'investigacao' | 'treino' | 'laboratorio' | 'acusacao' | 'revelacao';

export const STEPS: { id: Step; label: string }[] = [
  { id: 'expediente', label: 'Expediente' },
  { id: 'investigacao', label: 'Investigação' },
  { id: 'treino', label: 'Treino' },
  { id: 'laboratorio', label: 'Laboratório' },
  { id: 'acusacao', label: 'Conclusão' },
  { id: 'revelacao', label: 'O que aconteceu' },
];

export type SourceKind = 'museu' | 'acadêmico' | 'livro' | 'jornalístico' | 'enciclopédia';

export interface Source {
  label: string;
  kind: SourceKind;
  url?: string;
}

export type EvidenceKind = 'documento' | 'depoimento' | 'local' | 'objeto';

export interface Evidence {
  id: string;
  title: string;
  kind: EvidenceKind;
  paragraphs: string[];
  /**
   * true quando o conteúdo é reconstrução dramatizada (diálogo, cena, detalhe
   * sem fonte). O jogo sempre sinaliza isso para o jogador.
   */
  dramatized: boolean;
}

export interface Location {
  id: string;
  name: string;
  blurb: string;
  evidenceIds: string[];
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  print: FingerprintSpec;
}

export interface Question {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
}

export interface TrainingSample {
  id: string;
  print: FingerprintSpec;
}

export interface PatternInfo {
  type: PatternType;
  name: string;
  /** Código de Vucetich: letra para polegares, número para os demais dedos. */
  thumbCode: string;
  fingerCode: string;
  description: string;
}

export interface CaseFile {
  id: string;
  number: number;
  title: string;
  place: string;
  date: string;
  technique: string;
  playerRole: string;
  intro: string[];
  telegram: string;
  locations: Location[];
  evidence: Evidence[];
  suspects: Suspect[];
  latent: {
    /** De qual ficha a latente realmente veio (resposta do laboratório). */
    sourceSuspectId: string;
    view: View;
    minutiaIds: string[];
    caption: string;
  };
  patterns: PatternInfo[];
  training: TrainingSample[];
  accusation: Question[];
  reveal: {
    summary: string[];
    fidelity: { documented: string[]; divergent: string[]; dramatized: string[] };
    today: { title: string; text: string }[];
    sources: Source[];
  };
}

export interface GameState {
  version: 1;
  caseId: string;
  step: Step;
  reached: Step[];
  visited: string[];
  training: {
    answers: Record<string, PatternType>;
    firstTry: Record<string, boolean>;
  };
  lab: {
    marks: Record<string, Record<string, { x: number; y: number }>>;
    verdicts: Record<string, Verdict>;
    submitted: boolean;
  };
  accusation: {
    answers: Record<string, string>;
    submitted: boolean;
  };
}
