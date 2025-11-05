import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 用户设置插件
 */
export const userSettingPlugin: Plugin = {
  name: 'user-setting',
  version: '1.0.0',
  description: 'User settings plugin',
  order: 20,

  // 插件配置元数据
  config: definePluginConfig({
    label: '用户设置',
    description: '提供用户偏好设置和主题配置',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['settings', 'theme', 'user-preference', 'toolbar'],
    recommended: true,
  }),

  // 工具栏配置
  toolbar: {
    order: 5, // 在消息插件之后
    pc: true,
    h5: false, // 移动端隐藏
    component: () => import('./index.vue')
  }
};

// 导出组件和 composables（主组件通过动态导入使用）
export { default as BtcUserSettingDrawer } from './components/theme-drawer.vue';
export * from './composables';
