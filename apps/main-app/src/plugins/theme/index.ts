import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 主题插件（工具栏版本）
 */
export const themePlugin: Plugin = {
  name: 'theme',
  version: '1.0.0',
  description: 'Theme switching plugin',
  order: 15,

  // 插件配置元数据
  config: definePluginConfig({
    label: '主题切换',
    description: '提供明暗主题切换和自定义主题配置',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['theme', 'dark-mode', 'light-mode', 'toolbar'],
    recommended: true,
  }),

  // 工具栏配置
  toolbar: {
    order: 3, // 国际化之后
    pc: true,
    h5: false, // 移动端隐藏主题切换器
    component: () => import('../../modules/base/components/layout/theme-switcher/index.vue')
  }
};
