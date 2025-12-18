/**
 * 应用动态扫描器
 * 参考 cool-admin 的实现，自动扫描 apps 目录下的所有应用
 */
import type { AppIdentity } from './app-identity.types';
/**
 * 扫描并注册所有应用
 */
export declare function scanAndRegisterApps(): Map<string, AppIdentity>;
/**
 * 获取所有已注册的应用
 * 使用初始化标志确保线程安全
 */
export declare function getAllApps(): AppIdentity[];
/**
 * 根据 ID 获取应用
 * 使用初始化标志确保线程安全
 */
export declare function getAppById(id: string): AppIdentity | undefined;
/**
 * 获取所有子应用（排除主应用和布局应用）
 */
export declare function getSubApps(): AppIdentity[];
/**
 * 获取主应用
 */
export declare function getMainApp(): AppIdentity | undefined;
/**
 * 根据路径前缀查找应用
 */
export declare function getAppByPathPrefix(pathPrefix: string): AppIdentity | undefined;
/**
 * 根据子域名查找应用
 */
export declare function getAppBySubdomain(subdomain: string): AppIdentity | undefined;
