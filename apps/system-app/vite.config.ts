import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createMainAppViteConfig } from '../../configs/vite/factories/mainapp.config';
import { proxy } from './src/config/proxy';

const appDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(() => {

  return createMainAppViteConfig({
    appName: 'system-app',
    appDir,
    // 启用 public 图片资源处理插件（构建时自动启用）
    publicImagesToAssets: true,
    // 启用资源预加载插件（默认启用）
    enableResourcePreload: true,
    customServer: { proxy },
    proxy,
  });
});
