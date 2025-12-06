/**
 * 基础配置模块
 * 提供公共的别名和 resolve 配置
 */

import type { UserConfig } from 'vite';
import { createPathHelpers } from './utils/path-helpers';

/**
 * 创建基础别名配置
 * @param appDir 应用根目录路径
 * @param appName 应用名称
 * @returns 别名配置对象
 */
export function createBaseAliases(appDir: string, appName: string): Record<string, string> {
  const { withSrc, withPackages, withRoot, withConfigs } = createPathHelpers(appDir);

  return {
    '@': withSrc('src'),
    '@modules': withSrc('src/modules'),
    '@services': withSrc('src/services'),
    '@components': withSrc('src/components'),
    '@utils': withSrc('src/utils'),
    '@auth': withRoot('auth'),
    '@configs': withConfigs(''),
    '@btc/shared-core': withPackages('shared-core/src'),
    '@btc/shared-components': withPackages('shared-components/src'),
    '@btc/shared-utils': withPackages('shared-utils/src'),
    '@btc/subapp-manifests': withPackages('subapp-manifests/src/index.ts'),
    '@btc-common': withPackages('shared-components/src/common'),
    '@btc-components': withPackages('shared-components/src/components'),
    '@btc-styles': withPackages('shared-components/src/styles'),
    '@btc-locales': withPackages('shared-components/src/locales'),
    '@assets': withPackages('shared-components/src/assets'),
    '@btc-assets': withPackages('shared-components/src/assets'),
    '@plugins': withPackages('shared-components/src/plugins'),
    '@btc-utils': withPackages('shared-components/src/utils'),
    '@btc-crud': withPackages('shared-components/src/crud'),
    // 图表相关别名（具体文件路径放在前面，确保优先匹配）
    '@charts-utils/css-var': withPackages('shared-components/src/charts/utils/css-var'),
    '@charts-utils/color': withPackages('shared-components/src/charts/utils/color'),
    '@charts-utils/gradient': withPackages('shared-components/src/charts/utils/gradient'),
    '@charts-composables/useChartComponent': withPackages('shared-components/src/charts/composables/useChartComponent'),
    '@charts-types': withPackages('shared-components/src/charts/types'),
    '@charts-utils': withPackages('shared-components/src/charts/utils'),
    '@charts-composables': withPackages('shared-components/src/charts/composables'),
    // Element Plus 别名
    'element-plus/es': 'element-plus/es',
    'element-plus/dist': 'element-plus/dist',
  };
}

/**
 * 创建基础 resolve 配置
 * @param appDir 应用根目录路径
 * @param appName 应用名称
 * @returns resolve 配置对象
 */
export function createBaseResolve(appDir: string, appName: string): UserConfig['resolve'] {
  return {
    alias: createBaseAliases(appDir, appName),
    dedupe: ['vue', 'vue-router', 'pinia', 'element-plus', '@element-plus/icons-vue'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  };
}

