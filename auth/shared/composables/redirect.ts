/**
 * 跨应用重定向工具
 * 用于处理登录后跳转到子应用的逻辑
 */

import { storage } from '@btc/shared-core/utils/storage';
import { logger } from '@btc/shared-core';

/**
 * storage 键名：保存退出前的路径
 */
const LOGOUT_REDIRECT_KEY = 'btc_logout_redirect_path';

/**
 * 子应用路径前缀映射
 */
const SUB_APP_PREFIXES = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/docs', '/dashboard', '/personnel'];

/**
 * 从路径中提取子应用名称
 * 例如：/admin/xxx -> admin
 */
function extractSubAppName(path: string): string | null {
  for (const prefix of SUB_APP_PREFIXES) {
    if (path.startsWith(prefix)) {
      // 移除前缀的 / 后就是应用名称
      return prefix.substring(1);
    }
  }
  return null;
}

/**
 * 从子域名或端口中提取子应用名称
 * @param hostname - 主机名，例如 'admin.bellis.com.cn' 或 'localhost:8081'
 * @returns 子应用名称，例如 'admin'，如果不是子应用则返回 null
 */
async function extractSubAppNameFromHost(hostname: string): Promise<string | null> {
  try {
    // 使用统一的环境检测和配置
    const { getEnvironment } = await import('@btc/shared-core/configs/unified-env-config');
    const { getAppConfigByTestHost, getAppConfigByPrePort, getAppConfig, getAppConfigByDevPort } = await import('@btc/shared-core/configs/app-env.config');

    const env = getEnvironment();
    const port = typeof window !== 'undefined' ? window.location.port || '' : '';

    if (env === 'test' || env === 'production') {
      // 测试/生产环境：通过子域名查找
      const appConfig = getAppConfigByTestHost(hostname);
      if (!appConfig && env === 'production') {
        // 生产环境：尝试通过所有配置查找匹配的子域名
        const { APP_ENV_CONFIGS } = await import('@btc/shared-core/configs/app-env.config');
        const matched = APP_ENV_CONFIGS.find(config => config.prodHost === hostname);
        if (matched) {
          return matched.appName.replace('-app', '');
        }
      } else if (appConfig) {
        return appConfig.appName.replace('-app', '');
      }
    } else if (env === 'preview' && port) {
      // 预览环境：通过端口查找
      const appConfig = getAppConfigByPrePort(port);
      if (appConfig) {
        return appConfig.appName.replace('-app', '');
      }
    } else if (env === 'development' && port) {
      // 开发环境：通过端口查找
      const appConfig = getAppConfigByDevPort(port);
      if (appConfig) {
        return appConfig.appName.replace('-app', '');
      }
    }
  } catch (error) {
    // 如果导入失败，静默返回 null
  }

  return null;
}

/**
 * 获取当前完整路径（转换为统一的路径格式）
 * 例如：
 * - 在 admin.bellis.com.cn/user/list 或 localhost:8081/user/list -> /admin/user/list
 * - 在 bellis.com.cn/admin/user/list -> /admin/user/list
 * - 在 bellis.com.cn/ -> /
 *
 * @returns 统一的路径格式，例如 '/admin/user/list' 或 '/'
 */
export async function getCurrentUnifiedPath(): Promise<string> {
  if (typeof window === 'undefined') {
    return '/';
  }

  const pathname = window.location.pathname;
  const hostname = window.location.hostname;

  // 尝试从 hostname 中提取子应用名称（使用统一的环境检测）
  const subAppName = await extractSubAppNameFromHost(hostname);

  if (subAppName) {
    // 如果在子应用中，路径格式为 /subApp/path
    // 如果 pathname 已经是 /admin/xxx 格式，直接返回
    // 否则拼接为 /subApp/pathname
    if (pathname.startsWith(`/${subAppName}`)) {
      return pathname;
    }
    // 如果 pathname 是根路径，返回 /subApp
    if (pathname === '/') {
      return `/${subAppName}`;
    }
    // 否则拼接为 /subApp/pathname
    return `/${subAppName}${pathname}`;
  }

  // 如果不在子应用中，检查 pathname 是否已经是子应用路径格式
  const subAppNameFromPath = extractSubAppName(pathname);
  if (subAppNameFromPath) {
    return pathname;
  }

  // 主应用路径，直接返回
  return pathname || '/';
}

/**
 * 同步版本的 getCurrentUnifiedPath（向后兼容）
 * 使用同步方式，但可能在某些环境下不够准确
 */
export function getCurrentUnifiedPathSync(): string {
  if (typeof window === 'undefined') {
    return '/';
  }

  const pathname = window.location.pathname;

  // 检查 pathname 是否已经是子应用路径格式
  const subAppNameFromPath = extractSubAppName(pathname);
  if (subAppNameFromPath) {
    return pathname;
  }

  // 主应用路径，直接返回
  return pathname || '/';
}

/**
 * 保存退出前的路径
 * 应该在退出登录时调用，保存当前路径以便登录后返回
 */
export async function saveLogoutRedirectPath(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const currentPath = await getCurrentUnifiedPath();
    // 保存到 storage，以便在跨域跳转后仍能访问
    // 注意：由于跨域限制，storage 在不同子域名之间无法共享
    // 但可以在同一域名下使用（开发环境或主域名下）
    storage.set(LOGOUT_REDIRECT_KEY, currentPath);
  } catch (error) {
    logger.warn('[saveLogoutRedirectPath] Failed to save logout redirect path:', error);
  }
}

/**
 * 获取并清除保存的退出前路径
 * 应该在登录成功后调用，获取保存的路径并清除
 *
 * @returns 保存的路径，如果没有则返回 null
 */
export function getAndClearLogoutRedirectPath(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedPath = storage.get<string>(LOGOUT_REDIRECT_KEY);
    if (savedPath) {
      // 获取后清除
      storage.remove(LOGOUT_REDIRECT_KEY);
      return savedPath;
    }
    return null;
  } catch (error) {
    logger.warn('[getAndClearLogoutRedirectPath] Failed to get logout redirect path:', error);
    return null;
  }
}

/**
 * 构建退出登录的 URL，包含当前路径作为 oauth_callback 参数
 * 用于在退出登录时跳转到登录页，并传递当前路径以便登录后返回
 * 支持多参数URL，保留原有的查询参数
 *
 * @param baseLoginUrl - 登录页的基础 URL，例如 '/login' 或 'https://bellis.com.cn/login'
 * @returns 包含 oauth_callback 参数的登录页 URL
 */
export async function buildLogoutUrl(baseLoginUrl: string = '/login'): Promise<string> {
  if (typeof window === 'undefined') {
    return baseLoginUrl;
  }

  try {
    const currentPath = await getCurrentUnifiedPath();
    // 如果当前路径是登录页，不添加 oauth_callback 参数
    if (currentPath === '/login' || currentPath.startsWith('/login?')) {
      // 保留原有参数，添加 logout=1
      const separator = baseLoginUrl.includes('?') ? '&' : '?';
      return `${baseLoginUrl}${separator}logout=1`;
    }

    // 解析 baseLoginUrl 的查询参数
    const urlObj = new URL(baseLoginUrl, window.location.origin);
    urlObj.searchParams.set('logout', '1');
    urlObj.searchParams.set('oauth_callback', currentPath);

    // 返回相对路径或完整URL（取决于 baseLoginUrl 的格式）
    if (baseLoginUrl.startsWith('http://') || baseLoginUrl.startsWith('https://')) {
      return urlObj.href;
    } else {
      // 相对路径：返回路径和查询字符串
      return urlObj.pathname + urlObj.search;
    }
  } catch (error) {
    logger.warn('[buildLogoutUrl] Failed to build logout URL:', error);
    // 回退方案
    const separator = baseLoginUrl.includes('?') ? '&' : '?';
    return `${baseLoginUrl}${separator}logout=1`;
  }
}

/**
 * 构建退出登录的 URL，使用完整URL作为 oauth_callback 参数
 * 用于跨子域名场景，确保登录后能精确跳转到对应子域名和页面
 * 根据当前环境（development/preview/test/production）构建正确的完整URL
 * 支持多参数URL，保留原有的查询参数
 *
 * @param baseLoginUrl - 登录页的基础 URL，例如 '/login' 或 'https://bellis.com.cn/login'
 * @returns 包含完整URL作为oauth_callback参数的登录页 URL
 */
export async function buildLogoutUrlWithFullUrl(baseLoginUrl: string = '/login'): Promise<string> {
  if (typeof window === 'undefined') {
    return baseLoginUrl;
  }

  try {
    // 使用统一的环境检测
    const { getEnvironment, getCurrentSubApp } = await import('@btc/shared-core/configs/unified-env-config');
    const { getAppConfig } = await import('@btc/shared-core/configs/app-env.config');

    const env = getEnvironment();
    const currentSubApp = getCurrentSubApp();

    // 获取当前完整路径（统一格式）
    const currentPath = await getCurrentUnifiedPath();

    // 如果当前在登录页，不添加 oauth_callback 参数
    if (currentPath === '/login' || currentPath.startsWith('/login')) {
      // 保留原有参数，添加 logout=1
      const separator = baseLoginUrl.includes('?') ? '&' : '?';
      return `${baseLoginUrl}${separator}logout=1`;
    }

    // 根据环境构建完整的URL
    let currentFullUrl: string;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port || '';
    const search = window.location.search;
    const hash = window.location.hash;

    if (env === 'test' && currentSubApp) {
      // 测试环境：使用测试环境的子域名
      const appConfig = getAppConfig(`${currentSubApp}-app`);
      if (appConfig?.testHost) {
        currentFullUrl = `${protocol}//${appConfig.testHost}${currentPath}${search}${hash}`;
      } else {
        // 回退：使用当前URL
        currentFullUrl = window.location.href;
      }
    } else if (env === 'production' && currentSubApp) {
      // 生产环境：使用生产环境的子域名
      const appConfig = getAppConfig(`${currentSubApp}-app`);
      if (appConfig?.prodHost) {
        currentFullUrl = `${protocol}//${appConfig.prodHost}${currentPath}${search}${hash}`;
      } else {
        // 回退：使用当前URL
        currentFullUrl = window.location.href;
      }
    } else if (env === 'preview' && currentSubApp && port) {
      // 预览环境：使用预览环境的端口
      const appConfig = getAppConfig(`${currentSubApp}-app`);
      if (appConfig?.preHost && appConfig?.prePort) {
        currentFullUrl = `http://${appConfig.preHost}:${appConfig.prePort}/index.html#${currentPath}${search}${hash}`;
      } else {
        // 回退：使用当前URL
        currentFullUrl = window.location.href;
      }
    } else if (env === 'development' && currentSubApp) {
      // 开发环境：使用开发环境的端口
      const appConfig = getAppConfig(`${currentSubApp}-app`);
      if (appConfig?.devHost && appConfig?.devPort) {
        currentFullUrl = `//${appConfig.devHost}:${appConfig.devPort}${currentPath}${search}${hash}`;
      } else {
        // 回退：使用当前URL
        currentFullUrl = window.location.href;
      }
    } else {
      // 主应用或其他情况：直接使用当前URL
      currentFullUrl = window.location.href;
    }

    // 解析 baseLoginUrl 的查询参数，保留原有参数
    const urlObj = new URL(baseLoginUrl, window.location.origin);
    urlObj.searchParams.set('logout', '1');
    urlObj.searchParams.set('oauth_callback', currentFullUrl);

    // 返回相对路径或完整URL（取决于 baseLoginUrl 的格式）
    if (baseLoginUrl.startsWith('http://') || baseLoginUrl.startsWith('https://')) {
      return urlObj.href;
    } else {
      // 相对路径：返回路径和查询字符串
      return urlObj.pathname + urlObj.search;
    }
  } catch (error) {
    logger.warn('[buildLogoutUrlWithFullUrl] Failed to build logout URL with full URL:', error);
      // 回退：使用当前URL
      try {
        const currentFullUrl = window.location.href;
        if (currentFullUrl.includes('/login')) {
          const separator = baseLoginUrl.includes('?') ? '&' : '?';
          return `${baseLoginUrl}${separator}logout=1`;
        }
        // 解析 baseLoginUrl 的查询参数，保留原有参数
        const urlObj = new URL(baseLoginUrl, window.location.origin);
        urlObj.searchParams.set('logout', '1');
        urlObj.searchParams.set('oauth_callback', currentFullUrl);

        if (baseLoginUrl.startsWith('http://') || baseLoginUrl.startsWith('https://')) {
          return urlObj.href;
        } else {
          return urlObj.pathname + urlObj.search;
        }
    } catch (e) {
      const separator = baseLoginUrl.includes('?') ? '&' : '?';
    return `${baseLoginUrl}${separator}logout=1`;
    }
  }
}

/**
 * 处理跨应用重定向
 * 支持完整URL和路径格式两种redirect参数
 * - 如果redirect是完整URL（以http://或https://开头），直接跳转
 * - 如果redirect是路径格式（以/开头），使用现有的跨应用重定向逻辑
 *
 * @param redirectPath - 重定向路径或完整URL，例如 '/admin/xxx'、'/' 或 'https://admin.bellis.com.cn/user/list?page=1'
 * @param router - Vue Router实例（可选，保留参数以保持兼容性，但当前未使用）
 * @returns 如果需要跨应用跳转，返回true；否则返回false
 */
export async function handleCrossAppRedirect(redirectPath: string, _router?: any): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  // 如果redirect是完整URL（以http://或https://开头），直接跳转
  if (redirectPath.startsWith('http://') || redirectPath.startsWith('https://')) {
    // 验证URL是否属于允许的域名（防止开放重定向攻击）
    try {
      const url = new URL(redirectPath);
      // 动态获取允许的主机列表（从配置中读取，支持测试环境）
      const { APP_ENV_CONFIGS } = await import('@btc/shared-core/configs/app-env.config');
      const allowedHosts = new Set<string>([
        'bellis.com.cn',
        'test.bellis.com.cn',
        'localhost',
        '127.0.0.1',
        '10.80.8.199',
      ]);

      // 添加所有应用的测试和生产环境主机
      APP_ENV_CONFIGS.forEach(config => {
        if (config.testHost) {
          allowedHosts.add(config.testHost);
        }
        if (config.prodHost) {
          allowedHosts.add(config.prodHost);
        }
        if (config.devHost) {
          allowedHosts.add(config.devHost);
        }
        if (config.preHost) {
          allowedHosts.add(config.preHost);
        }
      });

      // 检查 hostname 是否匹配允许的主机
      const isAllowed = Array.from(allowedHosts).some(host => {
        if (url.hostname === host) {
          return true;
        }
        // 支持子域名匹配，例如 admin.bellis.com.cn 匹配 bellis.com.cn
        if (host.includes('.')) {
          return url.hostname === host || url.hostname.endsWith(`.${host}`);
        }
        return false;
      });

      if (isAllowed) {
        window.location.href = redirectPath;
        return true;
      } else {
        logger.warn('[handleCrossAppRedirect] Redirect URL not allowed:', redirectPath);
        return false;
      }
    } catch (error) {
      logger.warn('[handleCrossAppRedirect] Invalid redirect URL:', redirectPath, error);
      return false;
    }
  }

  // 如果路径是根路径或系统域路径，使用router跳转（主应用内部跳转）
  if (redirectPath === '/' ||
      redirectPath.startsWith('/data') ||
      redirectPath.startsWith('/profile') ||
      redirectPath.startsWith('/login') ||
      redirectPath.startsWith('/forget-password') ||
      redirectPath.startsWith('/register')) {
    // 主应用路径，不需要跨应用跳转
    return false;
  }

  // 检查是否是子应用路径
  const subAppName = extractSubAppName(redirectPath);
  if (!subAppName) {
    // 不是子应用路径，使用router跳转
    return false;
  }

  // 提取子应用内的路径（移除应用前缀）
  const appPrefix = `/${subAppName}`;
  let subAppPath = redirectPath.startsWith(`${appPrefix}/`)
    ? redirectPath.substring(appPrefix.length)
    : redirectPath === appPrefix
    ? '/'
    : redirectPath;

  // 规范化路径：确保以 / 开头，但避免多个斜杠
  // 如果 subAppPath 为空或不是以 / 开头，添加 /
  if (!subAppPath || !subAppPath.startsWith('/')) {
    subAppPath = `/${subAppPath}`;
  }
  // 移除多余的斜杠（但保留单个 /）
  subAppPath = subAppPath.replace(/\/+/g, '/');

  try {
    // 使用统一的环境检测和配置
    const { getEnvironment } = await import('@btc/shared-core/configs/unified-env-config');
    const { getAppConfig } = await import('@btc/shared-core/configs/app-env.config');

    const env = getEnvironment();
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    const appConfig = getAppConfig(`${subAppName}-app`);
    if (!appConfig) {
      // 如果找不到对应的应用配置，使用router跳转（主应用内跳转）
      return false;
    }

    let targetUrl: string;

    if (env === 'test') {
      // 测试环境：使用测试环境的子域名
      if (appConfig.testHost) {
        targetUrl = `${protocol}//${appConfig.testHost}${subAppPath}`;
      } else {
        return false;
      }
    } else if (env === 'production') {
      // 生产环境：使用生产环境的子域名
      if (appConfig.prodHost) {
        targetUrl = `${protocol}//${appConfig.prodHost}${subAppPath}`;
      } else {
        return false;
      }
    } else if (env === 'preview') {
      // 预览环境：使用预览环境的端口
      if (appConfig.preHost && appConfig.prePort) {
        targetUrl = `http://${appConfig.preHost}:${appConfig.prePort}/index.html#${subAppPath}`;
      } else {
        return false;
      }
    } else if (env === 'development') {
      // 开发环境：使用开发环境的端口
      // 注意：使用 protocol-relative URL (//host:port) 时，需要确保 subAppPath 以 / 开头
      if (appConfig.devHost && appConfig.devPort) {
        targetUrl = `${protocol}//${appConfig.devHost}:${appConfig.devPort}${subAppPath}`;
      } else {
        return false;
      }
    } else {
      // 其他环境：假设在同一域名下，使用路径前缀（主应用路由）
      return false;
    }

    // 使用window.location进行跨应用跳转
    window.location.href = targetUrl;
    return true;
  } catch (error) {
    logger.warn('[handleCrossAppRedirect] Failed to build target URL:', error);
    return false;
  }
}

