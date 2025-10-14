import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'virtual:uno.css';
import './styles/global.scss';
import './styles/theme.scss';
import './styles/nprogress.scss';
import App from './App.vue';
import router from './router';

// Import BTC components styles
import '@btc/shared-components/dist/style.css';

// Import plugins
import { createI18nPlugin, createThemePlugin, usePluginManager } from '@btc/shared-core';
import { excelPlugin, notificationPlugin, loggerPlugin, githubPlugin, i18nToolbarPlugin, themeToolbarPlugin } from './plugins';

const app = createApp(App);

// Install Pinia
const pinia = createPinia();
app.use(pinia);

// Install plugins
app.use(ElementPlus);
app.use(router);

// Install i18n plugin
const i18nPlugin = createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
});
app.use(i18nPlugin);

// Install theme plugin
const themePlugin = createThemePlugin();
app.use(themePlugin);

// Initialize Plugin Manager
const pluginManager = usePluginManager({ debug: false });
pluginManager.setApp(app);

// Register and install plugins
pluginManager
  .register(excelPlugin)
  .register(notificationPlugin)
  .register(loggerPlugin)
  .register(githubPlugin)
  .register(i18nToolbarPlugin)
  .register(themeToolbarPlugin);

// Install required plugins
pluginManager.installAll(['excel', 'notification', 'logger', 'github', 'i18n', 'theme']);

// Mount app
router.isReady().then(() => {
  app.mount('#app');

  // 应用挂载后，延迟关闭 Loading
  setTimeout(() => {
    const el = document.getElementById('Loading');
    if (el) {
      el.classList.add('is-hide');
    }
  }, 300);
});

// 设置语言切换时自动更新浏览器标题
import { setupI18nTitleWatcher } from './router';
setupI18nTitleWatcher();

// 初始化 qiankun 微前端
import { setupQiankun, listenSubAppReady, listenSubAppRouteChange } from './micro';
setupQiankun();
listenSubAppReady();
listenSubAppRouteChange();
