import type { Plugin } from '@btc/shared-core';

/**
 * 主题插件（工具栏版本）
 */
export const themePlugin: Plugin = {
  name: 'theme',
  version: '1.0.0',
  description: 'Theme switching plugin',
  order: 15,

  // 工具栏配置
  toolbar: {
    order: 3, // 国际化之后
    pc: true,
    h5: true,
    component: () => import('../../layout/theme-switcher/index.vue')
  }
};
