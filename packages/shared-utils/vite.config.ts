import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  logLevel: 'info', // 显示信息
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedUtils',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['dayjs'],
    },
  },
});
