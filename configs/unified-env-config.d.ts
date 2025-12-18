/**
 * 统一的环境配置系统
 * 支持通过 .env 切换配置方案，但内部规则不变
 */
export type Environment = 'development' | 'preview' | 'production';
export type ConfigScheme = 'default' | 'custom';
export interface EnvironmentConfig {
    api: {
        baseURL: string;
        timeout: number;
        backendTarget?: string;
    };
    microApp: {
        baseURL: string;
        entryPrefix: string;
    };
    docs: {
        url: string;
        port: string;
    };
    ws: {
        url: string;
    };
    upload: {
        url: string;
    };
    cdn: {
        staticAssetsUrl: string;
    };
}
/**
 * 检测当前环境
 */
export declare function getEnvironment(): Environment;
/**
 * 获取当前环境的配置
 */
export declare function getEnvConfig(): EnvironmentConfig;
/**
 * 判断是否为主应用（统一规则，基于应用身份配置）
 */
export declare function isMainApp(routePath?: string, locationPath?: string, isStandalone?: boolean): boolean;
/**
 * 获取当前激活的子应用
 */
export declare function getCurrentSubApp(): string | null;
/**
 * 获取子应用的入口地址（基于应用身份配置）
 */
export declare function getSubAppEntry(appId: string): string;
/**
 * 生成 qiankun activeRule（基于应用身份配置）
 */
export declare function getSubAppActiveRule(appId: string): string | ((location: Location) => boolean);
export declare function getCurrentEnvironment(): Environment;
export declare function getCurrentEnvConfig(): EnvironmentConfig;
export declare const currentEnvironment: Environment;
export declare const envConfig: EnvironmentConfig;
