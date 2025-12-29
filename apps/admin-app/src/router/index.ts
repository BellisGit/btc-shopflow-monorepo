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
 * 获取主应用的登录页面URL
 * 用于子应用在独立运行时重定向到主应用的登录页面
 */
function getMainAppLoginUrl(redirectPath?: string): string {
  if (typeof window === 'undefined') {
    return '/login';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  // 生产环境：主应用在 bellis.com.cn
  if (hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn') {
    // 子域名环境，重定向到主域名
    const mainDomain = 'bellis.com.cn';
    const redirectQuery = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
    return `${protocol}//${mainDomain}/login${redirectQuery}`;
  }

  // 开发环境：主应用在 localhost:8080 (system-app)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const mainAppPort = '8080';
    const redirectQuery = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
    return `${protocol}//${hostname}:${mainAppPort}/login${redirectQuery}`;
  }

  // 其他环境：尝试推断主域名（取域名的主部分）
  const parts = hostname.split('.');
  if (parts.length > 2) {
    // 子域名情况，取主域名部分
    const mainDomain = parts.slice(-2).join('.');
    const redirectQuery = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
    return `${protocol}//${mainDomain}${port ? `:${port}` : ''}/login${redirectQuery}`;
  }

  // 默认情况：使用相对路径（假设主应用在同一域名下）
  const redirectQuery = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
  return `/login${redirectQuery}`;
}

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
    return normalized;
  }

  return path;
}

// 路由级别loading的延迟定时器
let routeLoadingTimer: ReturnType<typeof setTimeout> | null = null;
// 路由级别loading的延迟时间（毫秒）
const ROUTE_LOADING_DELAY = 300;

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
    // 关键：cookie 是后端设置的，是认证的权威来源。如果 cookie 不存在，说明后端已经认为用户未认证。
    // 因此，如果 cookie 不存在，应该立即返回 false，不再检查其他本地存储。
    const cookieToken = getCookie('access_token');
    
    // 如果 cookie 不存在，立即返回 false
    // 这是安全的关键：cookie 是后端设置的，如果后端移除了 cookie，说明用户未认证
    if (!cookieToken) {
      return false;
    }

    // cookie 存在时，可以进一步检查其他本地存储作为补充（可选）
    // 但即使其他本地存储没有数据，只要 cookie 存在，也应该返回 true
    // 因为 cookie 是后端设置的，是认证的权威来源
    
    return true;
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

    // 清除之前的延迟定时器
    if (routeLoadingTimer) {
      clearTimeout(routeLoadingTimer);
      routeLoadingTimer = null;
    }

    // 检查是否有应用级别loading正在显示
    // 注意：使用DOM查询作为同步检查（因为beforeEach需要同步判断）
    // 应用级别loading使用fixed定位，添加到body，所以直接在body中查找
    const isAppLoadingVisible = ((): boolean => {
      try {
        // 检查body中是否有.app-loading元素（因为应用级别loading使用fixed定位，添加到body）
        const appLoadingEl = document.querySelector('.app-loading') as HTMLElement;
        if (!appLoadingEl) {
          return false;
        }
        
        const style = window.getComputedStyle(appLoadingEl);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               parseFloat(style.opacity) > 0;
      } catch (e) {
        return false;
      }
    })();

    // 延迟显示路由loading（如果应用loading未显示）
    if (!isAppLoadingVisible) {
      // 延迟300ms显示路由loading，避免快速切换时的闪烁
      routeLoadingTimer = setTimeout(async () => {
        try {
          const { routeLoadingService } = await import('@btc/shared-core');
          routeLoadingService.show();
        } catch (error) {
          // 静默失败
        }
      }, ROUTE_LOADING_DELAY);
    }

    // 独立运行时：检查认证
    // 关键：如果正在使用 layout-app（通过 qiankun 加载），由 layout-app 处理认证
    // 此时不应该进行认证检查，避免在 layout-app 加载完成前误判为未认证
    const isUsingLayoutApp = qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__;
    
    if (!isUsingLayoutApp) {
      // 独立运行时，如果未认证，重定向到主应用的登录页面
      if (!isAuthenticated()) {
        // 构建重定向路径：确保包含应用前缀，以便登录后能够正确返回
        let redirectPath = to.fullPath;
        // 在开发环境独立运行时，路径可能不包含 /admin 前缀，需要添加
        if (!redirectPath.startsWith('/admin') && redirectPath !== '/') {
          redirectPath = `/admin${redirectPath}`;
        }
        const mainAppLoginUrl = getMainAppLoginUrl(redirectPath);
        // 使用 window.location 进行跨域重定向（如果需要）
        window.location.href = mainAppLoginUrl;
        return;
      }
    } else {
      // 在 layout-app 环境下，认证由 layout-app 处理
      // 这里不进行认证检查
    }
    
    next();
  });

  // 路由后置守卫：清除路由loading的延迟定时器并隐藏路由loading
  router.afterEach(async () => {
    // 清除延迟定时器
    if (routeLoadingTimer) {
      clearTimeout(routeLoadingTimer);
      routeLoadingTimer = null;
    }
    
    // 隐藏路由loading
    try {
      const { routeLoadingService } = await import('@btc/shared-core');
      routeLoadingService.hide();
    } catch (error) {
      // 静默失败
    }
  });

  // 关键：参考 cool-admin，在路由解析完成后立即关闭 Loading（beforeResolve）
  // 这样可以在路由解析完成后、组件渲染前就关闭 loading，比等待应用挂载更快
  // 关键优化：立即关闭 loading，确保与 cool-admin 一致的性能
  let loadingClosed = false;
  router.beforeResolve(async () => {
    // 清除路由loading的延迟定时器（路由即将解析完成，不需要再显示路由loading）
    if (routeLoadingTimer) {
      clearTimeout(routeLoadingTimer);
      routeLoadingTimer = null;
    }
    
    // 隐藏路由loading（如果正在显示）
    try {
      const { routeLoadingService } = await import('@btc/shared-core');
      routeLoadingService.hide();
    } catch (error) {
      // 静默失败
    }
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
      
      // 关键：在qiankun环境下，也要关闭appLoadingService显示的应用级别loading
      // 避免与应用级别loading冲突，确保路由解析完成后立即关闭
      const isUsingLayoutApp = qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__;
      if (isUsingLayoutApp) {
        try {
          const { appLoadingService } = await import('@btc/shared-core');
          // admin-app的显示名称是'管理模块'，使用显示名称关闭应用级别loading
          appLoadingService.hide('管理模块');
        } catch (e) {
          // 静默失败，不影响路由解析
        }
      }
      
      // 关键：确保 NProgress 和 AppSkeleton 也被关闭（避免双重 loading）
      // 在独立运行时，不应该显示 NProgress 或 AppSkeleton
      try {
        // 关闭 NProgress（如果正在运行）
        const NProgress = (window as any).NProgress;
        if (NProgress && typeof NProgress.done === 'function') {
          NProgress.done();
        }
        
        // 隐藏 AppSkeleton（如果存在）
        const skeleton = document.getElementById('app-skeleton');
        if (skeleton) {
          skeleton.style.setProperty('display', 'none', 'important');
          skeleton.style.setProperty('visibility', 'hidden', 'important');
          skeleton.style.setProperty('opacity', '0', 'important');
        }
      } catch (e) {
        // 静默失败
      }
    }
  });

  router.onError(() => {
    // 路由错误已处理
  });

  return router;
};

// 导出路由配置获取函数和路由常量
export { getAdminRoutes, adminRoutes } from './routes/admin';
