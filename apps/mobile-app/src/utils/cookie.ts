/**
 * Cookie 工具函数
 */

/**
 * 获取 cookie 的 domain
 * 对于 bellis.com.cn 及其子域名，使用 .bellis.com.cn 作为 domain
 * 这样可以确保 cookie 在所有子域名之间共享
 */
function getCookieDomain(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  
  const hostname = window.location.hostname;
  
  // 如果是 bellis.com.cn 或其子域名，使用 .bellis.com.cn
  if (hostname.includes('bellis.com.cn')) {
    return '.bellis.com.cn';
  }
  
  // 开发环境（localhost、127.0.0.1、内网IP）不设置 domain，使用默认值
  return undefined;
}

/**
 * 读取 cookie 值
 * @param name cookie 名称
 * @returns cookie 值，如果不存在则返回 null
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      return value;
    }
  }

  return null;
}

/**
 * 设置 cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数（可选，默认 7 天）
 * @param options 额外选项（SameSite、Secure 等）
 */
export function setCookie(
  name: string,
  value: string,
  days: number = 7,
  options?: {
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
    domain?: string;
    path?: string;
  }
): void {
  if (typeof document === 'undefined') {
    return;
  }

  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }

  const path = options?.path || '/';
  let cookieString = `${name}=${value}${expires}; path=${path}`;

  const isHttps = window.location.protocol === 'https:';
  
  // 确定 domain：优先使用 options.domain，否则使用自动检测的 domain
  const domain = options?.domain ?? getCookieDomain();
  
  if (options?.sameSite) {
    if (options.sameSite === 'None' && !isHttps) {
      // 不设置 SameSite，让浏览器使用默认值
    } else {
      cookieString += `; SameSite=${options.sameSite}`;
    }
  } else if (isHttps) {
    cookieString += '; SameSite=None';
  }

  if (isHttps && options?.secure) {
    cookieString += '; Secure';
  }

  if (domain) {
    cookieString += `; Domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * 删除 cookie
 */
export function deleteCookie(
  name: string,
  options?: {
    domain?: string;
    path?: string;
  }
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const path = options?.path || '/';
  const domain = options?.domain;

  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

  if (domain) {
    cookieString += `; Domain=${domain}`;
  }

  document.cookie = cookieString;
}

