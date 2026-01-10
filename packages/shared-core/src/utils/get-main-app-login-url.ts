/**
 * 获取主应用登录页 URL
 * 用于子应用在独立运行时重定向到主应用的登录页面
 * 关键：只有主应用有登录页面，子应用没有登录页面
 * 所以子应用在生产环境子域名下必须重定向到主应用的登录页面
 */

import { getEnvironment, getCurrentSubApp } from '../configs/unified-env-config';

/**
 * 获取主应用登录页 URL
 * @param redirectPath - 登录后重定向的路径（可选）
 * @returns 主应用登录页的完整 URL
 */
export function getMainAppLoginUrl(redirectPath?: string): string {
  if (typeof window === 'undefined') {
    return '/login';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  const redirectQuery = redirectPath ? `?oauth_callback=${encodeURIComponent(redirectPath)}` : '';

  const env = getEnvironment();
  const currentSubApp = getCurrentSubApp();

  // 生产环境或测试环境：如果是子域名（如 system.bellis.com.cn 或 system.test.bellis.com.cn），重定向到主应用的登录页面
  // 关键：只有主应用有登录页面，子应用没有登录页面
  if ((env === 'production' || env === 'test') && currentSubApp) {
    // 子域名环境，重定向到主应用的登录页面
    const mainDomain = env === 'test' ? 'test.bellis.com.cn' : 'bellis.com.cn';
    return `${protocol}//${mainDomain}/login${redirectQuery}`;
  }

  // 开发环境：主应用在 localhost:8080 (main-app)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const mainAppPort = '8080';
    return `${protocol}//${hostname}:${mainAppPort}/login${redirectQuery}`;
  }

  // 其他环境：使用当前域名的登录页面（假设是主应用）
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/login${redirectQuery}`;
}
