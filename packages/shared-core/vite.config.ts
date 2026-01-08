import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  logLevel: 'error', // 只显示错误，抑制警告
  resolve: {
    alias: {
      '@btc/shared-components': resolve(__dirname, '../shared-components/src'),
      '@btc/auth-shared': resolve(__dirname, '../../auth/shared'),
      '@btc/shared-core/utils': resolve(__dirname, 'src/utils'),
      '@btc/shared-core/utils/array': resolve(__dirname, 'src/utils/array'),
      '@btc/shared-core/configs': resolve(__dirname, 'src/configs'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts', 'src/configs/app-configs-collected.ts'],
      outDir: 'dist',
      // 保留目录结构
      copyDtsFiles: false, // 不复制 .d.ts 文件，只从 .ts 文件生成
      // 生成类型声明文件后，插入类型引用路径
      insertTypesEntry: true,
      // 跳过类型检查，避免 rootDir 限制问题
      // @ts-expect-error - skipDiagnostics 在较新版本的 vite-plugin-dts 中可用
      skipDiagnostics: true,
      // 静默模式，不显示诊断信息
      logLevel: 'silent',
      // 使用单独的 tsconfig 文件
      tsconfigPath: './tsconfig.build.json',
      // 禁用 rollupTypes，避免 API Extractor 错误
      rollupTypes: false,
      // 生成统一的类型声明文件到 dist 根目录
      bundledPackages: [],
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
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        'configs/layout-bridge': resolve(__dirname, 'src/configs/layout-bridge.ts'),
        'configs/app-env.config': resolve(__dirname, 'src/configs/app-env.config.ts'),
        'configs/app-scanner': resolve(__dirname, 'src/configs/app-scanner.ts'),
        'configs/unified-env-config': resolve(__dirname, 'src/configs/unified-env-config.ts'),
        'configs/qiankun-config-center': resolve(__dirname, 'src/configs/qiankun-config-center.ts'),
        'configs/app-identity.types': resolve(__dirname, 'src/configs/app-identity.types.ts'),
      },
      external: [
        'vue',
        'axios',
        'vue-i18n',
        'pinia',
        'dayjs',
        'file-type',
        'zod',
        '@vueuse/core',
        '@btc/shared-components',
        /^@btc\/shared-components\/.*/,
        '@btc/auth-shared',
        /^@btc\/auth-shared\/.*/,
        // 排除 apps 目录的导入，这些文件在运行时可用，但构建时无法解析
        /^\.\.\/\.\.\/\.\.\/apps\/.*/,
      ],
      output: [
        {
          format: 'es',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'index') {
              return 'index.mjs';
            }
            return `configs/${chunkInfo.name.replace('configs/', '')}.mjs`;
          },
          globals: {
            vue: 'Vue',
            axios: 'axios',
            'vue-i18n': 'VueI18n',
            pinia: 'Pinia',
            '@vueuse/core': 'VueUse',
          },
        },
        {
          format: 'cjs',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'index') {
              return 'index.js';
            }
            return `configs/${chunkInfo.name.replace('configs/', '')}.js`;
          },
          globals: {
            vue: 'Vue',
            axios: 'axios',
            'vue-i18n': 'VueI18n',
            pinia: 'Pinia',
            '@vueuse/core': 'VueUse',
          },
        },
      ],
    },
  },
});
