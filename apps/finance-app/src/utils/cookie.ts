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
 * @param name cookie 名称
 * @param domain cookie 域名，默认为当前域名
 */
export function deleteCookie(name: string, domain?: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const domainPart = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
}

/**
 * 获取 cookie 域名
 * @returns cookie 域名
 */
export function getCookieDomain(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const hostname = window.location.hostname;
  
  // 如果是 localhost 或 IP 地址，返回空字符串（使用当前域名）
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return '';
  }

  // 如果是子域名（如 admin.bellis.com.cn），返回主域名（bellis.com.cn）
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return '.' + parts.slice(-2).join('.');
  }

  return '.' + hostname;
}

