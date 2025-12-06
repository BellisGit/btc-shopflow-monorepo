import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createLayoutAppViteConfig } from '../../configs/vite/factories/layout.config';

export default defineConfig(
  createLayoutAppViteConfig({
    appName: 'layout-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'layout',
  })
);
