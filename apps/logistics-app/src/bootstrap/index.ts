// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
// 样式文件在模块加载时同步导入
import '@btc/shared-components/styles/index.scss';
import '../styles/global.scss';
import '../styles/theme.scss';

import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { QiankunProps } from '@btc/shared-core';
import {
  createSubApp,
  mountSubApp,
  unmountSubApp,
  updateSubApp,
  // setupRouteSync 未使用，已移除
  setupHostLocationBridge,
  ensureCleanUrl,
  ensureLeadingSlash,
  normalizeToHostPath,
  getCurrentHostPath,
  type SubAppContext,
  type SubAppOptions,
} from '@btc/shared-core';

import App from '../App.vue';
import { userSettingPlugin } from '../plugins/user-setting';
import { createLogisticsRouter, setupRouter, setupStore, setupI18n, setupUI } from './core';
// LogisticsI18nPlugin 和 LogisticsThemePlugin 未使用，已移除导入
import { elementLocale } from './core/ui';

// 扩展 SubAppContext 以包含 registerTabs
export interface LogisticsAppContext extends SubAppContext {
  registerTabs: (props?: QiankunProps) => void;
  // 显式声明继承的属性，确保 TypeScript 正确识别
  app: SubAppContext['app'];
  router: SubAppContext['router'];
  pinia: SubAppContext['pinia'];
  i18n: SubAppContext['i18n'];
  theme: SubAppContext['theme'];
  cleanup: SubAppContext['cleanup'];
  props: SubAppContext['props'];
  translate: SubAppContext['translate'];
}

const LOGISTICS_APP_ID = 'logistics';
const LOGISTICS_BASE_PATH = '/logistics';
const LOGISTICS_DOMAIN_CACHE_PATH = '@utils/domain-cache';

// 自定义 setupStandalonePlugins（使用 userSettingPlugin）
const setupLogisticsPlugins = async (app: any, router: any) => {
  const { resetPluginManager, usePluginManager } = await import('@btc/shared-core');
  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);
  pluginManager.register(userSettingPlugin);
  await pluginManager.install(userSettingPlugin.name);
};

// 自定义 setupStandaloneGlobals（使用 appStorage 而不是 createAppStorageBridge）
const setupLogisticsGlobals = async () => {
  const { registerAppEnvAccessors, registerMenuRegistrationFunction, resolveAppLogoUrl, injectDomainListResolver } = await import('@btc/shared-core/configs/layout-bridge');

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
      // Failed to load EPS service
      (window as any).__APP_EPS_SERVICE__ = {};
    }
  }

  // 使用 appStorage 而不是 createAppStorageBridge
  try {
    const { appStorage } = await import('../utils/app-storage');
    (window as any).__APP_STORAGE__ = appStorage;
  } catch (error) {
    // Failed to load app storage
    (window as any).__APP_STORAGE__ = {
      user: {
        getAvatar: () => null,
        setAvatar: () => {},
        getName: () => null,
        setName: () => {},
      },
    };
  }

  // 关键：使用统一的域列表注入函数，确保汉堡菜单应用列表能够调用 me 接口
  // 静态导入 domain-cache 模块，确保在生产构建时被正确打包
  let domainCacheModule: any = null;
  try {
    domainCacheModule = await import('../utils/domain-cache');
  } catch (error) {
    // Failed to import domain-cache module
  }
  await injectDomainListResolver(LOGISTICS_APP_ID, domainCacheModule || LOGISTICS_DOMAIN_CACHE_PATH);

  try {
    const { finishLoading } = await import('../utils/loadingManager');
    (window as any).__APP_FINISH_LOADING__ = finishLoading;
  } catch (error) {
    // Failed to load loading manager
    (window as any).__APP_FINISH_LOADING__ = () => {};
  }

  (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
  (window as any).__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];
};

// 创建 registerTabs 函数
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
        i18nKey: 'menu.procurementModule',
      },
      {
        key: 'warehouse',
        title: translate('logistics.menu.warehouseModule'),
        path: '/logistics/warehouse',
        i18nKey: 'menu.warehouseModule',
      },
      {
        key: 'customs',
        title: translate('logistics.menu.customsModule'),
        path: '/logistics/customs',
        i18nKey: 'menu.customsModule',
      },
      {
        key: 'inventory',
        title: translate('logistics.menu.inventoryManagement'),
        path: '/logistics/inventory',
        i18nKey: 'menu.inventoryManagement',
      },
    ]);
  };
};

// 自定义 setupRouteSync（logistics-app 有特殊的 syncHostWithSubRoute 逻辑）
const setupLogisticsRouteSync = (context: LogisticsAppContext) => {
  // 关键：在 layout-app 环境下也需要设置路由同步
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return;
  }

  // 自定义 syncHostWithSubRoute（layout-app 环境下不修改 URL）
  const syncHostWithSubRoute = (fullPath: string) => {
    // 关键：在 layout-app 环境下（子域名环境），不应该修改 URL
    // 因为子域名环境下路径应该直接是子应用路由（如 / 或 /xxx），不需要添加 /logistics 前缀
    if (isUsingLayoutApp) {
      // layout-app 环境下（子域名环境），不修改 URL，避免路由循环
      return;
    }

    // 只在 qiankun 环境下同步路由到主机
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
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

    window.history.pushState(window.history.state, '', targetUrl);
  };

  // 触发路由变化事件的辅助函数
  const triggerRouteChangeEvent = (to: any) => {
    // 如果应用已卸载，不再同步路由
    if (context.isUnmounted) {
      return;
    }

    const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
    const fullPath = normalizeToHostPath(relativeFullPath, LOGISTICS_BASE_PATH);

    // 关键：如果是首页（meta.isHome === true），不触发路由变化事件，避免添加 tab
    if (to.meta?.isHome === true) {
      return;
    }

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
  };

  context.cleanup.routerAfterEach = context.router.afterEach((to: any) => {
    const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
    const fullPath = normalizeToHostPath(relativeFullPath, LOGISTICS_BASE_PATH);

    syncHostWithSubRoute(fullPath);
    
    // 关键修复：在 layout-app 模式下，使用 nextTick 确保路由完全更新后再触发事件
    // 这样可以确保组件能够响应式更新（菜单激活状态、tabbar 激活状态、内容区域）
    if (isUsingLayoutApp) {
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          triggerRouteChangeEvent(to);
        });
      }).catch(() => {
        // 如果导入失败，直接触发事件（兜底处理）
        triggerRouteChangeEvent(to);
      });
    } else {
      triggerRouteChangeEvent(to);
    }
  });

  // 关键：页面刷新时，主动触发一次当前路由的路由变化事件，确保标签页能够恢复
  // 等待路由就绪后再触发，确保路由信息完整
  context.router.isReady().then(() => {
    // 使用 nextTick 确保路由已经完全初始化
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        const currentRoute = context.router.currentRoute.value;
        // 只有当路由已匹配时才触发事件（避免在路由未匹配时触发）
        if (currentRoute.matched.length > 0) {
          triggerRouteChangeEvent(currentRoute);
        }
      });
    });
  }).catch(() => {
    // 如果路由就绪失败，静默处理
  });
};

// 自定义 setupEventBridge（logistics-app 有特殊逻辑：独立运行时也监听语言切换，并且会调用 registerTabs）
const setupLogisticsEventBridge = (context: LogisticsAppContext) => {
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

// 子应用配置（标准化模板，但使用自定义的 setupPlugins 和 setupGlobals）
const subAppOptions: SubAppOptions = {
  appId: LOGISTICS_APP_ID,
  basePath: LOGISTICS_BASE_PATH,
  domainCachePath: LOGISTICS_DOMAIN_CACHE_PATH,
  AppComponent: App,
  createRouter: createLogisticsRouter,
  setupRouter,
  setupStore,
  setupI18n,
  setupUI,
  setupPlugins: setupLogisticsPlugins,
};

export const createLogisticsApp = async (props: QiankunProps = {}): Promise<LogisticsAppContext> => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 独立运行或 layout-app 环境下都需要设置全局函数
  if (isStandalone || isUsingLayoutApp) {
    await setupLogisticsGlobals();
    // 关键：在独立运行模式下，确保菜单注册表已初始化
    try {
      const { getMenuRegistry } = await import('@btc/shared-components');
      const registry = getMenuRegistry();
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
    const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@btc/shared-core/configs/layout-bridge');
    registerManifestMenusForApp(LOGISTICS_APP_ID);
    registerManifestTabsForApp(LOGISTICS_APP_ID);
  } else {
    // qiankun 环境下也需要注册菜单和 Tabs
    try {
      const { getMenuRegistry } = await import('@btc/shared-components');
      const registry = getMenuRegistry();
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
    const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@btc/shared-core/configs/layout-bridge');
    registerManifestMenusForApp(LOGISTICS_APP_ID);
    registerManifestTabsForApp(LOGISTICS_APP_ID);
  }

  // 使用标准化的 createSubApp
  const context = (await createSubApp(subAppOptions, props)) as unknown as LogisticsAppContext;

  // 添加 registerTabs 功能
  context.registerTabs = createRegisterTabs(context);

  return context;
};

export const mountLogisticsApp = async (context: LogisticsAppContext, props: QiankunProps = {}) => {
  // 使用标准化的 mountSubApp
  await mountSubApp(context, subAppOptions, props);

  // 关键修复：等待路由导航完成后再设置路由同步
  // 这样可以避免路由同步覆盖正在进行的初始导航，导致组件内容被清空
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || isUsingLayoutApp) {
    // 等待路由准备好，并确保路由已匹配
    try {
      await context.router.isReady();
      
      // 使用 nextTick 确保路由已经完全初始化
      await import('vue').then(({ nextTick }) => {
        return new Promise<void>((resolve) => {
          nextTick(() => {
            // 检查路由是否已匹配，如果已匹配则继续，否则等待一段时间
            const currentRoute = context.router.currentRoute.value;
            if (currentRoute.matched.length > 0) {
              resolve();
            } else {
              // 如果路由未匹配，等待一段时间后继续（兼容性处理）
              setTimeout(() => {
                resolve();
              }, 200);
            }
          });
        });
      });
    } catch (error) {
      // 如果路由就绪失败，延迟一段时间后继续（兼容性处理）
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // 设置路由同步、事件桥接等（使用自定义版本）
  setupLogisticsRouteSync(context);
  setupHostLocationBridge(context, LOGISTICS_APP_ID, LOGISTICS_BASE_PATH);
  setupLogisticsEventBridge(context);
  ensureCleanUrl(context);
  context.registerTabs(props);

  // 设置退出登录函数（使用 useLogout composable）
  import('vue').then(({ nextTick }) => {
    nextTick(() => {
      // 关键：不立即调用 useLogout()，而是创建一个包装函数，在真正需要时才调用
      (window as any).__APP_LOGOUT__ = async () => {
        try {
          // 动态导入并调用 useLogout，此时 Vue 应用已挂载，上下文可用
          const { useLogout } = await import('../composables/useLogout');
          const { logout } = useLogout();
          await logout();
        } catch (error) {
          // 如果加载失败，使用兜底逻辑
          // useLogout failed, using fallback
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
          // 关键修复：只有 main-app（主应用）有登录页面，其他子应用都没有
          // 在生产环境子域名下，统一跳转到主域名（bellis.com.cn）的登录页面
          const hostname = window.location.hostname;
          const protocol = window.location.protocol;
          const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
          if (isProductionSubdomain) {
            // 子域名下统一跳转到主域名的登录页面（只有主应用有登录页面）
            const { buildLogoutUrl } = await import('@btc/auth-shared/composables/redirect');
            window.location.href = buildLogoutUrl(`${protocol}//bellis.com.cn/login`);
          } else {
            window.location.href = '/login?logout=1';
          }
        }
      };
    });
  });
};

export const updateLogisticsApp = (context: LogisticsAppContext, props: QiankunProps) => {
  updateSubApp(context, props);
  context.registerTabs(props);
};

export const unmountLogisticsApp = async (context: LogisticsAppContext, props: QiankunProps = {}) => {
  await unmountSubApp(context, props);
};
