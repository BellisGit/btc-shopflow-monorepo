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
    router.beforeEach((to: import('vue-router').RouteLocationNormalized, _from: import('vue-router').RouteLocationNormalized, next: import('vue-router').NavigationGuardNext) => {
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

  // 关键：参考 cool-admin，在路由解析完成后立即关闭 Loading（beforeResolve）
  // 这样可以在路由解析完成后、组件渲染前就关闭 loading，比等待应用挂载更快
  // 关键优化：立即关闭 loading，确保与 cool-admin 一致的性能
  let loadingClosed = false;
  router.beforeResolve(() => {
    if (!loadingClosed) {
      const loadingEl = document.getElementById('Loading');
      if (loadingEl) {
        // 关键：立即隐藏并移除 loading，确保与 cool-admin 一致的性能
        // 使用内联样式确保优先级，立即隐藏
        loadingEl.style.setProperty('display', 'none', 'important');
        loadingEl.style.setProperty('visibility', 'hidden', 'important');
        loadingEl.style.setProperty('opacity', '0', 'important');
        loadingEl.style.setProperty('pointer-events', 'none', 'important');
        loadingEl.classList.add('is-hide');
        
        // 延迟移除 DOM 元素（不影响显示，只是清理）
        setTimeout(() => {
          try {
            loadingEl.remove();
          } catch {
            // 忽略移除错误
          }
        }, 350);
        
        loadingClosed = true;
      }
    }
  });

  router.onError((_error: Error) => {
    // 路由错误已处理
  });

  return router;
};

export { logisticsRoutes };

