// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
// 注意：样式文件已在 main.ts 入口文件顶层导入，确保构建时被正确打包
// 这里不再重复导入，避免样式重复

import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { QiankunProps } from '@btc/shared-core';
import {
  createSubApp,
  mountSubApp,
  unmountSubApp,
  updateSubApp,
  setupRouteSync,
  setupHostLocationBridge,
  setupEventBridge,
  ensureCleanUrl,
  type SubAppContext,
  type SubAppOptions,
} from '@btc/shared-core';

import App from '../App.vue';
import { createAdminRouter, setupRouter, setupStore, setupI18n, setupUI } from './core';
import echartsPlugin from '../plugins/echarts';

// 扩展 SubAppContext 以包含 registerTabs
export interface AdminAppContext extends SubAppContext {
  registerTabs: (props?: QiankunProps) => void;
}

const ADMIN_APP_ID = 'admin';
const ADMIN_BASE_PATH = '/admin';
const ADMIN_DOMAIN_CACHE_PATH = '@utils/domain-cache';

// 自定义 setupStandaloneGlobals（admin-app 使用标准的 setupSubAppGlobals 逻辑）
const setupAdminGlobals = async () => {
  const { registerAppEnvAccessors, createAppStorageBridge, resolveAppLogoUrl, injectDomainListResolver } = await import('@configs/layout-bridge');

  registerAppEnvAccessors();
  const win = window as any;

  // 关键：不要在这里手动处理 EPS 服务！
  // EPS 服务应该由 services/eps.ts 中的 loadEpsService 自动处理
  // loadEpsService 会自动优先使用全局服务，如果没有则使用本地服务，并正确合并两者
  // 在 setupStore 中导入 services/eps.ts 可以确保 EPS 服务在正确的时机被初始化
  // 注意：不要设置空对象，让 loadEpsService 能够正确判断全局服务是否存在

  if (!win.__APP_STORAGE__) {
    win.__APP_STORAGE__ = createAppStorageBridge(ADMIN_APP_ID);
  }
  // 关键：使用统一的域列表注入函数，确保汉堡菜单应用列表能够调用 me 接口
  // 在生产环境下，别名路径可能无法动态导入，所以先静态导入模块
  try {
    const domainCacheModule = await import('../utils/domain-cache');
    await injectDomainListResolver(ADMIN_APP_ID, domainCacheModule);
  } catch (error) {
    // 如果静态导入失败，尝试使用路径字符串（可能在某些环境下工作）
    await injectDomainListResolver(ADMIN_APP_ID, ADMIN_DOMAIN_CACHE_PATH);
  }
  if (!win.__APP_FINISH_LOADING__) {
    win.__APP_FINISH_LOADING__ = () => {};
  }
  win.__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
  win.__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];
};

// 自定义 setupStandalonePlugins（admin-app 使用 sharedUserSettingPlugin 和 echartsPlugin）
const setupAdminPlugins = async (app: any, router: any) => {
  const { resetPluginManager, usePluginManager } = await import('@btc/shared-core');
  const { createSharedUserSettingPlugin } = await import('@configs/layout-bridge');
  const sharedUserSettingPlugin = createSharedUserSettingPlugin();

  // 注册 echarts 插件（v-chart 组件）
  app.use(echartsPlugin);

  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);
  pluginManager.register(sharedUserSettingPlugin);
  await pluginManager.install(sharedUserSettingPlugin.name);
};

// 创建 registerTabs 函数
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

// 自定义 setupEventBridge（admin-app 需要语言切换时调用 registerTabs）
const setupAdminEventBridge = (context: AdminAppContext) => {
  // 使用标准化的 setupEventBridge
  setupEventBridge(context);

  // 添加语言切换时调用 registerTabs 的逻辑
  const languageListener = ((event: Event) => {
    const custom = event as CustomEvent<{ locale: string }>;
    const newLocale = custom.detail?.locale as 'zh-CN' | 'en-US';
    if (newLocale && context.i18n?.i18n?.global) {
      context.registerTabs();
    }
  }) as EventListener;

  // 只在 qiankun 环境下添加额外的语言监听器
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.addEventListener('language-change', languageListener);
    context.cleanup.listeners.push(['language-change', languageListener]);
  }
};

// 自定义 logout 函数（admin-app 有特殊的 authApi 获取逻辑）
const createAdminLogoutFunction = (context: AdminAppContext) => {
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
      const t = context.i18n?.i18n?.global?.t;
      if (t) {
        BtcMessage.success(t('common.logoutSuccess'));
      }

      // 跳转到登录页，添加 logout=1 参数
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      // 在生产环境子域名下或 qiankun 环境下，使用 window.location 跳转
      if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
        if (isProductionSubdomain) {
          window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
        } else {
          window.location.href = '/login?logout=1';
        }
      } else {
        // 开发环境独立运行模式：使用路由跳转
        context.router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    } catch (error: any) {
      // 即使出现错误，也执行清理操作
      try {
        const { deleteCookie } = await import('../utils/cookie');
        deleteCookie('access_token');
      } catch { /* empty */ }

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
      } catch {
        // 清理操作失败不影响后续流程
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
        context.router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    }
  };
};

// 子应用配置（标准化模板，但使用自定义的 setupPlugins 和 setupGlobals）
const subAppOptions: SubAppOptions = {
  appId: ADMIN_APP_ID,
  basePath: ADMIN_BASE_PATH,
  domainCachePath: ADMIN_DOMAIN_CACHE_PATH,
  AppComponent: App,
  createRouter: createAdminRouter,
  setupRouter,
  setupStore,
  setupI18n,
  setupUI,
  setupPlugins: setupAdminPlugins,
};

export const createAdminApp = async (props: QiankunProps = {}): Promise<AdminAppContext> => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 独立运行或 layout-app 环境下都需要设置全局函数
  if (isStandalone || isUsingLayoutApp) {
    await setupAdminGlobals();
    // 关键：在独立运行模式下，确保菜单注册表已初始化
    try {
      const { getMenuRegistry } = await import('@btc/shared-components/store/menuRegistry');
      const registry = getMenuRegistry();
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
    const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@configs/layout-bridge');
    registerManifestMenusForApp(ADMIN_APP_ID);
    registerManifestTabsForApp(ADMIN_APP_ID);
  } else {
    // qiankun 环境下也需要注册菜单和 Tabs
    try {
      const { getMenuRegistry } = await import('@btc/shared-components/store/menuRegistry');
      const registry = getMenuRegistry();
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
    const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@configs/layout-bridge');
    registerManifestMenusForApp(ADMIN_APP_ID);
    registerManifestTabsForApp(ADMIN_APP_ID);
  }

  // 使用标准化的 createSubApp
  const context = await createSubApp(subAppOptions, props) as AdminAppContext;

  // 关键：在 createSubApp 之后，确保 EPS 服务已正确加载
  // 在 layout-app 环境下，全局服务可能还没准备好，需要等待并重新加载
  if (isUsingLayoutApp) {
    try {
      // 等待全局服务准备好（最多等待 3 秒）
      const waitForGlobalService = async (maxWait = 3000, interval = 100) => {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWait) {
          const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
          if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
            return globalService;
          }
          await new Promise(resolve => setTimeout(resolve, interval));
        }
        return null;
      };

      // 等待全局服务
      const globalService = await waitForGlobalService();

      if (globalService) {
        // 如果有全局服务，重新加载 EPS 服务以合并本地模块
        const { loadEpsService } = await import('@btc/shared-core');
        const epsModule = await import('virtual:eps').catch(() => null);
        const { service } = loadEpsService(epsModule?.default || epsModule || undefined);

        const win = window as any;
        // 确保全局变量已设置，供其他模块使用
        if (service && typeof service === 'object' && Object.keys(service).length > 0) {
          win.__APP_EPS_SERVICE__ = service;
          win.service = service;
          win.__BTC_SERVICE__ = service;
        }
      }
    } catch (error) {
      console.warn('[admin-app] 重新加载 EPS 服务失败:', error);
    }
  }

  // 关键：在 qiankun 模式下也需要注册 echarts 插件（v-chart 组件）
  // 因为 setupPlugins 只在独立运行模式下被调用
  if (!isStandalone) {
    context.app.use(echartsPlugin);
  }

  // 添加 registerTabs 功能
  context.registerTabs = createRegisterTabs(context);

  return context;
};

export const mountAdminApp = async (context: AdminAppContext, props: QiankunProps = {}) => {
  // 使用标准化的 mountSubApp
  await mountSubApp(context, subAppOptions, props);

  // 设置路由同步、事件桥接等（使用自定义的 setupAdminEventBridge）
  setupRouteSync(context, ADMIN_APP_ID, ADMIN_BASE_PATH);
  setupHostLocationBridge(context, ADMIN_APP_ID, ADMIN_BASE_PATH);
  setupAdminEventBridge(context);
  ensureCleanUrl(context);
  context.registerTabs(props);

  // 设置退出登录函数（使用自定义的 createAdminLogoutFunction）
  (window as any).__APP_LOGOUT__ = createAdminLogoutFunction(context);
};

export const updateAdminApp = (context: AdminAppContext, props: QiankunProps) => {
  updateSubApp(context, props);
  context.registerTabs(props);
};

export const unmountAdminApp = async (context: AdminAppContext, props: QiankunProps = {}) => {
  // 使用标准化的 unmountSubApp（已包含 isUnmounted 标记和 nextTick 逻辑）
  await unmountSubApp(context, props);
};
