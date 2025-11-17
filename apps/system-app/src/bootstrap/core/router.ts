import type { App } from 'vue';
import type { Router } from 'vue-router';
import { createSystemRouter } from '../../router';

export { createSystemRouter } from '../../router';

export const setupRouter = (app: App, router?: Router) => {
  const instance = router ?? createSystemRouter();
  app.use(instance);
  return instance;
};

export type { Router };
