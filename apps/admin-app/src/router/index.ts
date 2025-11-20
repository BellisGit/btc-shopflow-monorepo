import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { adminRoutes } from './routes/admin';

export const createAdminRouter = (): Router => {
  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes: adminRoutes,
  });

  router.onError((error) => {
    console.warn('[admin-app] Router error:', error);
  });

  return router;
};

export { adminRoutes };
