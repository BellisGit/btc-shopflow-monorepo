/**
 * 日志模块类型定义
 */

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * 日志上下文信息
 * 用于在日志中自动注入用户、请求等信息
 */
export interface LogContext {
  /** 用户ID */
  userId?: number | string;
  /** 用户名 */
  username?: string;
  /** 请求ID（用于追踪） */
  requestId?: string;
  /** 应用ID */
  appId?: string;
  /** IP地址 */
  ip?: string;
  /** 其他自定义上下文 */
  [key: string]: any;
}

/**
 * 日志传输器接口
 * 用于将日志发送到不同的目标（控制台、服务器等）
 */
export interface LogTransport {
  /**
   * 发送日志
   * @param level 日志级别
   * @param logObject 日志对象（Pino 格式）
   */
  send(level: number, logObject: any): void | Promise<void>;
}

/**
 * 日志配置选项
 */
export interface LoggerOptions {
  /** 日志级别 */
  level?: LogLevel;
  /** 是否启用日志上报 */
  enableTransport?: boolean;
  /** 自定义上下文 */
  context?: LogContext;
}
