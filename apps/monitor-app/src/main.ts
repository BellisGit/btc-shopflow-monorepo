import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
import 'virtual:svg-icons';
import 'virtual:uno.css';
// Element Plus 样式
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
// 关键：直接导入确保构建时被正确打包，避免代码分割导致的路径问题
import '@btc/shared-components/styles/dark-theme.css';
// 共享组件样式（必须在 global.scss 之前导入，确保构建时被正确打包）
// 关键：虽然 global.scss 中也通过 @use 导入了，但直接 import 可以确保样式在模块加载时就被处理
// 与 finance-app 保持一致，在入口文件中直接导入共享组件样式
import '@btc/shared-components/styles/index.scss';
// 应用全局样式（global.scss 中已通过 @use 导入共享组件样式，但直接导入可以确保构建时被正确处理）
import './styles/global.scss';
import './styles/theme.scss';
import './styles/nprogress.scss';
import './styles/menu-themes.scss';
import type { QiankunProps } from '@btc/shared-core';
import { registerAppEnvAccessors, registerManifestMenusForApp, registerManifestTabsForApp, createAppStorageBridge, createDefaultDomainResolver, resolveAppLogoUrl, createSharedUserSettingPlugin } from '@configs/layout-bridge';
import { setupSubAppErrorCapture, updateErrorList, listenForErrorReports } from '@btc/shared-utils/error-monitor';
import { createI18nPlugin, resetPluginManager, usePluginManager, createThemePlugin } from '@btc/shared-core';
import { getLocaleMessages, normalizeLocale, DEFAULT_LOCALE, FALLBACK_LOCALE } from './i18n/getters';
// AppLayout 未使用，但保留导入以备将来使用
// import { AppLayout } from '@btc/shared-components';
import App from './App.vue';
import { createMonitorRouter } from './router';
import { getManifestTabs, getManifestRoute } from '@btc/subapp-manifests';
import type { Router } from 'vue-router';
import { isMainApp } from '@configs/unified-env-config';
// 注意：initLayoutApp 改为动态导入，与其他应用保持一致

// 注入 isMainApp 函数到 shared-components（异步导入，避免构建时错误）
// 关键：在独立运行时，monitor-app 应该被判断为子应用（不是主应用），这样 AppLayout 才会正常显示顶栏、菜单等
// @ts-expect-error - 动态导入路径，TypeScript 无法在编译时解析
import('@btc/shared-components/components/layout/app-layout/utils').then(utils => {
  utils.setIsMainAppFn(isMainApp);
}).catch(() => {
  // 静默处理导入失败，不影响应用启动
  if (import.meta.env.DEV) {
    console.warn('[monitor-app] 无法导入 setIsMainAppFn，跳过设置');
  }
});

const MONITOR_APP_ID = 'monitor';
const MONITOR_BASE_PATH = '/monitor';
const sharedUserSettingPlugin = createSharedUserSettingPlugin();

let app: ReturnType<typeof createApp> | null = null;
let router: Router | null = null;
let i18nPlugin: ReturnType<typeof createI18nPlugin> | null = null;
let unsubscribeCrossDomain: (() => void) | null = null;
let routerAfterEach: (() => void) | null = null;
let locationListeners: Array<[string, EventListener]> = [];
let languageListener: EventListener | null = null;

// 路由同步相关变量
let syncingFromSubApp = false;
let syncingFromHost = false;

// 确保路径以 / 开头
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

// 规范化为主机路径
const normalizeToHostPath = (relativeFullPath: string) => {
  const normalizedRelative = relativeFullPath === '' ? '/' : ensureLeadingSlash(relativeFullPath);

  // 关键：在 layout-app 环境下也需要处理路径
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return normalizedRelative;
  }

  // 检测是否在生产环境的子域名下
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  // 在生产环境子域名下，路径应该不带应用前缀（直接使用相对路径）
  if (isProductionSubdomain) {
    return normalizedRelative;
  }

  // 开发环境（qiankun模式）：添加应用前缀
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
  // 检测是否在生产环境的子域名下或使用 layout-app
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
  const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;

  // 如果不在 qiankun 模式且不在 layout-app 模式，返回根路径
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return '/';
  }

  const { pathname, search, hash } = window.location;

  // 在生产环境子域名下或使用 layout-app，路径直接使用（不带 /monitor 前缀）
  if (isProductionSubdomain || isUsingLayoutApp) {
    return `${pathname || '/'}${search}${hash}`;
  }

  // 开发环境（qiankun模式）：需要从 /monitor 前缀中提取
  if (!pathname.startsWith(MONITOR_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(MONITOR_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

/**
 * 移除 Loading 元素
 */
function removeLoadingElement() {
  const loadingEl = document.getElementById('Loading');
  if (loadingEl) {
    // 立即隐藏（使用内联样式确保优先级）
    loadingEl.style.setProperty('display', 'none', 'important');
    loadingEl.style.setProperty('visibility', 'hidden', 'important');
    loadingEl.style.setProperty('opacity', '0', 'important');
    loadingEl.style.setProperty('pointer-events', 'none', 'important');

    // 添加淡出类（如果 CSS 中有定义）
    loadingEl.classList.add('is-hide');

    // 延迟移除，确保动画完成（300ms 过渡时间 + 50ms 缓冲）
    setTimeout(() => {
      try {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        } else if (loadingEl.isConnected) {
          // 如果 parentNode 为 null 但元素仍在 DOM 中，直接移除
          loadingEl.remove();
        }
      } catch (error) {
        // 如果移除失败，至少确保元素被隐藏
        loadingEl.style.setProperty('display', 'none', 'important');
      }
    }, 350);
  }
}

/**
 * 清理导航标记
 */
function clearNavigationFlag() {
  try {
    sessionStorage.removeItem('__BTC_NAV_LOADING__');
  } catch (e) {
    // 静默失败（某些浏览器可能禁用 sessionStorage）
  }
}

// 从主机路径提取子路由
const extractHostSubRoute = () => {
  // 关键：在 layout-app 环境下也需要提取主机路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return '/';
  }

  // 检测是否在生产环境的子域名下
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  const { pathname, search, hash } = window.location;

  // 在生产环境子域名下或使用 layout-app，路径直接使用（不带 /monitor 前缀）
  if (isProductionSubdomain || isUsingLayoutApp) {
    return `${pathname || '/'}${search}${hash}`;
  }

  // 开发环境（qiankun模式）：需要从 /monitor 前缀中提取
  if (!pathname.startsWith(MONITOR_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(MONITOR_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

// 同步子应用路由到主机路由
const syncHostWithSubRoute = (fullPath: string) => {
  // 关键：在 layout-app 环境下也需要同步路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if ((!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) || syncingFromHost) {
    return;
  }

  // 使用 normalizeToHostPath 规范化路径，它会自动处理生产环境子域名
  const targetUrl = normalizeToHostPath(fullPath || '/');
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (currentUrl === targetUrl) {
    return;
  }

  syncingFromSubApp = true;
  window.history.pushState(window.history.state, '', targetUrl);
};

// 同步主机路由到子应用路由
const syncSubRouteWithHost = () => {
  // 关键：在 layout-app 环境下也需要同步路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if ((!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) || !router) {
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
  // 优先从路由 meta 中获取 tabLabelKey，如果没有则从 manifest 获取
  const tabLabelKey = (to.meta?.tabLabelKey as string | undefined)
    || manifestRoute?.tab?.labelKey
    || manifestRoute?.labelKey;
  const labelKey = (to.meta?.titleKey as string | undefined)
    || manifestRoute?.labelKey;

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
  // 只在 qiankun 模式下设置路由同步（layout-app 模式下不需要，因为已经是子域名）
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
  // 关键：在 layout-app 环境下也需要同步路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
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

// 设置事件桥接（语言切换和主题切换）
const setupEventBridge = () => {
  // 语言切换监听器需要在所有环境下都运行（包括独立运行）
  languageListener = ((event: Event) => {
    const custom = event as CustomEvent<{ locale: string }>;
    const newLocale = custom.detail?.locale as 'zh-CN' | 'en-US';
    if (newLocale && i18nPlugin?.i18n?.global) {
      i18nPlugin.i18n.global.locale.value = newLocale;
      // 重新注册 Tabbar，确保标签页标题也更新
      registerTabs();
    }
  }) as EventListener;

  window.addEventListener('language-change', languageListener);
};

function bootstrap() {
  return Promise.resolve();
}

async function mount(_props: QiankunProps = {}) {
  // 查找挂载点：
  // - 优先使用 props.container（无论是否 qiankun，只要提供了 container 就使用）
  // - 否则：如果 __USE_LAYOUT_APP__ 为 true，尝试查找 #subapp-viewport
  // - 否则：使用 #app（独立运行模式）
  let container: HTMLElement | null = null;
  
  // 关键：优先使用 props.container（无论是 qiankun 模式还是嵌入 layout-app 模式）
  if (_props.container && _props.container instanceof HTMLElement) {
    container = _props.container;
  } else if ((window as any).__USE_LAYOUT_APP__) {
    // 使用 layout-app：尝试查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      container = viewport;
    } else {
      throw new Error('[monitor-app] 使用 layout-app 但未找到 #subapp-viewport 元素');
    }
  } else if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // qiankun 模式但未提供 container：尝试查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      container = viewport;
    } else {
      const appElement = document.querySelector('#app') as HTMLElement;
      if (appElement) {
        container = appElement;
      } else {
        throw new Error('[monitor-app] qiankun 模式下未找到容器元素');
      }
    }
  } else {
    // 独立运行模式：使用 #app
    const appElement = document.querySelector('#app') as HTMLElement;
    if (appElement) {
      container = appElement;
    }
  }

  if (!container) {
    throw new Error('监控应用容器不存在，请确保页面中存在 #app 或 #subapp-viewport 元素');
  }

  // 关键：在创建 Vue 应用之前注册菜单（确保菜单数据在 AppLayout 渲染前已准备好）
  // 无论是独立运行还是 qiankun 模式，都需要注册菜单
  // 在独立运行模式下，确保菜单注册表已初始化
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
  if (isStandalone) {
    try {
      const { getMenuRegistry } = await import('@btc/shared-components/store/menuRegistry');
      const registry = getMenuRegistry();
      // 确保注册表已挂载到全局对象
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
  }
  registerManifestMenusForApp(MONITOR_APP_ID);
  registerManifestTabsForApp(MONITOR_APP_ID);

  // 独立运行时：设置全局函数供 AppLayout 使用
  // 如果使用了 layout-app（通过 __USE_LAYOUT_APP__ 标志），不应该设置这些全局函数
  if (isStandalone) {
    registerAppEnvAccessors();
    const win = window as any;
    if (!win.__APP_STORAGE__) {
      win.__APP_STORAGE__ = createAppStorageBridge(MONITOR_APP_ID);
    }
    if (!win.__APP_EPS_SERVICE__) {
      win.__APP_EPS_SERVICE__ = {};
    }
    if (!win.__APP_GET_DOMAIN_LIST__) {
      win.__APP_GET_DOMAIN_LIST__ = createDefaultDomainResolver(MONITOR_APP_ID);
    }
    if (!win.__APP_FINISH_LOADING__) {
      win.__APP_FINISH_LOADING__ = () => {};
    }
    if (!win.__APP_LOGOUT__) {
      win.__APP_LOGOUT__ = () => {};
    }
    win.__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
    win.__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];
  }

  // 创建 Vue 应用
  app = createApp(App);

  // 关键：安装 Pinia（必须在任何 useStore 调用之前）
  // 生产环境报错 `Cannot read properties of undefined (reading '_s')` 通常是 activePinia 未初始化导致
  const pinia = createPinia();
  app.use(pinia);
  // 兜底：确保在非组件上下文中也能获取到 activePinia（例如某些 util/composable 在 setup 之外调用 store）
  setActivePinia(pinia);

  // 设置主题插件（与 finance-app 保持一致，用于主题色和背景样式）
  const themePlugin = createThemePlugin();
  app.use(themePlugin);

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

  // 关键：在独立运行时注册插件（与 finance-app 保持一致）
  // 用户设置插件是 AppLayout 正常工作所必需的，负责管理菜单主题、主题切换等功能
  // 重要：必须等待插件安装完成后再挂载应用，确保 AppLayout 能正确获取 menuType 等设置
  if (isStandalone) {
    const setupStandalonePlugins = async () => {
      if (!app || !router) {
        console.warn('[monitor-app] app 或 router 未初始化，无法注册插件');
        return;
      }
      console.log('[monitor-app] 开始注册插件...');
      resetPluginManager();
      const pluginManager = usePluginManager({ debug: false });
      pluginManager.setApp(app);
      pluginManager.setRouter(router);
      pluginManager.register(sharedUserSettingPlugin);
      console.log('[monitor-app] 插件已注册，开始安装...');
      await pluginManager.install(sharedUserSettingPlugin.name);
      console.log('[monitor-app] 插件安装完成');
    };

    // 关键：等待插件安装完成（与 finance-app 保持一致）
    await setupStandalonePlugins().catch((error) => {
      console.error('[monitor-app] 注册插件失败:', error);
    });
  }

  // 设置错误捕获（监控应用自己的错误，不使用跨域上报）
  setupSubAppErrorCapture({
    updateErrorList,
    appName: (_props?.appName as string | undefined) || MONITOR_APP_ID,
    useCrossDomainReport: false, // 监控应用自己不需要跨域上报
  });

  // 监听来自其他子应用的跨域错误上报
  unsubscribeCrossDomain = listenForErrorReports((errorInfo) => {
    // 接收到跨域上报的错误，存储到本地
    updateErrorList(errorInfo);
  });

  app.mount(container);
  
  // 关键：应用挂载完成后，移除 Loading 并清理 sessionStorage 标记
  removeLoadingElement();
  clearNavigationFlag();

  // 路由初始化：在 qiankun 模式下或使用 layout-app 时提前初始化路由，与 admin-app 保持一致
  // 如果使用了 layout-app（通过 __USE_LAYOUT_APP__ 标志），也需要初始化路由
  if ((qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__) && router) {
    const initialRoute = deriveInitialSubRoute();
    router.replace(initialRoute).catch(() => {});
  }

  // 设置退出登录函数（在应用挂载后设置，确保 router 和 i18n 已初始化）
  // 无论是独立运行还是 qiankun 模式，都需要设置
  // 关键：创建一个独立的 logout 函数，不依赖 composable，避免在非 setup 上下文中调用
  const createLogoutFunction = () => {
    return async () => {
      try {
        // 调用后端 logout API（通过全局 authApi，由 system-app 提供）
        try {
          const authApi = (window as any).__APP_AUTH_API__;
          if (authApi?.logout) {
            await authApi.logout();
          } else {
            console.warn('[monitor-app] Auth API logout function not available globally.');
          }
        } catch (error: any) {
          // 后端 API 失败不影响前端清理
          console.warn('Logout API failed, but continue with frontend cleanup:', error);
        }

        // 清除 cookie 中的 token
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // 清除登录状态标记（从统一的 settings 存储中移除）
        const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;
        if (appStorage) {
          const currentSettings = (appStorage.settings?.get() as Record<string, any>) || {};
          if (currentSettings.is_logged_in) {
            delete currentSettings.is_logged_in;
            appStorage.settings?.set(currentSettings);
          }
          appStorage.auth?.clear();
          appStorage.user?.clear();
        }

        // 清除 localStorage 中的 is_logged_in 标记（向后兼容）
        localStorage.removeItem('is_logged_in');

        // 清除用户状态（直接实现，不依赖 composable）
        try {
          const { storage } = await import('@btc/shared-utils');
          storage.remove('user');
          // 清理旧的 localStorage 数据（向后兼容）
          localStorage.removeItem('btc_user');
          localStorage.removeItem('user');
        } catch (e) {
          // 静默失败
        }

        // 清除标签页（Process Store）
        try {
          const { useProcessStore } = await import('@btc/shared-components');
          const processStore = useProcessStore();
          processStore.clear();
        } catch (e) {
          // 静默失败
        }

        // 显示退出成功提示
        const { BtcMessage } = await import('@btc/shared-components');
        const t = i18nPlugin?.i18n?.global?.t;
        if (t) {
          BtcMessage.success(t('common.logoutSuccess'));
        }

        // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
        // 判断是否在生产环境的子域名下
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

        // 在生产环境子域名下或 qiankun 环境下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
        if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
          // 如果是生产环境子域名，跳转到主域名；否则保持当前域名
          if (isProductionSubdomain) {
            window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
          } else {
            window.location.href = '/login?logout=1';
          }
        } else {
          // 开发环境独立运行模式：使用路由跳转，添加 logout=1 参数
          if (router) {
            router.replace({
              path: '/login',
              query: { logout: '1' }
            });
          }
        }
      } catch (error: any) {
        // 即使出现错误，也执行清理操作
        console.error('Logout error:', error);

        // 强制清除所有缓存
        try {
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch (e) {
          // 静默失败
        }

        try {
          const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;
          if (appStorage) {
            const currentSettings = (appStorage.settings?.get() as Record<string, any>) || {};
            if (currentSettings.is_logged_in) {
              delete currentSettings.is_logged_in;
              appStorage.settings?.set(currentSettings);
            }
            localStorage.removeItem('is_logged_in');
            appStorage.auth?.clear();
            appStorage.user?.clear();
          }

          const { storage } = await import('@btc/shared-utils');
          storage.remove('user');
          localStorage.removeItem('btc_user');
          localStorage.removeItem('user');

          const { useProcessStore } = await import('@btc/shared-components');
          const processStore = useProcessStore();
          processStore.clear();
        } catch (e) {
          // 静默失败
        }

        // 跳转到登录页
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

        if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
          if (isProductionSubdomain) {
            window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
          } else {
            window.location.href = '/login?logout=1';
          }
        } else {
          if (router) {
            router.replace({
              path: '/login',
              query: { logout: '1' }
            });
          }
        }
      }
    };
  };

  // 设置退出登录函数
  (window as any).__APP_LOGOUT__ = createLogoutFunction();

  // 设置路由同步和主机路由监听
  setupRouteSync();
  setupHostLocationBridge();

  // 设置事件桥接（语言切换和主题切换）
  setupEventBridge();

  // 注册 Tabbar
  registerTabs(_props);

  // 路由初始化完成后，如果当前路由不是首页，手动发送路由变化事件
  // 在 qiankun 模式下或使用 layout-app 时都需要处理
  if ((qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__) && router) {
    router.isReady().then(() => {
      if (!router) return;
      const currentRoute = router.currentRoute.value;
      // 如果当前路由不是首页，发送路由变化事件
      if (currentRoute && !currentRoute.meta?.isHome) {
        const relativeFullPath = ensureLeadingSlash(currentRoute.fullPath || currentRoute.path || '');
        const fullPath = normalizeToHostPath(relativeFullPath);
        // 只在 qiankun 模式下同步路由（layout-app 模式下不需要同步，因为已经是子域名）
        if (qiankunWindow.__POWERED_BY_QIANKUN__) {
          syncHostWithSubRoute(fullPath);
        }
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

  // 取消语言切换监听
  if (languageListener) {
    window.removeEventListener('language-change', languageListener);
    languageListener = null;
  }

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
    i18nPlugin = null;
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
  // 检查是否需要加载 layout-app
  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);

  if (shouldLoadLayout) {
    // 需要加载 layout-app，先初始化，等待完成后再决定是否渲染
    // 使用动态导入，与其他应用保持一致
    import('./utils/init-layout-app').then(({ initLayoutApp }) => {
      initLayoutApp()
        .then(() => {
          // layout-app 加载成功，检查是否需要独立渲染
          if ((window as any).__USE_LAYOUT_APP__) {
            // 关键：layout-app 已加载，子应用应该主动挂载到 layout-app 的 #subapp-viewport
            // 而不是等待 layout-app 通过 qiankun 加载（避免二次加载导致 DOM 操作冲突）
            const waitForViewport = (retries = 40): Promise<HTMLElement | null> => {
              return new Promise((resolve) => {
                const viewport = document.querySelector('#subapp-viewport') as HTMLElement | null;
                if (viewport) {
                  resolve(viewport);
                } else if (retries > 0) {
                  setTimeout(() => resolve(waitForViewport(retries - 1)), 50);
                } else {
                  resolve(null);
                }
              });
            };
            
            waitForViewport().then((viewport) => {
              if (viewport) {
                // 挂载到 layout-app 的 #subapp-viewport
                mount({ container: viewport } as any).catch((error) => {
                  console.error('[monitor-app] 挂载到 layout-app 失败:', error);
                });
              } else {
                console.error('[monitor-app] 等待 #subapp-viewport 超时，尝试独立渲染');
                mount({}).catch((error) => {
                  console.error('[monitor-app] 独立运行失败:', error);
                });
              }
            });
          } else {
            // layout-app 加载失败或不需要加载，独立渲染
            mount({}).catch((error) => {
              console.error('[monitor-app] 独立运行失败:', error);
            });
          }
        })
        .catch((error) => {
          console.error('[monitor-app] 初始化 layout-app 失败:', error);
          // layout-app 加载失败，独立渲染
          mount({}).catch((err) => {
            console.error('[monitor-app] 独立运行失败:', err);
          });
        });
    }).catch((error) => {
      console.error('[monitor-app] 导入 init-layout-app 失败:', error);
      // 导入失败，直接渲染
      mount({}).catch((err) => {
        console.error('[monitor-app] 独立运行失败:', err);
      });
    });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
    mount({}).catch((error) => {
      console.error('[monitor-app] 独立运行失败:', error);
    });
  }
}
