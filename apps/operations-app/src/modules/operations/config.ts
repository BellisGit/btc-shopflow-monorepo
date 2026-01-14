/**
 * 运维模块配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'operations',
  label: 'common.module.operations.label',
  order: 100,

  // 路由配置
  views: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: {
        isHome: true,
        titleKey: 'menu.operations.overview',
        tabLabelKey: 'menu.operations.overview',
        isPage: true,
      },
    },
    {
      path: '/ops/error',
      name: 'ErrorMonitor',
      component: () => import('./views/ErrorMonitor.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.operations.error',
        tabLabelKey: 'menu.operations.error',
        isPage: true,
      },
    },
    {
      path: '/ops/deployment-test',
      name: 'DeploymentTest',
      component: () => import('./views/DeploymentTest.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.operations.deploymentTest',
        tabLabelKey: 'menu.operations.deploymentTest',
        isPage: true,
      },
    },
  ],

  // PageConfig 字段（保留）
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
} satisfies ModuleConfig;
