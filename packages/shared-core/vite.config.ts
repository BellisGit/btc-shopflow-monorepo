import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  logLevel: 'error', // 只显示错误，抑制警告
  resolve: {
    alias: {
      '@configs': resolve(__dirname, '../../configs'),
      '@btc/shared-components': resolve(__dirname, '../shared-components/src'),
    },
  },
  plugins: [
    dts({
      include: ['src/**/*.ts', 'src/**/*.d.ts'],
      outDir: 'dist',
      // 保留目录结构
      copyDtsFiles: true,
      // 生成类型声明文件后，插入类型引用路径
      insertTypesEntry: true,
      // 跳过类型检查，避免 rootDir 限制问题
      skipDiagnostics: true,
      // 静默模式，不显示诊断信息
      logLevel: 'silent',
      // 使用单独的 tsconfig 文件
      tsconfigPath: './tsconfig.build.json',
      // 排除外部依赖的类型检查
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        'axios',
        'vue-i18n',
        '@btc/shared-utils',
        /^@btc\/shared-utils\/.*/,
        'pinia',
        '@vueuse/core',
        '@configs/layout-bridge',
        /^@configs\/.*/,
        '@btc/shared-components',
        /^@btc\/shared-components\/.*/,
      ],
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
