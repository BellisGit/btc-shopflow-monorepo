import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { getAdminRoutes } from './routes/admin';
import { getCookie } from '../utils/cookie';
import { appStorage } from '../utils/app-storage';

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
  // 在创建路由时动态获取路由配置，确保 isStandalone 检测正确
  const routes = getAdminRoutes();
  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes,
  });

  // 检查用户是否已认证（独立运行时使用）
  const isAuthenticated = (): boolean => {
    // 关键：如果正在使用 layout-app（通过 qiankun 加载），由 layout-app 处理认证
    // 此时 admin-app 是在 qiankun 环境下运行的，应该由 layout-app 或主应用处理认证
    if (qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__) {
      // qiankun 模式下由主应用或 layout-app 处理认证
      // 在 layout-app 环境下，layout-app 会从主应用获取认证状态
      // 如果认证失败，layout-app 会处理重定向，这里直接返回 true 避免重复检查
      return true;
    }

    // 独立运行时：检查本地认证状态
    // 1. 检查 cookie 中的 token（优先，因为跨子域名共享）
    const cookieToken = getCookie('access_token');
    if (cookieToken) {
      return true;
    }

    // 2. 检查 localStorage 中的 token
    const storageToken = appStorage.auth.getToken();
    if (storageToken) {
      return true;
    }

    // 3. 检查用户信息是否存在
    const userInfo = appStorage.user.get();
    if (userInfo?.id) {
      return true;
    }

    // 4. 检查登录状态标记
    const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
    if (isLoggedIn) {
      return true;
    }

    return false;
  };

  // 路由守卫：在生产环境子域名下规范化路径，并在独立运行时检查认证
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

    // 独立运行时：检查认证（排除登录页等公开页面）
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      const isPublicPage = to.path === '/login' || 
                          to.path === '/forget-password' || 
                          to.path === '/register';
      
      if (!isPublicPage && !isAuthenticated()) {
        // 未认证，重定向到登录页，并保存原始路径以便登录后跳转
        next({
          path: '/login',
          query: { redirect: to.fullPath },
        });
        return;
      }

      // 如果已认证且访问登录页，重定向到首页
      // 但是，如果查询参数中有 logout=1，说明是退出登录，应该允许访问登录页
      if (to.path === '/login' && isAuthenticated() && !to.query.logout) {
        const redirect = (to.query.redirect as string) || '/';
        const redirectPath = redirect.split('?')[0];
        next(redirectPath);
        return;
      }
    }
    
    next();
  });

  router.onError((error) => {
    console.warn('[admin-app] Router error:', error);
  });

  return router;
};

// 导出路由配置获取函数和路由常量
export { getAdminRoutes, adminRoutes } from './routes/admin';
