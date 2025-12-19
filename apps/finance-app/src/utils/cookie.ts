/**
 * Cookie 工具函数
 */

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
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
}

/**
 * 设置 cookie 值
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数，默认为 7 天
 * @param domain cookie 域名，默认为当前域名
 */
export function setCookie(name: string, value: string, days: number = 7, domain?: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }

  const domainPart = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=${value}${expires}; path=/${domainPart}`;
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

/**
 * 获取跨子域名共享的 cookie domain
 * 在生产环境下返回 .bellis.com.cn，其他环境返回 undefined（不设置 domain）
 * @returns cookie domain 字符串或 undefined
 */
export function getCookieDomain(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const hostname = window.location.hostname;

  // 生产环境：设置 domain 为 .bellis.com.cn 以支持跨子域名共享
  if (hostname.includes('bellis.com.cn')) {
    return '.bellis.com.cn';
  }

  // 其他环境（开发、预览等）：不设置 domain，cookie 只在当前域名下有效
  return undefined;
}

