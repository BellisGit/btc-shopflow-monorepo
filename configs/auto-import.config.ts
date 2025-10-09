/**
 * 自动导入配置模板
 * 供所有应用（main-app, logistics-app 等）使用
 */
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

/**
 * 创建 Auto Import 配置
 */
export function createAutoImportConfig() {
  return AutoImport({
    imports: [
      'vue',
      'vue-router',
      'pinia',
      {
        '@btc/shared-core': [
          'useCrud',
          'useDict',
          'usePermission',
          'useRequest',
          'createI18nPlugin',
          'useI18n',
        ],
        '@btc/shared-utils': [
          'formatDate',
          'formatDateTime',
          'formatMoney',
          'formatNumber',
          'isEmail',
          'isPhone',
          'storage',
        ],
      },
    ],

    resolvers: [ElementPlusResolver()],

    dts: 'src/auto-imports.d.ts',

    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
    },

    vueTemplate: true,
  });
}

/**
 * 创建 Components 自动导入配置
 */
export function createComponentsConfig() {
  return Components({
    resolvers: [ElementPlusResolver()],
    dts: 'src/components.d.ts',
    dirs: ['src/components'],
  });
}
