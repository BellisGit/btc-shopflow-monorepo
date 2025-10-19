import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { existsSync, readFileSync } from 'node:fs';

export default defineConfig({
  base: '/', // 明确设置为根路径，不使用 /engineering/
  logLevel: 'error', // 只显示错误，抑制警告
  plugins: [
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    qiankun('engineering', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 8082,
    host: '0.0.0.0',
    cors: true,
    origin: 'http://localhost:8082',
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    fs: {
      strict: false,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  build: {
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        '@element-plus/icons-vue',
        'axios',
        'lodash-es',
        'dayjs',
        '@vueuse/core'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
          axios: 'axios',
          'lodash-es': 'lodash',
          dayjs: 'dayjs',
          '@vueuse/core': 'VueUse'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
