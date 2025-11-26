/**
 * UI框架配置模块
 * 负责配置Element Plus、主题、样式等UI相关设置
 */

import type { App } from 'vue';
import ElementPlus from 'element-plus';
// 关键：确保 Element Plus 样式在最前面加载，避免被其他样式覆盖
// 开启样式隔离后，需要确保 Element Plus 样式在主应用中被正确加载
// 注意：main.ts 中已经引入了，这里再次引入确保样式被正确加载
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'virtual:uno.css';
// 关键：在关闭样式隔离的情况下，需要直接 import 样式文件，确保样式被正确加载
// 虽然 global.scss 中也通过 @import 引入了，但直接 import 可以确保样式在模块加载时就被处理
import '@btc/shared-components/styles/index.scss';
import '../../styles/global.scss';
import '../../styles/theme.scss';
import '../../styles/menu-themes.scss';
import '../../styles/nprogress.scss';

// ECharts 插件
import EChartsPlugin from '../../plugins/echarts';

// Element Plus 国际化
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';

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
  return localStorage.getItem('locale') || 'zh-CN';
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

/**
 * 配置全局样式
 */
export const setupGlobalStyles = () => {
  // 样式文件已经在顶部导入，这里可以添加额外的样式配置
  // 例如：动态主题切换、自定义CSS变量等
};

/**
 * 配置UI框架
 */
export const setupUI = (app: App) => {
  // 配置Element Plus
  setupElementPlus(app);

  // 配置ECharts
  app.use(EChartsPlugin);

  // 配置全局样式
  setupGlobalStyles();
};
