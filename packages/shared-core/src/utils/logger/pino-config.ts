/**
 * Pino 日志配置
 */

import pino from 'pino';
import type { LoggerOptions as PinoLoggerOptions } from 'pino';
import { isDevelopment } from '../../env';
import { createLogTransport } from './transports';

/**
 * 获取日志级别
 * 开发环境: debug，生产环境: warn
 */
function getLogLevel(): string {
  if (isDevelopment()) {
    return 'debug';
  }
  return 'warn';
}

/**
 * 创建 Pino 配置
 */
export function createPinoConfig(context?: any): PinoLoggerOptions {
  const isDev = isDevelopment();
  const level = getLogLevel();

  // 在浏览器环境中，配置传输器用于日志上报
  const browserConfig: any = {
    asObject: true, // 在浏览器中输出为对象格式
  };

  // 配置日志传输（上报到后端）
  if (typeof window !== 'undefined') {
    const transport = createLogTransport(context);
    browserConfig.transmit = {
      level: 30, // info 级别及以上才传输
      send: (level: number, logEvent: any) => {
        transport.send(level, logEvent);
      },
    };
  }

  const baseConfig: PinoLoggerOptions = {
    level,
    browser: browserConfig,
  };

  // 开发环境：使用 pino-pretty 格式化输出
  if (isDev) {
    return {
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    };
  }

  // 生产环境：结构化 JSON 输出
  return baseConfig;
}

/**
 * 创建 Pino 实例
 */
export function createPinoLogger(context?: any): pino.Logger {
  const config = createPinoConfig(context);
  return pino(config);
}
