/**
 * UI框架配置模块
 * 负责配置Element Plus、主题、样式等UI相关设置
 */

import type { App } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'virtual:uno.css';
import '../../styles/global.scss';
import '../../styles/theme.scss';
import '../../styles/nprogress.scss';
import '@btc/shared-components/styles/index.scss';

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
