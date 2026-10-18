import * as THREE from 'three';
import type { ObjectId } from '../../engine/types';
import { OBJECT_NAMES } from '../../ui/art/objects';
import { box, circle, overlaps, type Collider } from '../collision';
import type { Interactable } from '../interaction';
import type { Vec2 } from '../motion';
import { adobeTexture, dirtTexture, groundTexture, sizedBox, thatchTexture, woodTexture } from '../materials';
import { buildProp, createGlint, glintTexture } from '../props';
import { buildVegetation } from '../vegetation';
import type { ExploreSession, FindOutcome } from '../session';
import { BENCH, DOOR_H, DOOR_X0, DOOR_X1, HOUSE_D, HOUSE_W, HOUSE_Z, INNER, QUARTO, RIDGE, SEARCH_SPOTS, TABLE, TRUNK, WALL_H, WALL_T, WINDOWS } from './rancho-layout';

/**
 * O rancho de Francisca Rojas, Necochea, 1892: reconstrução dramatizada.
 *
 * O caso não descreve a casa. O cenário segue a arquitetura rural típica do
 * pampa bonaerense da época: rancho baixo de adobe caiado, telhado de palha,
 * ramada na frente, curral de estacas e um ombú. Unidades em metros; a frente
 * da casa olha para +z, onde o jogador começa.
 *
 * Etapa 3: os oito objetos da busca do rancho estão espalhados pela casa e
 * pelo terreiro. Examinar um objeto o registra no mesmo progresso da busca
 * 2D; com os oito, a cena é concluída e o marco da porta do quarto mostra a
 * mancha do cartão documentado, que passa a poder ser examinada.
 */

/**
 * O que o painel de exame mostra. `nature` separa o que é fato documentado
 * (texto dos cartões do caso) do que é peça de cena.
 */
export interface ExamineInfo {
  object?: ObjectId;
  title: string;
  nature: 'dramatizado' | 'documentado';
  paragraphs: string[];
  /** Resultado do registro, quando o exame é de um objeto da busca. */
  find?: FindOutcome;
}

export interface SceneInteractable extends Interactable {
  /** Usa o objeto. Devolve o que mostrar, quando é um exame. */
  use(): ExamineInfo | void;
}

export interface SceneBuild {
  root: THREE.Group;
  spawn: THREE.Vector3;
  /** Raio do terreno onde o jogador pode andar. */
  boundsRadius: number;
  /** Obstáculos atuais (a porta muda conforme abre ou fecha). */
  colliders(): readonly Collider[];
  interactables: SceneInteractable[];
  update(time: number, dt: number): void;
  /** Gráficos alto/baixo: sombras da lamparina e densidade do capim. */
  setQuality(high: boolean): void;
}

/** Raio do jogador para as colisões, o mesmo usado em index.ts. */
export const PLAYER_RADIUS = 0.3;
/** Intensidade da lamparina e da claridade que escapa para o terreiro (calibradas para exposição 1,5). */
const LAMP_POWER = 1.0;
const SPILL_POWER = 16;

/** Descrições dos objetos da busca: peças de cena, sem relação com os fatos do caso. */
const PROP_TEXT: Partial<Record<ObjectId, string>> = {
  lamparina: 'Lamparina a querosene, a iluminação comum no campo no fim do século XIX.',
  xicara: 'Xícara de louça, de uso diário.',
  chapeu: 'Chapéu de feltro de aba larga, como os usados no campo.',
  vela: 'Vela de sebo num prato de lata, apagada.',
  chave: 'Chave de ferro, de fechadura simples.',
  pente: 'Pente de chifre.',
  moeda: 'Moeda de cobre.',
  botao: 'Botão de osso, de roupa de trabalho.',
};
const PROP_NOTE = 'Peça de cena criada para a busca: o processo de 1892 não descreve os objetos da casa, e este não é um indício do caso.';

/**
 * Mancha escura e irregular, de sangue seco, para o batente: manchas
 * sobrepostas com bordas suaves, sem detalhe gráfico. As "linhas finas e
 * curvas" do cartão são descobertas no laboratório, não desenhadas aqui.
 */
function stainTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d')!;
  const blobs = [
    [32, 60, 22],
    [26, 74, 16],
    [38, 46, 14],
    [30, 90, 10],
  ] as const;
  for (const [x, y, r] of blobs) {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(46,16,10,0.95)');
    grad.addColorStop(0.7, 'rgba(52,20,12,0.75)');
    grad.addColorStop(1, 'rgba(52,20,12,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Gerador determinístico, para a vegetação ficar sempre no mesmo lugar. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

export function buildRancho(getPlayer: () => Vec2, session: ExploreSession): SceneBuild {
  const root = new THREE.Group();
  root.name = 'rancho';
  const r = rng(1892);
  const colliders: Collider[] = [];

  const adobe = new THREE.MeshStandardMaterial({ map: adobeTexture(), roughness: 0.95 });
  const thatch = new THREE.MeshStandardMaterial({ map: thatchTexture(), roughness: 1, side: THREE.DoubleSide });
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.9 });

  const add = <T extends THREE.Object3D>(o: T, shadow = true, parent: THREE.Object3D = root): T => {
    o.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = shadow;
        c.receiveShadow = true;
      }
    });
    parent.add(o);
    return o;
  };

  /** Caixa visível que também é obstáculo, com a mesma posição e tamanho. */
  const solidBox = (mat: THREE.Material, cx: number, cy: number, cz: number, w: number, h: number, d: number, flags?: { solid?: boolean; camera?: boolean }, tile = 3) => {
    const mesh = new THREE.Mesh(sizedBox(w, h, d, tile), mat);
    mesh.position.set(cx, cy, cz);
    add(mesh);
    colliders.push(box(cx, cy, cz, w, h, d, flags));
    return mesh;
  };

  /* ---------- Chão ---------- */

  const ground = new THREE.Mesh(new THREE.CircleGeometry(120, 48), new THREE.MeshStandardMaterial({ map: groundTexture(), color: 0x8fa38a, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  const dirt = new THREE.MeshStandardMaterial({ map: dirtTexture(), roughness: 1 });
  const yard = new THREE.Mesh(new THREE.CircleGeometry(7.5, 32), dirt);
  yard.rotation.x = -Math.PI / 2;
  yard.position.set(0, 0.01, HOUSE_Z + 5);
  yard.receiveShadow = true;
  root.add(yard);

  /* ---------- A casa: paredes em trechos, com o vão da porta ---------- */

  const front = HOUSE_Z + HOUSE_D / 2;
  const back = HOUSE_Z - HOUSE_D / 2;
  const left = -HOUSE_W / 2;
  const right = HOUSE_W / 2;
  const midY = WALL_H / 2;

  // Chão de terra batida por dentro.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HOUSE_W - WALL_T * 2, HOUSE_D - WALL_T * 2), dirt);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.02, HOUSE_Z);
  floor.receiveShadow = true;
  root.add(floor);

  solidBox(adobe, 0, midY, back + WALL_T / 2, HOUSE_W, WALL_H, WALL_T); // fundos
  solidBox(adobe, left + WALL_T / 2, midY, HOUSE_Z, WALL_T, WALL_H, HOUSE_D - WALL_T * 2); // lado esquerdo
  solidBox(adobe, right - WALL_T / 2, midY, HOUSE_Z, WALL_T, WALL_H, HOUSE_D - WALL_T * 2); // lado direito
  const fz = front - WALL_T / 2;
  solidBox(adobe, (left + DOOR_X0) / 2, midY, fz, DOOR_X0 - left, WALL_H, WALL_T); // frente, à esquerda da porta
  solidBox(adobe, (DOOR_X1 + right) / 2, midY, fz, right - DOOR_X1, WALL_H, WALL_T); // frente, à direita
  // Verga sobre a porta: só a câmera bate nela (o jogador passa por baixo).
  solidBox(adobe, (DOOR_X0 + DOOR_X1) / 2, (DOOR_H + WALL_H) / 2, fz, DOOR_X1 - DOOR_X0, WALL_H - DOOR_H, WALL_T, { solid: false });

  // Batentes de madeira no vão.
  for (const x of [DOOR_X0, DOOR_X1]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.08, DOOR_H, WALL_T + 0.04), wood);
    jamb.position.set(x, DOOR_H / 2, fz);
    add(jamb);
  }

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
  // Para a câmera, telhado e empenas viram um volume só: ela não sobe através da palha.
  colliders.push(box(0, WALL_H + (RIDGE + 0.2) / 2, HOUSE_Z, HOUSE_W + 0.9, RIDGE + 0.2, HOUSE_D + 1, { solid: false }));

  // Janelas: por fora brilham (há luz lá dentro); por dentro mostram a noite.
  const glow = new THREE.MeshStandardMaterial({ color: 0x3a2412, emissive: 0xffa24a, emissiveIntensity: 1.6 });
  const nightGlass = new THREE.MeshStandardMaterial({ color: 0x0e1622, emissive: 0x1c2c42, emissiveIntensity: 0.8, roughness: 0.4 });
  const frameMat = wood;
  for (const x of [-2.8, 3]) {
    // Faces da caixa: +x, −x, +y, −y, +z (rua), −z (interior).
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.6, WALL_T + 0.02), [frameMat, frameMat, frameMat, frameMat, glow, nightGlass]);
    w.position.set(x, 1.55, fz);
    add(w, false);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.16), wood);
    sill.position.set(x, 1.21, front + 0.06);
    add(sill);
  }

  /* ---------- A porta: abre para dentro, girando no batente direito ---------- */

  const hinge = new THREE.Group();
  hinge.position.set(DOOR_X1 - 0.04, 0, fz);
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(DOOR_X1 - DOOR_X0 - 0.08, DOOR_H - 0.04, 0.08), wood);
  doorLeaf.position.set(-(DOOR_X1 - DOOR_X0 - 0.08) / 2, DOOR_H / 2, 0);
  add(doorLeaf, true, hinge);
  root.add(hinge);

  const leafW = DOOR_X1 - DOOR_X0 - 0.08;
  const doorClosed = box(DOOR_X0 + 0.04 + leafW / 2, DOOR_H / 2, fz, leafW, DOOR_H, 0.08);
  // Aberta, a folha fica encostada no batente, perpendicular à parede.
  const doorOpen = box(DOOR_X1 - 0.04, DOOR_H / 2, fz - leafW / 2, 0.08, DOOR_H, leafW);
  let doorIsOpen = false;
  let doorAngle = 0; // 0 fechada; −π/2·0,95 aberta (o sinal negativo gira para −z, para dentro)
  const OPEN_ANGLE = -Math.PI / 2 * 0.95;
  const doorCenter = { x: (DOOR_X0 + DOOR_X1) / 2, z: fz };

  /* ---------- Interior (cenografia) ---------- */

  // Mesa rústica, banco e baú na sala.
  const table = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.8), wood);
  top.position.y = 0.76;
  table.add(top);
  for (const [lx, lz] of [[-0.62, -0.32], [0.62, -0.32], [-0.62, 0.32], [0.62, 0.32]] as const) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.73, 0.07), wood);
    leg.position.set(lx, 0.365, lz);
    table.add(leg);
  }
  table.position.set(TABLE.x, 0, TABLE.z);
  add(table);
  colliders.push(box(TABLE.x, 0.4, TABLE.z, 1.4, 0.8, 0.8, { camera: false }));

  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.32), wood);
  bench.position.set(BENCH.x, 0.44, BENCH.z);
  add(bench);
  for (const lx of [-0.5, 0.5]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.28), wood);
    leg.position.set(BENCH.x + lx, 0.21, BENCH.z);
    add(leg);
  }
  colliders.push(box(BENCH.x, 0.24, BENCH.z, 1.2, 0.48, 0.32, { camera: false }));

  solidBox(wood, TRUNK.x, TRUNK.top / 2, TRUNK.z, 1, TRUNK.top, 0.55, { camera: false }, 1);

  // Peitoril interno da janela da sala (onde fica o pente).
  const innerSill = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.18), wood);
  innerSill.position.set(WINDOWS[0], 1.22, INNER.z1 - 0.08);
  add(innerSill);

  /* ---------- O quarto: parede interna e o marco da porta ---------- */

  // A parede vai do fundo à frente, com o vão da porta do quarto entre z0 e z1.
  solidBox(adobe, QUARTO.x, WALL_H / 2, (INNER.z0 + QUARTO.z0) / 2, QUARTO.t, WALL_H, QUARTO.z0 - INNER.z0);
  solidBox(adobe, QUARTO.x, WALL_H / 2, (QUARTO.z1 + INNER.z1) / 2, QUARTO.t, WALL_H, INNER.z1 - QUARTO.z1);
  solidBox(adobe, QUARTO.x, (DOOR_H + WALL_H) / 2, (QUARTO.z0 + QUARTO.z1) / 2, QUARTO.t, WALL_H - DOOR_H, QUARTO.z1 - QUARTO.z0, { solid: false });
  // Marco de madeira clara e gasta: dois batentes e a travessa. Na madeira
  // escura do resto da casa, a mancha escura não apareceria.
  const paleWood = new THREE.MeshStandardMaterial({ color: 0xa48c6c, roughness: 0.95 });
  const jambDepth = QUARTO.t + 0.06;
  const jambZ = [QUARTO.z0 + QUARTO.jamb / 2, QUARTO.z1 - QUARTO.jamb / 2] as const;
  for (const z of jambZ) solidBox(paleWood, QUARTO.x, DOOR_H / 2, z, jambDepth, DOOR_H, QUARTO.jamb, { camera: false }, 1);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(jambDepth, 0.08, QUARTO.z1 - QUARTO.z0), paleWood);
  lintel.position.set(QUARTO.x, DOOR_H + 0.04, (QUARTO.z0 + QUARTO.z1) / 2);
  add(lintel);

  // A mancha do cartão documentado, na face do batente voltada para a sala.
  // Só aparece com a busca concluída, a mesma regra que libera o cartão.
  const stainTex = stainTexture();
  const stain = new THREE.Mesh(new THREE.PlaneGeometry(0.078, 0.22), new THREE.MeshStandardMaterial({ map: stainTex, transparent: true, roughness: 0.9, depthWrite: false }));
  stain.rotation.y = -Math.PI / 2;
  const stainZ = jambZ[1];
  stain.position.set(QUARTO.x - jambDepth / 2 - 0.003, 1.15, stainZ);
  root.add(stain);

  /* ---------- Objetos da busca ---------- */

  const glintTex = glintTexture();
  const props: { id: ObjectId; glint: THREE.Sprite; baseY: number; phase: number }[] = [];
  let lampFlame: THREE.MeshStandardMaterial | undefined;
  for (const id of session.targets) {
    const spot = SEARCH_SPOTS[id];
    if (!spot) throw new Error(`o objeto ${id} não tem lugar no rancho 3D`);
    const built = buildProp(id);
    built.group.position.set(spot.x, spot.y, spot.z);
    built.group.rotation.y = spot.rot;
    add(built.group, id === 'chapeu');
    if (id === 'lamparina') lampFlame = built.flame;
    const glint = createGlint(glintTex);
    glint.position.set(spot.x, spot.y + 0.14, spot.z);
    root.add(glint);
    props.push({ id, glint, baseY: spot.y + 0.14, phase: props.length * 1.7 });
  }

  // A luz da lamparina ilumina a sala; uma segunda luz, fora, representa a
  // claridade que escapa pela porta e pelas janelas.
  const lampSpot = SEARCH_SPOTS.lamparina ?? { x: TABLE.x, y: TABLE.top, z: TABLE.z };
  const lampLight = new THREE.PointLight(0xffa04a, LAMP_POWER, 7, 1.6);
  lampLight.position.set(lampSpot.x, 1.1, lampSpot.z);
  // Sombra da lamparina: as paredes e os móveis passam a bloquear a luz, e
  // ela não atravessa mais as paredes para o lado de fora. Custa 6 passadas
  // extras (um cubo de sombra), por isso some no modo de gráficos baixo.
  lampLight.shadow.mapSize.set(512, 512);
  lampLight.shadow.camera.near = 0.05;
  lampLight.shadow.camera.far = 7;
  lampLight.shadow.bias = -0.003;
  root.add(lampLight);

  /* ---------- Ramada: alpendre de troncos e galhos em frente à porta ---------- */

  for (const x of [-3.6, -1.2, 1.2, 3.6]) {
    const px = x + (r() - 0.5) * 0.1;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.35, 6), wood);
    post.position.set(px, 1.17, front + 2.1);
    post.rotation.z = (r() - 0.5) * 0.06;
    add(post);
    colliders.push(circle(px, front + 2.1, 0.1, 2.35));
  }
  const ramada = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 2.4), wood);
  ramada.position.set(0, 2.38, front + 1.15);
  ramada.rotation.x = 0.09;
  add(ramada);
  colliders.push(box(0, 2.38, front + 1.15, 8, 0.25, 2.4, { solid: false }));

  /* ---------- Curral de estacas ---------- */

  const postGeo = new THREE.CylinderGeometry(0.05, 0.07, 1, 5);
  const fencePoints: THREE.Vector3[] = [];
  const corral = { x0: 8, x1: 15, z0: -10, z1: -1 };
  const gateZ = corral.z1 - 2.5;
  for (let x = corral.x0; x <= corral.x1; x += 0.55) fencePoints.push(new THREE.Vector3(x, 0, corral.z0), new THREE.Vector3(x, 0, corral.z1));
  for (let z = corral.z0 + 0.55; z < corral.z1; z += 0.55) {
    fencePoints.push(new THREE.Vector3(corral.x1, 0, z));
    if (z < gateZ) fencePoints.push(new THREE.Vector3(corral.x0, 0, z)); // porteira aberta
  }
  const fence = new THREE.InstancedMesh(postGeo, wood, fencePoints.length);
  const m = new THREE.Matrix4();
  fencePoints.forEach((p, i) => {
    const h = 1.1 + r() * 0.5;
    m.compose(new THREE.Vector3(p.x, h / 2, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.1, 0, (r() - 0.5) * 0.1)), new THREE.Vector3(1, h, 1));
    fence.setMatrixAt(i, m);
  });
  add(fence);
  // A cerca bloqueia o jogador como uma linha contínua (as estacas ficam a
  // menos de um corpo de distância), mas não a câmera, que enxerga entre elas.
  const fenceFlags = { camera: false };
  const cx = (corral.x0 + corral.x1) / 2;
  const cw = corral.x1 - corral.x0 + 0.15;
  colliders.push(
    box(cx, 0.7, corral.z0, cw, 1.4, 0.15, fenceFlags),
    box(cx, 0.7, corral.z1, cw, 1.4, 0.15, fenceFlags),
    box(corral.x1, 0.7, (corral.z0 + corral.z1) / 2, 0.15, 1.4, corral.z1 - corral.z0, fenceFlags),
    box(corral.x0, 0.7, (corral.z0 + gateZ) / 2, 0.15, 1.4, gateZ - corral.z0, fenceFlags),
  );

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
  colliders.push(circle(-10, -3, 0.95, 3.2));

  /* ---------- Vegetação, pedras e árvores ---------- */

  const yardZ = HOUSE_Z + 5;
  const vegetation = buildVegetation({
    seed: 1892,
    blocked: (x, z) => {
      const nearHouse = Math.abs(x) < HOUSE_W / 2 + 1.2 && z > HOUSE_Z - HOUSE_D / 2 - 1.2 && z < front + 3.2;
      const inYard = Math.hypot(x, z - yardZ) < 6.8;
      const nearTree = Math.hypot(x + 10, z + 3) < 1.6;
      // Nada cresce em cima dos objetos da busca: escondê-los no capim seria injusto.
      const onSpot = Object.values(SEARCH_SPOTS).some((sp) => sp && Math.hypot(x - sp.x, z - sp.z) < 1.1);
      return nearHouse || inYard || nearTree || onSpot;
    },
  });
  root.add(vegetation.root);
  colliders.push(...vegetation.colliders);

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
  // Cor acima de 1 (HDR): a lua passa do limiar do bloom e ganha um halo.
  const moon = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.0), fog: false }));
  moon.position.copy(moonDir.clone().multiplyScalar(180));
  root.add(moon);

  /* ---------- Luzes ---------- */

  // Noite verde-azulada (como a referência): céu frio, chão escuro. A luz
  // ambiente não conhece paredes (ilumina o interior como o exterior), então
  // fica fraca: fora, quem ilumina é o luar (com sombra); dentro, a lamparina.
  root.add(new THREE.HemisphereLight(0x5f8f8a, 0x1d2418, 0.75));

  const moonLight = new THREE.DirectionalLight(0xa9cfc4, 3.2);
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

  // Afastada da fachada: colada nela, estourava a parede quando a câmera se aproxima.
  const warm = new THREE.PointLight(0xffa04a, SPILL_POWER, 12, 1.2);
  warm.position.set(0.4, 2, front + 1.8);
  root.add(warm);

  /* ---------- Interações ---------- */

  const interactables: SceneInteractable[] = [
    {
      id: 'porta',
      at: doorCenter,
      reach: 1.6,
      label: () => (doorIsOpen ? 'Fechar a porta' : 'Abrir a porta'),
      // Não fecha a porta em cima do jogador.
      enabled: () => !doorIsOpen || !overlaps(getPlayer(), PLAYER_RADIUS, [doorClosed]),
      use: () => {
        doorIsOpen = !doorIsOpen;
      },
    },
    ...props.map(({ id }): SceneInteractable => {
      const spot = SEARCH_SPOTS[id]!;
      const name = OBJECT_NAMES[id];
      return {
        id,
        at: { x: spot.x, z: spot.z },
        reach: 1.5,
        label: () => `Examinar: ${name}${session.isFound(id) ? ' (registrado)' : ''}`,
        use: () => ({
          object: id,
          title: name,
          nature: 'dramatizado',
          paragraphs: [`${PROP_TEXT[id] ?? name} Está ${spot.where}.`, PROP_NOTE],
          find: session.find(id),
        }),
      };
    }),
    {
      id: 'mancha',
      at: { x: QUARTO.x - 0.3, z: stainZ },
      reach: 1.4,
      label: () => 'Examinar o marco da porta do quarto',
      enabled: () => session.isComplete(),
      use: () => {
        const card = session.evidence('mancha');
        if (!card) return;
        return { title: card.title, nature: card.dramatized ? 'dramatizado' : 'documentado', paragraphs: card.paragraphs };
      },
    },
  ];

  return {
    root,
    spawn: new THREE.Vector3(0, 0, 9),
    boundsRadius: 30,
    colliders: () => [...colliders, doorIsOpen ? doorOpen : doorClosed],
    interactables,
    setQuality(high: boolean) {
      lampLight.castShadow = high;
      vegetation.setDensity(high ? 1 : 0.4);
    },
    update(time: number, dt: number) {
      vegetation.update(time);
      // A chama da lamparina tremula, e a claridade lá fora acompanha.
      const flicker = 0.88 + Math.sin(time * 7.3) * 0.06 + Math.sin(time * 13.1) * 0.04;
      warm.intensity = SPILL_POWER * flicker;
      lampLight.intensity = LAMP_POWER * flicker;
      glow.emissiveIntensity = 1.6 * flicker;
      if (lampFlame) lampFlame.emissiveIntensity = 3 * flicker;

      // Brilho pulsante nos objetos ainda não registrados.
      for (const p of props) {
        const found = session.isFound(p.id);
        p.glint.visible = !found;
        if (found) continue;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.4 + p.phase);
        p.glint.material.opacity = 0.35 + pulse * 0.5;
        p.glint.scale.setScalar(0.14 + pulse * 0.08);
        p.glint.position.y = p.baseY + pulse * 0.02;
      }
      stain.visible = session.isComplete();

      // A porta gira suavemente até o ângulo alvo (amortecimento exponencial).
      const targetAngle = doorIsOpen ? OPEN_ANGLE : 0;
      doorAngle += (targetAngle - doorAngle) * (1 - Math.exp(-dt * 8));
      hinge.rotation.y = doorAngle;
    },
  };
}
