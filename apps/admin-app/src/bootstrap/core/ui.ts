import type { App } from 'vue';
import ElementPlus from 'element-plus';
import { createThemePlugin } from '@btc/shared-core';

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '../../styles/theme.scss';

export type AdminThemePlugin = ReturnType<typeof createThemePlugin>;

// 缓存 themePlugin 实例，避免重复创建
let themePluginInstance: AdminThemePlugin | null = null;

export const setupUI = (app: App) => {
  // 复用 themePlugin 实例，避免重复创建
  if (!themePluginInstance) {
    themePluginInstance = createThemePlugin();
  }

  // ElementPlus 和 themePlugin 的注册是轻量级操作，不会阻塞
  app.use(ElementPlus);
  app.use(themePluginInstance);

  return themePluginInstance;
};
