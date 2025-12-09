/**
 * 外部配置模块的类型声明
 * 这些模块在构建时被标记为 external，不会被打包
 * 运行时由使用 shared-components 的应用提供
 */

declare module '@configs/unified-env-config' {
  export type Environment = 'development' | 'preview' | 'production';
  
  export function getEnvironment(): Environment;
  export function getCurrentSubApp(): string | null;
  export function isMainApp(
    routePath?: string,
    locationPath?: string,
    isStandalone?: boolean
  ): boolean;
}

declare module '@configs/app-scanner' {
  export interface AppIdentity {
    id: string;
    name: string;
    description?: string;
    pathPrefix: string;
    subdomain?: string;
    type: 'main' | 'sub' | 'layout' | 'docs';
    enabled: boolean;
    version?: string;
  }
  
  export function getAllApps(): AppIdentity[];
  export function getAppById(id: string): AppIdentity | undefined;
  export function getMainApp(): AppIdentity | undefined;
  export function getSubApps(): AppIdentity[];
  export function getAppByPathPrefix(pathPrefix: string): AppIdentity | undefined;
  export function getAppBySubdomain(subdomain: string): AppIdentity | undefined;
}

