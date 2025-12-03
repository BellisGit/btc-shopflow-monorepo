import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/error',
  },
  {
    path: '/error',
    name: 'ErrorMonitor',
    component: () => import('../views/ErrorMonitor.vue'),
    meta: { isHome: false },
  },
];

export const createMonitorRouter = (): Router => {
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

