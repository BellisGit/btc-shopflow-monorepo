import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
// Element Plus 样式
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '@btc/shared-components/styles/dark-theme.css';
import '@btc/shared-components/styles/index.scss';
import 'virtual:uno.css';
import { registerAppEnvAccessors, registerManifestMenusForApp } from '@configs/layout-bridge';
import { setupSubAppErrorCapture, updateErrorList, listenForErrorReports } from '@btc/shared-utils/error-monitor';
import { createI18nPlugin } from '@btc/shared-core';
import { getLocaleMessages, normalizeLocale, DEFAULT_LOCALE, FALLBACK_LOCALE } from './i18n/getters';
import App from './App.vue';
import { createMonitorRouter } from './router';

const MONITOR_APP_ID = 'monitor';

let app: ReturnType<typeof createApp> | null = null;
let router: ReturnType<typeof createMonitorRouter> | null = null;
let unsubscribeCrossDomain: (() => void) | null = null;

function bootstrap() {
  return Promise.resolve();
}

async function mount(_props: any) {
  const container = _props?.container || document.querySelector('#app') as HTMLElement;

  if (!container) {
    throw new Error('监控应用容器不存在，请确保页面中存在 #app 元素');
  }

  // 独立运行时：设置全局函数供 AppLayout 使用
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  if (isStandalone) {
    registerAppEnvAccessors();
    registerManifestMenusForApp(MONITOR_APP_ID);
  }

  // 创建 Vue 应用
  app = createApp(App);

  // 注册 Element Plus
  app.use(ElementPlus);

  // 设置 i18n
  const i18n = createI18nPlugin({
    locale: normalizeLocale(_props?.locale || DEFAULT_LOCALE),
    fallbackLocale: normalizeLocale(FALLBACK_LOCALE),
    messages: getLocaleMessages(),
    scope: 'monitor',
  });
  app.use(i18n);

  // 创建路由
  router = createMonitorRouter();
  app.use(router);

  // 设置错误捕获（监控应用自己的错误，不使用跨域上报）
  setupSubAppErrorCapture({
    updateErrorList,
    appName: _props?.appName || MONITOR_APP_ID,
    useCrossDomainReport: false, // 监控应用自己不需要跨域上报
  });

  // 监听来自其他子应用的跨域错误上报
  unsubscribeCrossDomain = listenForErrorReports((errorInfo) => {
    // 接收到跨域上报的错误，存储到本地
    updateErrorList(errorInfo);
  });

  // qiankun 模式下，需要根据当前路径初始化路由
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && router) {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/monitor')) {
      const subPath = currentPath.replace('/monitor', '') || '/error';
      router.replace(subPath).catch(() => {});
    }
  }

  app.mount(container);
}

async function unmount(_props: any) {
  // 取消跨域上报监听
  if (unsubscribeCrossDomain) {
    unsubscribeCrossDomain();
    unsubscribeCrossDomain = null;
  }
  
  if (app) {
    app.unmount();
    app = null;
    router = null;
  }
}

async function update(_props: any) {
  // 监控应用不需要更新逻辑
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun
renderWithQiankun({
  bootstrap,
  mount,
  unmount,
  update,
});

// 标准 ES 模块导出
export default { bootstrap, mount, unmount, update };

// 独立运行（非 qiankun 环境）
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  mount({});
}

