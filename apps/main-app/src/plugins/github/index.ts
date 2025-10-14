import type { Plugin } from '@btc/shared-core';

/**
 * GitHub插件
 */
export const githubPlugin: Plugin = {
  name: 'github',
  version: '1.0.0',
  description: 'GitHub repository access plugin',
  order: 10, // 设置合适的加载顺序

  // 工具栏配置
  toolbar: {
    order: 1, // 在最左侧
    pc: true,
    h5: true,
    component: () => import('./components/code.vue')
  },

  // 插件API
  api: {
    openRepository: (url?: string) => {
      window.open(url || 'https://github.com/BellisGit/btc-shopflow.git', '_blank');
    }
  }
};
