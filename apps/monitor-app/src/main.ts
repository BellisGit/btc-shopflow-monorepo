import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
import 'virtual:svg-icons';
// Element Plus 样式
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '@btc/shared-components/styles/dark-theme.css';
import '@btc/shared-components/styles/index.scss';
import 'virtual:uno.css';
import type { QiankunProps } from '@btc/shared-core';
import { registerAppEnvAccessors, registerManifestMenusForApp } from '@configs/layout-bridge';
import { setupSubAppErrorCapture, updateErrorList, listenForErrorReports } from '@btc/shared-utils/error-monitor';
import { createI18nPlugin } from '@btc/shared-core';
import { getLocaleMessages, normalizeLocale, DEFAULT_LOCALE, FALLBACK_LOCALE } from './i18n/getters';
import { AppLayout } from '@btc/shared-components';
import App from './App.vue';
import { createMonitorRouter } from './router';
import { getManifestTabs, getManifestRoute } from '@btc/subapp-manifests';
import type { Router } from 'vue-router';
import { initLayoutApp } from './utils/init-layout-app';

const MONITOR_APP_ID = 'monitor';
const MONITOR_BASE_PATH = '/monitor';

let app: ReturnType<typeof createApp> | null = null;
let router: Router | null = null;
let i18nPlugin: ReturnType<typeof createI18nPlugin> | null = null;
let unsubscribeCrossDomain: (() => void) | null = null;
let routerAfterEach: (() => void) | null = null;
let locationListeners: Array<[string, EventListener]> = [];

// 路由同步相关变量
let syncingFromSubApp = false;
let syncingFromHost = false;

// 确保路径以 / 开头
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

// 规范化为主机路径
const normalizeToHostPath = (relativeFullPath: string) => {
  const normalizedRelative = relativeFullPath === '' ? '/' : ensureLeadingSlash(relativeFullPath);

  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return normalizedRelative;
  }

  if (normalizedRelative === '/' || normalizedRelative === MONITOR_BASE_PATH) {
    return MONITOR_BASE_PATH;
  }

  // 如果已经是完整路径（以 /monitor 开头），直接返回
  if (normalizedRelative === MONITOR_BASE_PATH || normalizedRelative.startsWith(`${MONITOR_BASE_PATH}/`)) {
    return normalizedRelative;
  }

  return `${MONITOR_BASE_PATH}${normalizedRelative}`;
};

// 从主机路径推导初始子路由
const deriveInitialSubRoute = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return '/';
  }

  const { pathname, search, hash } = window.location;
  if (!pathname.startsWith(MONITOR_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(MONITOR_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

// 从主机路径提取子路由
const extractHostSubRoute = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return '/';
  }

  const { pathname, search, hash } = window.location;
  if (!pathname.startsWith(MONITOR_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(MONITOR_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

// 同步子应用路由到主机路由
const syncHostWithSubRoute = (fullPath: string) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ || syncingFromHost) {
    return;
  }

  let targetUrl = fullPath || MONITOR_BASE_PATH;
  
  if (!targetUrl.startsWith(MONITOR_BASE_PATH)) {
    if (targetUrl === '/' || targetUrl === '') {
      targetUrl = MONITOR_BASE_PATH;
    } else {
      targetUrl = `${MONITOR_BASE_PATH}${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`;
    }
  }

  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (currentUrl === targetUrl) {
    return;
  }

  syncingFromSubApp = true;
  window.history.pushState(window.history.state, '', targetUrl);
};

// 同步主机路由到子应用路由
const syncSubRouteWithHost = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ || !router) {
    return;
  }

  const targetRoute = extractHostSubRoute();
  const normalizedTarget = ensureLeadingSlash(targetRoute);
  const currentRoute = ensureLeadingSlash(
    router.currentRoute.value.fullPath || router.currentRoute.value.path || '/',
  );

  if (normalizedTarget === currentRoute) {
    return;
  }

  syncingFromHost = true;
  router.replace(normalizedTarget).catch(() => {}).finally(() => {
    syncingFromHost = false;
  });
};

// 获取翻译函数
const getTranslate = () => {
  if (!i18nPlugin?.i18n?.global) {
    return (key?: string | null) => key || '';
  }
  try {
    return (i18nPlugin.i18n.global.t as any) || ((key?: string | null) => key || '');
  } catch {
    return (key?: string | null) => key || '';
  }
};

// 发送路由变化事件（带完整的 meta 信息）
const sendRouteChangeEvent = (to: any) => {
  if (!router) return;

  const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
  const fullPath = normalizeToHostPath(relativeFullPath);

  // 从 manifest 获取路由信息
  const manifestRoute = getManifestRoute(MONITOR_APP_ID, fullPath);
  const tabLabelKey = manifestRoute?.tab?.labelKey || manifestRoute?.labelKey;
  const labelKey = manifestRoute?.labelKey;

  const translate = getTranslate();
  const label = tabLabelKey ? translate(tabLabelKey) : (to.name as string || fullPath);

  const metaPayload: Record<string, any> = {
    ...to.meta,
    label,
  };

  // 设置 labelKey
  if (typeof metaPayload.labelKey !== 'string' || metaPayload.labelKey.length === 0) {
    if (labelKey) {
      metaPayload.labelKey = labelKey;
    } else if (tabLabelKey) {
      metaPayload.labelKey = tabLabelKey;
    }
  }

  // 设置 breadcrumbs
  if (!metaPayload.breadcrumbs && Array.isArray(manifestRoute?.breadcrumbs)) {
    metaPayload.breadcrumbs = manifestRoute.breadcrumbs;
  }

  window.dispatchEvent(
    new CustomEvent('subapp:route-change', {
      detail: {
        path: fullPath,
        fullPath,
        name: to.name,
        meta: metaPayload,
      },
    }),
  );
};

// 设置路由同步
const setupRouteSync = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ || !router) {
    return;
  }

  routerAfterEach = router.afterEach((to) => {
    // 跳过首页
    if (to.meta?.isHome) {
      return;
    }

    const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
    const fullPath = normalizeToHostPath(relativeFullPath);

    syncHostWithSubRoute(fullPath);

    // 发送路由变化事件，用于 tabbar
    sendRouteChangeEvent(to);
  });
};

// 设置主机路由监听
const setupHostLocationBridge = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  const handleRoutingEvent = () => {
    if (syncingFromSubApp) {
      syncingFromSubApp = false;
      return;
    }

    syncSubRouteWithHost();
  };

  window.addEventListener('single-spa:routing-event', handleRoutingEvent);
  window.addEventListener('popstate', handleRoutingEvent);
  locationListeners.push(['single-spa:routing-event', handleRoutingEvent]);
  locationListeners.push(['popstate', handleRoutingEvent]);

  // 初始化时同步一次
  handleRoutingEvent();
};

// 注册 Tabbar
const registerTabs = (props?: QiankunProps) => {
  const register = props?.registerTabs;
  if (!register) {
    return;
  }

  const tabs = getManifestTabs(MONITOR_APP_ID);
  if (!tabs.length) {
    return;
  }

  register(tabs.map((tab) => ({
    key: tab.key,
    title: tab.labelKey ?? tab.label ?? tab.path,
    path: tab.path,
    i18nKey: tab.labelKey,
  })));
};

function bootstrap() {
  return Promise.resolve();
}

async function mount(_props: QiankunProps = {}) {
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
  i18nPlugin = createI18nPlugin({
    locale: normalizeLocale(_props?.locale || DEFAULT_LOCALE),
    fallbackLocale: normalizeLocale(FALLBACK_LOCALE),
    messages: getLocaleMessages(),
    scope: 'monitor',
  });
  app.use(i18nPlugin);

  // 创建路由
  router = createMonitorRouter(isStandalone);
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

  // 路由初始化
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && router) {
    const initialRoute = deriveInitialSubRoute();
    Promise.resolve().then(() => {
      if (router) {
        router.replace(initialRoute).catch(() => {});
      }
    });
  }

  app.mount(container);

  // 设置路由同步和主机路由监听
  setupRouteSync();
  setupHostLocationBridge();

  // 注册 Tabbar
  registerTabs(_props);

  // 路由初始化完成后，如果当前路由不是首页，手动发送路由变化事件
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && router) {
    router.isReady().then(() => {
      if (!router) return;
      const currentRoute = router.currentRoute.value;
      // 如果当前路由不是首页，发送路由变化事件
      if (currentRoute && !currentRoute.meta?.isHome) {
        const relativeFullPath = ensureLeadingSlash(currentRoute.fullPath || currentRoute.path || '');
        const fullPath = normalizeToHostPath(relativeFullPath);
        syncHostWithSubRoute(fullPath);
        sendRouteChangeEvent(currentRoute);
      }
    });
  }

  // 调用 onReady 回调
  if (_props?.onReady) {
    _props.onReady();
  }

  // 发送子应用就绪事件
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'monitor' } }));
  }
}

async function unmount(_props: QiankunProps = {}) {
  // 取消路由守卫
  if (routerAfterEach) {
    routerAfterEach();
    routerAfterEach = null;
  }

  // 取消路由监听
  locationListeners.forEach(([event, handler]) => {
    window.removeEventListener(event, handler);
  });
  locationListeners = [];

  // 取消跨域上报监听
  if (unsubscribeCrossDomain) {
    unsubscribeCrossDomain();
    unsubscribeCrossDomain = null;
  }

  // 清除 Tabbar
  if (_props?.clearTabs) {
    _props.clearTabs();
  }
  
  if (app) {
    app.unmount();
    app = null;
    router = null;
  }
}

async function update(_props: QiankunProps = {}) {
  // 更新时重新注册 Tabbar
  registerTabs(_props);
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
const shouldRunStandalone = () =>
  !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

if (shouldRunStandalone()) {
  // 如果需要加载 layout-app，先初始化
  initLayoutApp().catch((error) => {
    console.error('[monitor-app] 初始化 layout-app 失败:', error);
  });
  
  mount({}).catch((error) => {
    console.error('[monitor-app] 独立运行失败:', error);
  });
}
