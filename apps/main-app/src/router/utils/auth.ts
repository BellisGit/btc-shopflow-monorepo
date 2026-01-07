import { getCookie } from '@btc/shared-core/utils/cookie';
import { appStorage } from '../../utils/app-storage';

/**
 * 检查用户是否已认证
 * 注意：cookie 是后端设置的，是认证的权威来源。如果 cookie 不存在，说明后端已经认为用户未认证。
 * 支持通过 btc_user cookie 中的 credentialExpireTime 来判断是否过期。
 * 同时支持检查 is_logged_in 标记，用于解决登录成功后立即跳转时 cookie 可能还没准备好的问题。
 */
export function isAuthenticated(): boolean {
  // 首先检查 is_logged_in 标记（登录成功后立即设置，用于解决 cookie 同步时序问题）
  try {
    const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
    if (currentSettings.is_logged_in === true) {
      // 如果标记存在，说明刚登录成功，即使 cookie 还没准备好，也认为已认证
      // 这样可以避免登录成功后立即跳转时被路由守卫重定向回登录页
      return true;
    }
  } catch (error) {
    // 如果检查失败，继续检查其他方式
    if (import.meta.env.DEV) {
      console.warn('[isAuthenticated] Failed to check is_logged_in flag:', error);
    }
  }

  // 然后尝试检查 access_token cookie（如果后端没有设置 HttpOnly，可以读取）
  const cookieToken = getCookie('access_token');

  // 如果 access_token cookie 存在，说明已认证（后端会管理 cookie 的生命周期）
  if (cookieToken) {
    return true;
  }

  // 如果 access_token 读不到（可能是 HttpOnly），则检查 btc_user cookie 中的过期时间
  // user-check 会将 credentialExpireTime 存储到 btc_user cookie 中
  try {
    const btcUserCookie = getCookie('btc_user');
    if (!btcUserCookie) {
      // 如果 btc_user cookie 也不存在，说明未登录
      return false;
    }

    // 解析 btc_user cookie（getCookie 已经处理了 URL 解码）
    const btcUser = JSON.parse(btcUserCookie);
    const credentialExpireTime = btcUser?.credentialExpireTime;

    if (!credentialExpireTime) {
      // 如果没有过期时间，无法判断，保守返回 false
      return false;
    }

    // 比较当前时间与过期时间
    const expireTime = new Date(credentialExpireTime).getTime();
    const now = Date.now();

    // 如果当前时间小于过期时间，说明还在有效期内
    if (now < expireTime) {
      return true;
    }

    // 已过期
    return false;
  } catch (error) {
    // 解析失败，保守返回 false
    console.warn('[isAuthenticated] Failed to check credential expire time:', error);
    return false;
  }
}

