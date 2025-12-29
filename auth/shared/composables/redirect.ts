/**
 * 跨应用重定向工具
 * 用于处理登录后跳转到子应用的逻辑
 */

/**
 * localStorage 键名：保存退出前的路径
 */
const LOGOUT_REDIRECT_KEY = 'btc_logout_redirect_path';

/**
 * 子应用路径前缀映射
 */
const SUB_APP_PREFIXES = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/docs', '/dashboard', '/personnel'];

/**
 * 子应用名称到端口的映射（开发环境）
 */
const SUB_APP_DEV_PORTS: Record<string, string> = {
  'admin': '8081',
  'logistics': '8082',
  'quality': '8083',
  'production': '8084',
  'engineering': '8085',
  'finance': '8086',
  'operations': '8087',
  'docs': '8087',
  'dashboard': '8089',
  'personnel': '8090',
};

/**
 * 子应用名称到子域名的映射（生产环境）
 */
const SUB_APP_SUBDOMAINS: Record<string, string> = {
  'admin': 'admin.bellis.com.cn',
  'logistics': 'logistics.bellis.com.cn',
  'quality': 'quality.bellis.com.cn',
  'production': 'production.bellis.com.cn',
  'engineering': 'engineering.bellis.com.cn',
  'finance': 'finance.bellis.com.cn',
  'operations': 'operations.bellis.com.cn',
  'docs': 'docs.bellis.com.cn',
  'dashboard': 'dashboard.bellis.com.cn',
  'personnel': 'personnel.bellis.com.cn',
};

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
function extractSubAppNameFromHost(hostname: string): string | null {
  const hostnameLower = hostname.toLowerCase();
  
  // 检查是否是生产环境的子域名
  for (const [appName, subdomain] of Object.entries(SUB_APP_SUBDOMAINS)) {
    if (hostnameLower === subdomain || hostnameLower.startsWith(`${subdomain}:`)) {
      return appName;
    }
  }
  
  // 检查是否是开发环境的端口
  const portMatch = hostname.match(/:(\d+)$/);
  if (portMatch) {
    const port = portMatch[1];
    for (const [appName, appPort] of Object.entries(SUB_APP_DEV_PORTS)) {
      if (port === appPort) {
        return appName;
      }
    }
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
export function getCurrentUnifiedPath(): string {
  if (typeof window === 'undefined') {
    return '/';
  }

  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  
  // 尝试从 hostname 中提取子应用名称（生产环境子域名或开发环境端口）
  const subAppName = extractSubAppNameFromHost(hostname);
  
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
 * 保存退出前的路径
 * 应该在退出登录时调用，保存当前路径以便登录后返回
 */
export function saveLogoutRedirectPath(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const currentPath = getCurrentUnifiedPath();
    // 保存到 localStorage，以便在跨域跳转后仍能访问
    // 注意：由于跨域限制，localStorage 在不同子域名之间无法共享
    // 但可以在同一域名下使用（开发环境或主域名下）
    localStorage.setItem(LOGOUT_REDIRECT_KEY, currentPath);
  } catch (error) {
    console.warn('[saveLogoutRedirectPath] Failed to save logout redirect path:', error);
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
    const savedPath = localStorage.getItem(LOGOUT_REDIRECT_KEY);
    if (savedPath) {
      // 获取后清除
      localStorage.removeItem(LOGOUT_REDIRECT_KEY);
      return savedPath;
    }
    return null;
  } catch (error) {
    console.warn('[getAndClearLogoutRedirectPath] Failed to get logout redirect path:', error);
    return null;
  }
}

/**
 * 构建退出登录的 URL，包含当前路径作为 redirect 参数
 * 用于在退出登录时跳转到登录页，并传递当前路径以便登录后返回
 * 
 * @param baseLoginUrl - 登录页的基础 URL，例如 '/login' 或 'https://bellis.com.cn/login'
 * @returns 包含 redirect 参数的登录页 URL
 */
export function buildLogoutUrl(baseLoginUrl: string = '/login'): string {
  if (typeof window === 'undefined') {
    return baseLoginUrl;
  }
  
  try {
    const currentPath = getCurrentUnifiedPath();
    // 如果当前路径是登录页，不添加 redirect 参数
    if (currentPath === '/login' || currentPath.startsWith('/login?')) {
      return baseLoginUrl.includes('?') ? `${baseLoginUrl}&logout=1` : `${baseLoginUrl}?logout=1`;
    }
    
    // 构建包含 redirect 参数的 URL
    const separator = baseLoginUrl.includes('?') ? '&' : '?';
    const encodedPath = encodeURIComponent(currentPath);
    return `${baseLoginUrl}${separator}logout=1&redirect=${encodedPath}`;
  } catch (error) {
    console.warn('[buildLogoutUrl] Failed to build logout URL:', error);
    return baseLoginUrl.includes('?') ? `${baseLoginUrl}&logout=1` : `${baseLoginUrl}?logout=1`;
  }
}

/**
 * 处理跨应用重定向
 * 如果redirect路径是子应用路径，则跳转到对应的子应用URL
 * 
 * @param redirectPath - 重定向路径，例如 '/admin/xxx' 或 '/'
 * @param router - Vue Router实例（可选，保留参数以保持兼容性，但当前未使用）
 * @returns 如果需要跨应用跳转，返回true；否则返回false
 */
export function handleCrossAppRedirect(redirectPath: string, _router?: any): boolean {
  if (typeof window === 'undefined') {
    return false;
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
  const subAppPath = redirectPath.startsWith(`${appPrefix}/`)
    ? redirectPath.substring(appPrefix.length)
    : redirectPath === appPrefix
    ? '/'
    : redirectPath;

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isProduction = hostname.includes('bellis.com.cn');
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';

  let targetUrl: string;

  if (isProduction) {
    // 生产环境：跳转到子域名
    const subdomain = SUB_APP_SUBDOMAINS[subAppName];
    if (!subdomain) {
      // 如果找不到对应的子域名，使用router跳转（主应用内跳转）
      return false;
    }
    targetUrl = `${protocol}//${subdomain}${subAppPath}`;
  } else if (isDevelopment) {
    // 开发环境：跳转到对应的端口
    const port = SUB_APP_DEV_PORTS[subAppName];
    if (!port) {
      // 如果找不到对应的端口，使用router跳转（主应用内跳转）
      return false;
    }
    targetUrl = `${protocol}//${hostname}:${port}${subAppPath}`;
  } else {
    // 其他环境：假设在同一域名下，使用路径前缀（主应用路由）
    // 这种情况下，应该使用router跳转，因为子应用可能是通过路径前缀访问的
    return false;
  }

  // 使用window.location进行跨应用跳转
  window.location.href = targetUrl;
  return true;
}

