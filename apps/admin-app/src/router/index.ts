import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { adminRoutes } from './routes/admin';

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

  // 检测是否是 admin 子域名
  if (hostname === 'admin.bellis.com.cn' && path.startsWith('/admin/')) {
    const normalized = path.substring('/admin'.length) || '/';
    console.log(`[Router Path Normalize] ${path} -> ${normalized} (subdomain: ${hostname})`);
    return normalized;
  }

  return path;
}

export const createAdminRouter = (): Router => {
  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes: adminRoutes,
  });

  // 路由守卫：在生产环境子域名下规范化路径
  router.beforeEach((to, from, next) => {
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

  router.onError((error) => {
    console.warn('[admin-app] Router error:', error);
  });

  return router;
};

export { adminRoutes };
