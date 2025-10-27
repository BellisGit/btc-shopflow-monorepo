﻿/**
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
import { getProxyTarget } from './proxy';

/**
 * BTC 插件主入口（统一配置）
 * @param options 配置选项
 * @returns Vite 插件数组
 */
export function btc(options: Partial<BtcPluginConfig> & { proxy?: any } = {}) {
  // 应用类型
  config.type = options.type || 'admin';

  // 请求地址 - 自动从 proxy 配置获取
  if (options.proxy) {
    config.reqUrl = getProxyTarget(options.proxy);
  }

  // 合并其他配置
  Object.assign(config, options);

  // 完全像 cool-admin 一样直接返回插件数组
  const plugins = [];

  if (config.eps?.enable !== false) {
    plugins.push(
      epsPlugin({
        epsUrl: config.eps?.api || '/admin/login/eps/contract',
        outputDir: config.eps?.dist || 'build/eps',
        reqUrl: config.reqUrl || '',
      })
    );
  }

  plugins.push(svgPlugin());
  plugins.push(ctxPlugin());

  if (config.nameTag !== false) {
    plugins.push(tagPlugin());
  }

  return plugins;
}

// 导出独立插件（允许按需引入）
export { epsPlugin } from './eps';
export { svgPlugin } from './svg';
export { ctxPlugin } from './ctx';
export { tagPlugin } from './tag';

// 导出类型
export * from './eps/types';
export type { BtcPluginConfig } from './config';
