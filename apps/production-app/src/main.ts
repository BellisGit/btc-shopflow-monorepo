import { createApp } from 'vue';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
import '@btc/shared-components/styles/dark-theme.css';
// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
import 'virtual:svg-icons';
import './styles/theme.scss';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { createI18nPlugin, createThemePlugin, resetPluginManager, usePluginManager } from '@btc/shared-core';
import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
import type { QiankunProps } from '@btc/shared-core';
import { getLocaleMessages, normalizeLocale } from './i18n/getters';
import { AppLayout } from '@btc/shared-components';
import { registerAppEnvAccessors, registerManifestMenusForApp, registerManifestTabsForApp, createAppStorageBridge, createDefaultDomainResolver, resolveAppLogoUrl, createSharedUserSettingPlugin } from '@configs/layout-bridge';
import { loadSharedResourcesFromLayoutApp } from '@btc/shared-utils/cdn/load-shared-resources';
import App from './App.vue';

let app: VueApp | null = null;
let router: Router | null = null;
let i18nPlugin: ReturnType<typeof createI18nPlugin> | null = null;
let themePlugin: ReturnType<typeof createThemePlugin> | null = null;
let routerUnwatch: (() => void) | null = null; // 路由监听器清理函数

const PRODUCTION_APP_ID = 'production';
const sharedUserSettingPlugin = createSharedUserSettingPlugin();

function handleLanguageChange(e: CustomEvent<{ locale: string }>) {
  const newLocale = e.detail.locale as 'zh-CN' | 'en-US';
  if (i18nPlugin?.i18n?.global) {
    i18nPlugin.i18n.global.locale.value = newLocale;
  }
}

function handleThemeChange(e: CustomEvent<{ color: string; dark: boolean }>) {
  if (themePlugin?.theme) {
    // 检查当前颜色是否已经相同，避免不必要的调用和递归
    const currentColor = themePlugin.theme.currentTheme.value?.color;
    const currentDark = themePlugin.theme.isDark.value;
    // 只有当颜色或暗黑模式不同时才更新
    if (currentColor !== e.detail.color || currentDark !== e.detail.dark) {
      themePlugin.theme.setThemeColor(e.detail.color, e.detail.dark);
    }
  }
}

const shouldRunStandalone = () => {
  // 关键：如果 hostname 匹配生产环境域名，即使 __USE_LAYOUT_APP__ 还未设置，也不应该立即独立运行
  // 应该等待 initLayoutApp 完成后再决定
  const isProductionDomain = /\.bellis\.com\.cn$/i.test(window.location.hostname);
  if (isProductionDomain) {
    // 生产环境域名：如果 __USE_LAYOUT_APP__ 已设置，说明 layout-app 已加载，不应该独立运行
    // 如果还未设置，也不应该立即独立运行，应该等待 initLayoutApp
    return !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
  }
  // 非生产环境：正常判断
  return !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
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

const setupStandaloneGlobals = async () => {
  registerAppEnvAccessors();

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
      const { service } = await import('./services/eps');
      (window as any).__APP_EPS_SERVICE__ = service;
    } catch (error) {
      console.warn('[production-app] Failed to load EPS service:', error);
      (window as any).__APP_EPS_SERVICE__ = {};
    }
  }

  try {

    (window as any).__APP_STORAGE__ = createAppStorageBridge(PRODUCTION_APP_ID);
  } catch (error) {
    console.warn('[production-app] Failed to load app storage:', error);
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
    const domainModule = await import('./utils/domain-cache');
    if (domainModule.getDomainList) {
      (window as any).__APP_GET_DOMAIN_LIST__ = domainModule.getDomainList;
    }
    if (domainModule.clearDomainCache) {
      (window as any).__APP_CLEAR_DOMAIN_CACHE__ = domainModule.clearDomainCache;
      // 关键：在子应用初始化时清除域列表缓存，强制重新请求 me 接口
      // 这确保子应用显示的应用列表标题是最新的
      domainModule.clearDomainCache();
    }
  } catch (error) {
    console.warn('[production-app] Failed to load domain cache:', error);
    // 如果加载失败，使用默认解析器作为兜底
    (window as any).__APP_GET_DOMAIN_LIST__ = createDefaultDomainResolver(PRODUCTION_APP_ID);
  }

  (window as any).__APP_FINISH_LOADING__ = () => {};
  (window as any).__APP_LOGOUT__ = () => {};
  (window as any).__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];
  (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
};

const setupStandalonePlugins = async (appInstance: VueApp, routerInstance: Router) => {
  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(appInstance);
  pluginManager.setRouter(routerInstance);
  pluginManager.register(sharedUserSettingPlugin);
  await pluginManager.install(sharedUserSettingPlugin.name);
};

async function render(props: QiankunProps = {}) {
  const { container } = props;

  // 判断是否独立运行
  const isStandalone = shouldRunStandalone();

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
    registerManifestMenusForApp(PRODUCTION_APP_ID);
    registerManifestTabsForApp(PRODUCTION_APP_ID);
  }

  // 基础路由（页面组件）
  const pageRoutes = [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: { isHome: true },
    },
  ];

  // 根据运行模式返回不同的路由配置
  // 独立运行时：使用 AppLayout 包裹所有路由
  // qiankun 模式：直接返回页面路由（由主应用提供 Layout）
  const routes = isStandalone
    ? [
        {
          path: '/',
          component: AppLayout, // Use AppLayout from shared package
          children: pageRoutes,
        },
      ]
    : pageRoutes;

  router = createRouter({
    // 在 qiankun 环境下使用 MemoryHistory，避免路由冲突
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory('/'),
    strict: true,
    routes,
  });

  // 路由守卫：在生产环境子域名下规范化路径
  router.beforeEach((to, from, next) => {
    // 只在独立运行（非 qiankun）且是生产环境子域名时处理
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      const hostname = window.location.hostname;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      if (isProductionSubdomain && hostname === 'production.bellis.com.cn' && to.path.startsWith('/production/')) {
        const normalized = to.path.substring('/production'.length) || '/';
        console.log(`[Router Path Normalize] ${to.path} -> ${normalized} (subdomain: ${hostname})`);
        next({
          path: normalized,
          query: to.query,
          hash: to.hash,
          replace: true,
        });
        return;
      }
    }

    next();
  });

  router.onError((error) => {
    console.warn('[production-app] Router error:', error);
  });

  // 路由守卫：通知主应用添加标签
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    routerUnwatch = router.afterEach((to) => {
      // 跳过首页
      if (to.meta?.isHome) {
        return;
      }

      // 检测是否在生产环境的子域名下
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      // 规范化路径：生产环境子域名下不带应用前缀，开发环境带前缀
      let fullPath: string;
      if (isProductionSubdomain) {
        // 生产环境子域名：直接使用相对路径
        fullPath = to.fullPath || to.path || '/';
        if (!fullPath.startsWith('/')) {
          fullPath = `/${fullPath}`;
        }
      } else {
        // 开发环境（qiankun模式）：添加应用前缀
        const currentPath = window.location.pathname;
        fullPath = currentPath.startsWith('/production') ? currentPath : `/production${to.path === '/' ? '' : to.path}`;
      }

      window.dispatchEvent(new CustomEvent('subapp:route-change', {
        detail: {
          path: fullPath,
          fullPath: fullPath,
          name: to.name,
          meta: {
            ...to.meta,
            label: to.name as string,
          },
        },
      }));
    });
  }

  // Initialize i18n
  const initialLocale = props.locale || 'zh-CN';
  i18nPlugin = createI18nPlugin({
    locale: normalizeLocale(initialLocale),
    fallbackLocale: 'zh-CN',
    messages: getLocaleMessages(),
    scope: 'production',
  });

  // Initialize theme
  themePlugin = createThemePlugin();

  app = createApp(App);
  
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
        console.warn('[production-app] DOM 操作错误已捕获（应用可能正在卸载）:', err.message);
      }
      return;
    }
  };
  
  app.use(router);
  app.use(createPinia());
  app.use(ElementPlus);
  app.use(i18nPlugin);
  app.use(themePlugin);

  if (isStandalone && router) {
    await setupStandalonePlugins(app, router);
  }

  // 查找挂载点：
  // - 优先使用 props.container（无论是否 qiankun，只要提供了 container 就使用）
  // - 否则：如果 __USE_LAYOUT_APP__ 为 true，尝试查找 #subapp-viewport
  // - 否则：使用 #app（独立运行模式）
  let mountPoint: HTMLElement | null = null;
  
  // 关键：优先使用 props.container（无论是 qiankun 模式还是嵌入 layout-app 模式）
  if (container && container instanceof HTMLElement) {
    mountPoint = container;
  } else if ((window as any).__USE_LAYOUT_APP__) {
    // 使用 layout-app：尝试查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      mountPoint = viewport;
    } else {
      throw new Error('[production-app] 使用 layout-app 但未找到 #subapp-viewport 元素');
    }
  } else if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // qiankun 模式但未提供 container：尝试查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      mountPoint = viewport;
    } else {
      throw new Error('[production-app] qiankun 模式下未提供容器元素且未找到 #subapp-viewport');
    }
  } else {
    // 独立运行模式：使用 #app
    const appElement = document.querySelector('#app') as HTMLElement;
    if (!appElement) {
      throw new Error('[production-app] 独立运行模式下未找到 #app 元素');
    }
    mountPoint = appElement;
  }

  if (!mountPoint) {
    throw new Error('[production-app] 无法找到挂载节点');
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
    registerManifestMenusForApp(PRODUCTION_APP_ID);
    // 手动触发响应式更新，确保 Vue 能够检测到菜单变化
    if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
      const { triggerRef } = await import('vue');
      triggerRef((window as any).__BTC_MENU_REGISTRY__);
    }
  } catch (error) {
    // 静默失败
  }

  app.mount(mountPoint);
  
  // 关键：应用挂载完成后，移除 Loading 并清理 sessionStorage 标记
  removeLoadingElement();
  clearNavigationFlag();

  // 在 qiankun 环境下，同步初始路由
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && router) {
    router.isReady().then(() => {
      if (!router) return;
      // 从浏览器 URL 提取子应用路由
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/production')) {
        const subRoute = currentPath.slice('/production'.length) || '/';
        // 如果当前路由不匹配，则同步到子应用路由
        if (router.currentRoute.value.path !== subRoute) {
          router.replace(subRoute).catch(() => {});
        }
      } else {
        // 如果不是 /production 路径，默认跳转到首页
        router.replace('/').catch(() => {});
      }
    });
  }

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.addEventListener('language-change', handleLanguageChange as EventListener);
    window.addEventListener('theme-change', handleThemeChange as EventListener);
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
            console.warn('[production-app] Auth API logout function not available globally.');
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
}

// qiankun 生命周期钩子（标准 ES 模块导出格式）
function bootstrap() {
  // bootstrap 阶段不需要做任何初始化工作，所有初始化都在 mount 阶段完成
  // 直接返回已 resolve 的 Promise，避免超时警告
  return Promise.resolve(undefined);
}

async function mount(props: QiankunProps) {
  // 生产环境且非 layout-app：先加载共享资源
  if (import.meta.env.PROD && !(window as any).__IS_LAYOUT_APP__) {
    try {
      await loadSharedResourcesFromLayoutApp({
        onProgress: (loaded, total) => {
          if (import.meta.env.DEV) {
            console.log(`[production-app] 加载共享资源进度: ${loaded}/${total}`);
          }
        },
      });
    } catch (error) {
      console.warn('[production-app] 加载共享资源失败，继续使用本地资源:', error);
      // 继续执行，使用本地打包的资源作为降级方案
    }
  }

  await render(props);

  // 通知主应用：子应用已就绪
  if (props.onReady) {
    props.onReady();
  }
  window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'production' }}));
}

async function update(props: QiankunProps) {
  if (props.locale && i18nPlugin?.i18n?.global) {
    i18nPlugin.i18n.global.locale.value = props.locale as 'zh-CN' | 'en-US';
  }
}

async function unmount(props: QiankunProps = {}) {
  // ? 解绑路由监听器（防止幽灵事件）
  if (routerUnwatch) {
    routerUnwatch();
    routerUnwatch = null;
  }

  // 清理子应用的 Tab 映射
  if (props.clearTabs) {
    props.clearTabs();
  }

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.removeEventListener('language-change', handleLanguageChange as EventListener);
    window.removeEventListener('theme-change', handleThemeChange as EventListener);
  }

  app?.unmount();
  app = null;
  router = null;
  i18nPlugin = null;
  themePlugin = null;
}

// 导出 timeouts 配置，供 single-spa 使用
// 注意：qiankun 封装后，优先读取主应用 start 中的 lifeCycles 配置
// 这里的配置作为 fallback，主应用配置为准
// 优化后：开发环境 8 秒，生产环境 3-5 秒
// 关键：必须在 export default 之前声明，避免 TDZ (Temporal Dead Zone) 错误
// 注意：使用 import.meta.env.PROD 明确判定生产环境，避免构建产物环境判断异常导致 warningMillis=4000
const isProd = import.meta.env.PROD;
export const timeouts = {
  bootstrap: {
    millis: isProd ? 20000 : 8000, // 生产环境 20 秒，开发环境 8 秒（考虑网络延迟和资源加载）
    dieOnTimeout: false, // 超时后不终止应用，只警告（避免因网络问题导致应用无法加载）
    warningMillis: isProd ? 15000 : 4000, // 警告时间：生产环境 15 秒，开发环境 4 秒（避免过早警告）
  },
  mount: {
    millis: isProd ? 15000 : 8000, // 生产环境 15 秒，开发环境 8 秒
    dieOnTimeout: false, // 超时后不终止应用，只警告
    warningMillis: isProd ? 12000 : 4000, // 警告时间：生产环境 12 秒，开发环境 4 秒
  },
  unmount: {
    millis: 5000, // 增加到 5 秒，确保卸载完成
    dieOnTimeout: false,
    warningMillis: 4000,
  },
};

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
// 关键：只在 qiankun 环境下注册生命周期。
// renderWithQiankun 在非 qiankun 环境会自动调用 mount，导致"子应用独立先挂载一次 + 加载 layout-app 后又手动挂载一次"的双挂载，
// 进而引发内容区空白以及 single-spa #41/#1 等问题。
if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  renderWithQiankun({
    bootstrap,
    mount,
    update,
    unmount,
  });
}

// 标准 ES 模块导出（qiankun 需要）
// 关键：将 timeouts 也添加到 default 导出中，确保 single-spa 能够读取
export default { bootstrap, mount, unmount, timeouts };

// 独立运行（非 qiankun 环境）
if (shouldRunStandalone()) {
  // 检查是否需要加载 layout-app
  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);

  if (shouldLoadLayout) {
    // 需要加载 layout-app，先初始化，等待完成后再决定是否渲染
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
                render({ container: viewport } as any).catch((error) => {
                  console.error('[production-app] 挂载到 layout-app 失败:', error);
                });
              } else {
                console.error('[production-app] 等待 #subapp-viewport 超时，尝试独立渲染');
                render().catch((error) => {
                  console.error('[production-app] 独立运行失败:', error);
                });
              }
            });
          } else {
            // layout-app 加载失败或不需要加载，独立渲染
            render().catch((error) => {
              console.error('[production-app] 独立运行失败:', error);
            });
          }
        })
        .catch((error) => {
          console.error('[production-app] 初始化 layout-app 失败:', error);
          // layout-app 加载失败，独立渲染
          render().catch((err) => {
            console.error('[production-app] 独立运行失败:', err);
          });
        });
    }).catch((error) => {
      console.error('[production-app] 导入 init-layout-app 失败:', error);
      // 导入失败，直接渲染
      render().catch((err) => {
        console.error('[production-app] 独立运行失败:', err);
      });
    });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
    render().catch((error) => {
      console.error('[production-app] 独立运行失败:', error);
    });
  }
}
