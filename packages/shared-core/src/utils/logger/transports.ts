/**
 * 日志传输器
 * 集成现有的 request-logger，将 Pino 日志上报到后端
 */

import type { LogContext } from './types';

/**
 * 需要过滤的接口路径（不记录这些接口的日志）
 */
const FILTERED_PATHS = [
  '/login',
  '/register',
  '/captcha',
  '/code/sms/send',
  '/code/email/send',
  '/refresh-token',
  '/refresh/access-token',
  '/logout',
  '/upload',
  '/api/system/log/sys/request/update', // 过滤请求日志更新接口，避免循环记录
  '/api/system/log/sys/operation/update', // 过滤操作日志更新接口
];

/**
 * 判断是否需要记录日志
 */
function shouldLog(url: string): boolean {
  if (!url) {
    return false;
  }

  // 过滤内部资源（如静态文件）
  if (
    url.includes('.html') ||
    url.includes('.js') ||
    url.includes('.css') ||
    url.includes('.json') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.jpeg') ||
    url.includes('.gif') ||
    url.includes('.svg') ||
    url.includes('.ico')
  ) {
    return false;
  }

  // 只记录业务接口（以 /api/ 开头的请求）
  if (!url.startsWith('/api/')) {
    return false;
  }

  // 过滤敏感接口
  return !FILTERED_PATHS.some((path) => url.includes(path));
}

/**
 * 过滤敏感参数
 */
function filterSensitiveParams(params: any): any {
  if (!params || typeof params !== 'object') {
    return params;
  }

  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

  if (Array.isArray(params)) {
    return params.map((item) => filterSensitiveParams(item));
  }

  const filtered: any = {};
  for (const key in params) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
      filtered[key] = '***';
    } else {
      filtered[key] = filterSensitiveParams(params[key]);
    }
  }

  return filtered;
}

/**
 * 将 Pino 日志对象转换为 request-logger 格式
 */
function convertPinoLogToRequestLog(
  logObject: any,
  context?: LogContext
): any {
  // 提取日志信息
  const level = logObject.level || 30; // 默认 info
  const message = logObject.msg || logObject.message || '';
  const time = logObject.time || Date.now();
  const metadata = { ...logObject };
  delete metadata.level;
  delete metadata.msg;
  delete metadata.message;
  delete metadata.time;
  delete metadata.pid;
  delete metadata.hostname;

  // 从上下文或 metadata 中提取用户信息
  const userId = context?.userId || metadata.userId || metadata.user_id;
  const username = context?.username || metadata.username;
  const requestUrl = metadata.requestUrl || metadata.url || metadata.path || '';
  const ip = context?.ip || metadata.ip;
  const duration = metadata.duration || 0;
  const status = metadata.status || (level >= 50 ? 'failed' : 'success');

  // 过滤敏感参数
  const params = filterSensitiveParams(metadata.params || metadata);

  // 转换为 request-logger 格式
  return {
    userId: userId ? Number(userId) : undefined,
    username: username || 'unknown',
    requestUrl: requestUrl || '/unknown',
    params: typeof params === 'string' ? params : JSON.stringify(params),
    ip,
    duration: Number(duration) || 0,
    status: status as 'success' | 'failed',
    createdAt: new Date(time).toISOString(),
  };
}

/**
 * 日志传输器队列管理器
 * 复用 request-logger 的批量发送逻辑
 */
class LogTransportQueue {
  private queue: any[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_SIZE = 100; // 批量发送大小
  private readonly BATCH_INTERVAL = 180000; // 批量发送间隔（180秒）
  private readonly MAX_QUEUE_SIZE = 1000; // 最大队列长度
  private isServiceAvailable = true;
  private isPaused = false;
  private readonly QPS_LIMIT = 2; // 每秒最多发送2次请求
  private lastSendTime = 0;

  /**
   * 添加日志到队列
   */
  add(logItem: any) {
    // 检查队列长度，防止内存溢出
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      // 移除最旧的日志
      this.queue.shift();
    }

    this.queue.push(logItem);

    // 如果服务可用且未暂停，尝试发送
    if (this.isServiceAvailable && !this.isPaused) {
      this.tryFlush();
    } else if (this.queue.length === 1 && !this.timer) {
      // 如果服务不可用且没有定时器在运行，启动定时器等待服务恢复
      this.startTimer();
    }
  }

  /**
   * 尝试发送（带QPS限制）
   */
  private tryFlush() {
    // 检查QPS限制
    const now = Date.now();
    const timeSinceLastSend = now - this.lastSendTime;
    const minInterval = 1000 / this.QPS_LIMIT; // 最小间隔时间

    if (timeSinceLastSend < minInterval) {
      // 如果距离上次发送时间太短，延迟发送
      const delay = minInterval - timeSinceLastSend;
      setTimeout(() => {
        this.flush();
      }, delay);
      return;
    }

    // 检查是否达到批量大小
    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (this.queue.length > 0 && !this.timer) {
      // 如果队列有数据但未达到批量大小，且没有定时器在运行，启动定时器
      this.startTimer();
    }
  }

  /**
   * 批量发送日志
   */
  private async flush() {
    if (this.queue.length === 0) {
      return;
    }

    // 如果服务不可用，暂停发送
    if (!this.isServiceAvailable) {
      this.isPaused = true;
      this.startTimer(); // 继续等待服务恢复
      return;
    }

    const logsToSend = [...this.queue];

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      // 从全局获取 service
      const service =
        typeof window !== 'undefined' ? (window as any).__BTC_SERVICE__ : null;

      if (!service) {
        throw new Error('Service not initialized, cannot send logs');
      }

      // 检查服务是否可用
      if (!service?.admin?.log?.sys?.request?.update) {
        throw new Error('Request log service unavailable');
      }

      // 批量发送：将所有日志作为数组一次性发送
      await service.admin.log.sys.request.update(logsToSend);

      // 发送成功，重置状态
      this.isServiceAvailable = true;
      this.isPaused = false;
      this.lastSendTime = Date.now();

      // 清空队列（只清空已发送的部分）
      this.queue = this.queue.slice(logsToSend.length);

      // 如果还有剩余日志，继续尝试发送
      if (this.queue.length > 0) {
        this.tryFlush();
      }
    } catch (error) {
      // 发送失败，暂停发送
      this.isPaused = true;
      this.isServiceAvailable = false;

      // 5分钟后重新尝试
      setTimeout(() => {
        this.isServiceAvailable = true;
        this.isPaused = false;
        if (this.queue.length > 0) {
          this.tryFlush();
        }
      }, 5 * 60 * 1000); // 5分钟
    }
  }

  /**
   * 启动定时器
   */
  private startTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      // 定时器触发时，直接发送队列中的日志，不管是否达到批量大小
      if (this.isServiceAvailable && !this.isPaused && this.queue.length > 0) {
        this.flush();
      } else if (this.queue.length > 0) {
        // 如果服务不可用，继续等待
        this.startTimer();
      }
    }, this.BATCH_INTERVAL);
  }

  /**
   * 销毁实例（页面卸载时调用）
   */
  destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // 发送剩余的日志
    if (this.queue.length > 0) {
      this.flush();
    }
  }
}

// 创建单例
const logTransportQueue = new LogTransportQueue();

// 页面卸载时发送剩余日志
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logTransportQueue.destroy();
  });
}

/**
 * Pino 日志传输器
 * 将 Pino 日志发送到后端
 */
export function createLogTransport(context?: LogContext) {
  return {
    level: 30, // info 级别及以上才传输
    send: (level: number, logEvent: any) => {
      try {
        // 解析 Pino 日志对象
        const logObject = logEvent;

        // 检查是否需要记录（如果有 requestUrl）
        const requestUrl = logObject.requestUrl || logObject.url || logObject.path;
        if (requestUrl && !shouldLog(requestUrl)) {
          return;
        }

        // 转换为 request-logger 格式
        const requestLog = convertPinoLogToRequestLog(logObject, context);

        // 添加到队列
        logTransportQueue.add(requestLog);
      } catch (error) {
        // 传输失败不影响主流程，静默处理
        // 在开发环境可以输出错误（使用 console.error 避免循环依赖）
        // 注意：此文件是 logger 模块的一部分，不能使用 logger 本身，否则会造成循环依赖
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('Log transport error:', error);
        }
      }
    },
  };
}

/**
 * 手动发送日志（用于非 Pino 日志）
 */
export function sendLogToBackend(logItem: any) {
  logTransportQueue.add(logItem);
}
