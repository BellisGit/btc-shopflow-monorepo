import { storage } from '@btc/shared-utils';
import type { App } from 'vue';
import ElementPlus from 'element-plus';
import { createThemePlugin } from '@btc/shared-core';

// 样式文件在模块加载时同步导入，但 Vite 会优化处理
// 开发环境：Vite 会按需加载样式
// 生产环境：样式会被打包到单独的 CSS 文件
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '../../styles/theme.scss';

// ECharts 插件
import EChartsPlugin from '../../plugins/echarts';

// Element Plus 国际化
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';

export type AdminThemePlugin = ReturnType<typeof createThemePlugin>;

/**
 * Element Plus 语言配置
 */
export const elementLocale = {
  'zh-CN': zhCn,
  'en-US': en
};

/**
 * 获取当前语言设置
 */
export const getCurrentLocale = (): string => {
  return storage.get<string>('locale') || 'zh-CN';
};

/**
 * 配置Element Plus
 */
export const setupElementPlus = (app: App) => {
  const currentLocale = getCurrentLocale();

  app.use(ElementPlus, {
    locale: elementLocale[currentLocale as keyof typeof elementLocale] || zhCn
  });
};

// 缓存 themePlugin 实例，避免重复创建
let themePluginInstance: AdminThemePlugin | null = null;

export const setupUI = (app: App) => {
  // 复用 themePlugin 实例，避免重复创建
  if (!themePluginInstance) {
    themePluginInstance = createThemePlugin();
  }

  // 配置Element Plus（包含国际化）
  setupElementPlus(app);

  // 配置 themePlugin
  app.use(themePluginInstance);

  // 配置ECharts
  app.use(EChartsPlugin);

  return themePluginInstance;
};
