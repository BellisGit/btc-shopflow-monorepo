import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  logLevel: 'info',
  resolve: {
    // 确保正确解析 dayjs
    dedupe: ['dayjs'],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedUtils',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      // 不将 dayjs 设为 external，打包到库中，避免运行时 ES 模块导入问题
      // external: ['dayjs'],
      // qiankun 作为 peerDependency，应该由使用该工具函数的应用提供，不打包到库中
      external: ['qiankun'],
      output: {
        globals: {
          dayjs: 'dayjs',
          qiankun: 'qiankun',
        },
      },
    },
  },
});




