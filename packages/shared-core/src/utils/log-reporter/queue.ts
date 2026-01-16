/**
 * 日志队列管理
 * 负责批量收集日志，并在合适的时机批量上报
 */

import type { LogEntry, LogReporterOptions } from './types';

/**
 * 日志队列类
 */
export class LogQueue {
  private queue: LogEntry[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly batchSize: number;
  private readonly maxWaitTime: number;
  private onFlush: (logs: LogEntry[], skipRetry?: boolean) => Promise<void>;

  constructor(
    onFlush: (logs: LogEntry[], skipRetry?: boolean) => Promise<void>,
    options: Pick<LogReporterOptions, 'batchSize' | 'maxWaitTime'> = {}
  ) {
    this.onFlush = onFlush;
    this.batchSize = options.batchSize || 10;
    this.maxWaitTime = options.maxWaitTime || 5000;
  }

  /**
   * 添加日志到队列
   */
  add(entry: LogEntry): void {
    this.queue.push(entry);

    // 如果队列达到批量大小，立即刷新
    if (this.queue.length >= this.batchSize) {
      this.flush();
      return;
    }

    // 如果这是第一条日志，启动定时器
    if (this.queue.length === 1) {
      this.startTimer();
    }
  }

  /**
   * 启动定时器
   */
  private startTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.flush();
    }, this.maxWaitTime);
  }

  /**
   * 刷新队列（批量上报）
   * @param throwOnError 是否在错误时抛出异常（默认 false，用于测试场景）
   * @param skipRetry 是否跳过重试（默认 false，测试场景可以设为 true）
   */
  async flush(throwOnError: boolean = false, skipRetry: boolean = false): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    // 清除定时器
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 复制队列并清空
    const logsToSend = [...this.queue];
    this.queue = [];

    // 批量上报
    try {
      await this.onFlush(logsToSend, skipRetry);
    } catch (error) {
      // 上报失败，将日志重新加入队列（避免丢失）
      // 但限制队列大小，避免内存泄漏
      if (this.queue.length < 100) {
        this.queue.unshift(...logsToSend);
      }
      // 静默处理错误，不打印到控制台（避免干扰用户体验）
      // 如果需要调试，可以通过 throwOnError 参数控制
      if (throwOnError) {
        // 测试场景，重新抛出错误
        throw error;
      }
      // 生产环境静默失败，不打印错误
      
      // 如果设置了 throwOnError，重新抛出错误
      if (throwOnError) {
        throw error;
      }
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue = [];
  }

  /**
   * 获取队列长度
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * 销毁队列
   */
  destroy(): void {
    this.clear();
  }
}
