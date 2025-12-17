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
    meta: {
      isHome: true,
      titleKey: 'menu.monitor.overview',
      tabLabelKey: 'menu.monitor.overview',
    },
  },
  {
    path: '/ops/error',
    name: 'ErrorMonitor',
    component: () => import('../views/ErrorMonitor.vue'),
    meta: {
      isHome: false,
      titleKey: 'menu.monitor.error',
      tabLabelKey: 'menu.monitor.error',
    },
  },
  {
    path: '/ops/deployment-test',
    name: 'DeploymentTest',
    component: () => import('../views/DeploymentTest.vue'),
    meta: {
      isHome: false,
      titleKey: 'menu.monitor.deploymentTest',
      tabLabelKey: 'menu.monitor.deploymentTest',
    },
  },
];

export const createMonitorRouter = (isStandalone: boolean = false): Router => {
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 根据运行模式返回不同的路由配置
  // 独立运行且未使用 layout-app 时：使用 AppLayout 包裹所有路由
  // qiankun 模式或 layout-app 模式：直接返回页面路由（由主应用或 layout-app 提供 Layout）
  const routes = isStandalone && !isUsingLayoutApp
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
      : createWebHistory('/'),
    strict: true,
    routes,
  });

  // 路由守卫：在生产环境子域名下规范化路径
  router.beforeEach((to, _from, next) => {
    // 只在独立运行（非 qiankun）且是生产环境子域名时处理
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      const hostname = window.location.hostname;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      if (isProductionSubdomain && hostname === 'monitor.bellis.com.cn' && to.path.startsWith('/monitor/')) {
        const normalized = to.path.substring('/monitor'.length) || '/';
        console.log(`[Router Path Normalize] ${to.path} -> ${normalized} (subdomain: ${hostname})`);
        next({
          path: normalized,
          query: to.query,
          hash: to.hash,
          replace: true,
        });
        return;
      }
    }

    next();
  });

  router.onError((error) => {
    console.warn('[monitor-app] Router error:', error);
  });

  return router;
};

