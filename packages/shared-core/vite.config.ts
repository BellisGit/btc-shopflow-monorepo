import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['vue', 'axios', 'vue-i18n', '@btc/shared-utils'],
      output: {
        globals: {
          vue: 'Vue',
          axios: 'axios',
          'vue-i18n': 'VueI18n',
        },
      },
    },
  },
});
