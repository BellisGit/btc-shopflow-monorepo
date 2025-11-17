/**
 * 微前端应用配置
 */
export interface MicroAppConfig {
  name: string;
  entry: string;
  container: string;
  activeRule: string | ((location: Location) => boolean);
}

/**
 * 子应用列表
 */
const DEV_HOST =
  typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';

export const microApps: MicroAppConfig[] = [
  {
    name: 'system',
    entry: `//${DEV_HOST}:8081`,
    container: '#subapp-viewport',
    activeRule: (location) => {
      const path = location.pathname;
      // 系统域是默认域，匹配所有非其他已知域的路径
      return !path.startsWith('/admin') &&
             !path.startsWith('/logistics') &&
             !path.startsWith('/engineering') &&
             !path.startsWith('/quality') &&
             !path.startsWith('/production') &&
             !path.startsWith('/finance') &&
             !path.startsWith('/docs');
    },
  },
  {
    name: 'logistics',
    entry: `//${DEV_HOST}:8082`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/logistics'),
  },
  {
    name: 'engineering',
    entry: `//${DEV_HOST}:8085`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/engineering'),
  },
  {
    name: 'quality',
    entry: `//${DEV_HOST}:8083`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/quality'),
  },
  {
    name: 'production',
    entry: `//${DEV_HOST}:8084`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/production'),
  },
  {
    name: 'finance',
    entry: `//${DEV_HOST}:8086`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/finance'),
  },
];

