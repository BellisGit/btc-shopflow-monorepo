import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
import type { Pinia } from 'pinia';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { resetPluginManager, usePluginManager } from '@btc/shared-core';
import type { QiankunProps } from '@btc/shared-core';
import {
  registerAppEnvAccessors,
  registerManifestMenusForApp,
  registerManifestTabsForApp,
  createAppStorageBridge,
  createDefaultDomainResolver,
  resolveAppLogoUrl,
  createSharedUserSettingPlugin,
} from '@configs/layout-bridge';
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
import { createFinanceRouter, setupRouter, setupStore, setupI18n, setupUI } from './core';
import type { FinanceI18nPlugin } from './core/i18n';
import type { FinanceThemePlugin } from './core/ui';

type CleanupListener = [event: string, handler: EventListener];

interface CleanupState {
  routerAfterEach?: () => void;
  listeners: CleanupListener[];
}

export interface FinanceAppContext {
  app: VueApp;
  router: Router;
  pinia: Pinia;
  i18n: FinanceI18nPlugin;
  theme: FinanceThemePlugin;
  cleanup: CleanupState;
  props: QiankunProps;
  translate: (key?: string | null) => string;
}

const createTranslate = (context: FinanceAppContext) => {
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

const FINANCE_APP_ID = 'finance';
const FINANCE_BASE_PATH = '/finance';
const sharedUserSettingPlugin = createSharedUserSettingPlugin();

const setupStandaloneGlobals = () => {
  if (typeof window === 'undefined') {
    return;
  }
  registerAppEnvAccessors();
  const win = window as any;
  if (!win.__APP_STORAGE__) {
    win.__APP_STORAGE__ = createAppStorageBridge(FINANCE_APP_ID);
  }
  if (!win.__APP_EPS_SERVICE__) {
    win.__APP_EPS_SERVICE__ = {};
  }
  if (!win.__APP_GET_DOMAIN_LIST__) {
    win.__APP_GET_DOMAIN_LIST__ = createDefaultDomainResolver(FINANCE_APP_ID);
  }
  if (!win.__APP_FINISH_LOADING__) {
    win.__APP_FINISH_LOADING__ = () => {};
  }
  // 延迟设置 __APP_LOGOUT__，需要等待应用初始化完成
  // 在 mountFinanceApp 中设置
  win.__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
  win.__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];
};

const setupStandalonePlugins = async (app: VueApp, router: Router) => {
  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);
  pluginManager.register(sharedUserSettingPlugin);
  await pluginManager.install(sharedUserSettingPlugin.name);
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
  if (normalizedRelative === '/' || normalizedRelative === FINANCE_BASE_PATH) {
    return FINANCE_BASE_PATH;
  }

  // 如果已经是完整路径（以 /finance 开头），直接返回
  if (normalizedRelative === FINANCE_BASE_PATH || normalizedRelative.startsWith(`${FINANCE_BASE_PATH}/`)) {
    return normalizedRelative;
  }

  return `${FINANCE_BASE_PATH}${normalizedRelative}`;
};

const deriveInitialSubRoute = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return '/';
  }

  const { pathname, search, hash } = window.location;
  
  // 检查是否在子域名环境下（生产环境）
  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname === 'finance.bellis.com.cn';
  
  // 子域名环境下，路径直接是子应用路由（如 / 或 /xxx）
  if (isProductionSubdomain) {
    // 如果路径是 /finance/xxx，需要去掉 /finance 前缀
    if (pathname.startsWith(FINANCE_BASE_PATH)) {
      const suffix = pathname.slice(FINANCE_BASE_PATH.length) || '/';
      return `${ensureLeadingSlash(suffix)}${search}${hash}`;
    }
    // 否则直接使用当前路径
    return `${pathname}${search}${hash}`;
  }
  
  // 路径前缀环境下（如 /finance/xxx）
  if (!pathname.startsWith(FINANCE_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(FINANCE_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

const extractHostSubRoute = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return '/';
  }

  const { pathname, search, hash } = window.location;
  if (!pathname.startsWith(FINANCE_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(FINANCE_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

let syncingFromSubApp = false;
let syncingFromHost = false;

const syncHostWithSubRoute = (fullPath: string) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ || syncingFromHost) {
    return;
  }

  // 确保 fullPath 是有效的路径，如果已经是完整路径则直接使用
  let targetUrl = fullPath || FINANCE_BASE_PATH;
  
  // 如果 fullPath 已经是完整路径（以 /finance 开头），直接使用
  // 否则确保它以 FINANCE_BASE_PATH 开头
  if (!targetUrl.startsWith(FINANCE_BASE_PATH)) {
    // 如果 fullPath 是相对路径，拼接 base path
    if (targetUrl === '/' || targetUrl === '') {
      targetUrl = FINANCE_BASE_PATH;
    } else {
      targetUrl = `${FINANCE_BASE_PATH}${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`;
    }
  }

  const currentUrl = getCurrentHostPath();

  if (currentUrl === targetUrl) {
    return;
  }

  syncingFromSubApp = true;
  window.history.pushState(window.history.state, '', targetUrl);
};

const syncSubRouteWithHost = (context: FinanceAppContext) => {
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


const setupRouteSync = (context: FinanceAppContext) => {
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

const setupEventBridge = (context: FinanceAppContext) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  const languageListener = ((event: Event) => {
    const custom = event as CustomEvent<{ locale: string }>;
    const newLocale = custom.detail?.locale as 'zh-CN' | 'en-US';
    if (newLocale && context.i18n?.i18n?.global) {
      context.i18n.i18n.global.locale.value = newLocale;
    }
  }) as EventListener;

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

const ensureCleanUrl = (context: FinanceAppContext) => {
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

const setupHostLocationBridge = (context: FinanceAppContext) => {
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

export const createFinanceApp = async (props: QiankunProps = {}): Promise<FinanceAppContext> => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  if (isStandalone) {
    setupStandaloneGlobals();
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
    registerManifestMenusForApp(FINANCE_APP_ID);
    registerManifestTabsForApp(FINANCE_APP_ID);
  } else {
    // 关键：在 qiankun 环境下（被 layout-app 加载时）也需要注册菜单和 Tabs
    // 这样 layout-app 才能显示 finance-app 的菜单和 Tabs
    registerManifestMenusForApp(FINANCE_APP_ID);
    registerManifestTabsForApp(FINANCE_APP_ID);
  }

  const app = createApp(App);
  
  // 关键：添加全局错误处理，捕获 DOM 操作错误
  // 这些错误通常发生在组件更新时 DOM 节点已被移除的情况（如子应用卸载时）
  app.config.errorHandler = (err, instance, info) => {
    // 检查是否是 DOM 操作相关的错误
    if (err instanceof Error && (
      err.message.includes('insertBefore') ||
      err.message.includes('processCommentNode') ||
      err.message.includes('patch') ||
      err.message.includes('__vnode') ||
      err.message.includes('Cannot read properties of null') ||
      err.message.includes('Cannot set properties of null') ||
      err.message.includes('reading \'insertBefore\'') ||
      err.message.includes('reading \'emitsOptions\'')
    )) {
      // DOM 操作错误，可能是容器在更新时被移除
      // 静默处理，避免影响用户体验
      if (import.meta.env.DEV) {
        console.warn('[finance-app] DOM 操作错误已捕获（应用可能正在卸载）:', err.message);
      }
      return;
    }
  };
  
  // 先初始化 i18n，确保国际化文件已加载
  const i18n = setupI18n(app, props.locale || 'zh-CN');
  const router = createFinanceRouter();
  setupRouter(app, router);
  const pinia = setupStore(app);
  const theme = setupUI(app);

  if (isStandalone) {
    await setupStandalonePlugins(app, router);
  }

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    const initialRoute = deriveInitialSubRoute();
    router.replace(initialRoute).catch(() => {});
  }

  const context: FinanceAppContext = {
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
  };

  context.translate = createTranslate(context);

  return context;
};

export const mountFinanceApp = async (context: FinanceAppContext, props: QiankunProps = {}) => {
  context.props = props;

  // 查找挂载点：
  // - 优先使用 props.container（无论是否 qiankun，只要提供了 container 就使用）
  // - 否则：如果 __USE_LAYOUT_APP__ 为 true，尝试查找 #subapp-viewport
  // - 否则：使用 #app（独立运行模式）
  let mountPoint: HTMLElement | null = null;
  
  // 关键：优先使用 props.container（无论是 qiankun 模式还是嵌入 layout-app 模式）
  if (props.container && props.container instanceof HTMLElement) {
    mountPoint = props.container;
  } else if ((window as any).__USE_LAYOUT_APP__) {
    // 使用 layout-app：尝试查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      mountPoint = viewport;
    } else {
      throw new Error('[finance-app] 使用 layout-app 但未找到 #subapp-viewport 元素');
    }
  } else if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // qiankun 模式但未提供 container：尝试查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      mountPoint = viewport;
    } else {
      throw new Error('[finance-app] qiankun 模式下未提供容器元素且未找到 #subapp-viewport');
    }
  } else {
    // 独立运行模式：使用 #app
    const appElement = document.querySelector('#app') as HTMLElement;
    if (!appElement) {
      throw new Error('[finance-app] 独立运行模式下未找到 #app 元素');
    }
    mountPoint = appElement;
  }
  
  if (!mountPoint) {
    throw new Error('[finance-app] 无法找到挂载节点');
  }

  context.app.mount(mountPoint);

  // 关键：在应用挂载后再次注册菜单，确保菜单注册表已经初始化并且菜单已经注册
  // 这解决了生产环境子域名下独立运行时菜单为空的问题
  try {
    registerManifestMenusForApp(FINANCE_APP_ID);
  } catch (error) {
    // 静默失败
  }

  // 在 qiankun 环境下，等待路由就绪后再同步初始路由
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 使用 nextTick 确保 Vue 应用已完全挂载
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        context.router.isReady().then(() => {
          // 使用统一的初始路由推导函数，支持子域名环境（路径为 /）和路径前缀环境（路径为 /finance/xxx）
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

  // 设置退出登录函数（在应用挂载后设置，确保 router 和 i18n 已初始化）
  // 关键：创建一个独立的 logout 函数，不依赖 composable，避免在非 setup 上下文中调用
  const createLogoutFunction = (ctx: FinanceAppContext) => {
    return async () => {
      try {
        // 调用后端 logout API（通过全局 authApi，由 system-app 提供）
        try {
          const authApi = (window as any).__APP_AUTH_API__;
          if (authApi?.logout) {
            await authApi.logout();
          } else {
            console.warn('[useLogout] Auth API logout function not available globally.');
          }
        } catch (error: any) {
          // 后端 API 失败不影响前端清理
          console.warn('Logout API failed, but continue with frontend cleanup:', error);
        }

        // 清除 cookie 中的 token
        const { deleteCookie } = await import('../utils/cookie');
        deleteCookie('access_token');
        
        // 清除登录状态标记（从统一的 settings 存储中移除）
        const getAppStorage = () => {
          return (window as any).__APP_STORAGE__ || (window as any).appStorage;
        };
        const appStorage = getAppStorage();
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
        const t = ctx.i18n?.i18n?.global?.t;
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
          ctx.router.replace({
            path: '/login',
            query: { logout: '1' }
          });
        }
      } catch (error: any) {
        // 即使出现错误，也执行清理操作
        console.error('Logout error:', error);

        // 强制清除所有缓存
        try {
          const { deleteCookie } = await import('../utils/cookie');
          deleteCookie('access_token');
        } catch {}

        try {
          const getAppStorage = () => {
            return (window as any).__APP_STORAGE__ || (window as any).appStorage;
          };
          const appStorage = getAppStorage();
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

          // 清除用户状态（直接实现，不依赖 composable）
          const { storage } = await import('@btc/shared-utils');
          storage.remove('user');
          // 清理旧的 localStorage 数据（向后兼容）
          localStorage.removeItem('btc_user');
          localStorage.removeItem('user');

          const { useProcessStore } = await import('@btc/shared-components');
          const processStore = useProcessStore();
          processStore.clear();
        } catch {}

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
          ctx.router.replace({
            path: '/login',
            query: { logout: '1' }
          });
        }
      }
    };
  };

  // 设置退出登录函数
  (window as any).__APP_LOGOUT__ = createLogoutFunction(context);

  if (props.onReady) {
    props.onReady();
  }

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'finance' } }));
  }
};

export const updateFinanceApp = (context: FinanceAppContext, props: QiankunProps) => {
  context.props = {
    ...context.props,
    ...props,
  };

  if (props.locale && context.i18n?.i18n?.global) {
    context.i18n.i18n.global.locale.value = props.locale as 'zh-CN' | 'en-US';
  }
};

export const unmountFinanceApp = (context: FinanceAppContext, props: QiankunProps = {}) => {
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

