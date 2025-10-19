import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';

export default defineConfig({
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
  logLevel: 'error', // 只显示错误，抑制警告
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
    cssCodeSplit: false, // 将所有 CSS 合并到一个文件中
  },
});
