import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { systemRoutes } from './routes/system';

export const createSystemRouter = (): Router => {
  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes: systemRoutes,
  });

  router.onError((error) => {
    console.warn('[system-app] Router error:', error);
  });

  return router;
};

export { systemRoutes };

