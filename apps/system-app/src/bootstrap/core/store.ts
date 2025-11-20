import type { App } from 'vue';
import type { Pinia } from 'pinia';
import { createPinia } from 'pinia';

export const createStore = () => createPinia();

export const setupStore = (app: App, store?: Pinia) => {
  const pinia = store ?? createStore();
  app.use(pinia);
  return pinia;
};

export type { Pinia };
