/**
 * 公共 Vite 插件统一导出
 */

export { cleanDistPlugin } from './clean';
export { chunkVerifyPlugin, optimizeChunksPlugin } from './chunk';
export { ensureBaseUrlPlugin } from './url';
export { corsPlugin } from './cors';
export { ensureCssPlugin } from './css';
export { addVersionPlugin } from './version';
export { publicImagesToAssetsPlugin } from './public-images';
export { resourcePreloadPlugin } from './resource-preload';
export { resolveLogoPlugin } from './resolve-logo';
export { copyIconsPlugin } from './copy-icons';
export { uploadIconsToOssPlugin } from './upload-icons-to-oss';
export { replaceIconsWithCdnPlugin } from './replace-icons-with-cdn';
