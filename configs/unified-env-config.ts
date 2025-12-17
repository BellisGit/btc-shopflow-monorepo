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

  // CDN 配置
  cdn: {
    staticAssetsUrl: string;
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
      cdn: {
        staticAssetsUrl: '',
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
      cdn: {
        staticAssetsUrl: '',
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
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
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
      cdn: {
        staticAssetsUrl: '',
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
      cdn: {
        staticAssetsUrl: '',
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
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
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

  // 防御性检查：确保 getAllPrePorts 和 getAllDevPorts 可以安全调用
  // 如果 APP_ENV_CONFIGS 还没有初始化，使用 try-catch 捕获错误
  try {
    const prePorts = getAllPrePorts();
    if (prePorts.includes(port)) {
      return 'preview';
    }

    const devPorts = getAllDevPorts();
    if (devPorts.includes(port)) {
      return 'development';
    }
  } catch (error) {
    // 如果 getAllPrePorts 或 getAllDevPorts 抛出错误（如 APP_ENV_CONFIGS 未初始化）
    // 记录警告并继续使用其他方法判断环境
    if (import.meta.env.DEV) {
      console.warn('[unified-env-config] getAllPrePorts/getAllDevPorts 调用失败，使用备用方法判断环境:', error);
    }
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
  const config = configSchemes[scheme][env];

  // 支持通过环境变量覆盖 CDN URL
  // 在浏览器环境中，可以通过 VITE_CDN_STATIC_ASSETS_URL 覆盖
  // 在 Node.js 环境中（如 Vite 配置），可以通过 CDN_STATIC_ASSETS_URL 覆盖
  if (config.cdn?.staticAssetsUrl) {
    let envCdnUrl: string | undefined;

    if (typeof window !== 'undefined') {
      // 浏览器环境：从 import.meta.env 读取
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        envCdnUrl = import.meta.env.VITE_CDN_STATIC_ASSETS_URL;
      }
    } else {
      // Node.js 环境：从 process.env 读取
      envCdnUrl = process.env.CDN_STATIC_ASSETS_URL || process.env.VITE_CDN_STATIC_ASSETS_URL;
    }

    if (envCdnUrl) {
      return {
        ...config,
        cdn: {
          staticAssetsUrl: envCdnUrl,
        },
      };
    }
  }

  return config;
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

  const env = getEnvironment();
  // 优先使用 locationPath（完整路径），如果没有则使用 routePath，最后使用 window.location.pathname
  const path = locationPath || routePath || (typeof window !== 'undefined' ? window.location.pathname : '');

  // 关键：在开发环境中，即使 isStandalone 为 true，也要检查路径是否匹配子应用
  // 因为开发环境所有应用都使用同一个端口（8080），需要通过路径前缀判断
  if (isStandalone && env === 'development') {
    // 先检查是否是登录等公开页面
    if (path === '/login' || path === '/forget-password' || path === '/register') {
      return false;
    }

    // 检查路径是否匹配任何子应用的 pathPrefix
    const apps = getAllApps();
    for (const app of apps) {
      if (app.type === 'sub' && app.enabled) {
        const normalizedPathPrefix = app.pathPrefix.endsWith('/')
          ? app.pathPrefix.slice(0, -1)
          : app.pathPrefix;
        const normalizedPath = path.endsWith('/') && path !== '/'
          ? path.slice(0, -1)
          : path;

        // 精确匹配或路径前缀匹配
        if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/')) {
          // 匹配到子应用，不是主应用
          return false;
        }
      }
    }

    // 如果没有匹配到子应用，判断为主应用
    return true;
  }

  // 非开发环境的独立运行模式（如预览/生产环境的独立运行）
  if (isStandalone) {
    if (path === '/login' || path === '/forget-password' || path === '/register') {
      return false;
    }
    return true;
  }

  // qiankun 模式下的判断（非独立运行）
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
  // 关键：在开发环境中，所有应用都使用同一个端口（8080），所以只能通过路径前缀判断
  // 主应用路径：/data/...、/profile 等
  // 子应用路径：/logistics/...、/admin/... 等
  const apps = getAllApps();

  // 先检查是否是子应用路径（子应用的 pathPrefix 优先级更高）
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
      // 例如：/logistics 或 /logistics/warehouse/inventory/info 都匹配物流应用
      const isMatch = normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/');

      if (isMatch) {
        // 匹配到子应用，不是主应用
        return false;
      }
    }
  }

  // 关键：在 layout-app 环境下，如果路径是根路径 '/'，但实际 locationPath 是子应用路径，
  // 需要再次检查 locationPath（因为 route.path 可能是 '/'，但 window.location.pathname 是子应用路径）
  if (path === '/' && locationPath && locationPath !== '/') {
    // 使用 locationPath 重新检查
    const normalizedLocationPath = locationPath.endsWith('/') && locationPath !== '/'
      ? locationPath.slice(0, -1)
      : locationPath;

    for (const app of apps) {
      if (app.type === 'sub' && app.enabled) {
        const normalizedPathPrefix = app.pathPrefix.endsWith('/')
          ? app.pathPrefix.slice(0, -1)
          : app.pathPrefix;

        const isMatch = normalizedLocationPath === normalizedPathPrefix || normalizedLocationPath.startsWith(normalizedPathPrefix + '/');

        if (isMatch) {
          // 匹配到子应用，不是主应用
          return false;
        }
      }
    }
  }

  // 如果没有匹配到子应用，判断为主应用
  // 主应用的 pathPrefix 是 '/'，所以所有不匹配子应用的路径都是主应用路径
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

// 导出单例（延迟初始化，避免循环依赖问题）
// 注意：不要在模块顶层直接调用 getEnvironment()，因为它依赖 APP_ENV_CONFIGS
// 如果 unified-env-config.ts 在 app-env.config.ts 之前加载，会导致初始化顺序问题
// 使用 getter 函数延迟初始化，只在首次访问时计算
let _currentEnvironment: Environment | null = null;
let _envConfig: EnvironmentConfig | null = null;

export function getCurrentEnvironment(): Environment {
  if (_currentEnvironment === null) {
    _currentEnvironment = getEnvironment();
  }
  return _currentEnvironment;
}

export function getCurrentEnvConfig(): EnvironmentConfig {
  if (_envConfig === null) {
    _envConfig = getEnvConfig();
  }
  return _envConfig;
}

// 为了向后兼容，保留导出，但使用延迟初始化的 getter
// 注意：这些导出会在首次访问时计算，而不是在模块加载时
// 如果代码在模块加载时立即访问这些导出，仍然可能导致初始化顺序问题
// 建议使用 getCurrentEnvironment() 和 getCurrentEnvConfig() 函数代替
export const currentEnvironment = getCurrentEnvironment();
export const envConfig = getCurrentEnvConfig();

// 注意：移除了 currentSubApp 和 isMainAppNow 的顶层导出
// 因为它们会在模块加载时调用 getCurrentSubApp() 和 isMainApp()
// 这些函数依赖 getAllApps()，可能导致初始化顺序问题
// 请使用 getCurrentSubApp() 和 isMainApp() 函数来获取当前值

