import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import type { Plugin } from 'vite';

const appDir = fileURLToPath(new URL('.', import.meta.url));

// 移除替换插件，让图片正常打包到构建产物中

export default defineConfig({
  root: appDir,
  base: '/',
  publicDir: 'public',
  plugins: [
    vue(),
    // 图片和视频文件会正常打包到构建产物中，CDN 作为降级方案
  ],
  server: {
    port: 8095,
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(appDir, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
});
