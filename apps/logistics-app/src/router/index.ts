import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { getLogisticsRoutes } from './routes/logistics';

export const createLogisticsRouter = (): Router => {
  // 在创建路由时动态获取路由配置，确保 isStandalone 检测正确
  const routes = getLogisticsRoutes();
  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes,
  });

  router.onError((error) => {
    console.warn('[logistics-app] Router error:', error);
  });

  return router;
};

export { logisticsRoutes };

