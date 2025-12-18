// @btc/shared-utils 入口文件

// 核心工具模块
export * from './date';
// 显式导出日期格式化函数以避免moduleResolution: "bundler"解析问题
export { formatDateTimeFriendly, formatDate, formatDateTime, isDateTimeField, getDateRange, dateDiff } from './date';
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
// 显式导出 http 模块的类型，确保类型被正确导出
export type { MessageHandler, ConfirmHandler, RouterHandler, ApiResponse } from './http';

// 微前端相关
export * from './qiankun/load-layout-app';

// CDN 资源加载
export * from './cdn/load-shared-resources';
