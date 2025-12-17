import type { App } from 'vue';
import type { Router } from 'vue-router';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { AppLayout } from '@btc/shared-components';

// 基础路由（页面组件）
const pageRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../../views/Home.vue'),
    meta: { isHome: true },
  },
];

/**
 * 创建品质应用路由
 */
export const createQualityRouter = (): Router => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
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
    // 在 qiankun 环境下使用 MemoryHistory，避免路由冲突
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory('/'),
    strict: true,
    routes,
  });

  router.onError((error) => {
    console.warn('[quality-app] Router error:', error);
  });

  return router;
};

export const setupRouter = (app: App, router?: Router) => {
  const instance = router ?? createQualityRouter();
  app.use(instance);
  return instance;
};

export type { Router };
