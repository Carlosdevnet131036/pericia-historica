import * as THREE from 'three';
import { Input } from './input';
import { clampPitch, clampToRadius, headingOf, moveDelta, orbitPosition, turnTowards } from './motion';
import { createPlayer } from './player';
import { buildRancho } from './scenes/rancho';

/**
 * Ponto de entrada do modo 3D. Este arquivo (e o Three.js) só é baixado
 * quando o jogador abre a exploração, por import() dinâmico em main.ts.
 */
export interface WorldOptions {
  caseTitle: string;
  locationName: string;
  backHref: string;
}

export interface WorldHandle {
  dispose(): void;
}

type Mode = 'intro' | 'playing' | 'paused';

const CAMERA_DISTANCE = 4.6;
const HEAD_HEIGHT = 1.65;

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Libera geometrias, materiais e texturas de tudo o que estiver na cena. */
function disposeTree(root: THREE.Object3D): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const mat of mats) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
      mat.dispose();
    }
  });
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  if (text) e.textContent = text;
  return e;
}

export function mountWorld(container: HTMLElement, opts: WorldOptions): WorldHandle {
  container.replaceChildren();
  container.classList.add('world');

  /* ---------- Renderizador ---------- */

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap foi removido no Three.js 0.186
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'world-canvas';
  renderer.domElement.tabIndex = 0;
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  // Noite verde-azulada, como na referência: escura, mas legível.
  const night = new THREE.Color(0x16202b);
  scene.background = night;
  scene.fog = new THREE.FogExp2(night, 0.02);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);

  const world = buildRancho();
  scene.add(world.root);

  const player = createPlayer();
  player.root.position.copy(world.spawn);
  player.root.rotation.y = Math.PI; // de frente para a casa
  scene.add(player.root);

  /* ---------- Interface sobreposta ---------- */

  const hud = el('div', 'world-hud');
  hud.append(el('p', 'world-eyebrow', `${opts.caseTitle} · protótipo 3D, etapa 1`), el('p', 'world-place', opts.locationName));
  const help = el('p', 'world-help', 'W A S D andar · Shift correr · mouse olhar · Esc pausar');
  const overlay = el('div', 'world-overlay');
  const card = el('div', 'world-card');
  overlay.append(card);
  container.append(hud, help, overlay);

  let mode: Mode = 'intro';
  // Esc só pausa; para voltar, o jogador clica em "Continuar" (o navegador
  // exige um clique para capturar o mouse de novo).
  const input = new Input(renderer.domElement, undefined, () => {
    if (mode === 'playing') setMode('paused');
  });

  const resume = async () => {
    await input.lock();
    setMode('playing');
    renderer.domElement.focus();
  };

  function setMode(next: Mode): void {
    mode = next;
    overlay.hidden = next === 'playing';
    help.hidden = next !== 'playing';
    if (next === 'playing') return;
    input.unlock();
    const title = next === 'intro' ? opts.locationName : 'Pausa';
    const text =
      next === 'intro'
        ? 'Reconstrução dramatizada de um rancho do pampa em 1892. Nesta etapa você só explora o terreno; as interações chegam nas próximas.'
        : 'O jogo está pausado.';
    const go = el('button', 'btn primary', next === 'intro' ? 'Explorar' : 'Continuar');
    go.addEventListener('click', () => void resume());
    const back = el('a', 'btn ghost', 'Voltar ao caso');
    back.href = opts.backHref;
    const actions = el('div', 'world-actions');
    actions.append(go, back);
    card.replaceChildren(el('h2', '', title), el('p', '', text), actions);
    go.focus();
  }
  setMode('intro');

  // Sair do pointer lock (Esc do navegador) pausa o jogo.
  const onLockChange = () => {
    if (!input.locked && mode === 'playing') setMode('paused');
  };
  document.addEventListener('pointerlockchange', onLockChange);

  /* ---------- Tamanho ---------- */

  const resize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  /* ---------- Loop ---------- */

  let yaw = 0;
  let pitch = 0.28;
  const target = new THREE.Vector3();
  const desired = new THREE.Vector3();
  const timer = new THREE.Timer();
  let frame = 0;

  const tick = (now?: number) => {
    frame = requestAnimationFrame(tick);
    timer.update(now);
    // Passo limitado: se o jogo engasgar, ninguém atravessa paredes num salto.
    const dt = Math.min(timer.getDelta(), 0.05);
    const time = timer.getElapsed();

    let speed = 0;
    if (mode === 'playing') {
      const look = input.consumeLook();
      yaw += look.yaw;
      pitch = clampPitch(pitch + look.pitch);
      const d = moveDelta(input.move, yaw, dt);
      if (d.moving) {
        const p = clampToRadius({ x: player.root.position.x + d.x, z: player.root.position.z + d.z }, world.boundsRadius);
        player.root.position.x = p.x;
        player.root.position.z = p.z;
        player.root.rotation.y = turnTowards(player.root.rotation.y, headingOf(d), dt * 10);
        speed = Math.hypot(d.x, d.z) / dt;
      }
    } else {
      input.consumeLook();
    }
    player.animate(dt, speed);
    world.update(time);

    // Câmera segue com suavidade (amortecimento exponencial, independe do fps).
    target.set(player.root.position.x, HEAD_HEIGHT, player.root.position.z);
    const o = orbitPosition(target, yaw, pitch, CAMERA_DISTANCE);
    desired.set(o.x, Math.max(0.4, o.y), o.z);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 12));
    camera.lookAt(target);

    renderer.render(scene, camera);
  };
  camera.position.copy(orbitPosition(new THREE.Vector3(world.spawn.x, HEAD_HEIGHT, world.spawn.z), yaw, pitch, CAMERA_DISTANCE));
  tick();

  if (import.meta.env.DEV) {
    // Gancho só de desenvolvimento, para os testes de navegador lerem o estado.
    (window as unknown as Record<string, unknown>).__pericia3d = {
      get player() {
        return { x: player.root.position.x, z: player.root.position.z };
      },
      get mode() {
        return mode;
      },
      info: renderer.info,
    };
  }

  return {
    dispose() {
      cancelAnimationFrame(frame);
      timer.dispose();
      observer.disconnect();
      document.removeEventListener('pointerlockchange', onLockChange);
      input.dispose();
      disposeTree(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      container.replaceChildren();
      container.classList.remove('world');
      if (import.meta.env.DEV) delete (window as unknown as Record<string, unknown>).__pericia3d;
    },
  };
}
