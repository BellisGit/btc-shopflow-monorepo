import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createSubAppViteConfig } from '../../configs/vite/factories/subapp.config';
import { titleInjectPlugin } from './vite-plugin-title-inject';
import { proxy } from './src/config/proxy';

export default defineConfig(
  createSubAppViteConfig({
    appName: 'admin-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'admin',
    customPlugins: [titleInjectPlugin()],
    customServer: { proxy },
    proxy,
  })
);
