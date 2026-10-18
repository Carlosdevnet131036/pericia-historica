import * as THREE from 'three';
import { circle, type Collider } from './collision';

/**
 * Vegetação e pedras do terreno, geradas em código (sem arquivos externos).
 *
 * Desempenho: cada tipo é uma InstancedMesh, ou seja, uma única chamada de
 * desenho para milhares de cópias. O capim balança no vertex shader (a GPU
 * calcula o vento), sem custo de CPU por quadro. A densidade do capim pode
 * ser reduzida ao vivo (`setDensity`), mudando quantas instâncias são
 * desenhadas.
 */

export interface VegetationOptions {
  /** Pontos onde não deve nascer nada (casa, terreiro, curral...). */
  blocked(x: number, z: number): boolean;
  seed: number;
}

export interface Vegetation {
  root: THREE.Group;
  colliders: Collider[];
  update(time: number): void;
  /** 0 a 1: fração do capim desenhada (gráficos baixo/alto). */
  setDensity(f: number): void;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

/** Um tufo: várias folhas finas e inclinadas, com a ponta mais clara. */
function tuftGeometry(r: () => number): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const base = new THREE.Color(0x1d2a16);
  const tip = new THREE.Color(0x6b7a45);
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2;
    const lean = 0.08 + r() * 0.12;
    const h = 0.35 + r() * 0.35;
    const w = 0.025;
    const ox = (r() - 0.5) * 0.12;
    const oz = (r() - 0.5) * 0.12;
    const cx = Math.cos(a);
    const sz = Math.sin(a);
    pos.push(ox - sz * w, 0, oz + cx * w, ox + sz * w, 0, oz - cx * w, ox + cx * lean, h, oz + sz * lean);
    col.push(base.r, base.g, base.b, base.r, base.g, base.b, tip.r, tip.g, tip.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

/** Pedra: dodecaedro com os vértices deslocados, para não parecer sólido geométrico. */
function rockGeometry(r: () => number): THREE.BufferGeometry {
  const g = new THREE.DodecahedronGeometry(1, 0);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const k = 0.75 + r() * 0.5;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.6, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
}

export function buildVegetation(opts: VegetationOptions): Vegetation {
  const r = rng(opts.seed);
  const root = new THREE.Group();
  root.name = 'vegetacao';
  const colliders: Collider[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);

  const place = (count: number, radius: number, minR = 0) => {
    const out: { x: number; z: number }[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 20) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(minR * minR + r() * (radius * radius - minR * minR));
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (!opts.blocked(x, z)) out.push({ x, z });
    }
    return out;
  };

  /* ---------- Capim com vento ---------- */

  const grassSpots = place(7000, 34);
  const grassMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
  const uTime = { value: 0 };
  grassMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        // A ponta (y alto) balança; a base fica parada. A fase depende da
        // posição da instância, para o vento "passar" como uma onda.
        `#include <begin_vertex>
        float phase = uTime * 1.6 + instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.25;
        transformed.x += sin(phase) * 0.09 * transformed.y;
        transformed.z += cos(phase * 0.8) * 0.05 * transformed.y;`,
      );
  };
  const grass = new THREE.InstancedMesh(tuftGeometry(r), grassMat, grassSpots.length);
  grassSpots.forEach((p, i) => {
    // Até ~0,8 m: o capim do pampa no inverno, sem esconder o personagem.
    const s = 0.55 + r() * 0.5;
    q.setFromAxisAngle(up, r() * Math.PI * 2);
    m.compose(new THREE.Vector3(p.x, 0, p.z), q, new THREE.Vector3(s, s * (0.7 + r() * 0.4), s));
    grass.setMatrixAt(i, m);
  });
  grass.receiveShadow = true;
  root.add(grass);

  /* ---------- Arbustos ---------- */

  const bushMat = new THREE.MeshStandardMaterial({ color: 0x24331f, roughness: 1, flatShading: true });
  const bushGeo = new THREE.IcosahedronGeometry(1, 1);
  const bushSpots = place(60, 30, 9);
  const bushes = new THREE.InstancedMesh(bushGeo, bushMat, bushSpots.length * 3);
  let bi = 0;
  for (const p of bushSpots) {
    const size = 0.45 + r() * 0.5;
    // Três esferas sobrepostas formam um arbusto irregular.
    for (let k = 0; k < 3; k++) {
      const s = size * (0.6 + r() * 0.5);
      q.setFromAxisAngle(up, r() * Math.PI);
      m.compose(new THREE.Vector3(p.x + (r() - 0.5) * size, s * 0.55, p.z + (r() - 0.5) * size), q, new THREE.Vector3(s, s * 0.8, s));
      bushes.setMatrixAt(bi++, m);
    }
    colliders.push(circle(p.x, p.z, size * 0.8, size * 1.2, { camera: false }));
  }
  bushes.castShadow = true;
  bushes.receiveShadow = true;
  root.add(bushes);

  /* ---------- Pedras ---------- */

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x5d625c, roughness: 0.95, flatShading: true });
  const rockSpots = place(45, 30, 7);
  const rocks = new THREE.InstancedMesh(rockGeometry(r), rockMat, rockSpots.length);
  rockSpots.forEach((p, i) => {
    const s = 0.15 + r() ** 2 * 0.6;
    q.setFromEuler(new THREE.Euler(r() * 0.4, r() * Math.PI * 2, r() * 0.4));
    m.compose(new THREE.Vector3(p.x, s * 0.2, p.z), q, new THREE.Vector3(s, s, s));
    rocks.setMatrixAt(i, m);
    if (s > 0.35) colliders.push(circle(p.x, p.z, s * 0.9, s, { camera: false }));
  });
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  root.add(rocks);

  /* ---------- Quebra-vento de eucaliptos atrás da casa (dramatizado) ---------- */

  const barkMat = new THREE.MeshStandardMaterial({ color: 0x6d6658, roughness: 0.9 });
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x1c2a22, roughness: 1, flatShading: true });
  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.3, 1, 7);
  const crownGeo = new THREE.IcosahedronGeometry(1, 0);
  const treeCount = 14;
  const trunks = new THREE.InstancedMesh(trunkGeo, barkMat, treeCount);
  const crowns = new THREE.InstancedMesh(crownGeo, crownMat, treeCount * 4);
  let ci = 0;
  for (let i = 0; i < treeCount; i++) {
    const x = -22 + i * 3.4 + (r() - 0.5) * 1.5;
    const z = -21 - r() * 4;
    const h = 9 + r() * 5;
    m.compose(new THREE.Vector3(x, h / 2, z), q.identity(), new THREE.Vector3(1, h, 1));
    trunks.setMatrixAt(i, m);
    for (let k = 0; k < 4; k++) {
      const s = 1.4 + r() * 1.2;
      q.setFromAxisAngle(up, r() * Math.PI);
      m.compose(new THREE.Vector3(x + (r() - 0.5) * 2, h * (0.6 + k * 0.12), z + (r() - 0.5) * 2), q, new THREE.Vector3(s, s * 1.5, s));
      crowns.setMatrixAt(ci++, m);
    }
    colliders.push(circle(x, z, 0.35, h));
  }
  trunks.castShadow = crowns.castShadow = true;
  root.add(trunks, crowns);

  return {
    root,
    colliders,
    update(time) {
      uTime.value = time;
    },
    setDensity(f) {
      grass.count = Math.round(grassSpots.length * Math.min(1, Math.max(0, f)));
    },
  };
}
