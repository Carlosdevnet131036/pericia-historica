/**
 * Geometria simplificada de um corpo numa banheira, vista de lado.
 *
 * O corpo é um boneco de quatro segmentos (cabeça+tronco, coxa, perna+pé)
 * articulado no quadril e no joelho. Coordenadas em cm: x cresce da cabeceira
 * para os pés da banheira, y cresce para cima a partir do fundo.
 *
 * É um modelo didático: serve para mostrar por que a altura da vítima, o
 * comprimento da banheira e a posição do corpo importam, não para reconstruir
 * a biomecânica real de 1912.
 */

import type { BathPose } from '../engine/types';

export interface BathDims {
  bathLength: number;
  bathDepth: number;
  waterDepth: number;
  victimHeight: number;
}

export interface Pt {
  x: number;
  y: number;
}

export interface Body {
  hip: Pt;
  shoulder: Pt;
  head: Pt;
  headRadius: number;
  knee: Pt;
  foot: Pt;
}

export interface BathAssessment {
  headUnderwater: boolean;
  legsStraight: boolean;
  feetOut: boolean;
}

/** Altura do quadril acima do fundo quando sentado ou deitado (nádegas). */
const HIP_LIFT = 8;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Proporções aproximadas de um adulto em relação à altura total. */
export function segments(height: number) {
  return {
    torso: height * 0.3, // quadril → ombro
    neck: height * 0.07, // ombro → centro da cabeça
    headRadius: height * 0.065,
    thigh: height * 0.245,
    shin: height * 0.28, // joelho → ponta do pé
  };
}

export function bodyPoints(pose: BathPose, dims: BathDims): Body {
  const seg = segments(dims.victimHeight);
  const hip = { x: pose.hipX, y: HIP_LIFT };
  // O tronco aponta para a cabeceira (x negativo).
  const tx = -Math.cos(rad(pose.torso));
  const ty = Math.sin(rad(pose.torso));
  const shoulder = { x: hip.x + tx * seg.torso, y: hip.y + ty * seg.torso };
  const head = { x: shoulder.x + tx * seg.neck, y: shoulder.y + ty * seg.neck };
  const knee = { x: hip.x + Math.cos(rad(pose.thigh)) * seg.thigh, y: hip.y + Math.sin(rad(pose.thigh)) * seg.thigh };
  const foot = { x: knee.x + Math.cos(rad(pose.shin)) * seg.shin, y: knee.y + Math.sin(rad(pose.shin)) * seg.shin };
  return { hip, shoulder, head, headRadius: seg.headRadius, knee, foot };
}

/** O que um observador veria ao encontrar o corpo nessa posição. */
export function assess(pose: BathPose, dims: BathDims): BathAssessment {
  const b = bodyPoints(pose, dims);
  return {
    // A boca fica perto do centro da cabeça: basta o centro estar submerso.
    headUnderwater: b.head.y < dims.waterDepth,
    legsStraight: Math.abs(pose.thigh - pose.shin) <= 10,
    feetOut: b.foot.y > dims.waterDepth,
  };
}

export function sameAssessment(a: BathAssessment, b: BathAssessment): boolean {
  return a.headUnderwater === b.headUnderwater && a.legsStraight === b.legsStraight && a.feetOut === b.feetOut;
}

export function lerpPose(a: BathPose, b: BathPose, t: number): BathPose {
  const l = (x: number, y: number) => x + (y - x) * t;
  return { torso: l(a.torso, b.torso), thigh: l(a.thigh, b.thigh), shin: l(a.shin, b.shin), hipX: l(a.hipX, b.hipX) };
}
