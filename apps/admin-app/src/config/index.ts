/**
 * 全局配置文件
 * 参考：cool-admin-vue-8.x/src/config/index.ts
 */

import { appConfig } from './app';

// 是否开发模式
export const isDev = (import.meta as any).env.DEV;

// 环境变量
export const env = {
  MODE: (import.meta as any).env.MODE,
  DEV: (import.meta as any).env.DEV,
  PROD: (import.meta as any).env.PROD,
  SSR: (import.meta as any).env.SSR,
};

// 导出配置
export const config = {
  // 应用配置
  app: appConfig,

  // API 配置
  api: {
    // 基础路径：统一使用 /api，通过代理转发到后端
    // 开发环境：Vite 代理 /api 到 http://10.80.9.76:8115
    // 生产环境：Nginx 代理 /api 到 http://10.0.0.168:8115
    baseURL: '/api',
    // 请求超时时间
    timeout: 30000,
  },

  // 国际化配置
  i18n: {
    // 默认语言
    locale: localStorage.getItem('locale') || 'zh-CN',
    // 可选语言列表
    languages: [
      { label: '简体中文', value: 'zh-CN' },
      { label: 'English', value: 'en-US' },
    ],
  },

  // 主题配置
  theme: {
    // 默认主题模式
    mode: localStorage.getItem('theme-mode') || 'light',
    // 主题色
    primaryColor: '#409eff',
  },

  // 忽略规则
  ignore: {
    // 不显示请求进度条的路径
    NProgress: [
      '/user/profile',
      '/menu/list',
    ],
    // 不需要 token 验证的路径
    token: [
      '/login',
      '/401',
      '/403',
      '/404',
      '/500',
    ],
  },

  // 微前端配置
  microApp: {
    // 是否启用
    enabled: true,
    // 子应用列表
    apps: [
      {
        name: 'logistics',
        entry: isDev ? '//localhost:8081' : '/logistics/',
        activeRule: '/logistics',
      },
      {
        name: 'engineering',
        entry: isDev ? '//localhost:8082' : '/engineering/',
        activeRule: '/engineering',
      },
      {
        name: 'quality',
        entry: isDev ? '//localhost:8083' : '/quality/',
        activeRule: '/quality',
      },
      {
        name: 'production',
        entry: isDev ? '//localhost:8084' : '/production/',
        activeRule: '/production',
      },
    ],
  },
};

export default config;

