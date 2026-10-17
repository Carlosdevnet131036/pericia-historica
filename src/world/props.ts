import * as THREE from 'three';
import type { ObjectId } from '../engine/types';

/**
 * Objetos da busca em 3D, montados com primitivas (sem arquivos externos).
 * Origem no ponto de apoio (base do objeto, y = 0). Os pequenos (moeda,
 * botão, pente, chave) são um pouco maiores que o real, para serem visíveis
 * em terceira pessoa: é uma convenção de jogo, não uma medida histórica.
 */

const mat = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });

function mesh(geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  return o;
}

type Built = { group: THREE.Group; flame?: THREE.MeshStandardMaterial };

const BUILDERS: Partial<Record<ObjectId, () => Built>> = {
  lamparina: () => {
    const g = new THREE.Group();
    const brass = mat(0x8a6a3a, { metalness: 0.6, roughness: 0.45 });
    const flame = new THREE.MeshStandardMaterial({ color: 0x331a00, emissive: 0xffb45a, emissiveIntensity: 3 });
    g.add(
      mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 12), brass, 0, 0.015),
      mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 12), brass, 0, 0.08),
      mesh(new THREE.ConeGeometry(0.018, 0.06, 8), flame, 0, 0.17),
    );
    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.05, 0.16, 12, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf2e6cc, transparent: true, opacity: 0.3, emissive: 0xffb060, emissiveIntensity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
    );
    glass.position.y = 0.2;
    g.add(glass);
    return { group: g, flame };
  },
  xicara: () => {
    const g = new THREE.Group();
    const china = mat(0xe8e2d4, { roughness: 0.35 });
    // Copo aberto em cima: precisa das duas faces para o interior aparecer.
    const inside = mat(0xe8e2d4, { roughness: 0.35, side: THREE.DoubleSide });
    g.add(
      mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 16), china, 0, 0.005),
      mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.06, 14, 1, true), inside, 0, 0.04),
      mesh(new THREE.CircleGeometry(0.035, 14).rotateX(-Math.PI / 2), china, 0, 0.012),
    );
    const handle = mesh(new THREE.TorusGeometry(0.018, 0.005, 6, 12), china, 0.05, 0.042);
    g.add(handle);
    return { group: g };
  },
  vela: () => {
    const g = new THREE.Group();
    g.add(
      mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 14), mat(0x7d7f80, { metalness: 0.5, roughness: 0.5 }), 0, 0.008),
      mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.16, 10), mat(0xe9dfc4, { roughness: 0.9 }), 0, 0.095),
      mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.015, 4), mat(0x111111), 0, 0.182),
    );
    return { group: g };
  },
  chave: () => {
    const g = new THREE.Group();
    const iron = mat(0x4a4642, { metalness: 0.7, roughness: 0.5 });
    const bow = mesh(new THREE.TorusGeometry(0.035, 0.009, 6, 14), iron, -0.08, 0.009);
    bow.rotation.x = Math.PI / 2;
    g.add(bow, mesh(new THREE.BoxGeometry(0.14, 0.012, 0.012), iron, 0.02, 0.009), mesh(new THREE.BoxGeometry(0.012, 0.012, 0.04), iron, 0.08, 0.009, 0.02));
    return { group: g };
  },
  chapeu: () => {
    const g = new THREE.Group();
    const felt = mat(0x3b2f24, { roughness: 0.95 });
    g.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 20), felt, 0, 0.008), mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.1, 16), felt, 0, 0.065));
    return { group: g };
  },
  moeda: () => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.006, 18), mat(0xb87333, { metalness: 0.85, roughness: 0.35 }), 0, 0.004));
    return { group: g };
  },
  pente: () => {
    const g = new THREE.Group();
    const horn = mat(0x5a3c22, { roughness: 0.5 });
    g.add(mesh(new THREE.BoxGeometry(0.14, 0.012, 0.025), horn, 0, 0.006, -0.02));
    for (let i = 0; i < 9; i++) g.add(mesh(new THREE.BoxGeometry(0.006, 0.008, 0.035), horn, -0.064 + i * 0.016, 0.004, 0.01));
    return { group: g };
  },
  botao: () => {
    const g = new THREE.Group();
    const bone = mat(0xd8ccb0, { roughness: 0.6 });
    g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 16), bone, 0, 0.004));
    for (const [x, z] of [[-0.008, -0.008], [0.008, -0.008], [-0.008, 0.008], [0.008, 0.008]] as const) {
      g.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.009, 6), mat(0x2a241a), x, 0.005, z));
    }
    return { group: g };
  },
};

export function hasProp(id: ObjectId): boolean {
  return id in BUILDERS;
}

export function buildProp(id: ObjectId): Built {
  const make = BUILDERS[id];
  if (!make) throw new Error(`sem modelo 3D para o objeto ${id}`);
  return make();
}

/** Textura do brilho (gradiente radial). Criada uma vez por cena e liberada com ela. */
export function glintTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,240,200,1)');
  grad.addColorStop(0.25, 'rgba(255,220,150,0.55)');
  grad.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Brilho suave que marca um objeto ainda não registrado. */
export function createGlint(texture: THREE.Texture): THREE.Sprite {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  sprite.scale.setScalar(0.18);
  return sprite;
}
