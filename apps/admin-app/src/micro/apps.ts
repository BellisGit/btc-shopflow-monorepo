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
 * 子应用列表
 */
const DEV_HOST =
  typeof window !== 'undefined' && window.location.hostname
    ? (window.location.hostname === '0.0.0.0' ? 'localhost' : window.location.hostname)
    : 'localhost';

export const microApps: MicroAppConfig[] = [
  {
    name: 'system',
    entry: `//${DEV_HOST}:8081`,
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
    entry: `//${DEV_HOST}:8082`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/logistics'),
    timeout: 10000,
  },
  {
    name: 'engineering',
    entry: `//${DEV_HOST}:8085`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/engineering'),
    timeout: 10000,
  },
  {
    name: 'quality',
    entry: `//${DEV_HOST}:8083`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/quality'),
    timeout: 10000,
  },
  {
    name: 'production',
    entry: `//${DEV_HOST}:8084`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/production'),
    timeout: 10000,
  },
  {
    name: 'finance',
    entry: `//${DEV_HOST}:8086`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/finance'),
    timeout: 10000,
  },
];

