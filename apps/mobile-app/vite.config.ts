import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createMobileAppViteConfig } from '../../configs/vite/factories/mobile.config';

export default defineConfig(
  createMobileAppViteConfig({
    appName: 'mobile-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
  })
);
