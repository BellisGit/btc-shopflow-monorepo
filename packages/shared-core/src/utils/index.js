// @btc/shared-utils 入口文件
// 核心工具模块
export * from './date';
export * from './format';
export * from './validate';
export * from './storage';
export * from './storage/cross-domain';
// 数据处理模块
export * from './array';
export * from './object';
export * from './string';
export * from './number';
// 业务功能模块
export * from './form';
export * from './hooks';
export * from './http';
// Composables
export * from './composables/usePageTransition';
export * from './composables/useFileType';
// 显式导出 useFileType 相关函数，确保被正确导出
export { useFileType, detectFileType, detectFileTypeFromBuffer, detectFileTypeFromFileName } from './composables/useFileType';
// 微前端相关
export * from './qiankun/load-layout-app';
