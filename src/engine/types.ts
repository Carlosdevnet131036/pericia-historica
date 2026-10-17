import type { FingerprintSpec, PatternType, View } from '../forensics/fingerprint';
import type { Verdict } from '../forensics/match';
import type { DayTemp } from '../forensics/entomology';
import type { Landmark } from '../forensics/superimposition';
import type { WoodSetup } from '../forensics/wood';

export type Step = 'expediente' | 'investigacao' | 'treino' | 'laboratorio' | 'acusacao' | 'revelacao';

export const STEPS: { id: Step; label: string }[] = [
  { id: 'expediente', label: 'Expediente' },
  { id: 'investigacao', label: 'Investigação' },
  { id: 'treino', label: 'Treino' },
  { id: 'laboratorio', label: 'Laboratório' },
  { id: 'acusacao', label: 'Conclusão' },
  { id: 'revelacao', label: 'O que aconteceu' },
];

export type SourceKind = 'museu' | 'acadêmico' | 'livro' | 'jornalístico' | 'enciclopédia' | 'jurídico';

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

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: Option[];
  correct: string;
  explanation: string;
}

/* ---------- Módulos de treino ---------- */

export interface PatternInfo {
  type: PatternType;
  name: string;
  /** Código de Vucetich: letra para polegares, número para os demais dedos. */
  thumbCode: string;
  fingerCode: string;
  description: string;
}

export interface FingerprintTraining {
  kind: 'datiloscopia';
  title: string;
  lede: string;
  patterns: PatternInfo[];
  samples: { id: string; print: FingerprintSpec }[];
}

/** Treino de raciocínio: cada item é uma afirmação a ser classificada. */
export interface ReasoningTraining {
  kind: 'raciocinio';
  title: string;
  lede: string;
  items: Question[];
}

export type TrainingModule = FingerprintTraining | ReasoningTraining;

/* ---------- Módulos de laboratório ---------- */

export interface Suspect {
  id: string;
  name: string;
  role: string;
  print: FingerprintSpec;
}

export interface FingerprintLab {
  kind: 'confronto-digital';
  title: string;
  lede: string;
  latentTitle: string;
  suspects: Suspect[];
  latent: {
    /** De qual ficha a latente realmente veio (resposta do laboratório). */
    sourceSuspectId: string;
    view: View;
    minutiaIds: string[];
    caption: string;
  };
}

/** Uma das hipóteses testadas na simulação da banheira. */
export interface BathHypothesis {
  id: string;
  name: string;
  description: string;
  pose: BathPose;
  /** O que a simulação mostra ao final, em texto. */
  outcome: string;
}

/** Ângulos em graus; 0 = horizontal apontando para os pés da banheira. */
export interface BathPose {
  /** Inclinação do tronco: 90 = sentado ereto, 0 = deitado. */
  torso: number;
  /** Ângulo da coxa em relação ao horizontal. */
  thigh: number;
  /** Ângulo da canela em relação ao horizontal. */
  shin: number;
  /** Deslocamento do quadril ao longo da banheira, em cm a partir da cabeceira. */
  hipX: number;
}

export interface PathologyLab {
  kind: 'patologia-banho';
  title: string;
  lede: string;
  pattern: {
    title: string;
    lede: string;
    cases: { id: string; label: string }[];
    features: { id: string; text: string; inAll: boolean; note: string }[];
  };
  bath: {
    title: string;
    lede: string;
    /** Medidas usadas na simulação, em centímetros. */
    bathLength: number;
    bathDepth: number;
    waterDepth: number;
    victimHeight: number;
    foundDescription: string;
    /** Posição registrada pelo médico, no formato que a simulação calcula. */
    found: { headUnderwater: boolean; legsStraight: boolean; feetOut: boolean };
    hypotheses: BathHypothesis[];
    /** Hipótese compatível com a posição em que o corpo foi encontrado. */
    correct: string;
    explanation: string;
  };
}

export interface Bill {
  id: string;
  serial: string;
  denomination: number;
  kind: 'certificado-ouro' | 'nota-federal';
  where: string;
  date: string;
  /** Anotação feita por quem recebeu a nota (frentista, caixa de banco). */
  note?: string;
}

export interface WoodCandidate {
  id: string;
  name: string;
  description: string;
  grainSeed: number;
  /** A tábua está pregada sobre vigas (piso) ou solta (depósito)? */
  joists: boolean;
}

export interface MoneyWoodLab {
  kind: 'cedulas-madeira';
  title: string;
  lede: string;
  bills: {
    title: string;
    lede: string;
    ransomList: string[];
    ledger: Bill[];
    leadQuestion: string;
    leadBillId: string;
    leadExplanation: string;
  };
  wood: {
    title: string;
    lede: string;
    setup: WoodSetup;
    candidates: WoodCandidate[];
    explanation: string;
  };
}

export interface ProfileQuestion extends Question {
  /** Achados do esqueleto que o jogador usa para responder. */
  traits: string[];
}

export interface OverlayCandidate {
  id: string;
  name: string;
  description: string;
  landmarks: Landmark[];
}

export interface AnthropologyLab {
  kind: 'antropologia';
  title: string;
  lede: string;
  profile: {
    title: string;
    lede: string;
    questions: ProfileQuestion[];
  };
  overlay: {
    title: string;
    lede: string;
    skull: Landmark[];
    candidates: OverlayCandidate[];
    sourceCandidateId: string;
    /** Erro médio máximo (unidades do rosto) para considerar um encaixe. */
    threshold: number;
    explanation: string;
  };
}

export interface LarvaStage {
  id: string;
  name: string;
  length: string;
  /** Graus-dia acumulados desde a postura até atingir este estágio. */
  degreeDays: number;
}

export interface Newspaper {
  id: string;
  title: string;
  date: string;
  distribution: string;
}

export interface EntomologyLab {
  kind: 'entomologia';
  title: string;
  lede: string;
  larvae: {
    title: string;
    lede: string;
    measured: string;
    stages: LarvaStage[];
    correctStage: string;
    baseTemp: number;
    monthLabel: string;
    /** Último dia de desenvolvimento antes da coleta. */
    lastDay: number;
    temps: DayTemp[];
    explanation: string;
  };
  wrapping: {
    title: string;
    lede: string;
    papers: Newspaper[];
    leadQuestion: string;
    leadPaperId: string;
    dateQuestion: string;
    dateOptions: Option[];
    correctDate: string;
    explanation: string;
  };
}

export type LabModule = FingerprintLab | PathologyLab | MoneyWoodLab | AnthropologyLab | EntomologyLab;

/* ---------- Caso ---------- */

export interface CaseFile {
  id: string;
  number: number;
  title: string;
  place: string;
  year: number;
  date: string;
  technique: string;
  playerRole: string;
  intro: string[];
  dispatch: { header: string; body: string };
  copy: {
    start: string;
    investigationTitle: string;
    toTraining: string;
  };
  locations: Location[];
  evidence: Evidence[];
  training: TrainingModule;
  lab: LabModule;
  accusation: Question[];
  reveal: {
    summary: string[];
    fidelity: { documented: string[]; divergent: string[]; dramatized: string[] };
    today: { title: string; text: string }[];
    sources: Source[];
  };
}

/* ---------- Estado ---------- */

export interface GameState {
  version: 2;
  caseId: string;
  step: Step;
  reached: Step[];
  visited: string[];
  training: {
    answers: Record<string, string>;
    firstTry: Record<string, boolean>;
  };
  lab: {
    /** Confronto digital: pontos marcados por ficha e conclusão por ficha. */
    marks: Record<string, Record<string, { x: number; y: number }>>;
    verdicts: Record<string, Verdict>;
    /** Patologia: características marcadas no quadro e hipótese escolhida. */
    features: string[];
    hypothesis: string | null;
    /** Cédulas: notas marcadas como do resgate e a nota que leva ao suspeito. */
    bills: string[];
    lead: string | null;
    /** Madeira: posição do trilho em cada tábua candidata. */
    align: Record<string, { offset: number; flip: boolean }>;
    /** Antropologia: respostas do perfil biológico e ajuste da superposição. */
    answers: Record<string, string>;
    overlay: Record<string, { scale: number; dy: number }>;
    submitted: boolean;
  };
  accusation: {
    answers: Record<string, string>;
    submitted: boolean;
  };
}
