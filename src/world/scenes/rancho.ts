import * as THREE from 'three';
import { adobeTexture, dirtTexture, groundTexture, thatchTexture, woodTexture } from '../materials';

/**
 * O rancho de Francisca Rojas, Necochea, 1892: reconstrução dramatizada.
 *
 * O caso não descreve a casa. O cenário segue a arquitetura rural típica do
 * pampa bonaerense da época: rancho baixo de adobe caiado, telhado de palha,
 * ramada na frente, curral de estacas e um ombú. Unidades em metros; a frente
 * da casa olha para +z, onde o jogador começa.
 *
 * Etapa 1: só o exterior, sem colisões nem objetos da busca.
 */
export interface SceneBuild {
  root: THREE.Group;
  spawn: THREE.Vector3;
  /** Raio do terreno onde o jogador pode andar. */
  boundsRadius: number;
  update(time: number): void;
}

const HOUSE_Z = -6;
const HOUSE_W = 9;
const HOUSE_D = 5;
const WALL_H = 2.6;
const RIDGE = 1.7;

/** Gerador determinístico, para a vegetação ficar sempre no mesmo lugar. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

export function buildRancho(): SceneBuild {
  const root = new THREE.Group();
  root.name = 'rancho';
  const r = rng(1892);

  const adobe = new THREE.MeshStandardMaterial({ map: adobeTexture(), roughness: 0.95 });
  const thatch = new THREE.MeshStandardMaterial({ map: thatchTexture(), roughness: 1, side: THREE.DoubleSide });
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.9 });

  const add = <T extends THREE.Object3D>(o: T, shadow = true): T => {
    o.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = shadow;
        c.receiveShadow = true;
      }
    });
    root.add(o);
    return o;
  };

  /* ---------- Chão ---------- */

  const ground = new THREE.Mesh(new THREE.CircleGeometry(120, 48), new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  const yard = new THREE.Mesh(new THREE.CircleGeometry(7.5, 32), new THREE.MeshStandardMaterial({ map: dirtTexture(), roughness: 1 }));
  yard.rotation.x = -Math.PI / 2;
  yard.position.set(0, 0.01, HOUSE_Z + 5);
  yard.receiveShadow = true;
  root.add(yard);

  /* ---------- A casa ---------- */

  const front = HOUSE_Z + HOUSE_D / 2;
  const walls = new THREE.Mesh(new THREE.BoxGeometry(HOUSE_W, WALL_H, HOUSE_D), adobe);
  walls.position.set(0, WALL_H / 2, HOUSE_Z);
  add(walls);

  // Empenas triangulares nas laterais.
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-HOUSE_D / 2, 0);
  gableShape.lineTo(HOUSE_D / 2, 0);
  gableShape.lineTo(0, RIDGE);
  gableShape.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.2, bevelEnabled: false });
  for (const side of [-1, 1]) {
    const g = new THREE.Mesh(gableGeo, adobe);
    g.rotation.y = Math.PI / 2;
    g.position.set(side * (HOUSE_W / 2) - (side > 0 ? 0.2 : 0), WALL_H, HOUSE_Z);
    add(g);
  }

  // Telhado de palha: duas águas, com beiral.
  const slope = Math.atan2(RIDGE, HOUSE_D / 2);
  const slopeLen = Math.hypot(RIDGE, HOUSE_D / 2) + 0.6;
  for (const side of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(HOUSE_W + 0.9, 0.28, slopeLen), thatch);
    roof.rotation.x = -side * slope; // cada água sobe em direção à cumeeira
    roof.position.set(0, WALL_H + RIDGE / 2 + 0.05, HOUSE_Z - side * (HOUSE_D / 4 + 0.1));
    add(roof);
  }

  // Porta e janelas na frente. As janelas brilham: há uma luz acesa lá dentro.
  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.08), wood);
  door.position.set(0.6, 1, front + 0.04);
  add(door);
  const glow = new THREE.MeshStandardMaterial({ color: 0x3a2412, emissive: 0xffa24a, emissiveIntensity: 1.6 });
  for (const x of [-2.8, 3]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.6, 0.06), glow);
    w.position.set(x, 1.55, front + 0.03);
    add(w, false);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.16), wood);
    sill.position.set(x, 1.21, front + 0.06);
    add(sill);
  }

  // Ramada: alpendre de troncos e galhos em frente à porta.
  for (const x of [-3.6, -1.2, 1.2, 3.6]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.35, 6), wood);
    post.position.set(x + (r() - 0.5) * 0.1, 1.17, front + 2.1);
    post.rotation.z = (r() - 0.5) * 0.06;
    add(post);
  }
  const ramada = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 2.4), wood);
  ramada.position.set(0, 2.38, front + 1.15);
  ramada.rotation.x = 0.09;
  add(ramada);

  /* ---------- Curral de estacas ---------- */

  const postGeo = new THREE.CylinderGeometry(0.05, 0.07, 1, 5);
  const fencePoints: THREE.Vector3[] = [];
  const corral = { x0: 8, x1: 15, z0: -10, z1: -1 };
  for (let x = corral.x0; x <= corral.x1; x += 0.55) fencePoints.push(new THREE.Vector3(x, 0, corral.z0), new THREE.Vector3(x, 0, corral.z1));
  for (let z = corral.z0 + 0.55; z < corral.z1; z += 0.55) {
    fencePoints.push(new THREE.Vector3(corral.x1, 0, z));
    if (z < corral.z1 - 2.5) fencePoints.push(new THREE.Vector3(corral.x0, 0, z)); // porteira aberta
  }
  const fence = new THREE.InstancedMesh(postGeo, wood, fencePoints.length);
  const m = new THREE.Matrix4();
  fencePoints.forEach((p, i) => {
    const h = 1.1 + r() * 0.5;
    m.compose(new THREE.Vector3(p.x, h / 2, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.1, 0, (r() - 0.5) * 0.1)), new THREE.Vector3(1, h, 1));
    fence.setMatrixAt(i, m);
  });
  add(fence);

  /* ---------- O ombú ---------- */

  const leaves = new THREE.MeshStandardMaterial({ color: 0x1f2a17, roughness: 1, flatShading: true });
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.1, 3.2, 8), wood);
  trunk.position.y = 1.6;
  tree.add(trunk);
  for (let i = 0; i < 6; i++) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8 + r() * 0.9, 0), leaves);
    blob.position.set((r() - 0.5) * 4, 3.8 + r() * 1.2, (r() - 0.5) * 4);
    tree.add(blob);
  }
  tree.position.set(-10, 0, -3);
  add(tree);

  /* ---------- Vegetação baixa (instanciada: uma chamada de desenho) ---------- */

  const tufts: THREE.Vector3[] = [];
  while (tufts.length < 500) {
    const x = (r() - 0.5) * 70;
    const z = (r() - 0.5) * 70;
    const nearHouse = Math.abs(x) < HOUSE_W / 2 + 2 && z > HOUSE_Z - HOUSE_D && z < front + 5;
    if (!nearHouse) tufts.push(new THREE.Vector3(x, 0, z));
  }
  const tuftMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.12, 0.32, 4), new THREE.MeshStandardMaterial({ color: 0x55603a, roughness: 1, flatShading: true }), tufts.length);
  tufts.forEach((p, i) => {
    const s = 0.6 + r() * 0.8;
    m.compose(new THREE.Vector3(p.x, 0.16 * s, p.z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    tuftMesh.setMatrixAt(i, m);
  });
  tuftMesh.receiveShadow = true;
  root.add(tuftMesh);

  /* ---------- Céu: estrelas e lua ---------- */

  const starPos = new Float32Array(700 * 3);
  for (let i = 0; i < 700; i++) {
    const theta = r() * Math.PI * 2;
    const phi = Math.acos(0.05 + r() * 0.95); // só acima do horizonte
    starPos.set([Math.sin(phi) * Math.cos(theta) * 200, Math.cos(phi) * 200, Math.sin(phi) * Math.sin(theta) * 200], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  root.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcfd6e0, size: 1.4, sizeAttenuation: false, fog: false })));

  const moonDir = new THREE.Vector3(-0.5, 0.6, -0.62).normalize();
  const moon = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), new THREE.MeshBasicMaterial({ color: 0xe8e4d6, fog: false }));
  moon.position.copy(moonDir.clone().multiplyScalar(180));
  root.add(moon);

  /* ---------- Luzes ---------- */

  root.add(new THREE.HemisphereLight(0x6f8fae, 0x2a2418, 1.7));

  const moonLight = new THREE.DirectionalLight(0xb4c8e4, 2.4);
  moonLight.position.copy(moonDir.clone().multiplyScalar(30));
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  const sc = moonLight.shadow.camera;
  sc.left = sc.bottom = -24;
  sc.right = sc.top = 24;
  sc.near = 1;
  sc.far = 80;
  moonLight.shadow.bias = -0.0005;
  root.add(moonLight);

  // Luz quente que escapa pela janela e pela fresta da porta.
  const warm = new THREE.PointLight(0xffa04a, 22, 12, 1.2);
  warm.position.set(0.4, 1.7, front + 0.8);
  root.add(warm);

  return {
    root,
    spawn: new THREE.Vector3(0, 0, 9),
    boundsRadius: 30,
    update(time: number) {
      // A chama da lamparina lá dentro tremula.
      const flicker = 0.88 + Math.sin(time * 7.3) * 0.06 + Math.sin(time * 13.1) * 0.04;
      warm.intensity = 22 * flicker;
      glow.emissiveIntensity = 1.6 * flicker;
    },
  };
}
