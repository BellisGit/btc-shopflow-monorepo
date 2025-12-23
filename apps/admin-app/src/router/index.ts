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
    // 关键：在子域名环境下，即使无法直接读取 HttpOnly cookie，也应该尝试其他方式判断
    
    // 1. 检查 cookie 中的 token（优先，因为跨子域名共享）
    // 注意：如果 cookie 是 HttpOnly 的，getCookie 无法读取，但浏览器会自动在请求中发送
    const cookieToken = getCookie('access_token');
    if (cookieToken) {
      return true;
    }

    // 2. 检查用户信息是否存在（从 Cookie 或 localStorage 读取）
    // 关键：使用 appStorage.user.get() 会优先从 Cookie 读取（跨子域名共享）
    const userInfo = appStorage.user.get();
    if (userInfo?.id) {
      return true;
    }

    // 3. 检查 localStorage 中的 token
    const storageToken = appStorage.auth.getToken();
    if (storageToken) {
      return true;
    }

    // 4. 检查登录状态标记（从 settings 中读取，settings 也会优先从 Cookie 读取）
    const settings = appStorage.settings.get() as Record<string, any> | null;
    const isLoggedIn = settings?.is_logged_in === true;
    if (isLoggedIn) {
      return true;
    }

    // 5. 检查 localStorage 中的旧登录状态标记（向后兼容）
    const legacyIsLoggedIn = localStorage.getItem('is_logged_in') === 'true';
    if (legacyIsLoggedIn) {
      return true;
    }

    // 6. 在子域名环境下，如果无法读取 cookie，尝试通过检查是否有其他认证相关的 cookie
    // 例如检查是否有 session cookie 或其他认证标记
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
    if (isProductionSubdomain) {
      // 在子域名环境下，如果 cookie 是 HttpOnly 的，前端无法读取
      // 但可以通过检查是否有其他认证相关的标记来判断
      // 如果都没有，说明可能未认证，返回 false 让路由守卫处理重定向
      // 注意：这里不假设已认证，避免安全风险
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
    // 关键：如果正在使用 layout-app（通过 qiankun 加载），由 layout-app 处理认证
    // 此时不应该进行认证检查，避免在 layout-app 加载完成前误判为未认证
    const isUsingLayoutApp = qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__;
    
    if (!isUsingLayoutApp) {
      const isPublicPage = to.path === '/login' || 
                          to.path === '/forget-password' || 
                          to.path === '/register';
      
      if (!isPublicPage && !isAuthenticated()) {
        // 未认证，重定向到登录页，并保存原始路径以便登录后跳转
        console.warn('[admin-app] 未认证，重定向到登录页', {
          path: to.path,
          hasCookieToken: !!getCookie('access_token'),
          hasStorageToken: !!appStorage.auth.getToken(),
          hasUserInfo: !!appStorage.user.get()?.id,
          hostname: window.location.hostname,
        });
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
    } else {
      // 在 layout-app 环境下，认证由 layout-app 处理
      // 这里不进行认证检查
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

  router.onError((error) => {
    console.warn('[admin-app] Router error:', error);
  });

  return router;
};

// 导出路由配置获取函数和路由常量
export { getAdminRoutes, adminRoutes } from './routes/admin';
