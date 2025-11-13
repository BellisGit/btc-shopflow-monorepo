import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { logisticsRoutes } from './routes/logistics';

export const createLogisticsRouter = (): Router => {
  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes: logisticsRoutes,
  });

  router.onError((error) => {
    console.warn('[logistics-app] Router error:', error);
  });

  return router;
};

export { logisticsRoutes };

