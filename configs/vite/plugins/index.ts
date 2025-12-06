/**
 * 公共 Vite 插件统一导出
 */

export { cleanDistPlugin } from './clean';
export { chunkVerifyPlugin, optimizeChunksPlugin } from './chunk';
export { forceNewHashPlugin, fixDynamicImportHashPlugin } from './hash';
export { ensureBaseUrlPlugin } from './url';
export { corsPlugin } from './cors';
export { ensureCssPlugin } from './css';
