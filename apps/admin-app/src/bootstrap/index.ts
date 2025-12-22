// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
// 样式文件在模块加载时同步导入
// 关键：显式导入 shared-components 样式，确保 BtcDialog 等组件的样式在生产环境下正确加载
// 虽然 global.scss 中也通过 @use 导入了，但在 bootstrap 中显式导入可以确保样式加载顺序正确
import '@btc/shared-components/styles/index.scss';
// 注意：其他样式文件已在 main.ts 入口文件顶层导入，确保构建时被正确打包
// 这里只导入 shared-components 样式，避免样式重复

import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { QiankunProps } from '@btc/shared-core';
import {
  createSubApp,
  mountSubApp,
  unmountSubApp,
  updateSubApp,
  setupRouteSync,
  setupHostLocationBridge,
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

// 自定义 setupStandaloneGlobals（仿照 logistics-app 的方式，确保 EPS 服务正确初始化）
const setupAdminGlobals = async () => {
  const { registerAppEnvAccessors, createAppStorageBridge, resolveAppLogoUrl, injectDomainListResolver } = await import('@configs/layout-bridge');

  registerAppEnvAccessors();
  const win = window as any;

  // 优先使用全局共享的 EPS 服务（由 system-app 或 layout-app 提供）
  // 注意：本地服务的加载由 services/eps.ts 在被需要时自然导入，由 loadEpsService 处理
  const getGlobalEpsService = () => {
    const globalService = win.__APP_EPS_SERVICE__ || win.service || win.__BTC_SERVICE__;
    if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
      return globalService;
    }
    return null;
  };

  // 先检查是否有全局服务
  let globalService = getGlobalEpsService();

  if (!globalService) {
    // 等待全局服务可用（最多等待 3 秒，与 setupSubAppGlobals 一致）
    const waitForGlobalService = async (maxWait = 3000, interval = 100) => {
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
    win.__APP_EPS_SERVICE__ = globalService;
    win.service = globalService;
    win.__BTC_SERVICE__ = globalService;
  }
  // 注意：如果没有全局服务，不在这里加载本地服务
  // 因为如果此时加载 services/eps.ts，loadEpsService 可能返回本地服务并缓存
  // 即使后来全局服务准备好了，services/eps.ts 已经执行过了，不会重新检查
  // 本地服务的加载由 services/eps.ts 在被需要时自然导入，由 loadEpsService 处理

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

  // 注册菜单和 Tabs（无论是否独立运行都需要注册）
  const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@configs/layout-bridge');
  registerManifestMenusForApp(ADMIN_APP_ID);
  registerManifestTabsForApp(ADMIN_APP_ID);
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
// 仿照 logistics-app 的方式，确保在所有环境下都能正确响应语言切换
const setupAdminEventBridge = (context: AdminAppContext) => {
  // 语言切换监听器需要在所有环境下都运行（包括独立运行和 layout-app）
  const languageListener = ((event: Event) => {
    const custom = event as CustomEvent<{ locale: string }>;
    const newLocale = custom.detail?.locale as 'zh-CN' | 'en-US';
    if (newLocale && context.i18n?.i18n?.global) {
      // 更新 i18n locale
      context.i18n.i18n.global.locale.value = newLocale;
      // 调用 registerTabs 更新 tabbar
      context.registerTabs();
    }
  }) as EventListener;

  // 关键：在 layout-app 环境下也需要监听事件
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 只在 qiankun 环境下设置主题切换监听器
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 独立运行或 layout-app 环境：只监听语言切换事件
    window.addEventListener('language-change', languageListener);
    context.cleanup.listeners.push(['language-change', languageListener]);
    return;
  }

  // qiankun 环境下监听所有事件（语言和主题）
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

  // 独立运行或 layout-app 环境下都需要设置全局函数（包括 EPS 服务初始化）
  if (isStandalone || isUsingLayoutApp) {
    await setupAdminGlobals();
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
  // 注意：EPS 服务已在 setupSubAppGlobals 中正确初始化，无需再次处理
  const context = await createSubApp(subAppOptions, props) as AdminAppContext;

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
