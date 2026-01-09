/**
 * 认证路由守卫工厂
 * 检查用户是否已认证，未认证用户重定向到登录页
 */

import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router';

export interface AuthGuardConfig {
  /**
   * 应用名称（用于日志）
   */
  appName: string;
  /**
   * 公开页面列表（不需要认证的页面）
   */
  publicPages: string[];
  /**
   * 登录页路径（用于同域重定向，如果提供了 getLoginUrl 则优先使用 getLoginUrl）
   */
  loginPath: string;
  /**
   * 检查用户是否已认证的函数
   */
  isAuthenticated: () => boolean;
  /**
   * 检查路由是否为公开页面的函数（可选，如果不提供，使用 publicPages 列表）
   */
  isPublicPage?: (to: RouteLocationNormalized) => boolean;
  /**
   * 获取登录页完整 URL 的函数（可选，用于子应用独立运行时重定向到主应用登录页）
   * 如果提供，将优先使用此函数构建登录 URL，而不是使用 loginPath
   */
  getLoginUrl?: (redirectPath: string) => string;
}

/**
 * 默认的公开页面检查函数
 */
function defaultIsPublicPage(to: RouteLocationNormalized, publicPages: string[]): boolean {
  // 检查 meta.public
  if (to.meta?.public === true) {
    return true;
  }

  // 检查路径是否在公开页面列表中
  return publicPages.some((page) => {
    if (page.endsWith('/')) {
      return to.path.startsWith(page);
    }
    return to.path === page || to.path.startsWith(`${page}/`);
  });
}

/**
 * 创建认证路由守卫
 * @param config - 守卫配置
 * @returns 路由守卫函数
 */
export function createAuthGuard(config: AuthGuardConfig) {
  const isPublicPageFn = config.isPublicPage || ((to: RouteLocationNormalized) => defaultIsPublicPage(to, config.publicPages));

  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
    router?: Router
  ) => {
    // 检查是否为公开页面
    const isPublic = isPublicPageFn(to);

    if (isPublic) {
      next();
      return;
    }

    // 检查认证状态
    const isAuthenticatedUser = config.isAuthenticated();

    if (!isAuthenticatedUser) {
      // 未认证，重定向到登录页（带 oauth_callback 参数）
      try {
        // 如果提供了 getLoginUrl 函数，优先使用它（用于子应用独立运行时重定向到主应用登录页）
        if (config.getLoginUrl) {
          const loginUrl = config.getLoginUrl(to.fullPath);
          window.location.href = loginUrl;
          return;
        }

        // 否则使用 loginPath（同域重定向）
        if (router) {
          const loginRoute = router.resolve(config.loginPath);
          if (loginRoute && loginRoute.matched.length > 0) {
            next({
              path: config.loginPath,
              query: { oauth_callback: to.fullPath },
            });
          } else {
            window.location.href = `${config.loginPath}?oauth_callback=${encodeURIComponent(to.fullPath)}`;
          }
        } else {
          window.location.href = `${config.loginPath}?oauth_callback=${encodeURIComponent(to.fullPath)}`;
        }
      } catch (error) {
        // 如果出错，尝试使用 getLoginUrl（如果提供），否则使用 loginPath
        if (config.getLoginUrl) {
          window.location.href = config.getLoginUrl(to.fullPath);
        } else {
          window.location.href = `${config.loginPath}?oauth_callback=${encodeURIComponent(to.fullPath)}`;
        }
      }
      return;
    }

    // 已认证，继续导航
    next();
  };
}

