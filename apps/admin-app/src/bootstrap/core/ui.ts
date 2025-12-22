import type { App } from 'vue';
import ElementPlus from 'element-plus';
import { createThemePlugin } from '@btc/shared-core';

// 样式文件在模块加载时同步导入，但 Vite 会优化处理
// 开发环境：Vite 会按需加载样式
// 生产环境：样式会被打包到单独的 CSS 文件
// 关键：Element Plus 样式必须在 bootstrap 中导入，与物流应用保持一致
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

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

  // 注意：CRUD 组件通过 unplugin-vue-components 自动导入和注册
  // 不需要显式注册，与 logistics-app 保持一致

  return themePluginInstance;
};
