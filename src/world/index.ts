import * as THREE from 'three';
import { canvas } from '../ui/art/svg';
import { placedObject } from '../ui/art/objects';
import { notebook } from '../ui/components/diario';
import { h } from '../ui/dom';
import { cameraDistance, resolveCircle } from './collision';
import { Input } from './input';
import { pickInteractable } from './interaction';
import { clampPitch, clampToRadius, headingOf, moveDelta, orbitPosition, turnTowards } from './motion';
import { createPlayer } from './player';
import { createPost, type Post } from './post';
import { buildRancho, PLAYER_RADIUS, type ExamineInfo, type SceneInteractable } from './scenes/rancho';
import type { ExploreSession } from './session';

export { createSession } from './session';

/**
 * Ponto de entrada do modo 3D. Este arquivo (e o Three.js) só é baixado
 * quando o jogador abre a exploração, por import() dinâmico em main.ts.
 */
export interface WorldOptions {
  caseTitle: string;
  locationName: string;
  backHref: string;
  /** Progresso da busca deste lugar, compartilhado com a versão 2D. */
  session: ExploreSession;
}

export interface WorldHandle {
  dispose(): void;
}

type Mode = 'intro' | 'playing' | 'paused' | 'examine' | 'journal';

const CAMERA_DISTANCE = 4.6;
const HEAD_HEIGHT = 1.65;
/** Com a câmera mais perto que isso, ela estaria dentro do personagem: ele some. */
const HIDE_PLAYER_BELOW = 0.7;
const QUALITY_KEY = 'pericia-historica:3d-graficos';

/** Preferência só deste navegador: perder o valor não quebra nada. */
function loadQuality(): boolean {
  try {
    return localStorage.getItem(QUALITY_KEY) !== 'baixo';
  } catch {
    return true;
  }
}

function saveQuality(high: boolean): void {
  try {
    localStorage.setItem(QUALITY_KEY, high ? 'alto' : 'baixo');
  } catch {
    // sem armazenamento: a escolha vale só nesta sessão
  }
}

const NATURE_LABEL: Record<ExamineInfo['nature'], string> = {
  dramatizado: 'Reconstrução dramatizada',
  documentado: 'Documentado',
};

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

function formatTime(ms: number): string {
  const sec = Math.round(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

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
  // Com pós-processamento há várias renderizações por quadro; as estatísticas
  // são zeradas à mão no início do quadro para medir o quadro inteiro.
  renderer.info.autoReset = false;
  renderer.domElement.className = 'world-canvas';
  renderer.domElement.tabIndex = 0;
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  // Noite verde-azulada, como na referência: escura, mas legível.
  const night = new THREE.Color(0x10201f);
  scene.background = night;
  scene.fog = new THREE.FogExp2(night, 0.034);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);

  const player = createPlayer();
  const { session } = opts;
  const world = buildRancho(() => ({ x: player.root.position.x, z: player.root.position.z }), session);
  scene.add(world.root);
  player.root.position.copy(world.spawn);
  player.root.rotation.y = Math.PI; // de frente para a casa
  scene.add(player.root);

  /* ---------- Qualidade gráfica ---------- */

  let high = loadQuality();
  let post: Post | null = null;
  const applyQuality = () => {
    world.setQuality(high);
    if (high && !post) {
      post = createPost(renderer, scene, camera);
      post.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    } else if (!high && post) {
      post.dispose();
      post = null;
    }
  };

  /* ---------- Interface sobreposta ---------- */

  const hud = el('div', 'world-hud');
  hud.append(el('p', 'world-eyebrow', `${opts.caseTitle} · protótipo 3D, etapa 3`), el('p', 'world-place', opts.locationName));
  const help = el('p', 'world-help', 'W A S D andar · Shift correr · mouse olhar · E examinar · J diário · Esc pausar');
  const prompt = el('p', 'world-prompt');
  prompt.hidden = true;
  prompt.setAttribute('aria-live', 'polite');
  // Contador da busca, no canto: o mesmo progresso da versão 2D.
  const counter = el('p', 'world-counter');
  counter.setAttribute('aria-live', 'polite');
  const refreshCounter = () => {
    counter.textContent = session.isComplete()
      ? 'Busca concluída · J diário'
      : `Objetos ${session.foundCount()}/${session.targets.length} · J diário`;
  };
  refreshCounter();
  const overlay = el('div', 'world-overlay');
  const card = el('div', 'world-card');
  card.setAttribute('role', 'dialog');
  overlay.append(card);
  container.append(hud, counter, help, prompt, overlay);

  let mode: Mode = 'intro';
  let focused: SceneInteractable | null = null;

  const input = new Input(renderer.domElement, {
    // Esc só pausa; para voltar, o jogador clica em "Continuar" (o navegador
    // exige um gesto para capturar o mouse de novo).
    pause: () => {
      if (mode === 'playing' || mode === 'examine' || mode === 'journal') setMode('paused');
    },
    // J abre e fecha o diário.
    journal: () => {
      if (mode === 'journal') void resume();
      else if (mode === 'playing') showJournal();
    },
    // E usa o objeto em foco; no painel de exame, E também fecha o painel.
    interact: () => {
      if (mode === 'examine') void resume();
      else if (mode === 'playing' && focused) {
        const shown = focused.use();
        refreshCounter();
        if (shown) showExamine(shown);
      }
    },
  });

  const resume = async () => {
    await input.lock();
    // O relógio da busca começa quando o jogador começa a explorar (se a cena
    // não foi iniciada na versão 2D nem concluída).
    session.begin();
    setMode('playing');
    renderer.domElement.focus();
  };

  function actions(primary: string): HTMLDivElement {
    const go = el('button', 'btn primary', primary);
    go.addEventListener('click', () => void resume());
    const back = el('a', 'btn ghost', 'Voltar ao caso');
    back.href = opts.backHref;
    const row = el('div', 'world-actions');
    row.append(go, back);
    queueMicrotask(() => go.focus());
    return row;
  }

  function setMode(next: Mode): void {
    mode = next;
    overlay.hidden = next === 'playing';
    help.hidden = next !== 'playing';
    prompt.hidden = true;
    if (next === 'playing' || next === 'examine') return;
    input.unlock();
    const title = next === 'intro' ? opts.locationName : 'Pausa';
    const text =
      next === 'intro'
        ? session.isComplete()
          ? 'Reconstrução dramatizada de um rancho do pampa em 1892. A busca deste lugar já foi concluída; os cartões liberados estão no diário (J).'
          : `Reconstrução dramatizada de um rancho do pampa em 1892. Encontre e examine os ${session.targets.length} objetos da busca (E) para liberar os cartões deste lugar. O relógio começa quando você entra. O que achar aqui vale também na versão 2D.`
        : 'O jogo está pausado.';
    card.className = 'world-card';
    const quality = el('button', 'btn ghost world-quality', `Gráficos: ${high ? 'alto' : 'baixo'}`);
    quality.title = 'Baixo desliga brilho, gradação de cor e sombras da lamparina, e reduz o capim';
    quality.addEventListener('click', () => {
      high = !high;
      saveQuality(high);
      applyQuality();
      quality.textContent = `Gráficos: ${high ? 'alto' : 'baixo'}`;
    });
    card.replaceChildren(el('h2', '', title), el('p', '', text), actions(next === 'intro' ? 'Explorar' : 'Continuar'), quality);
  }

  /** Painel de exame: o mouse é liberado para ler e clicar; E ou o botão voltam. */
  function showExamine(info: ExamineInfo): void {
    openPanel('examine', 'world-card world-examine');
    const parts: (HTMLElement | SVGElement)[] = [];
    if (info.object) {
      const art = canvas('-30 -30 60 60', info.title);
      art.root.append(placedObject(info.object, art.hatch, 0, 0, 0, 1.15));
      art.root.classList.add('world-examine-art');
      parts.push(art.root);
    }
    parts.push(
      el('p', `world-nature${info.nature === 'documentado' ? ' is-doc' : ''}`, NATURE_LABEL[info.nature]),
      el('h2', '', info.title),
      ...info.paragraphs.map((t) => el('p', '', t)),
    );
    const f = info.find;
    if (f?.completed) {
      parts.push(
        h(
          'div',
          { class: 'world-result' },
          h('p', { class: 'world-result-title' }, 'Busca concluída'),
          h('p', { class: 'search-stars', 'aria-label': `${f.stars} de 5 estrelas` }, stars(f.stars ?? 0)),
          h('p', {}, `Tempo ${formatTime(f.elapsedMs ?? 0)}. Liberados no diário: ${(f.released ?? []).map((e) => e.title).join('; ')}.`),
        ),
      );
    } else if (f?.isNew) {
      parts.push(el('p', 'world-status', `Registrado no diário · ${session.foundCount()} de ${session.targets.length}`));
    } else if (f) {
      parts.push(el('p', 'world-status', 'Já registrado no diário.'));
    }
    parts.push(actions('Voltar à exploração (E)'));
    card.replaceChildren(...parts);
  }

  /** Diário em caderno, o mesmo componente da versão 2D. */
  function showJournal(): void {
    openPanel('journal', 'world-card world-notebook-host');
    card.replaceChildren(notebook(session.caseFile, session.state(), { initial: 'objetos', onClose: () => void resume(), closeLabel: 'Fechar o diário (J)' }));
    card.querySelector<HTMLElement>('.nb-tab.is-active')?.focus();
  }

  /** Abre um painel que solta o mouse (exame, diário). */
  function openPanel(next: 'examine' | 'journal', cls: string): void {
    mode = next;
    input.unlock();
    overlay.hidden = false;
    help.hidden = true;
    prompt.hidden = true;
    card.className = cls;
  }

  setMode('intro');

  // Sair do pointer lock (Esc do navegador) pausa o jogo. No exame o mouse já
  // está solto de propósito, então não conta.
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
    post?.setSize(w, h);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  applyQuality();

  /* ---------- Loop ---------- */

  let yaw = 0;
  let pitch = 0.28;
  let camDist = CAMERA_DISTANCE;
  // O ponto que a câmera segue é suavizado; a câmera em si é posta exatamente
  // na órbita em volta dele. Suavizar a posição da câmera (como na etapa 1)
  // faria ela cortar caminho por dentro das paredes nas curvas.
  const target = new THREE.Vector3(world.spawn.x, HEAD_HEIGHT, world.spawn.z);
  const follow = new THREE.Vector3();
  const timer = new THREE.Timer();
  let frame = 0;

  const tick = (now?: number) => {
    frame = requestAnimationFrame(tick);
    renderer.info.reset();
    timer.update(now);
    // Passo limitado: se o jogo engasgar, ninguém atravessa paredes num salto.
    const dt = Math.min(timer.getDelta(), 0.05);
    const time = timer.getElapsed();
    const pos = player.root.position;

    let speed = 0;
    if (mode === 'playing') {
      const look = input.consumeLook();
      yaw += look.yaw;
      pitch = clampPitch(pitch + look.pitch);
      const d = moveDelta(input.move, yaw, dt);
      if (d.moving) {
        const wanted = clampToRadius({ x: pos.x + d.x, z: pos.z + d.z }, world.boundsRadius);
        const p = resolveCircle(wanted, PLAYER_RADIUS, world.colliders());
        // Velocidade real (depois da colisão): encostado na parede, o passo diminui.
        speed = Math.hypot(p.x - pos.x, p.z - pos.z) / dt;
        pos.x = p.x;
        pos.z = p.z;
        player.root.rotation.y = turnTowards(player.root.rotation.y, headingOf(d), dt * 10);
      }

      focused = pickInteractable(pos, yaw, world.interactables);
      prompt.hidden = !focused;
      if (focused) prompt.textContent = `E  ${focused.label()}`;
    } else {
      input.consumeLook();
    }
    player.animate(dt, speed);
    world.update(time, dt);

    target.lerp(follow.set(pos.x, HEAD_HEIGHT, pos.z), 1 - Math.exp(-dt * 14));
    const ideal = orbitPosition(target, yaw, pitch, CAMERA_DISTANCE);
    const allowed = cameraDistance(target, ideal, world.colliders());
    // Aproxima na hora (para não mostrar o outro lado da parede) e se afasta devagar.
    camDist = allowed < camDist ? allowed : camDist + (allowed - camDist) * (1 - Math.exp(-dt * 4));
    const o = orbitPosition(target, yaw, pitch, camDist);
    camera.position.set(o.x, Math.max(0.3, o.y), o.z);
    camera.lookAt(target);
    player.root.visible = camDist > HIDE_PLAYER_BELOW;

    if (post) post.render();
    else renderer.render(scene, camera);
  };
  tick();

  if (import.meta.env.DEV) {
    // Gancho só de desenvolvimento, para os testes de navegador lerem e
    // posicionarem o estado (o navegador de teste roda a poucos quadros/s).
    (window as unknown as Record<string, unknown>).__pericia3d = {
      get player() {
        return { x: player.root.position.x, z: player.root.position.z };
      },
      get mode() {
        return mode;
      },
      get camDist() {
        return camDist;
      },
      get focused() {
        return focused?.id ?? null;
      },
      get found() {
        return session.foundCount();
      },
      get view() {
        return { yaw, pitch };
      },
      place(x: number, z: number, viewYaw = yaw, viewPitch = pitch) {
        player.root.position.set(x, 0, z);
        target.set(x, HEAD_HEIGHT, z);
        yaw = viewYaw;
        pitch = viewPitch;
      },
      info: renderer.info,
    };
  }

  return {
    dispose() {
      cancelAnimationFrame(frame);
      timer.dispose();
      post?.dispose();
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
