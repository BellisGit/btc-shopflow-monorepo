import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createSubAppViteConfig } from '../../configs/vite/factories/subapp.config';
import { copyIconsPlugin } from '../../configs/vite/plugins';
import { titleInjectPlugin } from './vite-plugin-title-inject';
import { proxy } from './src/config/proxy';

export default defineConfig(
  createSubAppViteConfig({
    appName: 'admin-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'admin',
    customPlugins: [
      titleInjectPlugin(),
      // 关键：admin-app 需要复制 icons 目录，因为它有图标展示的内容
      copyIconsPlugin(fileURLToPath(new URL('.', import.meta.url))),
    ],
    customServer: { proxy },
    proxy,
  })
);
