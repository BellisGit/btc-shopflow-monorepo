/**
 * EPS 插件类型定义
 */
export interface ApiMethod {
    path: string;
    method: string;
    name: string;
    summary?: string;
}
export interface ApiModule {
    name: string;
    prefix: string;
    api: ApiMethod[];
}
export interface EpsData {
    [moduleName: string]: ApiMethod[];
}
export interface EpsPluginOptions {
    /**
     * EPS 元数据 URL
     */
    epsUrl: string;
    /**
     * 输出目录
     */
    outputDir?: string;
    /**
     * 是否监听变化
     */
    watch?: boolean;
}
