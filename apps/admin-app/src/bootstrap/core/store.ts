/**
 * 状态管理配置模块
 * 负责配置Pinia状态管理
 */

import type { App } from 'vue';
import { createPinia } from 'pinia';

/**
 * 配置状态管理
 */
export const setupStore = (app: App) => {
  // 创建并安装Pinia
  const pinia = createPinia();
  app.use(pinia);

  return pinia;
};
