/**
 * 运维模块配置
 */

import type { PageConfig } from '../../../../../types/locale';

export default {
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.operations.name': '运维应用',
      'menu.operations.overview': '运维概览',
      'menu.operations.error': '错误监控',
      'menu.operations.deploymentTest': '部署测试',
    },
    'en-US': {
      // 菜单配置
      'menu.operations.name': 'Operations App',
      'menu.operations.overview': 'Operations Overview',
      'menu.operations.error': 'Error Monitoring',
      'menu.operations.deploymentTest': 'Deployment Test',
    },
  },

  columns: {},

  forms: {},

  service: {},
} satisfies PageConfig;
