/**
 * Matemática de movimento e câmera em terceira pessoa, sem Three.js, para
 * poder ser testada com Vitest.
 *
 * Convenções (as mesmas do Three.js): y para cima, o "à frente" padrão é −z.
 * `yaw` é o giro da câmera em torno do eixo y; com yaw = 0 a câmera fica atrás
 * do jogador, em +z, olhando para −z.
 */

export interface MoveInput {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

export interface Vec2 {
  x: number;
  z: number;
}

export const WALK_SPEED = 2.2; // m/s, passo de quem examina o terreno
export const RUN_SPEED = 4.6;

/** Deslocamento no plano do chão para este quadro, relativo à direção da câmera. */
export function moveDelta(input: MoveInput, yaw: number, dt: number): Vec2 & { moving: boolean } {
  const f = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
  const r = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (f === 0 && r === 0) return { x: 0, z: 0, moving: false };
  // Frente e direita da câmera projetadas no chão.
  const fx = -Math.sin(yaw);
  const fz = -Math.cos(yaw);
  const rx = Math.cos(yaw);
  const rz = -Math.sin(yaw);
  let x = fx * f + rx * r;
  let z = fz * f + rz * r;
  const len = Math.hypot(x, z); // na diagonal, não anda mais rápido
  const speed = input.run ? RUN_SPEED : WALK_SPEED;
  x = (x / len) * speed * dt;
  z = (z / len) * speed * dt;
  return { x, z, moving: true };
}

/** Mantém o jogador dentro de um círculo de raio `radius` em torno da origem. */
export function clampToRadius(p: Vec2, radius: number): Vec2 {
  const d = Math.hypot(p.x, p.z);
  if (d <= radius) return p;
  return { x: (p.x / d) * radius, z: (p.z / d) * radius };
}

/** Ângulo (em torno de y) para o personagem olhar na direção do movimento. */
export function headingOf(delta: Vec2): number {
  return Math.atan2(delta.x, delta.z);
}

/** Gira `current` em direção a `target` pelo caminho mais curto, no máximo `maxStep`. */
export function turnTowards(current: number, target: number, maxStep: number): number {
  let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) <= maxStep) return target;
  return current + Math.sign(diff) * maxStep;
}

export const PITCH_MIN = -0.15; // um pouco abaixo do horizonte
export const PITCH_MAX = 1.1; // quase de cima

export function clampPitch(pitch: number): number {
  return Math.min(PITCH_MAX, Math.max(PITCH_MIN, pitch));
}

/** Posição da câmera orbitando o ponto `target` (geralmente a cabeça do jogador). */
export function orbitPosition(target: { x: number; y: number; z: number }, yaw: number, pitch: number, distance: number) {
  const horizontal = Math.cos(pitch) * distance;
  return {
    x: target.x + Math.sin(yaw) * horizontal,
    y: target.y + Math.sin(pitch) * distance,
    z: target.z + Math.cos(yaw) * horizontal,
  };
}
