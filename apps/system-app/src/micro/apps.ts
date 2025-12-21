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
 * 获取应用入口地址
 */
const getAppEntry = (appName: string): string => {
  const envType = getEnvironmentType();
  // docs-site-app 的特殊处理：appName 是 'docs'，但配置名称是 'docs-site-app'
  const configAppName = appName === 'docs' ? 'docs-site-app' : `${appName}-app`;
  const appConfig = getAppConfig(configAppName);

  if (!appConfig) {
    console.warn(`[apps.ts] 未找到应用配置: ${configAppName}`);
    return `/${appName}/`;
  }

  switch (envType) {
    case 'production':
      // 生产环境：直接使用子域名根路径，构建产物直接部署到子域名根目录
      if (appConfig.prodHost) {
        const protocol =
          typeof window !== 'undefined' && window.location.protocol
            ? window.location.protocol
            : 'https:';
        return `${protocol}//${appConfig.prodHost}/`;
      }
      // 如果没有配置 prodHost，使用相对路径
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

/**
 * 子域名到应用路径的映射
 */
const subdomainToPathMap: Record<string, string> = {
  'admin.bellis.com.cn': '/admin',
  'logistics.bellis.com.cn': '/logistics',
  'quality.bellis.com.cn': '/quality',
  'production.bellis.com.cn': '/production',
  'engineering.bellis.com.cn': '/engineering',
  'finance.bellis.com.cn': '/finance',
};

/**
 * 根据子域名获取应用路径
 */
const getPathFromSubdomain = (hostname: string): string | null => {
  return subdomainToPathMap[hostname] || null;
};

/**
 * 子域名到应用名称的映射
 */
const hostnameToAppMap: Record<string, string> = {
  'admin.bellis.com.cn': 'admin',
  'logistics.bellis.com.cn': 'logistics',
  'quality.bellis.com.cn': 'quality',
  'production.bellis.com.cn': 'production',
  'engineering.bellis.com.cn': 'engineering',
  'finance.bellis.com.cn': 'finance',
};

/**
 * 根据 hostname 判断当前应该激活的子应用
 */
const getAppFromHostname = (hostname: string): string | null => {
  return hostnameToAppMap[hostname] || null;
};

export const microApps: MicroAppConfig[] = [
  {
    name: 'admin',
    entry: getAppEntry('admin'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 关键：如果当前访问的是子域名，直接激活（子域代理到主应用后，主应用根据 hostname 激活子应用）
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'admin') {
        return true;
      }
      // 支持路径匹配：/admin 开头（主域访问时）
      if (location.pathname.startsWith('/admin')) {
        return true;
      }
      return false;
    },
    timeout: import.meta.env.DEV ? 8000 : 15000, // 开发环境 8 秒，生产环境 15 秒（考虑网络延迟和资源加载时间）
  },
  {
    name: 'logistics',
    entry: getAppEntry('logistics'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 关键：如果当前访问的是子域名，直接激活
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'logistics') {
        return true;
      }
      // 支持路径匹配：/logistics 开头（主域访问时）
      if (location.pathname.startsWith('/logistics')) {
        return true;
      }
      return false;
    },
    timeout: import.meta.env.DEV ? 8000 : 15000, // 开发环境 8 秒，生产环境 15 秒（考虑网络延迟和资源加载时间）
  },
  {
    name: 'engineering',
    entry: getAppEntry('engineering'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'engineering') {
        return true;
      }
      if (location.pathname.startsWith('/engineering')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'quality',
    entry: getAppEntry('quality'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'quality') {
        return true;
      }
      if (location.pathname.startsWith('/quality')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'production',
    entry: getAppEntry('production'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'production') {
        return true;
      }
      if (location.pathname.startsWith('/production')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'finance',
    entry: getAppEntry('finance'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'finance') {
        return true;
      }
      if (location.pathname.startsWith('/finance')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'operations',
    entry: getAppEntry('operations'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 运维应用通过 /operations 路径访问
      if (location.pathname.startsWith('/operations')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'docs',
    entry: getAppEntry('docs'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 文档应用通过 /docs 路径访问
      if (location.pathname.startsWith('/docs')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
];

