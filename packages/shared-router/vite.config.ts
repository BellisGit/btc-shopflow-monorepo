import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  logLevel: 'error',
  resolve: {
    alias: {
      '@btc/shared-core': resolve(__dirname, '../shared-core/src'),
    },
  },
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
      outDir: 'dist',
      copyDtsFiles: false,
      insertTypesEntry: true,
      skipDiagnostics: true,
      logLevel: 'silent',
      tsconfigPath: './tsconfig.build.json',
      rollupTypes: false,
      bundledPackages: [],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedRouter',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        '@btc/shared-core',
        /^@btc\/shared-core\/.*/,
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
});

