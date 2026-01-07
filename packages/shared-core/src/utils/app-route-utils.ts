/**
 * 应用路由工具函数库
 * 提供统一的应用标识获取和路由判断函数，消除硬编码
 */

import { getMainApp, getAllApps } from '@configs/app-scanner';
import { isMainApp as isMainAppRouteUtil } from '@configs/unified-env-config';

/**
 * 获取主应用标识（从配置动态获取，不硬编码）
 */
export function getMainAppId(): string {
  try {
    const mainApp = getMainApp();
    return mainApp?.id || 'main'; // 兜底值
  } catch (error) {
    // 如果 getMainApp() 调用失败（可能因为模块加载顺序问题），使用兜底值
    return 'main';
  }
}

/**
 * 判断路径是否为主应用路由（从配置读取，不硬编码）
 */
export function isMainAppRoute(path: string): boolean {
  const mainApp = getMainApp();
  if (!mainApp?.routes?.mainAppRoutes || mainApp.routes.mainAppRoutes.length === 0) {
    // 兜底：使用 unified-env-config 的 isMainApp 函数
    return isMainAppRouteUtil(path);
  }
  
  // 检查路径是否匹配主应用路由列表
  return mainApp.routes.mainAppRoutes.some(route => {
    const normalizedRoute = route.replace(/\/+$/, '') || '/';
    const normalizedPath = path.replace(/\/+$/, '') || '/';
    
    // 精确匹配或路径前缀匹配
    return normalizedPath === normalizedRoute || 
           normalizedPath === '/' ||
           (normalizedPath.startsWith(normalizedRoute + '/') && normalizedRoute !== '/');
  });
}

/**
 * 判断路由是否可关闭（从配置读取）
 */
export function isRouteClosable(path: string): boolean {
  const mainApp = getMainApp();
  if (!mainApp?.routes?.nonClosableRoutes || mainApp.routes.nonClosableRoutes.length === 0) {
    return true; // 默认可关闭
  }
  
  const normalizedPath = path.replace(/\/+$/, '') || '/';
  return !mainApp.routes.nonClosableRoutes.includes(normalizedPath);
}

/**
 * 判断路由是否应该跳过 Tabbar（从配置读取）
 */
export function shouldSkipTabbar(path: string): boolean {
  const mainApp = getMainApp();
  if (!mainApp?.routes?.skipTabbarRoutes || mainApp.routes.skipTabbarRoutes.length === 0) {
    return false;
  }
  
  const normalizedPath = path.replace(/\/+$/, '') || '/';
  return mainApp.routes.skipTabbarRoutes.some(route => {
    const normalizedRoute = route.replace(/\/+$/, '') || '/';
    return normalizedPath === normalizedRoute || 
           normalizedPath.startsWith(normalizedRoute + '/');
  });
}

/**
 * 获取主应用首页路由（从配置读取）
 */
export function getMainAppHomeRoute(): string {
  const mainApp = getMainApp();
  return mainApp?.routes?.homeRoute || '/overview'; // 兜底值
}

/**
 * 根据路径获取应用标识（优先从 app-scanner，回退到路径推断）
 */
export function getAppIdFromPath(path: string): string {
  // 1. 优先从 app-scanner 通过 pathPrefix 获取
  const apps = getAllApps();
  for (const app of apps) {
    if (app.type === 'sub' && app.enabled) {
      const normalizedPathPrefix = app.pathPrefix.endsWith('/')
        ? app.pathPrefix.slice(0, -1)
        : app.pathPrefix;
      const normalizedPath = path.endsWith('/') && path !== '/'
        ? path.slice(0, -1)
        : path;
      
      // 精确匹配或路径前缀匹配
      if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/')) {
        return app.id;
      }
    }
  }
  
  // 2. 检查是否是主应用路由
  if (isMainAppRoute(path)) {
    return getMainAppId();
  }
  
  // 3. 回退到路径推断（兼容旧代码）
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/logistics')) return 'logistics';
  if (path.startsWith('/engineering')) return 'engineering';
  if (path.startsWith('/quality')) return 'quality';
  if (path.startsWith('/production')) return 'production';
  if (path.startsWith('/finance')) return 'finance';
  if (path.startsWith('/docs')) return 'docs';
  if (path.startsWith('/operations')) return 'operations';
  if (path.startsWith('/system')) return 'system';
  
  // 默认返回主应用
  return getMainAppId();
}

/**
 * 获取主应用路由配置（类型安全）
 */
export function getMainAppRoutes() {
  const mainApp = getMainApp();
  return mainApp?.routes || {
    mainAppRoutes: [],
    nonClosableRoutes: [],
    homeRoute: '/overview',
    skipTabbarRoutes: [],
  };
}

