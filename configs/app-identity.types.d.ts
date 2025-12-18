/**
 * 应用身份配置接口
 * 每个子应用必须实现此接口，定义自己的身份信息
 */
export interface AppIdentity {
    id: string;
    name: string;
    description?: string;
    pathPrefix: string;
    subdomain?: string;
    type: 'main' | 'sub' | 'layout' | 'docs';
    enabled: boolean;
    icon?: string;
    version?: string;
    metadata?: Record<string, any>;
}
