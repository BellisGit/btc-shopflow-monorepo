import type { Plugin } from '@btc/shared-core';

/**
 * 国际化插件（工具栏版本）
 */
export const i18nPlugin: Plugin = {
  name: 'i18n',
  version: '1.0.0',
  description: 'Internationalization plugin',
  order: 5,

  // 工具栏配置
  toolbar: {
    order: 2, // GitHub之后
    pc: true,
    h5: true,
    component: () => import('../../layout/locale-switcher/index.vue')
  }
};
