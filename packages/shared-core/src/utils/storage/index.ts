/**
 * 存储工具统一导出
 * 包含 Cookie、LocalStorage、SessionStorage、IndexedDB 和 Pinia 持久化插件
 */

// Cookie 工具
export * from './cookie';

// LocalStorage 工具
export * from './local';

// SessionStorage 工具
export * from './session';

// IndexedDB 工具
export * from './indexeddb';

// Pinia 持久化插件
export * from './pinia-persist';

// 跨域工具（保留向后兼容）
export * from './cross-domain';
