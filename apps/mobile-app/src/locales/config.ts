/**
 * 移动应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    subapp: {
      name: '移动应用',
    },
  },
  'en-US': {
    subapp: {
      name: 'Mobile Application',
    },
  },
} satisfies LocaleConfig;
