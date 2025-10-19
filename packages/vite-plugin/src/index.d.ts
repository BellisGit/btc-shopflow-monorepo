/**
 * @btc/vite-plugin - BTC Vite 插件集合
 *
 * 包含功能：
 * - EPS: Endpoint Service（API 自动化）
 * - SVG: SVG 图标处理
 * - Ctx: 上下文（模块扫描）
 * - Tag: 组件名称标签
 * - File: 文件操作
 * - Proxy: 代理配置
 */
import type { Plugin } from 'vite';
import type { BtcPluginConfig } from './config';
/**
 * BTC 插件主入口（统一配置）
 * @param options 配置选项
 * @returns Vite 插件数组
 */
export declare function btc(options?: Partial<BtcPluginConfig>): Plugin[];
export { epsPlugin } from './eps';
export { svgPlugin } from './svg';
export { ctxPlugin } from './ctx';
export { tagPlugin } from './tag';
export * from './eps/types';
export type { BtcPluginConfig } from './config';
