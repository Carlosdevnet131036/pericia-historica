import * as THREE from 'three';

/**
 * Texturas procedurais desenhadas em canvas: nenhum arquivo externo, nenhuma
 * licença a conferir e carregamento instantâneo. Cada função devolve uma
 * textura nova; quem cria é responsável por chamar dispose().
 */

function noiseCanvas(size: number, base: string, specks: { color: string; count: number; w: number; h: number }[], seed: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);
  let a = seed >>> 0;
  const r = () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
  for (const sp of specks) {
    g.fillStyle = sp.color;
    for (let i = 0; i < sp.count; i++) g.fillRect(r() * size, r() * size, sp.w * (0.5 + r()), sp.h * (0.5 + r()));
  }
  return c;
}

function toTexture(canvas: HTMLCanvasElement, repeat: number): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Adobe caiado: branco sujo com manchas de barro e rachaduras finas. */
export function adobeTexture(): THREE.CanvasTexture {
  const c = noiseCanvas(
    256,
    '#c9bfa8',
    [
      { color: 'rgba(120,96,70,0.18)', count: 260, w: 14, h: 8 },
      { color: 'rgba(255,250,235,0.25)', count: 200, w: 10, h: 6 },
      { color: 'rgba(70,55,40,0.35)', count: 40, w: 1, h: 18 },
    ],
    11,
  );
  return toTexture(c, 1);
}

/** Palha do telhado: riscas inclinadas em tons de palha seca. */
export function thatchTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#6b5636';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const x = (i * 37) % 256;
    const y = (i * 91) % 256;
    g.strokeStyle = i % 3 ? 'rgba(160,130,80,0.5)' : 'rgba(40,30,18,0.6)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 3, y + 22);
    g.stroke();
  }
  return toTexture(c, 2);
}

/** Chão do pampa à noite: capim baixo e terra. */
export function groundTexture(): THREE.CanvasTexture {
  const c = noiseCanvas(
    256,
    '#2c3324',
    [
      { color: 'rgba(70,82,50,0.55)', count: 1400, w: 2, h: 5 },
      { color: 'rgba(20,22,14,0.5)', count: 600, w: 3, h: 3 },
      { color: 'rgba(90,80,55,0.35)', count: 300, w: 4, h: 2 },
    ],
    23,
  );
  return toTexture(c, 40);
}

/** Terra batida do terreiro em frente à casa. */
export function dirtTexture(): THREE.CanvasTexture {
  const c = noiseCanvas(
    256,
    '#3d3326',
    [
      { color: 'rgba(90,75,55,0.45)', count: 900, w: 3, h: 3 },
      { color: 'rgba(20,16,12,0.45)', count: 500, w: 2, h: 2 },
    ],
    37,
  );
  return toTexture(c, 6);
}

/** Madeira escura e gasta (postes, porta, ramada). */
export function woodTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#3a2a1c';
  g.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 3) {
    g.strokeStyle = x % 9 ? 'rgba(90,65,40,0.45)' : 'rgba(15,10,6,0.55)';
    g.beginPath();
    g.moveTo(x + Math.sin(x) * 2, 0);
    g.lineTo(x + Math.cos(x) * 2, 128);
    g.stroke();
  }
  return toTexture(c, 1);
}
