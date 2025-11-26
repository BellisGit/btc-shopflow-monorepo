/**
 * 统一的应用环境配置
 * 所有应用的环境变量都从这里读取，避免二义性
 */

export interface AppEnvConfig {
  appName: string;
  devHost: string;
  devPort: string;
  preHost: string;
  prePort: string;
  prodHost: string;
}

/**
 * 所有应用的环境配置
 */
export const APP_ENV_CONFIGS: AppEnvConfig[] = [
  {
    appName: 'system-app',
    devHost: '10.80.8.199',
    devPort: '8080',
    preHost: 'localhost',
    prePort: '4180',
    prodHost: 'bellis.com.cn',
  },
  {
    appName: 'admin-app',
    devHost: '10.80.8.199',
    devPort: '8081',
    preHost: 'localhost',
    prePort: '4181',
    prodHost: 'admin.bellis.com.cn',
  },
  {
    appName: 'logistics-app',
    devHost: '10.80.8.199',
    devPort: '8082',
    preHost: 'localhost',
    prePort: '4182',
    prodHost: 'admin.bellis.com.cn',
  },
  {
    appName: 'quality-app',
    devHost: '10.80.8.199',
    devPort: '8083',
    preHost: 'localhost',
    prePort: '4183',
    prodHost: 'quality.bellis.com.cn',
  },
  {
    appName: 'production-app',
    devHost: '10.80.8.199',
    devPort: '8084',
    preHost: 'localhost',
    prePort: '4184',
    prodHost: 'production.bellis.com.cn',
  },
  {
    appName: 'engineering-app',
    devHost: '10.80.8.199',
    devPort: '8085',
    preHost: 'localhost',
    prePort: '4185',
    prodHost: 'engineering.bellis.com.cn',
  },
  {
    appName: 'finance-app',
    devHost: '10.80.8.199',
    devPort: '8086',
    preHost: 'localhost',
    prePort: '4186',
    prodHost: 'finance.bellis.com.cn',
  },
  {
    appName: 'mobile-app',
    devHost: '10.80.8.199',
    devPort: '8091',
    preHost: 'localhost',
    prePort: '4191',
    prodHost: 'mobile.bellis.com.cn',
  },
];

/**
 * 根据应用名称获取配置
 */
export function getAppConfig(appName: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.appName === appName);
}

/**
 * 获取所有开发端口列表
 */
export function getAllDevPorts(): string[] {
  return APP_ENV_CONFIGS.map((config) => config.devPort);
}

/**
 * 获取所有预览端口列表
 */
export function getAllPrePorts(): string[] {
  return APP_ENV_CONFIGS.map((config) => config.prePort);
}

/**
 * 根据端口获取应用配置
 */
export function getAppConfigByDevPort(port: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.devPort === port);
}

export function getAppConfigByPrePort(port: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.prePort === port);
}

