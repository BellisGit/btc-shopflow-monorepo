/**
 * Vite 应用配置辅助函数
 * 用于从统一配置中获取应用的环境变量
 */

import { getAppConfig, type AppEnvConfig } from './app-env.config';

/**
 * 获取应用配置（用于 vite.config.ts）
 */
export function getViteAppConfig(appName: string): {
  devPort: number;
  devHost: string;
  prePort: number;
  preHost: string;
  prodHost: string;
  mainAppOrigin: string;
} {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`未找到 ${appName} 的环境配置`);
  }

  const mainAppConfig = getAppConfig('system-app');
  const mainAppOrigin = mainAppConfig
    ? `http://${mainAppConfig.preHost}:${mainAppConfig.prePort}`
    : 'http://localhost:4180';

  return {
    devPort: parseInt(appConfig.devPort, 10),
    devHost: appConfig.devHost,
    prePort: parseInt(appConfig.prePort, 10),
    preHost: appConfig.preHost,
    prodHost: appConfig.prodHost,
    mainAppOrigin,
  };
}

