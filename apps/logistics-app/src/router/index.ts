import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { getLogisticsRoutes, logisticsRoutes } from './routes/logistics';

/**
 * 规范化路径：在生产环境子域名下，移除应用前缀
 */
function normalizePath(path: string): string {
  // 只在独立运行（非 qiankun）且是生产环境子域名时处理
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    return path; // qiankun 模式保持原路径
  }

  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  if (!isProductionSubdomain) {
    return path; // 非生产环境子域名，保持原路径
  }

  // 检测是否是 logistics 子域名
  if (hostname === 'logistics.bellis.com.cn' && path.startsWith('/logistics/')) {
    const normalized = path.substring('/logistics'.length) || '/';
    console.log(`[Router Path Normalize] ${path} -> ${normalized} (subdomain: ${hostname})`);
    return normalized;
  }

  return path;
}

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

  // 路由守卫：在生产环境子域名下规范化路径
    router.beforeEach((to: import('vue-router').RouteLocationNormalized, from: import('vue-router').RouteLocationNormalized, next: import('vue-router').NavigationGuardNext) => {
    const normalizedPath = normalizePath(to.path);

    if (normalizedPath !== to.path) {
      // 路径需要规范化，重定向到规范化后的路径
      next({
        path: normalizedPath,
        query: to.query,
        hash: to.hash,
        replace: true,
      });
      return;
    }

    next();
  });

  router.onError((error: Error) => {
    console.warn('[logistics-app] Router error:', error);
  });

  return router;
};

export { logisticsRoutes };

