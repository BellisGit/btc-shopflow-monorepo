import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  logLevel: 'error', // 只显示错误，抑制警告
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VitePluginEps',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vite',
        'fs',
        'path',
        'node:fs',
        'node:path',
        'node:url',
        '@vue/compiler-sfc',
        'magic-string',
        'prettier',
        'vue',
        'axios',
        'glob',
        'lodash',
        'svgo',
        /^node:/,  // 匹配所有 node: 前缀的内置模块
      ],
    },
  },
});
