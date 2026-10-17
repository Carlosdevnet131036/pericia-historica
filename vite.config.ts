import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos: o build funciona em qualquer subpasta, como
  // https://<usuario>.github.io/pericia-historica/, sem fixar o nome do repo.
  base: './',
});
