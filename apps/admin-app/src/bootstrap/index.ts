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
// 注意：样式文件已在 main.ts 入口文件顶层导入，确保构建时被正确打包
// 这里不再重复导入，避免样式重复
// import '@btc/shared-components/styles/index.scss';
// import '../styles/global.scss';
// import '../styles/theme.scss';

import App from '../App.vue';
import { createAdminRouter, setupRouter, setupStore, setupI18n, setupUI } from './core';
import type { AdminI18nPlugin } from './core/i18n';
import type { AdminThemePlugin } from './core/ui';
import echartsPlugin from '../plugins/echarts';

type CleanupListener = [event: string, handler: EventListener];

interface CleanupState {
  routerAfterEach?: () => void;
  listeners: CleanupListener[];
}

export interface AdminAppContext {
  app: VueApp;
  router: Router;
  pinia: Pinia;
  i18n: AdminI18nPlugin;
  theme: AdminThemePlugin;
  cleanup: CleanupState;
  props: QiankunProps;
  translate: (key?: string | null) => string;
  registerTabs: (props?: QiankunProps) => void;
  container: HTMLElement | null; // 保存挂载容器引用，用于安全卸载
}

const createTranslate = (context: AdminAppContext) => {
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

const ADMIN_BASE_PATH = '/admin';

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
  if (normalizedRelative === '/' || normalizedRelative === ADMIN_BASE_PATH) {
    return ADMIN_BASE_PATH;
  }

  // 如果已经是完整路径（以 /admin 开头），直接返回
  if (normalizedRelative === ADMIN_BASE_PATH || normalizedRelative.startsWith(`${ADMIN_BASE_PATH}/`)) {
    return normalizedRelative;
  }

  return `${ADMIN_BASE_PATH}${normalizedRelative}`;
};

const deriveInitialSubRoute = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return '/';
  }

  const { pathname, search, hash } = window.location;
  if (!pathname.startsWith(ADMIN_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(ADMIN_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

const extractHostSubRoute = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return '/';
  }

  const { pathname, search, hash } = window.location;
  if (!pathname.startsWith(ADMIN_BASE_PATH)) {
    return '/';
  }

  const suffix = pathname.slice(ADMIN_BASE_PATH.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
};

let syncingFromSubApp = false;
let syncingFromHost = false;
let isUnmounted = false; // 标记应用是否已卸载

const syncHostWithSubRoute = (fullPath: string) => {
  // 如果应用已卸载，不再同步路由
  if (isUnmounted || !qiankunWindow.__POWERED_BY_QIANKUN__ || syncingFromHost) {
    return;
  }

  // 确保 fullPath 是有效的路径，如果已经是完整路径则直接使用
  let targetUrl = fullPath || ADMIN_BASE_PATH;

  // 如果 fullPath 已经是完整路径（以 /admin 开头），直接使用
  // 否则确保它以 ADMIN_BASE_PATH 开头
  if (!targetUrl.startsWith(ADMIN_BASE_PATH)) {
    // 如果 fullPath 是相对路径，拼接 base path
    if (targetUrl === '/' || targetUrl === '') {
      targetUrl = ADMIN_BASE_PATH;
    } else {
      targetUrl = `${ADMIN_BASE_PATH}${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`;
    }
  }

  const currentUrl = getCurrentHostPath();

  if (currentUrl === targetUrl) {
    return;
  }

  syncingFromSubApp = true;
  window.history.pushState(window.history.state, '', targetUrl);
};

const syncSubRouteWithHost = (context: AdminAppContext) => {
  // 如果应用已卸载，不再同步路由
  if (isUnmounted || !qiankunWindow.__POWERED_BY_QIANKUN__) {
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

const createRegisterTabs = (context: AdminAppContext) => {
  return (props?: QiankunProps) => {
    const targetProps = props ?? context.props;
    const register = targetProps?.registerTabs;
    if (!register) {
      return;
    }

    const translate = context.translate;

    // 管理域的标签页配置
    register([
      {
        key: 'admin-home',
        title: translate('menu.home'),
        path: '/admin',
        i18nKey: 'menu.home',
      },
      // 可以根据需要添加更多管理域标签页
    ]);
  };
};

const setupRouteSync = (context: AdminAppContext) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  context.cleanup.routerAfterEach = context.router.afterEach((to) => {
    // 设置页面标题（生产环境后备方案，确保标题正确）
    try {
      const pageTitle = (to.meta?.title as string) || (to.meta?.titleKey as string) || '';
      if (pageTitle) {
        document.title = `${pageTitle} - 管理应用 - BTC ShopFlow`;
      } else if (to.path === '/' || to.path === '/admin' || to.path === '/admin/') {
        // 首页使用默认标题
        document.title = '管理应用 - BTC ShopFlow';
      }
    } catch (error) {
      // 忽略错误
    }
    
    // 清理所有 ECharts 实例和相关的 DOM 元素（tooltip、toolbox 等），防止页面切换时残留
    try {
      import('@btc/shared-components/charts/utils/cleanup').then(({ cleanupAllECharts }) => {
        cleanupAllECharts();
      }).catch(() => {
        // 如果导入失败，使用备用清理逻辑
        try {
          const tooltipElements = document.querySelectorAll('.echarts-tooltip');
          tooltipElements.forEach(el => {
            if (el.parentNode === document.body) {
              el.parentNode.removeChild(el);
            }
          });
          const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
          toolboxElements.forEach(el => {
            if (el.parentNode === document.body) {
              el.parentNode.removeChild(el);
            }
          });
        } catch (fallbackError) {
          // 忽略错误
        }
      });
    } catch (error) {
      // 忽略错误
    }

    // 如果应用已卸载，不再同步路由
    if (isUnmounted) {
      return;
    }

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

const setupEventBridge = (context: AdminAppContext) => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  const languageListener = ((event: Event) => {
    const custom = event as CustomEvent<{ locale: string }>;
    const newLocale = custom.detail?.locale as 'zh-CN' | 'en-US';
    if (newLocale && context.i18n?.i18n?.global) {
      context.i18n.i18n.global.locale.value = newLocale;
      context.registerTabs();
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

const ensureCleanUrl = (context: AdminAppContext) => {
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

const setupHostLocationBridge = (context: AdminAppContext) => {
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

const ADMIN_APP_ID = 'admin';
const sharedUserSettingPlugin = createSharedUserSettingPlugin();

const setupStandaloneGlobals = () => {
  if (typeof window === 'undefined') {
    return;
  }
  registerAppEnvAccessors();
  const win = window as any;
  if (!win.__APP_STORAGE__) {
    win.__APP_STORAGE__ = createAppStorageBridge(ADMIN_APP_ID);
  }
  if (!win.__APP_EPS_SERVICE__) {
    win.__APP_EPS_SERVICE__ = {};
  }
  if (!win.__APP_GET_DOMAIN_LIST__) {
    win.__APP_GET_DOMAIN_LIST__ = createDefaultDomainResolver(ADMIN_APP_ID);
  }
  if (!win.__APP_FINISH_LOADING__) {
    win.__APP_FINISH_LOADING__ = () => {};
  }
  if (!win.__APP_LOGOUT__) {
    win.__APP_LOGOUT__ = () => {};
  }
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

export const createAdminApp = (props: QiankunProps = {}): AdminAppContext => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  
  if (isStandalone) {
    setupStandaloneGlobals();
    // 关键：在独立运行模式下，确保菜单注册表已初始化
    // 先初始化菜单注册表，再注册菜单，确保菜单在 AppLayout 渲染前已准备好
    // 注意：createAdminApp 是同步函数，但菜单注册表初始化是异步的
    // 这里使用立即执行的异步函数来初始化，不阻塞应用创建
    (async () => {
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
    })();
    registerManifestMenusForApp(ADMIN_APP_ID);
  } else {
    // 关键：在 qiankun 环境下（被 layout-app 加载时）也需要初始化菜单注册表并注册菜单
    // 这样 layout-app 才能显示 admin-app 的菜单
    // 确保菜单注册表已初始化，使用全局注册表实例
    (async () => {
      try {
        // 优先使用已存在的全局注册表（layout-app 创建的）
        if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
          // 全局注册表已存在，直接使用
        } else {
          // 如果全局不存在，创建新的并挂载到全局
          const { getMenuRegistry } = await import('@btc/shared-components/store/menuRegistry');
          const registry = getMenuRegistry();
          if (typeof window !== 'undefined') {
            (window as any).__BTC_MENU_REGISTRY__ = registry;
          }
        }
        // 注册菜单
        registerManifestMenusForApp(ADMIN_APP_ID);
      } catch (error) {
        // 静默失败，但尝试同步注册菜单作为后备
        registerManifestMenusForApp(ADMIN_APP_ID);
      }
    })();
    // 同步注册菜单（作为后备，确保菜单能够注册）
    registerManifestMenusForApp(ADMIN_APP_ID);
  }
  
  registerManifestTabsForApp(ADMIN_APP_ID);

  const app = createApp(App);

  // 关键：添加全局错误处理，捕获 DOM 操作错误
  // 这些错误通常发生在组件更新时 DOM 节点已被移除的情况
  app.config.errorHandler = (err, instance, info) => {
    // 检查是否是 DOM 操作相关的错误
    if (err instanceof Error && (
      err.message.includes('insertBefore') ||
      err.message.includes('__vnode') ||
      err.message.includes('Cannot read properties of null') ||
      err.message.includes('Cannot set properties of null')
    )) {
      // DOM 操作错误，可能是容器在更新时被移除
      // 不抛出错误，避免影响用户体验
      return;
    }
  };

  const router = createAdminRouter();
  setupRouter(app, router);
  const pinia = setupStore(app);
  const theme = setupUI(app);
  const i18n = setupI18n(app, props.locale || 'zh-CN');

  // 注册 echarts 插件（v-chart 组件）
  app.use(echartsPlugin);

  // 关键：在独立运行时注册插件（与 finance-app 保持一致）
  if (isStandalone) {
    // 使用异步方式注册插件，避免阻塞应用创建
    setupStandalonePlugins(app, router).catch(() => {
      // 注册插件失败，静默处理
    });
  }

  // 路由初始化：在 qiankun 模式下或使用 layout-app 时提前初始化路由，与 finance-app 保持一致
  // 如果使用了 layout-app（通过 __USE_LAYOUT_APP__ 标志），也需要初始化路由
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__) {
    const initialRoute = deriveInitialSubRoute();
    router.replace(initialRoute).catch(() => {});
  }

  const context: AdminAppContext = {
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
    container: null, // 初始化为 null，挂载时设置
  };

  context.translate = createTranslate(context);
  context.registerTabs = createRegisterTabs(context);

  return context;
};

export const mountAdminApp = async (context: AdminAppContext, props: QiankunProps = {}) => {
  // 重置卸载标记
  isUnmounted = false;
  context.props = props;

  // 关键：使用 try-catch 确保 onReady 总是被调用，即使挂载失败也要清除 loading
  try {
    // 查找挂载点：
    // - qiankun 模式下：直接使用 props.container（即 #subapp-viewport），不要查找或创建 #app
    // - 独立运行模式下：使用 #app
    let mountPoint: HTMLElement | null = null;

    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      // qiankun 模式：直接使用 container（layout-app 传递的 #subapp-viewport）
      if (props.container && props.container instanceof HTMLElement) {
        mountPoint = props.container;
      } else {
        // 尝试从 DOM 中查找 #subapp-viewport
        const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
        if (viewport) {
          mountPoint = viewport;
        } else {
          const errorMsg = '[admin-app] qiankun 模式下未提供容器元素，且 DOM 中未找到 #subapp-viewport';
          throw new Error(errorMsg);
        }
      }
    } else {
      // 独立运行模式：使用 #app
      const appElement = document.querySelector('#app') as HTMLElement;
      if (!appElement) {
        const errorMsg = '[admin-app] 独立运行模式下未找到 #app 元素';
        throw new Error(errorMsg);
      }
      mountPoint = appElement;
    }

    if (!mountPoint) {
      const errorMsg = '[admin-app] 无法找到挂载节点';
      throw new Error(errorMsg);
    }

    // 保存容器引用，用于安全卸载
    context.container = mountPoint;

    // 关键：不直接操作 DOM 节点，让 qiankun 和 Vue 自己管理容器内容
    // qiankun 会在挂载前自动清空容器，我们只需要直接挂载 Vue 应用即可
    // 使用 nextTick 确保 Vue 的更新周期完成，避免在 DOM 操作期间挂载导致冲突
    await import('vue').then(({ nextTick }) => {
      return new Promise<void>((resolve) => {
        nextTick(() => {
          resolve();
        });
      });
    });

    // 关键：在应用挂载前再次注册菜单，确保菜单注册表已经初始化并且菜单已经注册
    // 这解决了生产环境子域名下独立运行时菜单为空的问题
    // 必须在 app.mount 之前注册，确保 AppLayout 渲染时菜单已准备好
    try {
      // 确保菜单注册表已初始化，优先使用全局注册表（layout-app 创建的）
      let registry: any;
      if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
        // 使用已存在的全局注册表
        registry = (window as any).__BTC_MENU_REGISTRY__;
      } else {
        // 如果全局不存在，创建新的并挂载到全局
        const { getMenuRegistry } = await import('@btc/shared-components/store/menuRegistry');
        registry = getMenuRegistry();
        if (typeof window !== 'undefined') {
          (window as any).__BTC_MENU_REGISTRY__ = registry;
        }
      }
      
      // 重新注册菜单，确保菜单数据已准备好
      registerManifestMenusForApp(ADMIN_APP_ID);
      
      // 验证菜单是否已正确注册
      const registeredMenus = registry?.value?.[ADMIN_APP_ID];
      if (!registeredMenus || registeredMenus.length === 0) {
        // 如果菜单为空，尝试再次注册
        registerManifestMenusForApp(ADMIN_APP_ID);
      }
      
      // 手动触发响应式更新，确保 Vue 能够检测到菜单变化
      if (registry) {
        const { triggerRef } = await import('vue');
        triggerRef(registry);
      }
    } catch (error) {
      // 静默失败，但尝试同步注册菜单作为后备
      registerManifestMenusForApp(ADMIN_APP_ID);
    }

    // 挂载 Vue 应用
    // 关键：不进行任何 DOM 操作，直接挂载，让 Vue 和 qiankun 自己管理
    // DevTools 会通过 shared-components 的自动挂载机制自动挂载
    context.app.mount(mountPoint);

    setupRouteSync(context);
    setupHostLocationBridge(context);
    setupEventBridge(context);
    ensureCleanUrl(context);
    context.registerTabs(props);

    // 设置退出登录函数（在应用挂载后设置，确保 router 和 i18n 已初始化）
    // 无论是独立运行还是 qiankun 模式，都需要设置
    // 关键：创建一个独立的 logout 函数，不依赖 composable，避免在非 setup 上下文中调用
    const createLogoutFunction = (ctx: AdminAppContext) => {
      return async () => {
        try {
          // 获取 authApi（优先使用全局的，如果没有则使用本地的）
          const getAuthApi = async () => {
            const globalAuthApi = (window as any).__APP_AUTH_API__;
            if (globalAuthApi && typeof globalAuthApi.logout === 'function') {
              return globalAuthApi;
            }
            const { authApi } = await import('../modules/api-services');
            return authApi;
          };

          // 调用后端 logout API（优先使用全局 authApi）
          // 注意：即使后端 API 失败，前端也要执行清理操作
          try {
            const authApi = await getAuthApi();
            await authApi.logout();
          } catch (error: any) {
            // 后端 API 失败不影响前端清理
          }

          // 清除 cookie 中的 token
          const { deleteCookie } = await import('../utils/cookie');
          deleteCookie('access_token');
          
          // 清除登录状态标记（从统一的 settings 存储中移除）
          const { appStorage } = await import('../utils/app-storage');
          const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
          if (currentSettings.is_logged_in) {
            delete currentSettings.is_logged_in;
            appStorage.settings.set(currentSettings);
          }
          
          // 清除 localStorage 中的 is_logged_in 标记（向后兼容）
          localStorage.removeItem('is_logged_in');
          
          // 清除所有认证相关数据（使用统一存储管理器）
          appStorage.auth.clear();
          appStorage.user.clear();

          // 清除用户信息
          localStorage.removeItem('user');

          // 清除标签页（Process Store）
          const { useProcessStore } = await import('../store/process');
          const processStore = useProcessStore();
          processStore.clear();

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

          // 强制清除所有缓存
          try {
            const { deleteCookie } = await import('../utils/cookie');
            deleteCookie('access_token');
          } catch {}

          try {
            const { appStorage } = await import('../utils/app-storage');
            const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
            if (currentSettings.is_logged_in) {
              delete currentSettings.is_logged_in;
              appStorage.settings.set(currentSettings);
            }
            localStorage.removeItem('is_logged_in');
            appStorage.auth.clear();
            appStorage.user.clear();
            localStorage.removeItem('user');

            const { useProcessStore } = await import('../store/process');
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

    // 关键：在 qiankun 环境下或通过 layout-app:mounted 事件挂载时，等待路由就绪后再同步初始路由
    // 使用 nextTick 确保 Vue 应用已完全挂载
    // 如果提供了 container，说明是通过 layout-app:mounted 事件挂载的，也需要初始化路由
    if (qiankunWindow.__POWERED_BY_QIANKUN__ || (props.container && props.container instanceof HTMLElement)) {
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          context.router.isReady().then(() => {
            // 使用统一的初始路由推导函数，支持子域名环境（路径为 /）和路径前缀环境（路径为 /admin/xxx）
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

    // 关键：在挂载成功后调用 onReady，清除 loading 状态
    // 注意：路由初始化是异步的，不阻塞 onReady 调用
    if (props.onReady) {
      props.onReady();
    }

    // 在 qiankun 环境下也发送就绪事件
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'admin' } }));
    }
  } catch (error) {
    // 关键：即使挂载失败，也要调用 onReady 清除 loading 状态
    if (props.onReady) {
      try {
        props.onReady();
      } catch (onReadyError) {
        // onReady 回调执行失败，静默处理
      }
    }
    // 在 qiankun 环境下也发送就绪事件
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      try {
        window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'admin' } }));
      } catch (eventError) {
        // 发送 subapp:ready 事件失败，静默处理
      }
    }
  }
};

export const updateAdminApp = (context: AdminAppContext, props: QiankunProps) => {
  context.props = {
    ...context.props,
    ...props,
  };

  if (props.locale && context.i18n?.i18n?.global) {
    context.i18n.i18n.global.locale.value = props.locale as 'zh-CN' | 'en-US';
  }

  context.registerTabs(props);
};

export const unmountAdminApp = async (context: AdminAppContext, props: QiankunProps = {}) => {
  // 标记应用已卸载，阻止路由同步和响应式更新
  isUnmounted = true;

  // 先清理事件监听器和路由钩子，阻止后续的响应式更新
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

  // 关键：使用 nextTick 确保所有待处理的响应式更新完成，避免在卸载过程中触发更新
  await import('vue').then(({ nextTick }) => {
    return new Promise<void>((resolve) => {
      nextTick(() => {
        // 安全卸载：不直接操作 DOM，只卸载 Vue 应用
        // qiankun 会自己管理容器的清理，我们不需要检查 DOM 状态
        if (context.app) {
          try {
            context.app.unmount();
          } catch (error) {
            // 卸载失败，静默处理
            // 这通常发生在容器已经被移除的情况下，属于正常情况
          }
        }

        // 清理容器引用
        context.container = null;
        context.props = {};
        resolve();
      });
    });
  });
};
