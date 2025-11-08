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
export const microApps: MicroAppConfig[] = [
  {
    name: 'logistics',
    entry: '//localhost:8081',
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/logistics'),
  },
  {
    name: 'engineering',
    entry: '//localhost:8082',
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/engineering'),
  },
  {
    name: 'quality',
    entry: '//localhost:8083',
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/quality'),
  },
  {
    name: 'production',
    entry: '//localhost:8084',
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/production'),
  },
  {
    name: 'finance',
    entry: '//localhost:8085',
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/finance'),
  },
];

