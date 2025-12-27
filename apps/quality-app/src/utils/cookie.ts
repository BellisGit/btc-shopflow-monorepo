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
    if (!c) continue;
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
 * 设置 cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数（可选）
 * @param options 额外选项（SameSite、Secure 等）
 */
export function setCookie(
  name: string,
  value: string,
  days?: number,
  options?: {
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
    domain?: string;
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

  let cookieString = name + '=' + value + expires + '; path=/';

  // 添加 SameSite 属性（默认 Lax，兼容性最好）
  if (options?.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`;
  } else {
    cookieString += '; SameSite=Lax';
  }

  // 添加 Secure 属性（仅在 HTTPS 时设置）
  if (options?.secure && location.protocol === 'https:') {
    cookieString += '; Secure';
  }

  // 添加 domain 属性（如果指定）
  if (options?.domain) {
    cookieString += `; Domain=${options.domain}`;
  }

  document.cookie = cookieString;
}

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

