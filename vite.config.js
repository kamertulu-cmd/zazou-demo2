import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, 'site');
const input = Object.fromEntries(
  readdirSync(root).filter((f) => f.endsWith('.html')).map((f) => [f.replace('.html', ''), resolve(root, f)])
);

export default defineConfig({
  root,
  base: './', // göreli yollar: kamertulu-cmd.github.io/zazou-demo/ alt dizininde çalışır
  publicDir: resolve(__dirname, 'site/public'),
  build: { outDir: resolve(__dirname, 'dist'), emptyOutDir: true, assetsInlineLimit: 0, rollupOptions: { input } },
});
