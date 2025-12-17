import type { App } from 'vue';
import type { Pinia } from 'pinia';
import { createPinia } from 'pinia';
// 关键：在 setupStore 之前导入 EPS 服务，确保 EPS 服务在 store 初始化时已经可用
// 在 layout-app 环境下，loadEpsService 会自动使用全局服务
import '../../services/eps';

export const createStore = () => createPinia();

export const setupStore = (app: App, store?: Pinia) => {
  const pinia = store ?? createStore();
  app.use(pinia);
  return pinia;
};

export type { Pinia };
