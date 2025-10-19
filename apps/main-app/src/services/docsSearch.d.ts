/**
 * 文档搜索服务
 * 用于在全局搜索中搜索 VitePress 文档内容
 *
 * 自动从 VitePress 的搜索索引接口加载数据
 */
export interface DocSearchResult {
    id: string;
    type: 'doc';
    title: string;
    path: string;
    breadcrumb: string;
    excerpt?: string;
}
/**
 * 搜索文档（异步）
 * @param keyword 搜索关键词
 * @returns 匹配的文档列表
 */
export declare function searchDocs(keyword: string): Promise<DocSearchResult[]>;
/**
 * 获取所有文档（用于快速访问）
 * @returns 所有文档列表
 */
export declare function getAllDocs(): Promise<DocSearchResult[]>;
/**
 * 根据路径获取文档完整 URL
 * @param path VitePress 内部路径
 * @returns 完整的文档 URL
 */
export declare function getDocUrl(path: string): string;
