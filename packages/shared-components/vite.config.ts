import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';
import type { Plugin } from 'vite';

// 复制 dark-theme.css 到 dist 目录的插件
function copyDarkThemePlugin(): Plugin {
  return {
    name: 'copy-dark-theme',
    writeBundle() {
      const srcFile = resolve(__dirname, 'src/styles/dark-theme.css');
      const distDir = resolve(__dirname, 'dist/styles');
      const distFile = resolve(distDir, 'dark-theme.css');

      try {
        mkdirSync(distDir, { recursive: true });
        copyFileSync(srcFile, distFile);
        console.log('[copy-dark-theme] ✓ 已复制 dark-theme.css 到 dist/styles/');
      } catch (error) {
        console.error('[copy-dark-theme] ✗ 复制失败:', error);
      }
    },
  } as Plugin;
}

export default defineConfig({
  resolve: {
    alias: {
      '@btc-common': resolve(__dirname, 'src/common'),
      '@btc-components': resolve(__dirname, 'src/components'),
      '@btc-crud': resolve(__dirname, 'src/crud'),
      '@btc-styles': resolve(__dirname, 'src/styles'),
      '@btc-locales': resolve(__dirname, 'src/locales'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@btc-assets': resolve(__dirname, 'src/assets'), // 添加 @btc-assets 别名，用于图片资源导入
      '@plugins': resolve(__dirname, 'src/plugins'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@btc/shared-components': resolve(__dirname, 'src'),
      // 添加 @configs 别名，指向项目根目录的 configs 文件夹（用于开发环境）
      // 在构建时，这些模块会被标记为 external，不会被打包
      '@configs': resolve(__dirname, '../../configs'),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      '@charts-utils/css-var': resolve(__dirname, 'src/charts/utils/css-var'),
      '@charts-utils/color': resolve(__dirname, 'src/charts/utils/color'),
      '@charts-utils/gradient': resolve(__dirname, 'src/charts/utils/gradient'),
      '@charts-composables/useChartComponent': resolve(__dirname, 'src/charts/composables/useChartComponent'),
      '@charts': resolve(__dirname, 'src/charts'),
      '@charts-types': resolve(__dirname, 'src/charts/types'),
      '@charts-utils': resolve(__dirname, 'src/charts/utils'),
      '@charts-composables': resolve(__dirname, 'src/charts/composables'),
    },
  },
  plugins: [
    vue(),
    copyDarkThemePlugin(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.d.ts', 'node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
      outDir: resolve(__dirname, 'dist'),
      root: __dirname,
      copyDtsFiles: false, // 不复制 .d.ts 文件，只从 .ts 文件生成
      insertTypesEntry: true,
      skipDiagnostics: true,
      logLevel: 'silent',
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      rollupTypes: false, // 禁用 rollupTypes，避免路径解析错误
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  logLevel: 'error', // 鍙樉绀洪敊璇紝鎶戝埗璀﹀憡
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia', 'element-plus', '@element-plus/icons-vue', '@btc/shared-core', '@btc/shared-utils', '@btc/subapp-manifests', '@configs/unified-env-config', '@configs/app-scanner'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'pinia': 'Pinia',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
          '@btc/shared-core': 'BTCSharedCore',
          '@btc/shared-utils': 'BTCSharedUtils',
          '@btc/subapp-manifests': 'BTCSubappManifests',
        },
        assetFileNames: (assetInfo: { name?: string }) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: false, // 灏嗘墍鏈?CSS 鍚堝苟鍒颁竴涓枃浠朵腑
  },
});

