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
  // 因为预览模式也使用构建产物（import.meta.env.PROD 为 true），但端口不同
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

  // 其他情况：如果 import.meta.env.PROD 为 true，且端口不在预览/开发端口范围内，则认为是生产环境
  // 生产环境通常没有端口（使用默认端口 80/443）或使用其他端口
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
      // 生产环境：使用相对路径，由 Nginx 反向代理
      return `/${appName}/`;

    case 'preview': {
      // 预览环境：使用统一配置中的预览主机和端口
      // 关键：使用完整的 URL（包含 /index.html），确保 qiankun 能正确加载构建产物
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
    name: 'admin',
    entry: getAppEntry('admin'),
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/admin'),
    timeout: import.meta.env.DEV ? 8000 : 5000, // 开发环境 8 秒，生产环境 5 秒
  },
  {
    name: 'logistics',
    entry: getAppEntry('logistics'),
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/logistics'),
    timeout: import.meta.env.DEV ? 8000 : 5000, // 开发环境 8 秒，生产环境 5 秒
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

