/**
 * 统一的应用环境配置
 * 所有应用的环境变量都从这里读取，避免二义性
 */
export interface AppEnvConfig {
    appName: string;
    devHost: string;
    devPort: string;
    preHost: string;
    prePort: string;
    prodHost: string;
}
/**
 * 所有应用的环境配置
 */
export declare const APP_ENV_CONFIGS: AppEnvConfig[];
/**
 * 根据应用名称获取配置
 */
export declare function getAppConfig(appName: string): AppEnvConfig | undefined;
/**
 * 获取所有开发端口列表
 */
export declare function getAllDevPorts(): string[];
/**
 * 获取所有预览端口列表
 */
export declare function getAllPrePorts(): string[];
/**
 * 根据端口获取应用配置
 */
export declare function getAppConfigByDevPort(port: string): AppEnvConfig | undefined;
export declare function getAppConfigByPrePort(port: string): AppEnvConfig | undefined;
export declare function getAppConfigByTestHost(testHost: string): AppEnvConfig | undefined;