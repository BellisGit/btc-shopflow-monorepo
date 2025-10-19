/**
 * 服务构建器
 * 从 EPS 数据动态生成 service 对象
 */
export interface ApiMethod {
    name: string;
    method: string;
    path: string;
    summary?: string;
}
export interface ServiceModule {
    api: ApiMethod[];
}
export type EpsData = Record<string, ServiceModule>;
/**
 * 动态服务类型
 */
export type DynamicService = Record<string, Record<string, (data?: any) => Promise<any>>>;
export declare class ServiceBuilder {
    /**
     * 从 EPS 数据构建服务对象
     * @param epsData - virtual:eps 提供的数据
     */
    build(epsData: EpsData): DynamicService;
}
