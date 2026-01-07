/**
 * 登录页重定向守卫工厂
 * 处理已认证用户访问登录页时的重定向逻辑
 */

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

export interface LoginRedirectGuardConfig {
  /**
   * 应用名称（用于日志）
   */
  appName: string;
  /**
   * 首页路由（已认证用户访问登录页时重定向到此）
   */
  homeRoute: string;
  /**
   * 获取主应用首页路由的函数（可选，用于跨应用场景）
   */
  getMainAppHomeRoute?: () => string;
  /**
   * 检查用户是否已认证的函数
   */
  isAuthenticated: () => boolean;
}

/**
 * 检测是否有退出登录参数
 */
function hasLogoutParam(to: RouteLocationNormalized): boolean {
  const logoutValue = Array.isArray(to.query.logout) ? to.query.logout[0] : to.query.logout;
  return (
    logoutValue === '1' ||
    logoutValue === 1 ||
    logoutValue === 'true' ||
    String(logoutValue) === '1'
  );
}

/**
 * 检测是否有退出登录的 sessionStorage 标记
 */
function hasLogoutTimestamp(): boolean {
  try {
    const logoutTimestamp = sessionStorage.get<number>('logout_timestamp');
    if (logoutTimestamp === null || logoutTimestamp === undefined) {
      return false;
    }

    const logoutTime = typeof logoutTimestamp === 'number' ? logoutTimestamp : parseInt(String(logoutTimestamp), 10);
    const now = Date.now();
    const timeDiff = now - logoutTime;

    // 5秒内有效
    if (timeDiff < 5000) {
      return true;
    } else {
      // 超过5秒，清除标记
      sessionStorage.remove('logout_timestamp');
      return false;
    }
  } catch (e) {
    return false;
  }
}

/**
 * 创建登录页重定向守卫
 * @param config - 守卫配置
 * @returns 路由守卫函数
 */
export function createLoginRedirectGuard(config: LoginRedirectGuardConfig) {
  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    // 只在访问登录页时执行
    if (to.path !== '/login') {
      next();
      return;
    }

    const isAuthenticatedUser = config.isAuthenticated();

    // 如果未认证，允许访问登录页
    if (!isAuthenticatedUser) {
      next();
      return;
    }

    // 已认证用户访问登录页，需要检查是否有退出参数
    const hasLogout = hasLogoutParam(to) || hasLogoutTimestamp();

    // 如果有退出参数或标记，允许访问登录页（退出流程中）
    if (hasLogout) {
      // 清除 sessionStorage 标记（如果存在）
      try {
        sessionStorage.remove('logout_timestamp');
      } catch (e) {
        // 静默失败
      }
      next();
      return;
    }

    // 检查 from=duty 参数（特殊场景）
    if (to.query.from === 'duty') {
      next();
      return;
    }

    // 已认证且没有退出参数，重定向到首页或 redirect 参数指定的页面
    const redirect = (to.query.redirect as string) || config.getMainAppHomeRoute?.() || config.homeRoute;
    const redirectPath = redirect.split('?')[0] || config.homeRoute;
    next(redirectPath);
  };
}

