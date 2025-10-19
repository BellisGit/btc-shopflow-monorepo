import type { Plugin } from 'vite';
/**
 * 创建 SVG sprite
 */
export declare function createSvg(): Promise<{
    code: string;
    svgIcons: string[];
}>;
/**
 * SVG 图标插件
 * 扫描项目中的 SVG 文件，自动生成 SVG sprite
 */
export declare function svgPlugin(): Plugin;
