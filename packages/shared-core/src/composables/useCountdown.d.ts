import type { ComputedRef, MaybeRef } from 'vue';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
}

export interface UseCountdownOptions {
  /** 是否自动开始，默认 true */
  autoStart?: boolean;
  /** 更新间隔（毫秒），默认 1000 */
  interval?: number;
}

export interface UseCountdownReturn {
  countdown: ComputedRef<CountdownResult>;
  formattedText: ComputedRef<string>;
  start: () => void;
  stop: () => void;
  restart: () => void;
}

/**
 * 倒计时 composable
 * @param targetTime 目标时间（Date、字符串、时间戳或响应式引用）
 * @param options 配置选项
 */
export declare function useCountdown(
  targetTime: MaybeRef<Date | string | number>,
  options?: UseCountdownOptions
): UseCountdownReturn;

