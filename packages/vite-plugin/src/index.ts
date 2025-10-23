/**
 * @btc/vite-plugin - BTC Vite 鎻掍欢闆嗗悎
 *
 * 鍖呭惈鍔熻兘锛? * - EPS: Endpoint Service锛圓PI 鑷姩鍖栵級
 * - SVG: SVG 鍥炬爣澶勭悊
 * - Ctx: 涓婁笅鏂囷紙妯″潡鎵弿锛? * - Tag: 缁勪欢鍚嶇О鏍囩
 * - File: 鏂囦欢鎿嶄綔
 * - Proxy: 浠ｇ悊閰嶇疆
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
 * BTC 鎻掍欢涓诲叆鍙ｏ紙缁熶竴閰嶇疆锛? * @param options 閰嶇疆閫夐」
 * @returns Vite 鎻掍欢鏁扮粍
 */
export function btc(options: Partial<BtcPluginConfig> & { proxy?: any } = {}): Plugin[] {
  // 搴旂敤绫诲瀷
  config.type = options.type || 'admin';

  // 璇锋眰鍦板潃 - 鑷姩浠?proxy 閰嶇疆鑾峰彇
  if (options.proxy) {
    config.reqUrl = getProxyTarget(options.proxy);
  }

  // 鍚堝苟鍏朵粬閰嶇疆
  Object.assign(config, options);

  const plugins: Plugin[] = [];

  // EPS 鎻掍欢
  if (config.eps?.enable !== false) {
    plugins.push(
      epsPlugin({
        epsUrl: config.eps?.api || '/admin/login/eps/contract',
        outputDir: config.eps?.dist || 'build/eps',
        reqUrl: config.reqUrl || '',
      })
    );
  }

  // SVG 鎻掍欢
  plugins.push(svgPlugin());

  // Ctx 鎻掍欢
  plugins.push(ctxPlugin());

  // Tag 鎻掍欢
  if (config.nameTag) {
    plugins.push(tagPlugin());
  }

  return plugins.filter(Boolean);
}

// 瀵煎嚭鐙珛鎻掍欢锛堝厑璁告寜闇€寮曞叆锛?export { epsPlugin } from './eps';
export { svgPlugin } from './svg';
export { ctxPlugin } from './ctx';
export { tagPlugin } from './tag';

// 瀵煎嚭绫诲瀷
export * from './eps/types';
export type { BtcPluginConfig } from './config';

