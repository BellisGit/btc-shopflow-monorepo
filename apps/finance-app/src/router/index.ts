import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { financeRoutes } from './routes/finance';

export const createFinanceRouter = (): Router => {
  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes: financeRoutes,
  });

  router.onError((error) => {
    console.warn('[finance-app] Router error:', error);
  });

  return router;
};

export { financeRoutes };

