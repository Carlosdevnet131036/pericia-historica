import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Pós-processamento: a cena é desenhada numa textura e passa por filtros
 * antes de ir para a tela.
 *
 *   RenderPass → Bloom → Gradação de cor + vinheta → OutputPass
 *
 * - Bloom: as luzes fortes (janelas, chama, lua) "vazam" um halo, como numa
 *   lente de verdade. Só o que passa do limiar brilha.
 * - Gradação: sombras puxadas para o verde-azulado e luzes para o âmbar (o
 *   contraste frio/quente da referência), mais uma vinheta nas bordas.
 * - OutputPass: aplica o tone mapping e converte para sRGB (no caminho sem
 *   pós-processamento, o próprio renderer faz isso).
 */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uShadow: { value: new THREE.Color(0x0d2a2a) },
    uHighlight: { value: new THREE.Color(0xffb36b) },
    uVignette: { value: 0.55 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec3 uShadow;
    uniform vec3 uHighlight;
    uniform float uVignette;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      // Tons escuros ganham um pouco de verde-azulado; tons claros, de âmbar.
      c.rgb += uShadow * (1.0 - smoothstep(0.0, 0.35, l)) * 0.35;
      c.rgb = mix(c.rgb, c.rgb * uHighlight * 1.4, smoothstep(0.55, 1.2, l) * 0.25);
      float d = distance(vUv, vec2(0.5));
      c.rgb *= 1.0 - smoothstep(0.35, 0.85, d) * uVignette;
      gl_FragColor = c;
    }`,
};

export interface Post {
  render(): void;
  setSize(w: number, h: number): void;
  dispose(): void;
}

export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): Post {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // Força, raio e limiar: só as fontes de luz (bem acima de 1 em HDR) brilham.
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.6, 0.85);
  composer.addPass(bloom);
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);
  composer.addPass(new OutputPass());
  return {
    render: () => composer.render(),
    setSize: (w, h) => {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(w, h);
    },
    dispose: () => {
      bloom.dispose();
      grade.dispose();
      composer.dispose();
    },
  };
}
