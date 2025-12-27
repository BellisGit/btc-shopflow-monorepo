/**
 * Cookie 工具函数
 */

/**
 * 删除 cookie
 * 注意：如果 cookie 是 HttpOnly 的，前端无法删除，需要后端通过 Set-Cookie header 清除
 * @param name cookie 名称
 * @param options 额外选项（domain 等）
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

  // 基本删除尝试（仅对非 HttpOnly cookie 有效）
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

  if (domain) {
    cookieString += `; Domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * 获取 cookie 值
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
    if (!c) continue;
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
}

/**
 * 设置 cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数，默认为 7 天
 * @param options 额外选项
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
  let cookieString = `${name}=${encodeURIComponent(value)}${expires}; path=${path}`;

  const isHttps = window.location.protocol === 'https:';

  if (options?.sameSite) {
    if (options.sameSite === 'None' && !isHttps) {
      // 不设置 SameSite
    } else {
      cookieString += `; SameSite=${options.sameSite}`;
    }
  } else if (isHttps) {
    cookieString += '; SameSite=Lax';
  }

  if (isHttps && options?.secure) {
    cookieString += '; Secure';
  }

  if (options?.domain) {
    cookieString += `; Domain=${options.domain}`;
  }

  document.cookie = cookieString;
}
