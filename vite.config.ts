import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos: o build funciona em qualquer subpasta, como
  // https://<usuario>.github.io/pericia-historica/, sem fixar o nome do repo.
  base: './',
  build: {
    // O pacote do modo 3D (Three.js, ~570 KB, ~150 KB comprimido) só é baixado
    // quando o jogador abre a exploração, por import() dinâmico.
    chunkSizeWarningLimit: 650,
  },
});
