/**
 * 全局配置文件
 * 参考：cool-admin-vue-8.x/src/config/index.ts
 */
import { appConfig } from './app';
// 是否开发模式
export var isDev = import.meta.env.DEV;
// 环境变量
export var env = {
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    SSR: import.meta.env.SSR,
};
// 导出配置
export var config = {
    // 应用配置
    app: appConfig,
    // API 配置
    api: {
        // 基础路径
        baseURL: isDev ? '/api' : import.meta.env.VITE_API_BASE_URL || 'http://10.0.0.168:8115/api',
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
                entry: isDev ? '//localhost:8082' : '/logistics/',
                activeRule: '/logistics',
            },
            {
                name: 'engineering',
                entry: isDev ? '//localhost:8085' : '/engineering/',
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
