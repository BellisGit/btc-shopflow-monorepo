/**
 * 统一日志模块
 * 基于 Pino 的日志系统，集成到现有的日志上报机制
 */

import pino from 'pino';
import { createPinoLogger } from './pino-config';
import { createLogTransport } from './transports';
import type { LogContext, LogLevel, LoggerOptions } from './types';
import { getCurrentAppId } from '../env-info';

// 全局上下文（用户信息、请求ID等）
let globalContext: LogContext = {};

/**
 * 设置全局日志上下文
 */
export function setLogContext(context: LogContext) {
  globalContext = { ...globalContext, ...context };
}

/**
 * 获取全局日志上下文
 */
export function getLogContext(): LogContext {
  return { ...globalContext };
}

/**
 * 清除全局日志上下文
 */
export function clearLogContext() {
  globalContext = {};
}

/**
 * 创建带上下文的 logger 实例
 */
function createLoggerWithContext(context?: LogContext): pino.Logger {
  const mergedContext = {
    ...globalContext,
    ...context,
    appId: context?.appId || globalContext.appId || getCurrentAppId(),
  };

  // 创建基础 logger，传入上下文用于传输器
  const baseLogger = createPinoLogger(mergedContext);

  // 如果有上下文，创建子 logger
  if (Object.keys(mergedContext).length > 0) {
    return baseLogger.child(mergedContext);
  }

  return baseLogger;
}

// 创建默认 logger 实例
let defaultLogger: pino.Logger = createLoggerWithContext();

/**
 * 重新初始化 logger（当上下文变化时调用）
 */
export function reinitializeLogger(context?: LogContext) {
  defaultLogger = createLoggerWithContext(context);
}

/**
 * 获取 logger 实例
 */
export function getLogger(context?: LogContext): pino.Logger {
  if (context) {
    return createLoggerWithContext(context);
  }
  return defaultLogger;
}

/**
 * 便捷的日志方法
 */
export const logger = {
  /**
   * Debug 级别日志
   */
  debug: (message: string, ...args: any[]) => {
    defaultLogger.debug({ ...args }, message);
  },

  /**
   * Info 级别日志
   */
  info: (message: string, ...args: any[]) => {
    defaultLogger.info({ ...args }, message);
  },

  /**
   * Warn 级别日志
   */
  warn: (message: string, ...args: any[]) => {
    defaultLogger.warn({ ...args }, message);
  },

  /**
   * Error 级别日志
   */
  error: (message: string, error?: Error | any, ...args: any[]) => {
    if (error instanceof Error) {
      defaultLogger.error({ err: error, ...args }, message);
    } else if (error) {
      defaultLogger.error({ ...error, ...args }, message);
    } else {
      defaultLogger.error({ ...args }, message);
    }
  },

  /**
   * Fatal 级别日志
   */
  fatal: (message: string, error?: Error | any, ...args: any[]) => {
    if (error instanceof Error) {
      defaultLogger.fatal({ err: error, ...args }, message);
    } else if (error) {
      defaultLogger.fatal({ ...error, ...args }, message);
    } else {
      defaultLogger.fatal({ ...args }, message);
    }
  },

  /**
   * 创建带上下文的子 logger
   */
  child: (context: LogContext) => {
    return createLoggerWithContext(context);
  },

  /**
   * 设置日志级别
   */
  setLevel: (level: LogLevel) => {
    defaultLogger.level = level;
  },

  /**
   * 获取当前日志级别
   */
  getLevel: () => {
    return defaultLogger.level;
  },
};

// 导出类型
export type { LogContext, LogLevel, LoggerOptions } from './types';
export type { Logger } from 'pino';

// 默认导出 logger
export default logger;
