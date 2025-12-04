import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { AppLayout } from '@btc/shared-components';

// 基础路由（页面组件）
const pageRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { isHome: true },
  },
  {
    path: '/ops/error',
    name: 'ErrorMonitor',
    component: () => import('../views/ErrorMonitor.vue'),
    meta: { isHome: false },
  },
  {
    path: '/ops/deployment-test',
    name: 'DeploymentTest',
    component: () => import('../views/DeploymentTest.vue'),
    meta: { isHome: false },
  },
];

export const createMonitorRouter = (isStandalone: boolean = false): Router => {
  // 根据运行模式返回不同的路由配置
  // 独立运行时：使用 AppLayout 包裹所有路由
  // qiankun 模式：直接返回页面路由（由主应用提供 Layout）
  const routes = isStandalone
    ? [
        {
          path: '/',
          component: AppLayout,
          children: pageRoutes,
        },
      ]
    : pageRoutes;

  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory('/monitor'),
    strict: true,
    routes,
  });

  router.onError((error) => {
    console.warn('[monitor-app] Router error:', error);
  });

  return router;
};

