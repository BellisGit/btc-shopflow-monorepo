/**
 * 用户检查轮询统一接口
 */

import { startPolling, stopPolling, isPollingActive } from './useUserCheckPolling';
import { startCountdown, stopCountdown } from './useUserCheckCountdown';
import { getUserCheckDataFromStorage, getCredentialExpireTime, clearUserCheckData } from './useUserCheckStorage';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import type { UserCheckData } from './useUserCheck';

/**
 * 启动用户检查轮询
 * @param forceImmediate 是否强制立即检查（登录后需要立即调用一次，获取最新的剩余时间）
 * 在登录成功后立即调用时，应传递 forceImmediate = true
 * 在应用启动时检查到已登录时调用，应传递 forceImmediate = false（使用存储的剩余时间）
 */
export function startUserCheckPolling(forceImmediate = false): void {
  // 如果已经在轮询，不重复启动
  if (isPollingActive()) {
    return;
  }

  // 启动轮询，每次检查后根据剩余时间决定是否启动倒计时
  startPolling(({ remainingTime }) => {
    // 如果剩余时间不足30秒，启动倒计时
    if (remainingTime < 30) {
      startCountdown();
    } else {
      // 如果剩余时间大于30秒，停止倒计时
      stopCountdown();
    }
  }, forceImmediate);
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
    // 优先检查是否是刚登录（通过 is_logged_in 标记）
    const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;
    let isJustLoggedIn = false;
    if (appStorage) {
      const settings = appStorage.settings?.get?.() as Record<string, any> | null;
      if (settings?.is_logged_in === true) {
        // 清除登录标记，避免下次启动时再次强制检查
        isJustLoggedIn = true;
        delete settings.is_logged_in;
        appStorage.settings.set(settings);
      }
    }

    // 如果检测到刚登录，强制立即检查
    if (isJustLoggedIn) {
      startUserCheckPolling(true);
      return;
    }

    // 方式1: 检查 sessionStorage 中是否有用户检查数据（说明之前已登录）
    // 优先使用存储的剩余时间，避免页面刷新时立即调用
    const hasUserCheckData = sessionStorage.get('user_check_status');
    if (hasUserCheckData) {
      // 页面刷新后恢复，使用存储的剩余时间，不强制立即检查
      startUserCheckPolling(false);
      return;
    }

    // 方式2: 检查 cookie 中的 access_token
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
      // 有 token 但没有 sessionStorage 数据，可能是首次登录或 sessionStorage 被清除
      // 此时应该立即检查，获取最新的剩余时间
      startUserCheckPolling(true);
      return;
    }

    // 方式3: 检查全局 appStorage
    if (appStorage) {
      const user = appStorage.user?.get?.();
      if (user?.id) {
        // 有用户数据但没有 sessionStorage 数据，应该立即检查
        startUserCheckPolling(true);
        return;
      }
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

/**
 * 应用切换时重新初始化 user-check
 * 在 qiankun afterMount 或主应用切换时调用
 */
export async function reinitializeUserCheckOnAppSwitch(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  // 如果当前在登录页面，不重新初始化
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath.startsWith('/login?')) {
    return;
  }

  try {
    // 停止当前轮询和倒计时
    stopUserCheckPolling();

    // 立即调用 user-check 获取最新数据
    const { checkUser } = await import('./useUserCheck');
    const { storeUserCheckData } = await import('./useUserCheckStorage');
    
    const result = await checkUser();

    if (!result || !result.isValid || !result.data) {
      // 检查失败，不启动轮询
      if (import.meta.env.DEV) {
        console.warn('[reinitializeUserCheckOnAppSwitch] User check failed, not starting polling');
      }
      return;
    }

    // 立即更新会话存储数据（保证数据最新，用于比对）
    storeUserCheckData(result.data);

    // 根据新的数据重新启动轮询（强制立即检查，获取最新数据）
    startUserCheckPolling(true);
  } catch (error) {
    // 静默失败，不影响应用切换
    if (import.meta.env.DEV) {
      console.warn('[reinitializeUserCheckOnAppSwitch] Failed to reinitialize user check:', error);
    }
  }
}

