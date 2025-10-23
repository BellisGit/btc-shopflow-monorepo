/**
 * 鍩虹鏈嶅姟绫? * 灏佽 fetch API 璇锋眰
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
     * 鍙戣捣 HTTP 璇锋眰
     */
    static request<T = unknown>(config: RequestConfig): Promise<T>;
}


