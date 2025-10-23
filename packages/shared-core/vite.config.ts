import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  logLevel: 'error', // 鍙樉绀洪敊璇紝鎶戝埗璀﹀憡
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['vue', 'axios', 'vue-i18n', '@btc/shared-utils', 'pinia', '@vueuse/core'],
      output: {
        globals: {
          vue: 'Vue',
          axios: 'axios',
          'vue-i18n': 'VueI18n',
          pinia: 'Pinia',
          '@vueuse/core': 'VueUse',
        },
      },
    },
  },
});


