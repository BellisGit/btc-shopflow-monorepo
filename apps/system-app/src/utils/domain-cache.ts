/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */

import type { } from '@btc/shared-components';
import { deleteCookie } from '@btc/shared-core/utils/cookie';
import { appStorage } from './app-storage';
import { BtcMessage, BtcNotification } from '@btc/shared-components';

let domainListCache: { data: any; timestamp: number } | null = null;
let pendingRequest: Promise<any> | null = null;
const CACHE_DURATION = 5000; // 缓存5秒


/**
 * 执行退出登录逻辑（清除数据并重定向）
 */
function handleLogout() {
  try {
    // 停止全局用户检查轮询
    try {
      import('@btc/shared-core/composables/user-check').then(({ stopUserCheckPolling }) => {
        stopUserCheckPolling();
      }).catch((error) => {
        // 如果导入失败，静默处理
        if (import.meta.env.DEV) {
          console.warn('Failed to stop global user check polling on logout:', error);
        }
      });
    } catch (error) {
      // 如果导入失败，静默处理
    }

    // 清除 cookie 中的 token
    deleteCookie('access_token');

    // 清除登录状态标记（从统一的 settings 存储中移除）
    const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
    if (currentSettings.is_logged_in) {
      delete currentSettings.is_logged_in;
      appStorage.settings.set(currentSettings);
    }

    // 清除所有认证相关数据（使用统一存储管理器）
    appStorage.auth.clear();
    appStorage.user.clear();

    // 清除 localStorage 中的 is_logged_in 标记（向后兼容）
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('is_logged_in');
    }

    // 显示提示信息
    BtcMessage.error('身份已过期，请重新登录');

    // 判断是否在生产环境的子域名下
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

    // 使用 setTimeout 确保消息提示先显示，然后再跳转
    setTimeout(() => {
      // 在生产环境子域名下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (isProductionSubdomain) {
        window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
      } else {
        // 开发环境：使用 window.location 跳转，添加 logout=1 参数
        window.location.href = '/login?logout=1';
      }
    }, 100);
  } catch (error) {
    console.error('[getDomainList] Logout error:', error);
    // 即使出错也尝试跳转到登录页
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login?logout=1';
      }, 100);
    }
  }
}


/**
 * 获取域列表（带缓存和请求锁）
 * 注意：此函数只负责获取域列表，不再进行用户状态检查
 * 用户状态检查由独立的 user-check 轮询机制处理
 */
export async function getDomainList(service: any): Promise<any> {
  const now = Date.now();

  // 检查缓存是否有效
  if (domainListCache && (now - domainListCache.timestamp) < CACHE_DURATION) {
    return domainListCache.data;
  }

  // 如果已经有请求在进行，等待该请求完成
  if (pendingRequest) {
    return await pendingRequest;
  }

  // 创建新请求
  pendingRequest = (async () => {
    try {
      // 确保 service 存在，避免 undefined 错误
      if (!service) {
        console.warn('[getDomainList] EPS service not available');
        return [];
      }
      const response = await service.admin?.iam?.domain?.me();
      // 更新缓存
      domainListCache = { data: response, timestamp: Date.now() };
      return response;
    } finally {
      // 清除请求锁
      pendingRequest = null;
    }
  })();

  return await pendingRequest;
}

/**
 * 清除缓存（用于强制刷新）
 */
export function clearDomainCache(): void {
  domainListCache = null;
  pendingRequest = null;
}


