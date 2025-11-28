import { getAppConfig, getAllDevPorts, getAllPrePorts } from '@configs/app-env.config';

/**
 * 微前端应用配置
 */
export interface MicroAppConfig {
  name: string;
  entry: string;
  container: string;
  activeRule: string | ((location: Location) => boolean);
  // 生命周期超时配置（毫秒）
  timeout?: number;
}

/**
 * 环境类型
 */
type EnvironmentType = 'development' | 'preview' | 'production';

/**
 * 检测当前环境类型
 */
const getEnvironmentType = (): EnvironmentType => {
  if (typeof window === 'undefined') {
    return import.meta.env.PROD ? 'production' : 'development';
  }

  // 关键：优先通过端口判断环境类型，而不是依赖 import.meta.env.PROD
  const port = window.location.port || '';
  const previewPorts = getAllPrePorts();
  const devPorts = getAllDevPorts();

  // 预览环境：端口在配置的预览端口列表中
  if (previewPorts.includes(port)) {
    return 'preview';
  }

  // 开发环境：端口在配置的开发端口列表中
  if (devPorts.includes(port)) {
    return 'development';
  }

  // 生产环境：如果 import.meta.env.PROD 为 true，且端口不在预览/开发端口范围内
  if (import.meta.env.PROD) {
    return 'production';
  }

  // 默认返回开发环境
  return 'development';
};

/**
 * 获取主机地址
 */
const getHost = (): string => {
  if (typeof window === 'undefined') {
    return 'localhost';
  }
  const hostname = window.location.hostname;
  return hostname === '0.0.0.0' ? 'localhost' : hostname;
};

/**
 * 获取应用入口地址
 */
const getAppEntry = (appName: string): string => {
  const envType = getEnvironmentType();
  const host = getHost();
  const appConfig = getAppConfig(`${appName}-app`);

  if (!appConfig) {
    console.warn(`[apps.ts] 未找到应用配置: ${appName}-app`);
    return `/${appName}/`;
  }

  switch (envType) {
    case 'production':
      // 生产环境：根据子域名判断使用子域名还是相对路径
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomainMap: Record<string, string> = {
          'bellis.com.cn': 'system',
          'logistics.bellis.com.cn': 'logistics',
          'quality.bellis.com.cn': 'quality',
          'production.bellis.com.cn': 'production',
          'engineering.bellis.com.cn': 'engineering',
          'finance.bellis.com.cn': 'finance',
        };
        
        // 如果当前访问的是对应子应用的子域名，使用子域名作为入口
        if (subdomainMap[hostname] === appName) {
          const protocol = window.location.protocol;
          return `${protocol}//${hostname}/`;
        }
      }
      // 否则使用相对路径，由 Nginx 反向代理
      return `/${appName}/`;

    case 'preview': {
      // 预览环境：使用统一配置中的预览主机和端口
      return `http://${appConfig.preHost}:${appConfig.prePort}/index.html`;
    }

    case 'development':
    default:
      // 开发环境：使用统一配置中的开发主机和端口
      return `//${appConfig.devHost}:${appConfig.devPort}`;
  }
};

export const microApps: MicroAppConfig[] = [
  {
    name: 'system',
    entry: getAppEntry('system'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const path = location.pathname;
      // 排除不需要 Layout 的页面（这些页面没有 #subapp-viewport 容器）
      if (path === '/login' ||
          path === '/forget-password' ||
          path === '/register') {
        return false;
      }
      // 排除个人信息页面（由主应用自己处理）
      if (path === '/profile') {
        return false;
      }
      // 系统域是默认域，匹配所有非其他已知域的路径
      return !path.startsWith('/admin') &&
             !path.startsWith('/logistics') &&
             !path.startsWith('/engineering') &&
             !path.startsWith('/quality') &&
             !path.startsWith('/production') &&
             !path.startsWith('/finance') &&
             !path.startsWith('/docs');
    },
    // 增加生命周期超时时间到 10 秒，避免警告
    timeout: 10000,
  },
  {
    name: 'logistics',
    entry: getAppEntry('logistics'),
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/logistics'),
    timeout: 10000,
  },
  {
    name: 'engineering',
    entry: getAppEntry('engineering'),
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/engineering'),
    timeout: 10000,
  },
  {
    name: 'quality',
    entry: getAppEntry('quality'),
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/quality'),
    timeout: 10000,
  },
  {
    name: 'production',
    entry: getAppEntry('production'),
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/production'),
    timeout: 10000,
  },
  {
    name: 'finance',
    entry: getAppEntry('finance'),
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/finance'),
    timeout: 10000,
  },
];

