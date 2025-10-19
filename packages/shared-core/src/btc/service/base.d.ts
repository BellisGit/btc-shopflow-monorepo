/**
 * 基础服务类
 * 封装 fetch API 请求
 */
export interface RequestConfig {
    url: string;
    method?: string;
    params?: Record<string, unknown>;
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
}
export declare class BaseService {
    /**
     * 发起 HTTP 请求
     */
    static request<T = unknown>(config: RequestConfig): Promise<T>;
}
