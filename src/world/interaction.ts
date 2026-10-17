import type { Vec2 } from './motion';

/**
 * Escolha do que o jogador pode usar com a tecla E, sem Three.js.
 *
 * Um objeto só é oferecido se estiver perto e mais ou menos na direção para
 * onde a câmera aponta. Entre vários, vence o de menor custo: distância somada
 * a uma penalidade pelo ângulo, para "o que estou olhando" ganhar de "o que
 * está mais perto, mas de lado".
 */
export interface Interactable {
  id: string;
  /** Ponto de referência no chão (xz). */
  at: Vec2;
  /** Alcance em metros a partir do centro do jogador. */
  reach: number;
  /** Texto curto do aviso: "Examinar a lamparina", "Abrir a porta". */
  label(): string;
  /** Pode ser usado agora? (ex.: não fechar a porta com o jogador no vão). */
  enabled?(): boolean;
}

/** Meio-ângulo do cone de interesse em torno da direção da câmera. */
export const LOOK_CONE = (75 * Math.PI) / 180;

/** Diferença angular absoluta, em [0, π]. */
function angleBetween(ax: number, az: number, bx: number, bz: number): number {
  const dot = ax * bx + az * bz;
  const len = Math.hypot(ax, az) * Math.hypot(bx, bz);
  if (len < 1e-9) return 0;
  return Math.acos(Math.min(1, Math.max(-1, dot / len)));
}

/**
 * O melhor objeto ao alcance, ou null.
 * `yaw` segue a convenção de motion.ts: com yaw = 0 a câmera olha para −z.
 */
export function pickInteractable<T extends Interactable>(player: Vec2, yaw: number, items: readonly T[]): T | null {
  const fx = -Math.sin(yaw);
  const fz = -Math.cos(yaw);
  let best: T | null = null;
  let bestCost = Infinity;
  for (const it of items) {
    if (it.enabled && !it.enabled()) continue;
    const dx = it.at.x - player.x;
    const dz = it.at.z - player.z;
    const dist = Math.hypot(dx, dz);
    if (dist > it.reach) continue;
    // Colado no objeto, o ângulo deixa de fazer sentido.
    const angle = dist < 0.35 ? 0 : angleBetween(fx, fz, dx, dz);
    if (angle > LOOK_CONE) continue;
    const cost = dist + angle * 0.8;
    if (cost < bestCost) {
      bestCost = cost;
      best = it;
    }
  }
  return best;
}
