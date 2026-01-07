/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */

import { deleteCookie } from '@btc/shared-core/utils/cookie';
import { appStorage } from './app-storage';
import { BtcMessage } from '@btc/shared-components';

let domainListCache: { data: any; timestamp: number } | null = null;
let pendingRequest: Promise<any> | null = null;
const CACHE_DURATION = 5000; // 缓存5秒

/**
 * 执行退出登录逻辑（清除数据并重定向）
 */
function handleLogout() {
  try {
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
      // 关键：只有主应用（bellis.com.cn）有登录页面，子应用没有登录页面
      // 所以在生产环境子域名下，必须重定向到主应用的登录页面
      if (isProductionSubdomain) {
        // 子域名环境，重定向到主应用的登录页面
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
 * 用户检查（检查用户登录状态）
 * @returns 如果正常返回 true，如果401返回 false，其他错误抛出异常
 */
async function checkUser(): Promise<boolean> {
  try {
    // 使用 fetch API 调用用户检查接口，避免构建时的依赖问题
    const response = await fetch('/api/system/auth/user-check', {
      method: 'GET',
      credentials: 'include', // 包含 cookie
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 解析响应数据
    // 先读取文本，避免响应体为空时 JSON 解析失败
    const responseText = await response.text();
    let responseData: any = null;
    if (responseText.trim()) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // JSON 解析失败，但继续处理状态码
        console.warn('[checkUser] Failed to parse JSON response:', parseError);
      }
    }
    const code = responseData?.code;
    const status = response.status;

    // 如果返回200，说明cookie正常
    if (code === 200 || status === 200) {
      return true;
    }

    // 如果返回401，说明cookie已过期
    if (code === 401 || status === 401) {
      return false;
    }

    // 其他情况，默认认为正常（避免因为其他错误导致无法加载域列表）
    return true;
  } catch (error: any) {
    // 检查错误对象本身的 code 属性
    if (error?.code === 401) {
      return false;
    }

    // 其他错误，默认认为正常（避免因为网络错误导致无法加载域列表）
    console.warn('[getDomainList] User check failed, but continue:', error);
    return true;
  }
}

/**
 * 获取域列表（带缓存和请求锁）
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
      // 首先进行用户检查
      const isHealthy = await checkUser();
      if (!isHealthy) {
        // cookie已过期，执行退出登录逻辑（同步执行，不等待）
        handleLogout();
        // 返回空数组，避免继续执行
        return [];
      }

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
