import * as THREE from 'three';

/**
 * Texturas fotográficas do modo 3D (Poly Haven, CC0; ver
 * public/texturas/CREDITOS.md e scripts/fetch_assets.py).
 *
 * Cada textura tem três mapas:
 * - diff: cor (sRGB);
 * - nor: normal no padrão OpenGL, que simula relevo sem mais polígonos;
 * - arm: oclusão (R), rugosidade (G) e metal (B) num arquivo só. O Three.js
 *   lê exatamente esses canais de aoMap, roughnessMap e metalnessMap, então o
 *   mesmo arquivo serve aos três.
 *
 * Se algum arquivo não carregar, a textura fica de fora da biblioteca e o
 * material usa a versão gerada em código: o 3D nunca deixa de abrir por causa
 * de uma imagem.
 */
export const TEXTURE_IDS = ['parede', 'telhado', 'campo', 'terra', 'madeira', 'eucalipto', 'casca'] as const;
export type TextureId = (typeof TEXTURE_IDS)[number];
export const MAP_NAMES = ['diff', 'nor', 'arm'] as const;

export interface PBRSet {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  arm: THREE.Texture;
}

export type TextureLibrary = Partial<Record<TextureId, PBRSet>>;

const url = (id: TextureId, name: string) => new URL(`texturas/${id}/${name}.jpg`, document.baseURI).href;

export async function loadTextures(onProgress?: (done: number, total: number) => void): Promise<TextureLibrary> {
  const loader = new THREE.TextureLoader();
  const total = TEXTURE_IDS.length * MAP_NAMES.length;
  let done = 0;
  const load = async (id: TextureId, name: string): Promise<THREE.Texture | null> => {
    try {
      const t = await loader.loadAsync(url(id, name));
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 4;
      if (name === 'diff') t.colorSpace = THREE.SRGBColorSpace;
      return t;
    } catch {
      return null;
    } finally {
      onProgress?.(++done, total);
    }
  };
  const entries = await Promise.all(
    TEXTURE_IDS.map(async (id) => {
      const [map, normalMap, arm] = await Promise.all(MAP_NAMES.map((n) => load(id, n)));
      if (!map || !normalMap || !arm) {
        // Conjunto incompleto: descarta o que veio e usa o material de reserva.
        for (const t of [map, normalMap, arm]) t?.dispose();
        return null;
      }
      return [id, { map, normalMap, arm }] as const;
    }),
  );
  return Object.fromEntries(entries.filter((e) => e !== null)) as TextureLibrary;
}

export interface PBROptions {
  /** Repetições da textura (em geometrias com UV de 0 a 1) ou 1/metros (UV métrico). */
  repeat?: [number, number];
  /** Material gerado em código, usado se a textura não carregou. */
  fallback(): THREE.MeshStandardMaterial;
  side?: THREE.Side;
  color?: THREE.ColorRepresentation;
  normalScale?: number;
}

/**
 * Material com a textura fotográfica. As cópias (`clone`) compartilham a
 * mesma imagem na GPU; só mudam a repetição, então várias superfícies podem
 * usar a mesma textura em escalas diferentes sem gastar memória a mais.
 */
export function pbrMaterial(lib: TextureLibrary, id: TextureId, opts: PBROptions): THREE.MeshStandardMaterial {
  const set = lib[id];
  if (!set) return opts.fallback();
  const [rx, ry] = opts.repeat ?? [1, 1];
  const copy = (t: THREE.Texture) => {
    const c = t.clone();
    c.repeat.set(rx, ry);
    c.needsUpdate = true;
    return c;
  };
  const arm = copy(set.arm);
  const ns = opts.normalScale ?? 1;
  return new THREE.MeshStandardMaterial({
    map: copy(set.map),
    normalMap: copy(set.normalMap),
    normalScale: new THREE.Vector2(ns, ns),
    aoMap: arm,
    roughnessMap: arm,
    metalnessMap: arm,
    roughness: 1,
    metalness: 1, // o canal B do ARM manda (é preto nestas texturas: nada é metálico)
    color: opts.color ?? 0xffffff,
    side: opts.side ?? THREE.FrontSide,
  });
}
