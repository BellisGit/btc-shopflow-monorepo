/**
 * 用户检查轮询统一接口
 */

import { startPolling, stopPolling, isPollingActive } from './useUserCheckPolling';
import { startCountdown, stopCountdown } from './useUserCheckCountdown';
import { getUserCheckDataFromStorage, getCredentialExpireTime, clearUserCheckData } from './useUserCheckStorage';
import type { UserCheckData } from './useUserCheck';

/**
 * 启动用户检查轮询
 * 在登录成功后立即调用，或在应用启动时检查到已登录时调用
 */
export function startUserCheckPolling(): void {
  // 如果已经在轮询，不重复启动
  if (isPollingActive()) {
    return;
  }

  // 启动轮询，每次检查后根据剩余时间决定是否启动倒计时
  startPolling(({ remainingTime, status }) => {
    // 如果剩余时间不足30秒，启动倒计时
    if (remainingTime < 30) {
      startCountdown();
    } else {
      // 如果剩余时间大于30秒，停止倒计时
      stopCountdown();
    }
  });
}

/**
 * 检查是否已登录，如果已登录则启动轮询
 * 在应用启动时调用
 */
export function startUserCheckPollingIfLoggedIn(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 如果已经在轮询，不重复启动
  if (isPollingActive()) {
    return;
  }

  // 检查是否在登录页面，如果是则不启动
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath.startsWith('/login?')) {
    return;
  }

  // 检查是否已登录
  try {
    // 方式1: 检查 cookie 中的 access_token
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        if (!c) continue;
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    };

    const token = getCookie('access_token');
    if (token) {
      startUserCheckPolling();
      return;
    }

    // 方式2: 检查全局 appStorage
    const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;
    if (appStorage) {
      const user = appStorage.user?.get?.();
      if (user?.id) {
        startUserCheckPolling();
        return;
      }

      // 方式3: 检查登录状态标记
      const settings = appStorage.settings?.get?.() as Record<string, any> | null;
      if (settings?.is_logged_in === true) {
        startUserCheckPolling();
        return;
      }
    }

    // 方式4: 检查 sessionStorage 中是否有用户检查数据（说明之前已登录）
    const hasUserCheckData = sessionStorage.getItem('btc_user_check_status');
    if (hasUserCheckData) {
      startUserCheckPolling();
      return;
    }
  } catch (error) {
    // 静默失败，不影响应用启动
    if (import.meta.env.DEV) {
      console.warn('[startUserCheckPollingIfLoggedIn] Failed to check login status:', error);
    }
  }
}

/**
 * 停止用户检查轮询
 * 在退出登录时调用
 */
export function stopUserCheckPolling(): void {
  stopPolling();
  stopCountdown();
  clearUserCheckData();
}

/**
 * 获取当前用户检查数据
 */
export function getUserCheckData(): {
  credentialExpireTime: string | null;
  sessionData: Partial<UserCheckData> | null;
} {
  return {
    credentialExpireTime: getCredentialExpireTime(),
    sessionData: getUserCheckDataFromStorage(),
  };
}

