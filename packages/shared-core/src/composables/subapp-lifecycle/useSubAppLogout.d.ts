import type { SubAppContext } from './types';
/**
 * 创建退出登录函数（标准化模板）
 */
export declare function createLogoutFunction(context: SubAppContext, appId: string): () => Promise<void>;
