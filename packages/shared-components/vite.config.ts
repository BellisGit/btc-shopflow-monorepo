import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';

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
    vue()
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
        assetFileNames: (assetInfo) => {
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

