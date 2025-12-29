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
    prodHost: 'logistics.bellis.com.cn',
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
  {
    appName: 'docs-app',
    devHost: 'localhost',
    devPort: '8092',
    preHost: 'localhost',
    prePort: '4192',
    prodHost: 'docs.bellis.com.cn',
  },
  {
    appName: 'operations-app',
    devHost: '10.80.8.199',
    devPort: '8087',
    preHost: 'localhost',
    prePort: '4187',
    prodHost: 'operations.bellis.com.cn',
  },
  {
    appName: 'layout-app',
    devHost: '10.80.8.199',
    devPort: '8088',
    preHost: 'localhost',
    prePort: '4188',
    prodHost: 'layout.bellis.com.cn',
  },
  {
    appName: 'dashboard-app',
    devHost: '10.80.8.199',
    devPort: '8089',
    preHost: 'localhost',
    prePort: '4189',
    prodHost: 'dashboard.bellis.com.cn',
  },
  {
    appName: 'personnel-app',
    devHost: '10.80.8.199',
    devPort: '8090',
    preHost: 'localhost',
    prePort: '4190',
    prodHost: 'personnel.bellis.com.cn',
  },
  {
    appName: 'home-app',
    devHost: '10.80.8.199',
    devPort: '8095',
    preHost: 'localhost',
    prePort: '4195',
    prodHost: 'www.bellis.com.cn',
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
  // 防御性检查：使用 try-catch 捕获可能的 TDZ (Temporal Dead Zone) 错误
  // 如果 APP_ENV_CONFIGS 还没有初始化（由于循环依赖或模块加载顺序），返回空数组
  try {
    return APP_ENV_CONFIGS.map((config) => config.devPort);
  } catch (error) {
    if (error instanceof ReferenceError && error.message.includes('before initialization')) {
      if (import.meta.env.DEV) {
        console.warn('[app-env.config] APP_ENV_CONFIGS 未初始化（可能是循环依赖），返回空数组');
      }
      return [];
    }
    // 其他错误重新抛出
    throw error;
  }
}

/**
 * 获取所有预览端口列表
 */
export function getAllPrePorts(): string[] {
  // 防御性检查：使用 try-catch 捕获可能的 TDZ (Temporal Dead Zone) 错误
  // 如果 APP_ENV_CONFIGS 还没有初始化（由于循环依赖或模块加载顺序），返回空数组
  try {
    return APP_ENV_CONFIGS.map((config) => config.prePort);
  } catch (error) {
    if (error instanceof ReferenceError && error.message.includes('before initialization')) {
      if (import.meta.env.DEV) {
        console.warn('[app-env.config] APP_ENV_CONFIGS 未初始化（可能是循环依赖），返回空数组');
      }
      return [];
    }
    // 其他错误重新抛出
    throw error;
  }
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

