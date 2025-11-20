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
    name: 'admin',
    entry: `//${DEV_HOST}:8081`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/admin'),
    timeout: import.meta.env.DEV ? 8000 : 5000, // 开发环境 8 秒，生产环境 5 秒
  },
  {
    name: 'logistics',
    entry: `//${DEV_HOST}:8082`,
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/logistics'),
    timeout: import.meta.env.DEV ? 8000 : 5000, // 开发环境 8 秒，生产环境 5 秒
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
