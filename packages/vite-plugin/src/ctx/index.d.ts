import type { Plugin } from 'vite';
export interface CtxData {
    modules?: string[];
    serviceLang?: string;
}
/**
 * 创建上下文数据
 */
export declare function createCtx(): Promise<CtxData>;
/**
 * 上下文插件（自动扫描模块）
 * 扫描 src/modules/ 目录，获取所有模块名和服务语言类型
 */
export declare function ctxPlugin(): Plugin;
