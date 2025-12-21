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
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'error-monitor/index': resolve(__dirname, 'src/error-monitor/index.ts'),
        'qiankun/load-layout-app': resolve(__dirname, 'src/qiankun/load-layout-app.ts'),
        'cookie/index': resolve(__dirname, 'src/cookie/index.ts'),
      },
      name: 'BTCSharedUtils',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'js';
        return entryName === 'index' ? `index.${ext}` : `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      // 不将 dayjs 设为 external，打包到库中，避免运行时 ES 模块导入问题
      // external: ['dayjs'],
      // qiankun 和 vue 作为 peerDependency，应该由使用该工具函数的应用提供，不打包到库中
      external: ['qiankun', 'vue'],
      output: {
        globals: {
          dayjs: 'dayjs',
          qiankun: 'qiankun',
          vue: 'Vue',
        },
      },
    },
  },
});




