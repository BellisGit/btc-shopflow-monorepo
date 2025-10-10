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
import { epsPlugin } from './eps';
import { svgPlugin } from './svg';
import { ctxPlugin } from './ctx';
import { tagPlugin } from './tag';
import type { BtcPluginConfig } from './config';
import { config } from './config';

/**
 * BTC 插件主入口（统一配置）
 * @param options 配置选项
 * @returns Vite 插件数组
 */
export function btc(options: Partial<BtcPluginConfig> = {}): Plugin[] {
  // 合并配置
  Object.assign(config, options);

  const plugins: Plugin[] = [];

  // EPS 插件
  if (config.eps?.enable !== false) {
    plugins.push(
      epsPlugin({
        epsUrl: config.eps?.api || '/admin/base/open/eps',
        outputDir: config.eps?.dist || 'build/eps',
      })
    );
  }

  // SVG 插件
  plugins.push(svgPlugin());

  // Ctx 插件
  plugins.push(ctxPlugin());

  // Tag 插件
  if (config.nameTag) {
    plugins.push(tagPlugin());
  }

  return plugins.filter(Boolean);
}

// 导出独立插件（允许按需引入）
export { epsPlugin } from './eps';
export { svgPlugin } from './svg';
export { ctxPlugin } from './ctx';
export { tagPlugin } from './tag';

// 导出类型
export * from './eps/types';
export type { BtcPluginConfig } from './config';
