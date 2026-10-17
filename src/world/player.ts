import * as THREE from 'three';

/**
 * O investigador: figura low-poly com sobretudo, chapéu e maleta, montada
 * com primitivas. Pernas e braços balançam quando ele anda.
 */
export interface Player {
  root: THREE.Group;
  /** Atualiza a animação de caminhada; `speed` em m/s (0 = parado). */
  animate(dt: number, speed: number): void;
}

export function createPlayer(): Player {
  const root = new THREE.Group();
  root.name = 'jogador';
  root.scale.setScalar(0.78); // cerca de 1,85 m com o chapéu
  // As partes ficam num grupo próprio para o balanço do passo não mexer na posição do jogador.
  const body = new THREE.Group();
  root.add(body);

  const coat = new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.9 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: 0.95 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xc8a284, roughness: 0.8 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x4a2f1c, roughness: 0.7 });

  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  };

  // Pernas giram a partir do quadril (pivô no topo).
  const leg = (x: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.9, 0);
    pivot.add(mesh(new THREE.BoxGeometry(0.16, 0.9, 0.18), cloth, 0, -0.45, 0));
    body.add(pivot);
    return pivot;
  };
  const legL = leg(-0.11);
  const legR = leg(0.11);

  // Sobretudo: tronco de cone, mais largo embaixo.
  body.add(mesh(new THREE.CylinderGeometry(0.26, 0.36, 0.95, 8), coat, 0, 1.22, 0));
  body.add(mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.25, 8), coat, 0, 1.78, 0));

  const arm = (x: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.82, 0);
    pivot.add(mesh(new THREE.BoxGeometry(0.13, 0.7, 0.15), coat, 0, -0.35, 0));
    body.add(pivot);
    return pivot;
  };
  const armL = arm(-0.33);
  const armR = arm(0.33);

  body.add(mesh(new THREE.SphereGeometry(0.16, 10, 8), skin, 0, 2.05, 0));
  // Chapéu: aba larga e copa.
  body.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16), cloth, 0, 2.17, 0));
  body.add(mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.2, 12), cloth, 0, 2.28, 0));
  // Maleta na mão direita.
  armR.add(mesh(new THREE.BoxGeometry(0.1, 0.24, 0.34), leather, 0, -0.78, 0));

  let phase = 0;
  const animate = (dt: number, speed: number) => {
    if (speed > 0.01) {
      phase += dt * speed * 3.2;
      const swing = Math.sin(phase) * Math.min(0.6, 0.18 * speed);
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing * 0.8;
      armR.rotation.x = swing * 0.3;
      body.position.y = Math.abs(Math.sin(phase)) * 0.03;
    } else {
      // Volta suavemente à posição de repouso.
      for (const p of [legL, legR, armL, armR]) p.rotation.x *= Math.max(0, 1 - dt * 10);
      body.position.y *= Math.max(0, 1 - dt * 10);
    }
  };

  return { root, animate };
}
