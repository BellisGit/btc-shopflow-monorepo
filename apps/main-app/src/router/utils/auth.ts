import { getCookie } from '@btc/shared-core/utils/cookie';
;
import { storage } from '@btc/shared-utils';

/**
 * 检查用户是否已认证
 * 注意：cookie 是后端设置的，是认证的权威来源。如果 cookie 不存在，说明后端已经认为用户未认证。
 * 支持通过 btc_user cookie 中的 credentialExpireTime 来判断是否过期。
 * 同时支持检查 is_logged_in 标记，用于解决登录成功后立即跳转时 cookie 可能还没准备好的问题。
 * 
 * 关键修复：优先检查 cookie，cookie 是认证的权威来源。如果 cookie 不存在，即使 is_logged_in 标记存在，也认为未认证。
 * 但为了兼容登录后立即跳转的场景，如果 is_logged_in 标记存在且 cookie 也存在，则信任标记。
 */
export function isAuthenticated(): boolean {
  // 首先检查 access_token cookie（如果后端没有设置 HttpOnly，可以读取）
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
      // 关键：即使 is_logged_in 标记存在，如果 cookie 不存在，也认为未认证
      // 清除可能存在的 is_logged_in 标记（防止状态不一致）
      // 直接操作存储，避免触发存储有效性检查
      try {
        const settingsKey = 'settings';
        const currentSettings = (storage.get(settingsKey) as Record<string, any>) || {};
        if (currentSettings.is_logged_in === true) {
          delete currentSettings.is_logged_in;
          storage.set(settingsKey, currentSettings);
        }
      } catch (error) {
        // 静默失败
      }
      return false;
    }

    // 解析 btc_user cookie（getCookie 已经处理了 URL 解码）
    const btcUser = JSON.parse(btcUserCookie);
    const credentialExpireTime = btcUser?.credentialExpireTime;

    // 如果 cookie 存在，检查 is_logged_in 标记（用于解决登录后立即跳转时 cookie 可能还没准备好的问题）
    // 但只有在 cookie 也存在时才信任这个标记
    // 关键：直接读取 settings 存储，不通过 appStorage.settings.get()，避免触发存储有效性检查导致反复重定向
    try {
      const settingsKey = 'settings';
      const currentSettings = (storage.get(settingsKey) as Record<string, any>) || {};
      if (currentSettings.is_logged_in === true) {
        // 如果标记存在且 cookie 也存在，说明刚登录成功，即使过期时间还没准备好，也认为已认证
        // 这样可以避免登录成功后立即跳转时被路由守卫重定向回登录页
        return true;
      }
    } catch (error) {
      // 如果检查失败，继续检查其他方式
    }

    if (!credentialExpireTime) {
      // 如果没有过期时间，无法判断，保守返回 false
      // 清除可能存在的 is_logged_in 标记（直接操作存储，避免触发检查）
      try {
        const settingsKey = 'settings';
        const currentSettings = (storage.get(settingsKey) as Record<string, any>) || {};
        if (currentSettings.is_logged_in === true) {
          delete currentSettings.is_logged_in;
          storage.set(settingsKey, currentSettings);
        }
      } catch (error) {
        // 静默失败
      }
      return false;
    }

    // 比较当前时间与过期时间
    const expireTime = new Date(credentialExpireTime).getTime();
    const now = Date.now();

    // 如果当前时间小于过期时间，说明还在有效期内
    if (now < expireTime) {
      return true;
    }

    // 已过期，清除 is_logged_in 标记（直接操作存储，避免触发检查）
    try {
      const settingsKey = 'settings';
      const currentSettings = (storage.get(settingsKey) as Record<string, any>) || {};
      if (currentSettings.is_logged_in === true) {
        delete currentSettings.is_logged_in;
        storage.set(settingsKey, currentSettings);
      }
    } catch (error) {
      // 静默失败
    }
    return false;
  } catch (error) {
    // 解析失败，保守返回 false
    // 清除可能存在的 is_logged_in 标记（直接操作存储，避免触发检查）
    try {
      const settingsKey = 'settings';
      const currentSettings = (storage.get(settingsKey) as Record<string, any>) || {};
      if (currentSettings.is_logged_in === true) {
        delete currentSettings.is_logged_in;
        storage.set(settingsKey, currentSettings);
      }
    } catch (e) {
      // 静默失败
    }
    console.warn('[isAuthenticated] Failed to check credential expire time:', error);
    return false;
  }
}

