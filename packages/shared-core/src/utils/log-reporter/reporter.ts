/**
 * 日志上报核心逻辑
 * 负责将日志上报到服务器
 */

import type { LogEntry, LogReporterOptions, LogReportResponse, LogReportRequest } from './types';
import { LogQueue } from './queue';
import { getCurrentAppId } from '../env-info';
import { getFullAppId, convertToServerLogEntry, toISOString, estimateLogSize } from './utils';
import { isBusinessApp, isSpecialAppById } from '../../configs/app-env.config';

/**
 * 日志上报器类
 */
export class LogReporter {
  private queue: LogQueue;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly enabled: boolean;
  private readonly silent: boolean;
  private appName: string;
  // 限流：记录最近 1 秒内的请求时间戳（后端限制 QPS 为每秒 5 次）
  private readonly requestTimestamps: number[] = [];
  private readonly maxRequestsPerSecond: number = 5;

  constructor(options: LogReporterOptions = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.enabled = options.enabled !== false;
    this.silent = options.silent || false;

    // 获取应用名称
    this.appName = this.getAppName();

    // 创建日志队列
    // 注意：reportLogs 需要接收 skipRetry 参数，但 LogQueue 的 onFlush 签名不支持
    // 所以我们需要通过闭包来传递 skipRetry
    this.queue = new LogQueue(
      (logs, skipRetry) => this.reportLogs(logs, skipRetry),
      {
        batchSize: options.batchSize || 10,
        maxWaitTime: options.maxWaitTime || 5000,
      }
    );
  }

  /**
   * 获取应用名称
   */
  private getAppName(): string {
    // 优先从环境信息获取
    const appId = getCurrentAppId();
    if (appId) {
      return appId;
    }

    // 从 window 对象获取
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__APP_NAME__) {
        return win.__APP_NAME__;
      }
      if (win.__QIANKUN_APP_NAME__) {
        return win.__QIANKUN_APP_NAME__;
      }
    }

    // 默认值
    return 'unknown';
  }

  /**
   * 上报日志（批量）
   * @param skipRetry 是否跳过重试（用于测试场景）
   */
  private async reportLogs(logs: LogEntry[], skipRetry: boolean = false): Promise<void> {
    if (!this.enabled || logs.length === 0) {
      return;
    }

    // 确保所有日志都有应用名称，并过滤掉特殊应用
    const logsWithAppName = logs
      .map(log => ({
        ...log,
        appName: log.appName || this.appName,
      }))
      .filter(log => {
        // 只上报主应用和业务应用的日志，过滤掉特殊应用
        const appName = log.appName;
        const appNameForCheck = appName.endsWith('-app') ? appName : `${appName}-app`;
        // 允许 invalid-app 通过，用于测试错误情况
        if (appNameForCheck === 'invalid-app') {
          return true;
        }
        // 允许主应用（main-app）上报
        if (appNameForCheck === 'main-app') {
          return true;
        }
        // 允许业务应用上报
        return isBusinessApp(appNameForCheck);
      });

    // 如果所有日志都被过滤掉，直接返回
    if (logsWithAppName.length === 0) {
      return;
    }

    // 限流：确保不超过每秒 5 次请求
    await this.waitForRateLimit();

    // 重试机制（测试场景可以跳过）
    const maxAttempts = skipRetry ? 1 : this.maxRetries + 1;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.sendLogs(logsWithAppName);
        if (response.success) {
          return; // 上报成功
        }
        throw new Error(response.message || '上报失败');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // 如果是 429 错误（Too Many Requests），增加等待时间
        if (error instanceof Error && error.message.includes('429')) {
          // 429 错误表示限流，等待更长时间后重试
          await this.sleep(2000); // 等待 2 秒
          // 清理请求时间戳，重置限流窗口
          this.requestTimestamps.length = 0;
          continue;
        }

        // 如果是最后一次尝试，直接抛出错误（不等待）
        if (attempt >= maxAttempts - 1) {
          break;
        }

        // 如果不是最后一次尝试，等待后重试
        await this.sleep(this.retryDelay * (attempt + 1)); // 指数退避
      }
    }

    // 所有重试都失败，抛出错误
    if (lastError) {
      if (!this.silent) {
        console.error('[LogReporter] 日志上报失败（已重试）:', lastError);
      }
      throw lastError;
    }
  }

  /**
   * 发送日志到服务器
   */
  private async sendLogs(logs: LogEntry[]): Promise<LogReportResponse> {
    if (logs.length === 0) {
      return { success: true, count: 0 };
    }

    const appName = logs[0]?.appName || this.appName;
    const fullAppId = getFullAppId(appName);

    // 转换为服务器格式并过滤过大的日志
    const serverLogs = logs
      .map(convertToServerLogEntry)
      .filter(entry => {
        const size = estimateLogSize(entry);
        if (size > 2048) {
          console.warn('[LogReporter] 日志条目过大，已跳过:', entry);
          return false;
        }
        return true;
      });

    if (serverLogs.length === 0) {
      return { success: true, count: 0, message: '所有日志条目都被过滤' };
    }

    // 构建请求体
    // 注意：logs 字段需要是 JSON 字符串，后端会反序列化
    // 批次时间戳使用第一条日志的时间戳，确保时间戳一致性
    const batchTimestamp = serverLogs.length > 0 
      ? serverLogs[0].timestamp 
      : toISOString(Date.now());
    
    const requestBody: LogReportRequest = {
      appId: fullAppId,
      timestamp: batchTimestamp,
      logs: JSON.stringify(serverLogs),
    };

    // URL 使用不带 -app 后缀的应用名
    const appNameForUrl = appName.endsWith('-app') ? appName.slice(0, -4) : appName;
    const url = `/api/system/logs/${appNameForUrl}/receive`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // 不阻塞主线程，使用 keepalive（如果支持）
        keepalive: true,
      });

      // 先尝试解析响应体（无论成功还是失败）
      let responseData: any;
      try {
        responseData = await response.json();
      } catch {
        // 如果无法解析 JSON，使用默认处理
        responseData = null;
      }

      // 检查 HTTP 状态码
      if (!response.ok) {
        // 尝试解析后端返回的错误信息
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (responseData) {
          // 后端可能返回 {code, msg, data} 格式的错误
          if (responseData.msg) {
            errorMessage = `HTTP ${response.status}: ${responseData.msg}`;
          } else if (responseData.message) {
            errorMessage = `HTTP ${response.status}: ${responseData.message}`;
          }
        }
        throw new Error(errorMessage);
      }

      // 检查响应体中的业务状态码（即使 HTTP 状态码是 200，业务状态码也可能表示错误）
      if (responseData && typeof responseData.code === 'number' && responseData.code !== 200) {
        // 业务状态码表示错误
        let errorMessage = `业务错误 ${responseData.code}`;
        if (responseData.msg) {
          errorMessage = `业务错误 ${responseData.code}: ${responseData.msg}`;
        } else if (responseData.message) {
          errorMessage = `业务错误 ${responseData.code}: ${responseData.message}`;
        }
        throw new Error(errorMessage);
      }

      // 响应成功
      return {
        success: true,
        message: responseData?.message,
        count: responseData?.count || serverLogs.length,
      };
    } catch (error) {
      // 网络错误或其他错误
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * 添加日志到队列
   */
  report(entry: LogEntry): void {
    if (!this.enabled) {
      return;
    }

    // 确保日志有应用名称和时间戳
    const appName = entry.appName || this.appName;
    const logEntry: LogEntry = {
      ...entry,
      appName,
      timestamp: entry.timestamp || Date.now(),
    };

    // 只上报主应用和业务应用的日志，过滤掉特殊应用（layout-app, docs-app, home-app, mobile-app）
    // 判断方式：检查 appName 是否为主应用或业务应用
    const appNameForCheck = appName.endsWith('-app') ? appName : `${appName}-app`;
    // 允许 invalid-app 通过，用于测试错误情况
    if (appNameForCheck === 'invalid-app') {
      // 测试用应用，允许上报
    } else if (appNameForCheck === 'main-app') {
      // 主应用，允许上报
    } else if (!isBusinessApp(appNameForCheck)) {
      // 如果不是业务应用，静默跳过，不进行上报
      if (import.meta.env.DEV) {
        console.debug('[LogReporter] 跳过特殊应用的日志上报:', appName);
      }
      return;
    }

    this.queue.add(logEntry);
  }

  /**
   * 立即刷新队列（用于应用关闭时）
   * @param throwOnError 是否在错误时抛出异常（默认 true，用于测试场景）
   * @param skipRetry 是否跳过重试（默认 false，测试场景可以设为 true）
   * @throws 如果上报失败且 throwOnError 为 true，会抛出错误
   */
  async flush(throwOnError: boolean = true, skipRetry: boolean = false): Promise<void> {
    // 使用队列的 flush 方法，传递 throwOnError 和 skipRetry 参数
    await this.queue.flush(throwOnError, skipRetry);
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue.clear();
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * 销毁上报器
   */
  destroy(): void {
    this.queue.destroy();
  }

  /**
   * 限流：等待直到可以发送请求（确保不超过每秒 5 次）
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    // 清理 1 秒之前的请求时间戳
    while (this.requestTimestamps.length > 0 && this.requestTimestamps[0] < oneSecondAgo) {
      this.requestTimestamps.shift();
    }

    // 如果当前 1 秒内的请求数已达到限制，等待
    if (this.requestTimestamps.length >= this.maxRequestsPerSecond) {
      const oldestRequestTime = this.requestTimestamps[0];
      const waitTime = 1000 - (now - oldestRequestTime) + 50; // 额外等待 50ms 确保安全
      if (waitTime > 0) {
        await this.sleep(waitTime);
        // 递归检查，确保等待后仍然符合限制
        return this.waitForRateLimit();
      }
    }

    // 记录本次请求时间戳
    this.requestTimestamps.push(Date.now());
  }

  /**
   * 睡眠函数（用于重试延迟）
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
