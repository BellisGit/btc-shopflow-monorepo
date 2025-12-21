import type { App } from 'vue';
import type { Pinia } from 'pinia';
import { createPinia, setActivePinia } from 'pinia';

export const createStore = () => {
  const pinia = createPinia();
  // 关键：设置 activePinia，确保在非组件上下文中也能获取到
  setActivePinia(pinia);
  return pinia;
};

export const setupStore = (app: App, store?: Pinia) => {
  const pinia = store ?? createStore();
  app.use(pinia);
  // 关键：设置 activePinia，确保在非组件上下文中也能获取到
  setActivePinia(pinia);
  return pinia;
};

export type { Pinia };
