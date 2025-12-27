/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */

import type { } from '@btc/shared-components';
import { deleteCookie } from './cookie';
import { appStorage } from './app-storage';
import { BtcMessage, BtcNotification } from '@btc/shared-components';

let domainListCache: { data: any; timestamp: number } | null = null;
let pendingRequest: Promise<any> | null = null;
const CACHE_DURATION = 5000; // 缓存5秒

// 动态轮询相关变量
let dynamicPollingTimeout: ReturnType<typeof setTimeout> | null = null;
let isPollingActive = false;
let isLoggedOut = false;
let lastWarningTime = 0; // 上次提醒时间（毫秒时间戳）
const WARNING_INTERVAL = 60 * 1000; // 提醒间隔：60秒（避免频繁提醒）

// 使用 sessionStorage 保存轮询状态和剩余时间，避免页面刷新后重复调用 user-check
const POLLING_STATE_KEY = '__btc_user_check_polling_state';
const POLLING_STATE_DURATION = 5 * 60 * 1000; // 轮询状态有效期：5分钟

/**
 * 从 sessionStorage 获取上次检查的剩余时间
 * 如果存在且有效，则使用该值启动轮询，避免立即调用 user-check
 */
function getLastRemainingTime(): number | null {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return null;
  }

  try {
    const stateStr = sessionStorage.getItem(POLLING_STATE_KEY);
    if (!stateStr) {
      return null;
    }

    const state = JSON.parse(stateStr);
    const now = Date.now();
    const elapsed = now - state.timestamp;

    // 如果状态在有效期内（5分钟），且有剩余时间数据
    // 注意：不检查 pollingActive，因为页面刷新时 pollingActive 可能被清除，但剩余时间仍然有效
    if (elapsed < POLLING_STATE_DURATION && state.remainingTime !== null && state.remainingTime !== undefined) {
      // 计算实际剩余时间（减去已过去的时间）
      const elapsedSeconds = Math.floor(elapsed / 1000);
      const actualRemainingTime = Math.max(0, state.remainingTime - elapsedSeconds);

      return actualRemainingTime > 0 ? actualRemainingTime : null;
    }

    // 状态已过期，清除
    sessionStorage.removeItem(POLLING_STATE_KEY);
    return null;
  } catch (error) {
    // 解析失败，清除无效状态
    if (import.meta.env.DEV) {
      console.warn('[user-check] 解析 sessionStorage 状态失败:', error);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(POLLING_STATE_KEY);
    }
    return null;
  }
}

/**
 * 保存轮询状态和剩余时间到 sessionStorage
 */
function savePollingState(pollingActive: boolean, remainingTime?: number): void {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(
      POLLING_STATE_KEY,
      JSON.stringify({
        pollingActive,
        remainingTime: remainingTime ?? null,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    // sessionStorage 可能不可用（隐私模式等），忽略错误
    if (import.meta.env.DEV) {
      console.warn('[user-check] Failed to save polling state:', error);
    }
  }
}

/**
 * 执行退出登录逻辑（清除数据并重定向）
 */
function handleLogout() {
  try {
    // 关键：停止 user-check 轮询，清除 sessionStorage 中的状态
    stopDynamicPolling(true);

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
 * 用户检查（检查用户登录状态）
 * @returns 如果正常返回用户数据，如果401返回 null，其他错误抛出异常
 */
async function checkUser(): Promise<{
  isValid: boolean;
  data?: {
    status: 'valid' | 'expired' | 'soon_expire' | 'unauthorized';
    serverCurrentTime: string;
    credentialExpireTime: string;
    remainingTime: number;
    details: string;
  };
  remainingTime?: number;
} | null> {
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

    const httpStatus = response.status;
    const code = responseData?.code;

    // 如果返回200，说明cookie正常
    if (code === 200 || httpStatus === 200) {
      // 实际数据在 responseData.data 中
      const userData = responseData?.data;

      // 检查响应数据格式，确保包含必要字段
      if (import.meta.env.DEV && userData) {
        console.log('[checkUser] 用户检查成功', {
          status: userData.status,
          remainingTime: userData.remainingTime,
          serverCurrentTime: userData.serverCurrentTime,
          credentialExpireTime: userData.credentialExpireTime,
        });
      }

      return {
        isValid: true,
        data: userData,
        remainingTime: userData?.remainingTime,
      };
    }

    // 如果返回401，说明cookie已过期
    if (code === 401 || httpStatus === 401) {
      return null;
    }

    // 其他情况，默认认为正常（避免因为其他错误导致无法加载域列表）
    const userData = responseData?.data;
    return {
      isValid: true,
      data: userData,
      remainingTime: userData?.remainingTime,
    };
  } catch (error: any) {
    // 检查错误对象本身的 code 属性
    if (error?.code === 401) {
      return null;
    }

    // 其他错误，默认认为正常（避免因为网络错误导致无法加载域列表）
    console.warn('[checkUser] User check failed, but continue:', error);
    return {
      isValid: true,
    };
  }
}

/**
 * 显示时间提醒（当剩余时间较短时）
 * @param remainingTime 剩余过期时间（秒）
 */
function showTimeWarning(remainingTime: number): void {
  const now = Date.now();

  // 避免频繁提醒（60秒内只提醒一次）
  if (now - lastWarningTime < WARNING_INTERVAL) {
    return;
  }

  // 根据剩余时间显示不同的提醒
  let message = '';
  let type: 'warning' | 'error' = 'warning';

  if (remainingTime <= 60) {
    // 剩余时间 <= 60秒，显示错误提醒
    message = `登录凭证即将过期，剩余 ${remainingTime} 秒，请及时保存工作`;
    type = 'error';
  } else if (remainingTime <= 5 * 60) {
    // 剩余时间 <= 5分钟，显示警告提醒
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    message = `登录凭证即将过期，剩余 ${minutes} 分 ${seconds} 秒，请及时保存工作`;
    type = 'warning';
  } else if (remainingTime <= 10 * 60) {
    // 剩余时间 <= 10分钟，显示提示
    const minutes = Math.floor(remainingTime / 60);
    message = `登录凭证将在 ${minutes} 分钟后过期，请及时保存工作`;
    type = 'warning';
  } else {
    // 剩余时间 > 10分钟，不提醒
    return;
  }

  // 显示提醒
  if (type === 'error') {
    BtcNotification.error(message, {
      title: '登录凭证即将过期',
      duration: 0, // 不自动关闭
    });
  } else {
    BtcNotification.warning(message, {
      title: '登录凭证即将过期',
      duration: 5000, // 5秒后自动关闭
    });
  }

  lastWarningTime = now;
}

/**
 * 基于剩余过期时间计算动态轮询间隔（反向指数退避）
 * @param remainingTime 剩余过期时间（秒）
 * @returns 下一次轮询间隔（毫秒）
 */
function calculateDynamicInterval(remainingTime: number): number {
  // 定义间隔规则（反向指数：剩余时间越短，间隔越小）
  const rules = [
    { threshold: 30 * 60, interval: 5 * 60 * 1000 }, // >30分钟 → 5分钟
    { threshold: 10 * 60, interval: 2 * 60 * 1000 }, // 10~30分钟 → 2分钟
    { threshold: 5 * 60, interval: 1 * 60 * 1000 },  // 5~10分钟 → 1分钟
    { threshold: 1 * 60, interval: 30 * 1000 },      // 1~5分钟 → 30秒
    { threshold: 30, interval: 5 * 1000 }             // <30秒 → 5秒
  ];

  // 匹配规则，返回对应间隔
  for (const rule of rules) {
    if (remainingTime > rule.threshold) {
      return rule.interval;
    }
  }
  return 5 * 1000; // 兜底：最小间隔5秒
}

/**
 * 动态轮询 user-check 接口（递归调用，替代固定 setInterval）
 * @param advanceTime 提前退出时间（秒，如60秒），默认60秒
 */
async function dynamicUserCheckPolling(advanceTime = 60): Promise<void> {
  if (isLoggedOut || !isPollingActive) {
    return; // 已退出或轮询已停止，终止轮询
  }

  // 关键：如果当前在登录页面，停止轮询
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath.startsWith('/login?')) {
      stopDynamicPolling(true);
      return;
    }
  }

  try {
    // 1. 调用 user-check 接口
    const result = await checkUser();

    // 2. 如果返回 null，说明凭证已过期
    if (!result) {
      handleLogout();
      isLoggedOut = true;
      stopDynamicPolling(true); // 清除 sessionStorage 状态
      return;
    }

    // 3. 如果返回数据，检查状态和剩余时间
    const { data, remainingTime } = result;

    // 如果没有 data，说明可能是旧格式的响应，使用默认间隔继续轮询
    if (!data) {
      // 如果没有剩余时间数据，使用默认间隔（30秒）
      dynamicPollingTimeout = setTimeout(() => {
        dynamicUserCheckPolling(advanceTime);
      }, 30 * 1000);
      return;
    }

    const status = data.status;
    const remaining = remainingTime ?? data.remainingTime;

    // 如果剩余时间为 undefined 或 null，说明接口可能还没返回完整数据，使用默认间隔继续轮询
    if (remaining === undefined || remaining === null) {
      if (import.meta.env.DEV) {
        console.warn('[动态轮询] 未获取到剩余过期时间，使用默认间隔继续轮询');
      }
      dynamicPollingTimeout = setTimeout(() => {
        dynamicUserCheckPolling(advanceTime);
      }, 30 * 1000);
      return;
    }

    // 如果状态是已过期或未授权，执行退出
    if (status === 'expired' || status === 'unauthorized') {
      if (import.meta.env.DEV) {
        console.log(`[动态轮询] 用户状态：${status}，执行退出`);
      }
      handleLogout();
      isLoggedOut = true;
      stopDynamicPolling(true); // 清除 sessionStorage 状态
      return;
    }

    // 如果状态是 valid 或 soon_expire，继续处理
    if (status === 'valid' || status === 'soon_expire') {
      // 如果剩余时间 <= 0，执行退出
      if (remaining <= 0) {
        if (import.meta.env.DEV) {
          console.log(`[动态轮询] 剩余过期时间：${remaining}秒，执行退出`);
        }
        handleLogout();
        isLoggedOut = true;
        stopDynamicPolling(true); // 清除 sessionStorage 状态
        return;
      }

      // 显示时间提醒（当剩余时间较短时）
      showTimeWarning(remaining);

      // 如果剩余时间 <= 提前退出时间，执行退出
      if (remaining <= advanceTime) {
        if (import.meta.env.DEV) {
          console.log(`[动态轮询] 剩余过期时间：${remaining}秒 <= 提前退出时间：${advanceTime}秒，执行退出`);
        }
        handleLogout();
        isLoggedOut = true;
        stopDynamicPolling(true); // 清除 sessionStorage 状态
        return;
      }

      // 保存轮询状态和剩余时间到 sessionStorage
      savePollingState(true, remaining);

      // 4. 计算下一次轮询间隔，递归调用（核心：动态间隔）
      const nextInterval = calculateDynamicInterval(remaining);

      if (import.meta.env.DEV) {
        console.log(`[动态轮询] 剩余过期时间：${remaining}秒，下次轮询间隔：${nextInterval / 1000}秒`);
      }

      dynamicPollingTimeout = setTimeout(() => {
        dynamicUserCheckPolling(advanceTime);
      }, nextInterval);
    } else {
      // 如果状态未知或不是预期的值，使用默认间隔继续轮询，不退出
      if (import.meta.env.DEV) {
        console.warn(`[动态轮询] 未知状态：${status}，使用默认间隔继续轮询`);
      }
      dynamicPollingTimeout = setTimeout(() => {
        dynamicUserCheckPolling(advanceTime);
      }, 30 * 1000);
      return;
    }
  } catch (error) {
    console.error('[动态轮询] User check failed:', error);
    // 异常时：间隔加倍重试（传统指数退避），最多重试间隔30秒
    const currentInterval = dynamicPollingTimeout
      ? (dynamicPollingTimeout as any)._idleTimeout || 10 * 1000
      : 10 * 1000;
    const retryInterval = Math.min(currentInterval * 2, 30 * 1000);

    dynamicPollingTimeout = setTimeout(() => {
      dynamicUserCheckPolling(advanceTime);
    }, retryInterval);
  }
}

/**
 * 启动动态轮询（页面加载时调用）
 * @param advanceTime 提前退出时间（秒），默认60秒
 * @param initialRemainingTime 初始剩余时间（秒），如果提供，则跳过第一次检查，直接使用该值计算间隔
 * @param forceImmediateCheck 是否强制立即检查（登录后需要立即调用一次，获取最长的剩余时间）
 */
export function startDynamicUserCheckPolling(advanceTime = 60, initialRemainingTime?: number, forceImmediateCheck = false): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 关键：如果当前在登录页面，不启动轮询
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath.startsWith('/login?')) {
    return;
  }

  // 先停止已有轮询
  stopDynamicPolling();

  // 重置状态
  isLoggedOut = false;
  isPollingActive = true;

  // 关键：如果检测到刚登录（is_logged_in 为 true），强制立即调用一次 user-check
  // 这样可以获取到最长的剩余时间（刚登录时剩余时间最长）
  let shouldForceCheck = forceImmediateCheck;
  if (!shouldForceCheck) {
    try {
      const currentSettings = appStorage.settings.get() as Record<string, any> | null;
      if (currentSettings?.is_logged_in === true) {
        shouldForceCheck = true;
        // 清除登录标记，避免下次启动时再次强制检查
        delete currentSettings.is_logged_in;
        appStorage.settings.set(currentSettings);
      }
    } catch (error) {
      // 静默失败，不影响轮询启动
    }
  }

  // 如果强制立即检查（登录后），直接执行第一次检查，不管 sessionStorage 中是否有数据
  if (shouldForceCheck) {
    dynamicUserCheckPolling(advanceTime);
    return;
  }

  // 优先从 sessionStorage 获取上次的剩余时间（如果存在且有效）
  const lastRemainingTime = getLastRemainingTime();
  const finalRemainingTime = initialRemainingTime ?? lastRemainingTime;

  // 如果提供了初始剩余时间或从 sessionStorage 恢复了剩余时间，跳过第一次检查，直接计算间隔并延迟执行
  if (finalRemainingTime !== undefined && finalRemainingTime !== null && finalRemainingTime > 0) {
    const nextInterval = calculateDynamicInterval(finalRemainingTime);
    // 保存轮询状态和剩余时间到 sessionStorage
    savePollingState(true, finalRemainingTime);
    dynamicPollingTimeout = setTimeout(() => {
      dynamicUserCheckPolling(advanceTime);
    }, nextInterval);
  } else {
    // 没有初始剩余时间，立即执行第一次检查
    dynamicUserCheckPolling(advanceTime);
  }
}

/**
 * 停止动态轮询（页面关闭/主动退出时调用）
 * @param clearState 是否清除 sessionStorage 中的状态，默认 false（保留状态以便刷新后恢复）
 */
export function stopDynamicPolling(clearState = false): void {
  isPollingActive = false;
  if (dynamicPollingTimeout) {
    clearTimeout(dynamicPollingTimeout);
    dynamicPollingTimeout = null;
  }
  // 只有在明确要求清除状态时才清除（如用户主动退出登录）
  // 页面刷新时不清除，保留状态以便刷新后恢复
  if (clearState) {
    savePollingState(false);
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

// 页面卸载时只清除定时器，不清除 sessionStorage（保留状态以便刷新后恢复）
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // 只清除定时器，不清除 sessionStorage 中的状态
    // 这样刷新后可以从 sessionStorage 恢复剩余时间，避免立即调用 user-check
    isPollingActive = false;
    if (dynamicPollingTimeout) {
      clearTimeout(dynamicPollingTimeout);
      dynamicPollingTimeout = null;
    }
    // 不调用 savePollingState(false)，保留 sessionStorage 中的状态
  });
}

