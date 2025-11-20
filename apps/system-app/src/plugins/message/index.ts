import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 消息插件
 */
export const messagePlugin: Plugin = {
  name: 'message',
  version: '1.0.0',
  description: 'Message center plugin',
  order: 20,

  // 插件配置元数据
  config: definePluginConfig({
    label: '消息中心',
    description: '提供私信、系统消息功能',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['message', 'chat', 'toolbar'],
    recommended: true,
  }),

  // 工具栏配置
  toolbar: {
    order: 4, // 在通知之后
    pc: true,
    h5: false, // 移动端隐藏
    component: () => import('./components/message-icon.vue')
  }
};

// 导出组件（仅导出面板，图标组件通过动态导入使用）
export { default as BtcMessagePanel } from './components/message-panel.vue';

