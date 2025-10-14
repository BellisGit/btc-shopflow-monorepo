import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { btc } from '@btc/vite-plugin';
import UnoCSS from 'unocss/vite';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { titleInjectPlugin } from './vite-plugin-title-inject';

export default defineConfig({
  plugins: [
    titleInjectPlugin(), // 服务端标题注入（必须在最前面）
    vue(),
    createAutoImportConfig(),
    createComponentsConfig({ includeShared: true }),
    UnoCSS({
      configFile: '../../uno.config.ts',
    }),
    btc({
      type: 'admin',
      reqUrl: '',
      nameTag: true,
      eps: {
        enable: true,
        api: '', // 空 URL 表示使用本地 Mock 数据
        dist: 'build/eps',
        mapping: [],
      },
      svg: {
        skipNames: ['base', 'icons'], // 跳过 base 和 icons 模块名前缀
      },
    }),
  ],
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: 8080,
    host: '0.0.0.0', // 允许网络访问
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/api': {
        target: 'http://10.80.9.76:8115',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/sys/admin/base/sys'),
      },
    },
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue',
      '@vueuse/core',
      'axios',
      'lodash-es',
      'dayjs',
    ],
  },
  build: {
    charset: 'utf8',
    rollupOptions: {
      output: {
        charset: 'utf8',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
});
