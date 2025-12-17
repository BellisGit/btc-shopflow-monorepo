import type { App } from 'vue';
import ElementPlus from 'element-plus';
import { createThemePlugin } from '@btc/shared-core';

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

export type MonitorThemePlugin = ReturnType<typeof createThemePlugin>;

export const setupUI = (app: App) => {
  const themePlugin = createThemePlugin();

  app.use(ElementPlus);
  app.use(themePlugin);

  return themePlugin;
};
