import type { Plugin } from '@btc/shared-core';
import type { AppEnvConfig } from './app-env.config';
declare global {
    interface Window {
        __APP_GET_APP_CONFIG__?: (appName: string) => AppEnvConfig | undefined;
        __APP_GET_ALL_DEV_PORTS__?: () => string[];
        __APP_GET_ALL_PRE_PORTS__?: () => string[];
        __REGISTER_MENUS_FOR_APP__?: (appId: string) => void;
    }
}
/**
 * 注册 AppLayout 运行时所需的环境配置访问器
 * 在独立运行的子应用中调用一次即可
 */
/**
 * 注册全局菜单注册函数，供菜单组件使用
 */
export declare function registerMenuRegistrationFunction(target?: Window): void;
export declare function registerAppEnvAccessors(target?: Window): void;
/**
 * 根据 manifest 注册当前应用的菜单
 */
export declare function registerManifestMenusForApp(appId: string): void;
/**
 * 根据 manifest 注册当前应用的 Tabs（用于 tabbar 显示）
 * 注意：tabbar 的标签是通过路由导航时自动添加到 processStore 的，
 * 标签的文本通过 getManifestRoute 从 manifest 中获取，不需要单独的 tabRegistry
 * 这个函数主要用于确保 manifest 数据已加载，实际标签文本由 tabbar 组件从 manifest 中读取
 */
export declare function registerManifestTabsForApp(appId: string): void;
/**
 * 解析应用 Logo 地址（始终返回根路径，不依赖当前路由）
 * 生产环境使用 CDN，开发/预览环境使用本地路径
 */
export declare function resolveAppLogoUrl(): string;
/**
 * 创建一个轻量级的 AppStorage 适配器，满足 AppLayout 的最小依赖
 */
export declare function createAppStorageBridge(namespace: string): {
    readonly user: {
        get: () => Record<string, any>;
        set(data: Record<string, any>): void;
        getAvatar: () => any;
        setAvatar(avatar: string): void;
        getName: () => any;
        setName(name: string): void;
        clear(): void;
    };
    readonly settings: {
        get: () => Record<string, any>;
        set(data: Record<string, any>): void;
        getItem(key: string): any;
        setItem(key: string, value: unknown): void;
    };
};
/**
 * 返回一个默认的域名列表解析器，确保菜单抽屉不会因为缺失服务而报错
 */
export declare function createDefaultDomainResolver(appId: string): () => Promise<{
    domainCode: string;
    name: string;
    host: string;
    appId: string;
    active: boolean;
}[]>;
/**
 * 统一注入域列表获取函数（所有子应用必须调用）
 * 优先使用 domain-cache 模块（调用 me 接口获取真实域列表），
 * 如果加载失败则使用默认解析器作为兜底
 *
 * @param appId 应用 ID（如 'finance', 'admin'）
 * @param domainCachePathOrModule domain-cache 模块的路径字符串，或者已经导入的模块对象
 * @param target 目标 window 对象，默认为全局 window
 */
export declare function injectDomainListResolver(appId: string, domainCachePathOrModule?: string | {
    getDomainList?: any;
    clearDomainCache?: any;
}, target?: Window): Promise<void>;
/**
 * 创建一个通用的用户设置插件，供未自定义实现的子应用复用
 */
export declare function createSharedUserSettingPlugin(): Plugin;
