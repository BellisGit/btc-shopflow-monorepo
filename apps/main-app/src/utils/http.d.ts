/**
 * HTTP 请求工具
 */
export declare class Http {
    private baseURL;
    constructor(baseURL?: string);
    private request;
    get<T = any>(url: string, params?: Record<string, any>): Promise<T>;
    post<T = any>(url: string, data?: any): Promise<T>;
    put<T = any>(url: string, data?: any): Promise<T>;
    delete<T = any>(url: string): Promise<T>;
}
export declare const http: Http;
/**
 * 创建标准 CRUD 服务
 */
export declare function createCrudService(resource: string): {
    page: (params: {
        page: number;
        size: number;
        keyword?: string;
    }) => Promise<{
        list: any[];
        total: number;
    }>;
    add: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: ({ ids }: {
        ids: (string | number)[];
    }) => Promise<void>;
};
