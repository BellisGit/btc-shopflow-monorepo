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

    resolvers: [
      ElementPlusResolver({
        importStyle: false, // 禁用按需样式导入
      }),
    ],

    dts: 'src/auto-imports.d.ts',

    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
    },

    vueTemplate: true,
  });
}

export interface ComponentsConfigOptions {
  /**
   * 额外的组件目录（用于域级组件）
   */
  extraDirs?: string[];
  /**
   * 是否导入共享组件库
   */
  includeShared?: boolean;
}

/**
 * 创建 Components 自动导入配置
 * @param options 配置选项
 */
export function createComponentsConfig(options: ComponentsConfigOptions = {}) {
  const { extraDirs = [], includeShared = true } = options;

  const dirs = [
    'src/components', // 应用级组件
    ...extraDirs, // 额外的域级组件目录
  ];

  // 如果包含共享组件，添加共享组件目录
  if (includeShared) {
    dirs.push('../../packages/shared-components/src/components');
  }

  return Components({
    resolvers: [
      ElementPlusResolver({
        importStyle: false, // 禁用按需样式导入，避免 Vite reloading
      }),
      // 自定义解析器：@btc/shared-components
      (componentName) => {
        if (componentName.startsWith('Btc') || componentName.startsWith('btc-')) {
          return {
            name: componentName,
            from: '@btc/shared-components',
          };
        }
      },
    ],
    dts: 'src/components.d.ts',
    dirs,
    extensions: ['vue', 'tsx'], // 支持 .vue 和 .tsx 文件
    // 强制重新扫描组件
    deep: true,
    // 包含所有 Btc 开头的组件
    include: [/\.vue$/, /\.tsx$/, /Btc[A-Z]/, /btc-[a-z]/],
  });
}
// UTF-8 encoding fix
