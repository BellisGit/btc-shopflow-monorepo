/**
 * Cookie 工具函数
 */

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

  // 添加 SameSite 属性
  // 关键发现：开发服务器（8080）可以工作，但预览服务器（4180）不行
  // 可能的原因：开发服务器上后端返回的 Set-Cookie 可能没有 SameSite，浏览器使用默认值
  // 解决方案：在 IP 地址环境下，也不设置 SameSite，让浏览器使用默认值（与开发服务器一致）
  const isPreview = window.location.port.startsWith('41');
  const isHttps = window.location.protocol === 'https:';
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+/.test(window.location.hostname);

  if (options?.sameSite) {
    // 如果明确指定了 SameSite，使用指定的值
    // 但如果指定了 SameSite=None 且不是 HTTPS，浏览器会拒绝，所以改为不设置（让浏览器决定）
    if (options.sameSite === 'None' && !isHttps) {
      // 不设置 SameSite，让浏览器使用默认值
    } else {
      cookieString += `; SameSite=${options.sameSite}`;
    }
  } else if (isHttps) {
    // HTTPS 环境下：使用 SameSite=None（需要配合 Secure）
    cookieString += '; SameSite=None';
  } else if (isPreview && isIpAddress) {
    // 预览模式 + IP 地址 + HTTP：不设置 SameSite（让浏览器使用默认值，与开发服务器一致）
    // 不设置 SameSite
  } else {
    // 其他情况：不设置 SameSite（让浏览器使用默认值）
    // 注意：开发服务器可能也没有设置 SameSite，所以可以工作
  }

  // 添加 Secure 属性（仅在 HTTPS 时）
  // 注意：在 HTTP 环境下设置 Secure cookie 会被浏览器拒绝，所以必须检查协议
  // 即使 options.secure 为 true，如果不是 HTTPS，也不设置 Secure
  if (isHttps && (options?.secure || (isPreview && isHttps))) {
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
