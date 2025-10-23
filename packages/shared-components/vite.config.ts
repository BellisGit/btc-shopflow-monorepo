import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@btc-common': resolve(__dirname, 'src/common'),
      '@btc-components': resolve(__dirname, 'src/components'),
      '@btc-crud': resolve(__dirname, 'src/crud'),
      '@btc-styles': resolve(__dirname, 'src/styles'),
      '@btc-locales': resolve(__dirname, 'src/locales'),
    },
  },
  plugins: [
    vue()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  logLevel: 'error', // 鍙樉绀洪敊璇紝鎶戝埗璀﹀憡
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['vue', 'element-plus', '@element-plus/icons-vue', '@btc/shared-core', '@btc/shared-utils'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
          '@btc/shared-core': 'BTCSharedCore',
          '@btc/shared-utils': 'BTCSharedUtils',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: false, // 灏嗘墍鏈?CSS 鍚堝苟鍒颁竴涓枃浠朵腑
  },
});

