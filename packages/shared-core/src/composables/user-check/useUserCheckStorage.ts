/**
 * 用户检查数据存储
 */

import { getCookie, setCookie, getCookieDomain } from './utils/cookie';
import type { UserCheckData } from './useUserCheck';

const SESSION_STORAGE_KEYS = {
  STATUS: 'btc_user_check_status',
  SERVER_TIME: 'btc_user_check_serverTime',
  REMAINING_TIME: 'btc_user_check_remainingTime',
  DETAILS: 'btc_user_check_details',
} as const;

/**
 * 存储用户检查数据
 * @param data 用户检查数据
 */
export function storeUserCheckData(data: UserCheckData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // 1. 将 credentialExpireTime 存储到 cookie 的 btc_user 中
    const btcUserCookie = getCookie('btc_user');
    let btcUser: any = {};
    
    if (btcUserCookie) {
      try {
        // getCookie 已经做了 decodeURIComponent，所以直接解析
        btcUser = JSON.parse(btcUserCookie);
      } catch (e) {
        // 如果解析失败，使用空对象
        btcUser = {};
      }
    }

    // 更新 credentialExpireTime
    btcUser.credentialExpireTime = data.credentialExpireTime;

    // 重新设置 cookie
    const domain = getCookieDomain();
    const isHttps = window.location.protocol === 'https:';
    setCookie('btc_user', JSON.stringify(btcUser), 7, {
      sameSite: isHttps ? 'None' : undefined,
      secure: isHttps,
      path: '/',
      domain: domain,
    });

    // 2. 将其他四个字段存储到 sessionStorage
    sessionStorage.setItem(SESSION_STORAGE_KEYS.STATUS, data.status);
    sessionStorage.setItem(SESSION_STORAGE_KEYS.SERVER_TIME, data.serverCurrentTime);
    sessionStorage.setItem(SESSION_STORAGE_KEYS.REMAINING_TIME, String(data.remainingTime));
    sessionStorage.setItem(SESSION_STORAGE_KEYS.DETAILS, data.details);
  } catch (error) {
    console.error('[storeUserCheckData] Failed to store data:', error);
  }
}

/**
 * 从 cookie 获取 credentialExpireTime
 */
export function getCredentialExpireTime(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const btcUserCookie = getCookie('btc_user');
    if (!btcUserCookie) {
      return null;
    }

    // getCookie 已经做了 decodeURIComponent，所以直接解析
    const btcUser = JSON.parse(btcUserCookie);
    return btcUser?.credentialExpireTime || null;
  } catch (error) {
    console.error('[getCredentialExpireTime] Failed to get credentialExpireTime:', error);
    return null;
  }
}

/**
 * 从 sessionStorage 获取用户检查数据
 */
export function getUserCheckDataFromStorage(): Partial<UserCheckData> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const status = sessionStorage.getItem(SESSION_STORAGE_KEYS.STATUS);
    const serverTime = sessionStorage.getItem(SESSION_STORAGE_KEYS.SERVER_TIME);
    const remainingTime = sessionStorage.getItem(SESSION_STORAGE_KEYS.REMAINING_TIME);
    const details = sessionStorage.getItem(SESSION_STORAGE_KEYS.DETAILS);

    if (!status && !serverTime && !remainingTime && !details) {
      return null;
    }

    return {
      status: status as UserCheckData['status'] | undefined,
      serverCurrentTime: serverTime || undefined,
      remainingTime: remainingTime ? Number(remainingTime) : undefined,
      details: details || undefined,
    };
  } catch (error) {
    console.error('[getUserCheckDataFromStorage] Failed to get data:', error);
    return null;
  }
}

/**
 * 清除用户检查数据
 */
export function clearUserCheckData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.STATUS);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.SERVER_TIME);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.REMAINING_TIME);
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.DETAILS);
  } catch (error) {
    console.error('[clearUserCheckData] Failed to clear data:', error);
  }
}

