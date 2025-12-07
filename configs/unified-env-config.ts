/**
 * 统一的环境配置系统
 * 支持通过 .env 切换配置方案，但内部规则不变
 */

import { getAllApps, getAppById } from './app-scanner';
import { getAllDevPorts, getAllPrePorts, getAppConfig } from './app-env.config';

export type Environment = 'development' | 'preview' | 'production';
export type ConfigScheme = 'default' | 'custom'; // 可以通过 .env 切换

export interface EnvironmentConfig {
  // API 配置
  api: {
    baseURL: string;
    timeout: number;
    backendTarget?: string;
  };
  
  // 微前端配置
  microApp: {
    baseURL: string;
    entryPrefix: string;
  };
  
  // 文档配置
  docs: {
    url: string;
    port: string;
  };
  
  // WebSocket 配置
  ws: {
    url: string;
  };
  
  // 上传配置
  upload: {
    url: string;
  };
}

// 配置方案：类似 Element Plus 主题
const configSchemes: Record<ConfigScheme, Record<Environment, EnvironmentConfig>> = {
  default: {
    development: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://10.80.9.76:8115',
      },
      microApp: {
        baseURL: '//10.80.8.199',
        entryPrefix: '',
      },
      docs: {
        url: 'http://localhost:4172',
        port: '4172',
      },
      ws: {
        url: 'ws://10.80.9.76:8115',
      },
      upload: {
        url: '/api/upload',
      },
    },
    preview: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'http://localhost',
        entryPrefix: '/index.html',
      },
      docs: {
        url: 'http://localhost:4173',
        port: '4173',
      },
      ws: {
        url: 'ws://localhost:8115',
      },
      upload: {
        url: '/api/upload',
      },
    },
    production: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'https://bellis.com.cn',
        entryPrefix: '', // 构建产物直接部署到子域名根目录
      },
      docs: {
        url: 'https://docs.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
    },
  },
  custom: {
    // 可以通过 .env 定义自定义配置方案
    // 这里可以扩展其他配置方案
    development: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://10.80.9.76:8115',
      },
      microApp: {
        baseURL: '//10.80.8.199',
        entryPrefix: '',
      },
      docs: {
        url: 'http://localhost:4172',
        port: '4172',
      },
      ws: {
        url: 'ws://10.80.9.76:8115',
      },
      upload: {
        url: '/api/upload',
      },
    },
    preview: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'http://localhost',
        entryPrefix: '/index.html',
      },
      docs: {
        url: 'http://localhost:4173',
        port: '4173',
      },
      ws: {
        url: 'ws://localhost:8115',
      },
      upload: {
        url: '/api/upload',
      },
    },
    production: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'https://bellis.com.cn',
        entryPrefix: '', // 构建产物直接部署到子域名根目录
      },
      docs: {
        url: 'https://docs.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
    },
  },
};

/**
 * 获取当前配置方案（从 .env 读取，默认 default）
 */
function getConfigScheme(): ConfigScheme {
  // 防御性检查：在 Node.js 环境中，import.meta.env 可能未定义
  if (typeof import.meta === 'undefined' || !import.meta.env) {
    return 'default';
  }
  return (import.meta.env.VITE_CONFIG_SCHEME as ConfigScheme) || 'default';
}

/**
 * 检测当前环境
 */
export function getEnvironment(): Environment {
  if (typeof window === 'undefined') {
    // 在 Node.js 环境中（如 Vite 配置文件），import.meta.env 可能未定义
    // 使用防御性检查，提供后备方案
    const prodFlag =
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD) ??
      (process.env.NODE_ENV === 'production');
    return prodFlag ? 'production' : 'development';
  }

  const hostname = window.location.hostname;
  const port = window.location.port || '';
  
  if (hostname.includes('bellis.com.cn')) {
    return 'production';
  }
  
  if (getAllPrePorts().includes(port)) {
    return 'preview';
  }
  
  if (getAllDevPorts().includes(port)) {
    return 'development';
  }
  
  // 浏览器环境：防御性地访问 import.meta.env
  const prodFlag =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD) ??
    false;
  return prodFlag ? 'production' : 'development';
}

/**
 * 获取当前环境的配置
 */
export function getEnvConfig(): EnvironmentConfig {
  const scheme = getConfigScheme();
  const env = getEnvironment();
  return configSchemes[scheme][env];
}

/**
 * 判断是否为主应用（统一规则，基于应用身份配置）
 */
export function isMainApp(
  routePath?: string,
  locationPath?: string,
  isStandalone?: boolean
): boolean {
  // 独立运行时
  if (isStandalone === undefined) {
    // 防御性检查：在 Node.js 环境中，window 未定义
    if (typeof window === 'undefined') {
      // 在 Node.js 环境中（如 Vite 配置文件），默认返回 true（主应用）
      return true;
    }
    const qiankunWindow = (window as any).__POWERED_BY_QIANKUN__;
    isStandalone = !qiankunWindow;
  }
  
  if (isStandalone) {
    const path = routePath || locationPath || '';
    if (path === '/login' || path === '/forget-password' || path === '/register') {
      return false;
    }
    return true;
  }

  const env = getEnvironment();
  // 优先使用 routePath，如果没有则使用 locationPath，最后使用 window.location.pathname
  const path = routePath || locationPath || (typeof window !== 'undefined' ? window.location.pathname : '');
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  if (path === '/login' || path === '/forget-password' || path === '/register') {
    return false;
  }

  // 生产环境：通过子域名判断（基于应用身份配置）
  if (env === 'production') {
    const app = getAllApps().find(a => a.subdomain === hostname);
    if (app && app.type === 'sub') {
      return false;
    }
    return true;
  }

  // 开发/预览环境：通过路径判断（基于应用身份配置）
  const apps = getAllApps();
  
  for (const app of apps) {
    if (app.type === 'sub' && app.enabled) {
      // 支持 pathPrefix 带或不带尾部斜杠
      const normalizedPathPrefix = app.pathPrefix.endsWith('/') 
        ? app.pathPrefix.slice(0, -1) 
        : app.pathPrefix;
      const normalizedPath = path.endsWith('/') && path !== '/'
        ? path.slice(0, -1)
        : path;
      
      // 精确匹配或路径前缀匹配
      if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/')) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 获取当前激活的子应用
 */
export function getCurrentSubApp(): string | null {
  const env = getEnvironment();
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // 生产环境：通过子域名判断
  if (env === 'production' && hostname) {
    const app = getAllApps().find(a => a.subdomain === hostname);
    return app?.id || null;
  }

  // 开发/预览环境：通过路径判断（与 isMainApp 使用相同的匹配逻辑）
  const apps = getAllApps();

  for (const app of apps) {
    if (app.type === 'sub' && app.enabled) {
      // 支持 pathPrefix 带或不带尾部斜杠（与 isMainApp 使用相同的匹配逻辑）
      const normalizedPathPrefix = app.pathPrefix.endsWith('/') 
        ? app.pathPrefix.slice(0, -1) 
        : app.pathPrefix;
      const normalizedPath = path.endsWith('/') && path !== '/'
        ? path.slice(0, -1)
        : path;

      // 精确匹配或路径前缀匹配
      if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/')) {
        return app.id;
      }
    }
  }

  return null;
}

/**
 * 获取子应用的入口地址（基于应用身份配置）
 */
export function getSubAppEntry(appId: string): string {
  const app = getAppById(appId);
  if (!app) {
    console.warn(`[unified-env-config] 未找到应用: ${appId}`);
    return `/${appId}/`;
  }

  const env = getEnvironment();
  const envConfig = getEnvConfig();
  const appEnvConfig = getAppConfig(`${appId}-app`);

  if (!appEnvConfig) {
    console.warn(`[unified-env-config] 未找到应用环境配置: ${appId}-app`);
    return `/${appId}/`;
  }

  switch (env) {
    case 'production':
      // 生产环境：直接使用子域名根路径，构建产物直接部署到子域名根目录
      if (app.subdomain && appEnvConfig.prodHost) {
        const protocol = typeof window !== 'undefined' && window.location.protocol
          ? window.location.protocol
          : 'https:';
        return `${protocol}//${appEnvConfig.prodHost}/`;
      }
      return `/${appId}/`;

    case 'preview':
      return `http://${appEnvConfig.preHost}:${appEnvConfig.prePort}${envConfig.microApp.entryPrefix}`;

    case 'development':
    default:
      return `${envConfig.microApp.baseURL}:${appEnvConfig.devPort}`;
  }
}

/**
 * 生成 qiankun activeRule（基于应用身份配置）
 */
export function getSubAppActiveRule(appId: string): string | ((location: Location) => boolean) {
  const app = getAppById(appId);
  if (!app) {
    console.warn(`[unified-env-config] 未找到应用: ${appId}`);
    return `/${appId}`;
  }

  const env = getEnvironment();

  if (env === 'production' && app.subdomain) {
    return (location: Location) => {
      if (location.hostname === app.subdomain) {
        return true;
      }
      if (location.pathname.startsWith(app.pathPrefix)) {
        return true;
      }
      return false;
    };
  }

  return (location: Location) => {
    return location.pathname.startsWith(app.pathPrefix);
  };
}

// 导出单例
export const currentEnvironment = getEnvironment();
export const envConfig = getEnvConfig();
export const currentSubApp = getCurrentSubApp();
export const isMainAppNow = isMainApp();

