import type { App } from 'vue';
import type { Router } from 'vue-router';
import { createMonitorRouter } from '../../router';

export { createMonitorRouter } from '../../router';

export const setupRouter = (app: App, router?: Router, isStandalone?: boolean) => {
  const instance = router ?? createMonitorRouter(isStandalone ?? false);
  app.use(instance);
  return instance;
};

export type { Router };
