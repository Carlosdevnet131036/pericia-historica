import { describe, expect, it } from 'vitest';
import credits from '../../public/texturas/CREDITOS.md?raw';
import { MAP_NAMES, TEXTURE_IDS } from './textures';

// O site publicado depende destes arquivos: o teste falha se algum sumir.
// `?inline` devolve o arquivo como data URL em base64, o que dá o tamanho.
const files = import.meta.glob<string>('../../public/texturas/*/*.jpg', { query: '?inline', import: 'default', eager: true });
const bytes = (dataUrl: string) => Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);

describe('texturas do modo 3D', () => {
  it('cada textura tem os três mapas (cor, normal e ARM)', () => {
    for (const id of TEXTURE_IDS) {
      for (const name of MAP_NAMES) {
        const file = files[`../../public/texturas/${id}/${name}.jpg`];
        expect(file, `${id}/${name}.jpg`).toBeDefined();
        expect(bytes(file!), `${id}/${name}.jpg vazio`).toBeGreaterThan(1000);
      }
    }
  });

  it('todas aparecem nos créditos, com a licença CC0', () => {
    expect(credits).toContain('https://polyhaven.com/license');
    for (const id of TEXTURE_IDS) expect(credits, id).toContain(`| \`${id}\` |`);
  });

  it('o pacote de texturas cabe no orçamento (6 MB)', () => {
    const total = Object.values(files).reduce((sum, f) => sum + bytes(f), 0);
    expect(total).toBeGreaterThan(1024 * 1024);
    expect(total).toBeLessThan(6 * 1024 * 1024);
  });
});
