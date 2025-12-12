import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
import type { Pinia } from 'pinia';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { QiankunProps } from '@btc/shared-core';
import { resetPluginManager, usePluginManager } from '@btc/shared-core';
import { registerAppEnvAccessors, registerManifestMenusForApp, registerManifestTabsForApp, resolveAppLogoUrl, registerMenuRegistrationFunction } from '@configs/layout-bridge';
// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
// 样式文件在模块加载时同步导入
// Vite 会优化处理：开发环境按需加载，生产环境打包到单独 CSS 文件
// 这些导入不会阻塞 JavaScript 执行
// 关键：在关闭样式隔离的情况下，需要直接 import 样式文件，确保样式被正确加载
// 虽然 global.scss 中也通过 @import 引入了，但直接 import 可以确保样式在模块加载时就被处理
import '@btc/shared-components/styles/index.scss';
import '../styles/global.scss';
import '../styles/theme.scss';

import App from '../App.vue';
import { userSettingPlugin } from '../plugins/user-setting';
import { createLogisticsRouter, setupRouter, setupStore, setupI18n, setupUI } from './core';
import type { LogisticsI18nPlugin } from './core/i18n';
import type { LogisticsThemePlugin } from './core/ui';
import { elementLocale } from './core/ui';

type CleanupListener = [event: string, handler: EventListener];

interface CleanupState {
  routerAfterEach?: () => void;
  listeners: CleanupListener[];
}

export interface LogisticsAppContext {
  app: VueApp;
  router: Router;
  pinia: Pinia;
  i18n: LogisticsI18nPlugin;
  theme: LogisticsThemePlugin;
  cleanup: CleanupState;
  props: QiankunProps;
  translate: (key?: string | null) => string;
  registerTabs: (props?: QiankunProps) => void;
}

const createTranslate = (context: LogisticsAppContext) => {
  return (key?: string | null) => {
    if (!key) {
      return '';
    }

    try {
      return (context.i18n?.i18n?.global?.t as any)?.(key) ?? key;
    } catch (_err) {
      return key;
    }
  };
};

const LOGISTICS_APP_ID = 'logistics';
const LOGISTICS_BASE_PATH = '/logistics';

const setupStandalonePlugins = async (app: VueApp, router: Router) => {
  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);
  pluginManager.register(userSettingPlugin);
  await pluginManager.install(userSettingPlugin.name);
};

const setupStandaloneGlobals = async () => {
  registerAppEnvAccessors();
  registerMenuRegistrationFunction();

  // 优先使用全局共享的 EPS 服务（由 system-app 或其他应用提供）
  // 只有在没有全局服务时，才加载本地的 EPS 服务
  const getGlobalEpsService = () => {
    const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
    if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
      return globalService;
    }
    return null;
  };

  // 先检查是否有全局服务
  let globalService = getGlobalEpsService();
  
  if (!globalService) {
    // 等待全局服务可用（最多等待 2 秒）
    const waitForGlobalService = async (maxWait = 2000, interval = 100) => {
      const startTime = Date.now();
      while (Date.now() - startTime < maxWait) {
        const service = getGlobalEpsService();
        if (service) return service;
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      return null;
    };
    
    globalService = await waitForGlobalService();
  }

  if (globalService) {
    // 使用全局服务
    (window as any).__APP_EPS_SERVICE__ = globalService;
  } else {
    // 没有全局服务，加载本地服务
    try {
      const { service } = await import('../services/eps');
      (window as any).__APP_EPS_SERVICE__ = service;
    } catch (error) {
      console.warn('[logistics-app] Failed to load EPS service:', error);
      (window as any).__APP_EPS_SERVICE__ = {};
    }
  }

  try {
    const { appStorage } = await import('../utils/app-storage');
    (window as any).__APP_STORAGE__ = appStorage;
  } catch (error) {
    console.warn('[logistics-app] Failed to load app storage:', error);
    (window as any).__APP_STORAGE__ = {
      user: {
        getAvatar: () => null,
        setAvatar: () => {},
        getName: () => null,
        setName: () => {},
      },
    };
  }

  try {
    const domainModule = await import('../utils/domain-cache');
    if (domainModule.getDomainList) {
      (window as any).__APP_GET_DOMAIN_LIST__ = domainModule.getDomainList;
    }
    if (domainModule.clearDomainCache) {
      (window as any).__APP_CLEAR_DOMAIN_CACHE__ = domainModule.clearDomainCache;
    }
  } catch (error) {
    console.warn('[logistics-app] Failed to load domain cache:', error);
  }

  try {
    const { finishLoading } = await import('../utils/loadingManager');
    (window as any).__APP_FINISH_LOADING__ = finishLoading;
  } catch (error) {
    console.warn('[logistics-app] Failed to load loading manager:', error);
    (window as any).__APP_FINISH_LOADING__ = () => {};
  }

  // 注意：不在 setupStandaloneGlobals 中设置 __APP_LOGOUT__
  // 因为 useLogout() 需要 Vue 应用上下文（useRouter、useI18n）
  // 将在 mountLogisticsApp 中设置，此时应用已挂载，有完整的 Vue 上下文

  (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
  (window as any).__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];
};

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const getCurrentHostPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

const normalizeToHostPath = (relativeFullPath: string) => {
  const normalizedRelative = relativeFullPath === '' ? '/' : ensureLeadingSlash(relativeFullPath);

  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
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
  if (normalizedRelative === '/' || normalizedRelative === LOGISTICS_BASE_PATH) {
    return LOGISTICS_BASE_PATH;
  }

  // 如果已经是完整路径（以 /logistics 开头），直接返回
  if (normalizedRelative === LOGISTICS_BASE_PATH || normalizedRelative.startsWith(`${LOGISTICS_BASE_PATH}/`)) {
    return normalizedRelative;
  }

  return `${LOGISTICS_BASE_PATH}${normalizedRelative}`;
};

const deriveInitialSubRoute = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return '/';
  }

  const { pathname, search, hash } = window.location;
  if (!pathname.startsWith(LOGISTICS_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(LOGISTICS_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

const extractHostSubRoute = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return '/';
  }

  const { pathname, search, hash } = window.location;
  if (!pathname.startsWith(LOGISTICS_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(LOGISTICS_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

let syncingFromSubApp = false;
let syncingFromHost = false;

const syncHostWithSubRoute = (fullPath: string) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ || syncingFromHost) {
    return;
  }

  // 确保 fullPath 是有效的路径，如果已经是完整路径则直接使用
  let targetUrl = fullPath || LOGISTICS_BASE_PATH;
  
  // 如果 fullPath 已经是完整路径（以 /logistics 开头），直接使用
  // 否则确保它以 LOGISTICS_BASE_PATH 开头
  if (!targetUrl.startsWith(LOGISTICS_BASE_PATH)) {
    // 如果 fullPath 是相对路径，拼接 base path
    if (targetUrl === '/' || targetUrl === '') {
      targetUrl = LOGISTICS_BASE_PATH;
    } else {
      targetUrl = `${LOGISTICS_BASE_PATH}${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`;
    }
  }

  const currentUrl = getCurrentHostPath();

  if (currentUrl === targetUrl) {
    return;
  }

  syncingFromSubApp = true;
  window.history.pushState(window.history.state, '', targetUrl);
};

const syncSubRouteWithHost = (context: LogisticsAppContext) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  const targetRoute = extractHostSubRoute();
  const normalizedTarget = ensureLeadingSlash(targetRoute);
  const currentRoute = ensureLeadingSlash(
    context.router.currentRoute.value.fullPath || context.router.currentRoute.value.path || '/',
  );

  if (normalizedTarget === currentRoute) {
    return;
  }

  syncingFromHost = true;
  context.router.replace(normalizedTarget).catch(() => {}).finally(() => {
    syncingFromHost = false;
  });
};

const createRegisterTabs = (context: LogisticsAppContext) => {
  return (props?: QiankunProps) => {
    const targetProps = props ?? context.props;
    const register = targetProps?.registerTabs;
    if (!register) {
      return;
    }

    const translate = context.translate;

    register([
      {
        key: 'procurement',
        title: translate('logistics.menu.procurementModule'),
        path: '/logistics/procurement',
        i18nKey: 'menu.logistics.procurementModule',
      },
      {
        key: 'warehouse',
        title: translate('logistics.menu.warehouseModule'),
        path: '/logistics/warehouse',
        i18nKey: 'menu.logistics.warehouseModule',
      },
      {
        key: 'customs',
        title: translate('logistics.menu.customsModule'),
        path: '/logistics/customs',
        i18nKey: 'menu.logistics.customsModule',
      },
      {
        key: 'config',
        title: translate('logistics.menu.config'),
        path: '/logistics/config',
        i18nKey: 'menu.logistics.config',
      },
    ]);
  };
};

const setupRouteSync = (context: LogisticsAppContext) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  context.cleanup.routerAfterEach = context.router.afterEach((to) => {
    const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
    const fullPath = normalizeToHostPath(relativeFullPath);

    syncHostWithSubRoute(fullPath);
    const tabLabelKey = to.meta?.tabLabelKey as string | undefined;
    const tabLabel =
      tabLabelKey ??
      (to.meta?.tabLabel as string | undefined) ??
      (to.meta?.title as string | undefined) ??
      (to.name as string | undefined) ??
      fullPath;

    const label = tabLabelKey ? context.translate(tabLabelKey) : tabLabel;

    const metaPayload = {
      ...to.meta,
      label,
    } as Record<string, any>;

    if (
      typeof metaPayload.labelKey !== 'string' ||
      metaPayload.labelKey.length === 0
    ) {
      if (typeof to.meta?.labelKey === 'string' && to.meta.labelKey.length > 0) {
        metaPayload.labelKey = to.meta.labelKey;
      } else if (
        typeof tabLabelKey === 'string' &&
        tabLabelKey.startsWith('menu.')
      ) {
        metaPayload.labelKey = tabLabelKey;
      }
    }

    if (!metaPayload.breadcrumbs && Array.isArray(to.meta?.breadcrumbs)) {
      metaPayload.breadcrumbs = to.meta.breadcrumbs;
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
  });
};

const setupEventBridge = (context: LogisticsAppContext) => {
  // 语言切换监听器需要在所有环境下都运行（包括独立运行）
  const languageListener = ((event: Event) => {
    const custom = event as CustomEvent<{ locale: string }>;
    const newLocale = custom.detail?.locale as 'zh-CN' | 'en-US';
    if (newLocale && context.i18n?.i18n?.global) {
      context.i18n.i18n.global.locale.value = newLocale;
      context.registerTabs();
      
      // 更新 Element Plus 的 locale
      const locale = elementLocale[newLocale];
      if (locale && context.app?.config?.globalProperties?.$ELEMENT) {
        context.app.config.globalProperties.$ELEMENT.locale = locale;
      }
    }
  }) as EventListener;

  // 只在 qiankun 环境下设置主题切换监听器
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 独立运行时只监听语言切换事件
    window.addEventListener('language-change', languageListener);
    context.cleanup.listeners.push(['language-change', languageListener]);
    return;
  }

  // qiankun 环境下监听所有事件

  const themeListener = ((event: Event) => {
    const custom = event as CustomEvent<{ color: string; dark: boolean }>;
    const detail = custom.detail;
    if (detail && context.theme?.theme) {
      // 检查当前颜色是否已经相同，避免不必要的调用和递归
      const currentColor = context.theme.theme.currentTheme.value?.color;
      const currentDark = context.theme.theme.isDark.value;
      // 只有当颜色或暗黑模式不同时才更新
      if (currentColor !== detail.color || currentDark !== detail.dark) {
        context.theme.theme.setThemeColor(detail.color, detail.dark);
      }
    }
  }) as EventListener;

  window.addEventListener('language-change', languageListener);
  window.addEventListener('theme-change', themeListener);

  context.cleanup.listeners.push(['language-change', languageListener], ['theme-change', themeListener]);
};

const ensureCleanUrl = (context: LogisticsAppContext) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  context.router.isReady().then(() => {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('/') && currentPath !== '/') {
      window.history.replaceState(window.history.state, '', currentPath.slice(0, -1) + window.location.search + window.location.hash);
    }
  });
};

const setupHostLocationBridge = (context: LogisticsAppContext) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  const handleRoutingEvent = () => {
    if (syncingFromSubApp) {
      syncingFromSubApp = false;
      return;
    }

    syncSubRouteWithHost(context);
  };

  window.addEventListener('single-spa:routing-event', handleRoutingEvent);
  window.addEventListener('popstate', handleRoutingEvent);
  context.cleanup.listeners.push(['single-spa:routing-event', handleRoutingEvent], ['popstate', handleRoutingEvent]);

  handleRoutingEvent();
};

export const createLogisticsApp = async (props: QiankunProps = {}): Promise<LogisticsAppContext> => {
  // 独立运行时：在创建路由之前设置全局函数供 AppLayout 使用
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  if (isStandalone) {
    await setupStandaloneGlobals();
    // 关键：在独立运行模式下，确保菜单注册表已初始化
    // 先初始化菜单注册表，再注册菜单，确保菜单在 AppLayout 渲染前已准备好
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
    registerManifestMenusForApp(LOGISTICS_APP_ID);
    registerManifestTabsForApp(LOGISTICS_APP_ID);
  } else {
    // 关键：在 qiankun 环境下（被 layout-app 加载时）也需要注册菜单和 Tabs
    // 这样 layout-app 才能显示 logistics-app 的菜单和 Tabs
    // 确保菜单注册表已初始化（开发环境也需要）
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
    registerManifestMenusForApp(LOGISTICS_APP_ID);
    registerManifestTabsForApp(LOGISTICS_APP_ID);
  }

  // 这些初始化操作都是轻量级的，不会阻塞
  // createApp、createRouter、createPinia 等都是同步的快速操作
  const app = createApp(App);
  const router = createLogisticsRouter();
  setupRouter(app, router);
  const pinia = setupStore(app);
  const theme = setupUI(app);
  const i18n = setupI18n(app, props.locale || 'zh-CN');

  if (isStandalone) {
    await setupStandalonePlugins(app, router);
  }

  // 路由初始化使用 nextTick 避免阻塞，确保在下一个事件循环中执行
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    const initialRoute = deriveInitialSubRoute();
    // 使用 Promise.resolve().then() 确保路由替换在下一个 tick 执行，不阻塞当前初始化
    Promise.resolve().then(() => {
    router.replace(initialRoute).catch(() => {});
    });
  }

  const context: LogisticsAppContext = {
    app,
    router,
    pinia,
    i18n,
    theme,
    cleanup: {
      listeners: [],
    },
    props,
    translate: () => '',
    registerTabs: () => {},
  };

  context.translate = createTranslate(context);
  context.registerTabs = createRegisterTabs(context);

  return context;
};

export const mountLogisticsApp = async (context: LogisticsAppContext, props: QiankunProps = {}) => {
  context.props = props;

  // 查找挂载点：
  // - qiankun 模式下：直接使用 props.container（即 #subapp-viewport），不要查找或创建 #app
  // - 独立运行模式下：使用 #app
  let mountPoint: HTMLElement | null = null;
  
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // qiankun 模式：直接使用 container（layout-app 传递的 #subapp-viewport）
    if (props.container && props.container instanceof HTMLElement) {
      mountPoint = props.container;
    } else {
      throw new Error('[logistics-app] qiankun 模式下未提供容器元素');
    }
  } else {
    // 独立运行模式：使用 #app
    const appElement = document.querySelector('#app') as HTMLElement;
    if (!appElement) {
      throw new Error('[logistics-app] 独立运行模式下未找到 #app 元素');
    }
    mountPoint = appElement;
  }
  
  if (!mountPoint) {
    throw new Error('[logistics-app] 无法找到挂载节点');
  }

    // 关键：在应用挂载前再次注册菜单，确保菜单注册表已经初始化并且菜单已经注册
    // 这解决了生产环境子域名下独立运行时菜单为空的问题
    // 必须在 app.mount 之前注册，确保 AppLayout 渲染时菜单已准备好
    try {
      // 确保菜单注册表已初始化
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        const { getMenuRegistry } = await import('@btc/shared-components/store/menuRegistry');
        const registry = getMenuRegistry();
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
      // 重新注册菜单，确保菜单数据已准备好
      registerManifestMenusForApp(LOGISTICS_APP_ID);
      // 注意：不在应用挂载前使用 triggerRef，避免在非 Vue 上下文中触发响应式更新
      // 菜单注册表的变化会在应用挂载后自动被 Vue 的响应式系统检测到
      
      // 验证菜单是否已正确注册
      const registry = (window as any).__BTC_MENU_REGISTRY__;
      if (registry && registry.value) {
        const registeredMenus = registry.value[LOGISTICS_APP_ID] || [];
        if (registeredMenus.length === 0) {
          // 如果菜单仍然为空，再次尝试注册
          registerManifestMenusForApp(LOGISTICS_APP_ID);
          // 在应用挂载后触发响应式更新，避免在非 Vue 上下文中使用 triggerRef
          // triggerRef(registry);
        }
      }
    } catch (error) {
      // 静默失败
    }

    context.app.mount(mountPoint);

  // 在 qiankun 环境下，等待路由就绪后再同步初始路由
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 使用 nextTick 确保 Vue 应用已完全挂载
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        context.router.isReady().then(() => {
          // 使用统一的初始路由推导函数，支持子域名环境（路径为 /）和路径前缀环境（路径为 /logistics/xxx）
          const initialRoute = deriveInitialSubRoute();
          // 如果当前路由不匹配或没有匹配的路由，则同步到子应用路由
          if (context.router.currentRoute.value.matched.length === 0 || 
              context.router.currentRoute.value.path !== initialRoute.split('?')[0].split('#')[0]) {
            context.router.replace(initialRoute).catch(() => {});
          }
        });
      });
    });
  }

  setupRouteSync(context);
  setupHostLocationBridge(context);
  setupEventBridge(context);
  ensureCleanUrl(context);
  context.registerTabs(props);

  // 设置退出登录函数（在应用挂载后设置，确保 router 和 i18n 已初始化）
  // 无论是独立运行还是 qiankun 模式，都需要设置
  // 关键：覆盖 layout-app 设置的简单退出函数，使用子应用的完整退出逻辑
  // 注意：必须在 Vue 应用上下文中调用 useLogout，确保依赖注入系统可用
  // 使用延迟加载的方式，将 useLogout 的调用包装在一个函数中，只在真正需要时才调用
  import('vue').then(({ nextTick }) => {
    nextTick(() => {
      // 关键：不立即调用 useLogout()，而是创建一个包装函数，在真正需要时才调用
      // 这样确保在调用时 Vue 应用上下文已经准备好
      (window as any).__APP_LOGOUT__ = async () => {
        try {
          // 动态导入并调用 useLogout，此时 Vue 应用已挂载，上下文可用
          const { useLogout } = await import('../composables/useLogout');
          const { logout } = useLogout();
          await logout();
        } catch (error) {
          // 如果加载失败，使用兜底逻辑
          console.warn('[logistics-app] useLogout failed, using fallback:', error);
          try {
            const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;
            if (appStorage) {
              appStorage.auth?.clear();
              appStorage.user?.clear();
            }
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          } catch (e) {
            // 静默失败
          }
          // 跳转到登录页
          const hostname = window.location.hostname;
          const protocol = window.location.protocol;
          const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
          if (isProductionSubdomain) {
            window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
          } else {
            window.location.href = '/login?logout=1';
          }
        }
      };
    });
  });

  if (props.onReady) {
    props.onReady();
  }

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'logistics' } }));
  }
};

export const updateLogisticsApp = (context: LogisticsAppContext, props: QiankunProps) => {
  context.props = {
    ...context.props,
    ...props,
  };

  if (props.locale && context.i18n?.i18n?.global) {
    context.i18n.i18n.global.locale.value = props.locale as 'zh-CN' | 'en-US';
  }

  context.registerTabs(props);
};

export const unmountLogisticsApp = (context: LogisticsAppContext, props: QiankunProps = {}) => {
  if (context.cleanup.routerAfterEach) {
    context.cleanup.routerAfterEach();
    context.cleanup.routerAfterEach = undefined;
  }

  context.cleanup.listeners.forEach(([event, handler]) => {
    window.removeEventListener(event, handler);
  });
  context.cleanup.listeners = [];

  const clearTabs = props.clearTabs ?? context.props?.clearTabs;
  if (clearTabs) {
    clearTabs();
  }

  context.app.unmount();
  context.props = {};
};

