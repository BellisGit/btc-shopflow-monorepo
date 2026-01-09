/**
 * 存储有效性检查工具
 * 用于检查认证相关的存储（cookie、localStorage）是否有效
 * 当检测到存储被清除时，自动触发退出逻辑
 */

import { storage } from './storage/local';
import { sessionStorage } from './storage/session';

// 防止重复触发退出的标志
let isLoggingOut = false;

// Profile 信息存储键名（与 profile-info-cache.ts 保持一致）
const PROFILE_INFO_STORAGE_KEY = 'btc_profile_info_data';

/**
 * 检查是否在登录页
 */
function isLoginPage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const pathname = window.location.pathname;
  return pathname === '/login' || pathname.startsWith('/login?');
}

/**
 * 检查认证存储的有效性
 * 只检查顶栏用户个人信息 profile 存储的 key 是否存在
 * 如果不存在，说明存储被清除，需要退出
 * 
 * 注意：在登录页不进行检查，避免循环重定向
 */
export function checkStorageValidity(): boolean {
  // 如果在登录页，直接返回 true，不进行检查（避免循环重定向）
  if (isLoginPage()) {
    return true;
  }

  try {
    // 只检查 profile 信息存储 key 是否存在
    // 优先从 sessionStorage 检查
    const sessionData = sessionStorage.get(PROFILE_INFO_STORAGE_KEY);
    if (sessionData) {
      return true;
    }
    
    // 其次从 localStorage 检查
    const localData = storage.get(PROFILE_INFO_STORAGE_KEY);
    if (localData) {
      return true;
    }
    
    // 如果两个存储中都没有，说明存储被清除
    return false;
  } catch (error) {
    // 检查失败，保守返回 false
    return false;
  }
}

/**
 * 触发自动退出（当检测到存储被清除时）
 */
export async function triggerAutoLogout(): Promise<void> {
  // 防止重复触发
  if (isLoggingOut) {
    return;
  }

  // 如果已经在登录页，不需要再次跳转
  if (isLoginPage()) {
    return;
  }

  isLoggingOut = true;

  try {
    // 动态导入 logoutCore
    const { logoutCore } = await import('../auth/logoutCore');
    
    // 调用退出逻辑（标记为远程退出，不调用 API）
    await logoutCore({
      isRemoteLogout: true,
    });

    // 退出成功后，跳转到登录页
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      if (isProductionSubdomain) {
        // 生产环境子域名，跳转到主域名登录页
        window.location.href = `${protocol}//bellis.com.cn/login?oauth_callback=${encodeURIComponent(currentPath)}`;
      } else {
        // 开发环境或主域名，跳转到本地登录页
        window.location.href = `/login?oauth_callback=${encodeURIComponent(currentPath)}`;
      }
    }
  } catch (error) {
    console.error('[storageValidityCheck] 自动退出失败:', error);
    // 即使退出失败，也尝试跳转到登录页（但需要检查是否已在登录页）
    if (typeof window !== 'undefined' && !isLoginPage()) {
      try {
        window.location.href = '/login';
      } catch (e) {
        // 静默失败
      }
    }
  } finally {
    // 延迟重置标志，避免立即再次触发
    setTimeout(() => {
      isLoggingOut = false;
    }, 2000);
  }
}
