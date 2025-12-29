/**
 * 用户检查轮询管理器
 */

import { checkUser } from './useUserCheck';
import { storeUserCheckData, getUserCheckDataFromStorage } from './useUserCheckStorage';

type PollingCallback = (data: { remainingTime: number; status: string }) => void;

let pollingTimer: ReturnType<typeof setTimeout> | null = null;
let isPolling = false;
let currentCallback: PollingCallback | null = null;

/**
 * 根据剩余时间计算下次轮询间隔（反向指数退避算法）
 * @param remainingTime 剩余时间（秒）
 * @returns 下次轮询间隔（毫秒）
 */
function calculatePollingInterval(remainingTime: number): number {
  const remainingMinutes = remainingTime / 60;

  if (remainingMinutes > 30) {
    // 大于30分钟：20分钟调用一次
    return 20 * 60 * 1000;
  } else if (remainingMinutes >= 10) {
    // 10分钟到30分钟：5分钟调用一次
    return 5 * 60 * 1000;
  } else if (remainingMinutes >= 3) {
    // 3分钟到10分钟：2分钟调用一次
    return 2 * 60 * 1000;
  } else if (remainingMinutes >= 1) {
    // 1分钟到3分钟：30秒调用一次
    return 30 * 1000;
  } else if (remainingTime >= 30) {
    // 30秒到1分钟：10秒调用一次
    return 10 * 1000;
  } else {
    // 小于30秒：5秒调用一次
    return 5 * 1000;
  }
}

/**
 * 执行一次用户检查并安排下次轮询
 */
async function performCheck(): Promise<void> {
  if (!isPolling) {
    return;
  }

  try {
    const result = await checkUser();

    if (!result || !result.isValid || !result.data) {
      // 检查失败，停止轮询
      stopPolling();
      return;
    }

    const { data, remainingTime } = result;

    // 存储数据
    storeUserCheckData(data);

    // 通知回调
    if (currentCallback) {
      currentCallback({
        remainingTime: remainingTime || data.remainingTime,
        status: data.status,
      });
    }

    // 如果剩余时间为0且状态为expired，停止轮询（由倒计时逻辑处理退出）
    if (data.remainingTime <= 0 && data.status === 'expired') {
      stopPolling();
      return;
    }

    // 计算下次轮询间隔
    const interval = calculatePollingInterval(data.remainingTime);

    // 安排下次轮询
    if (isPolling) {
      pollingTimer = setTimeout(() => {
        performCheck();
      }, interval);
    }
  } catch (error) {
    console.error('[useUserCheckPolling] Check failed:', error);
    // 即使出错也继续轮询（使用默认间隔）
    if (isPolling) {
      pollingTimer = setTimeout(() => {
        performCheck();
      }, 5 * 60 * 1000); // 默认5分钟
    }
  }
}

/**
 * 启动用户检查轮询
 * @param callback 每次检查后的回调函数
 * @param forceImmediate 是否强制立即检查（登录后需要立即调用一次）
 */
export function startPolling(callback?: PollingCallback, forceImmediate = false): void {
  if (isPolling) {
    // 如果已经在轮询，先停止
    stopPolling();
  }

  isPolling = true;
  currentCallback = callback || null;

  // 如果不是强制立即检查，尝试从 sessionStorage 恢复剩余时间
  if (!forceImmediate && typeof window !== 'undefined') {
    try {
      const storedData = getUserCheckDataFromStorage();
      const storedRemainingTime = storedData?.remainingTime;

      // 如果存在有效的剩余时间（大于0），使用该时间计算第一次轮询间隔
      if (storedRemainingTime !== undefined && storedRemainingTime !== null && storedRemainingTime > 0) {
        // 计算下次轮询间隔
        const interval = calculatePollingInterval(storedRemainingTime);

        // 如果间隔大于0，延迟执行第一次检查
        if (interval > 0) {
          pollingTimer = setTimeout(() => {
            performCheck();
          }, interval);
          return;
        }
      }
    } catch (error) {
      // 如果恢复失败，继续执行立即检查
      if (import.meta.env.DEV) {
        console.warn('[useUserCheckPolling] Failed to restore remaining time from storage:', error);
      }
    }
  }

  // 如果没有存储的剩余时间，或者强制立即检查，立即执行一次检查
  performCheck();
}

/**
 * 停止用户检查轮询
 */
export function stopPolling(): void {
  isPolling = false;
  currentCallback = null;

  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }
}

/**
 * 检查是否正在轮询
 */
export function isPollingActive(): boolean {
  return isPolling;
}

