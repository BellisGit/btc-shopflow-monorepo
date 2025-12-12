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
import { registerAppEnvAccessors, registerManifestMenusForApp, registerManifestTabsForApp, createAppStorageBridge, createDefaultDomainResolver, resolveAppLogoUrl, createSharedUserSettingPlugin } from '@configs/layout-bridge';
// @ts-expect-error - 类型声明文件可能未构建，但运行时可用
import { AppLayout } from '@btc/shared-components';
import App from './App.vue';

let app: VueApp | null = null;
let router: Router | null = null;
let i18nPlugin: ReturnType<typeof createI18nPlugin> | null = null;
let themePlugin: ReturnType<typeof createThemePlugin> | null = null;
let routerUnwatch: (() => void) | null = null; // 路由监听器清理函数

const ENGINEERING_APP_ID = 'engineering';
const sharedUserSettingPlugin = createSharedUserSettingPlugin();

// 语言切换事件监听器
function handleLanguageChange(e: CustomEvent<{ locale: string }>) {
  const newLocale = e.detail.locale as 'zh-CN' | 'en-US';
  if (i18nPlugin?.i18n?.global) {
    i18nPlugin.i18n.global.locale.value = newLocale;
  }
}

// 主题切换事件监听器
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

const shouldRunStandalone = () =>
  !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

const setupStandaloneGlobals = () => {
  registerAppEnvAccessors();
  (window as any).__APP_STORAGE__ = createAppStorageBridge(ENGINEERING_APP_ID);
  (window as any).__APP_EPS_SERVICE__ = {};
  (window as any).__APP_GET_DOMAIN_LIST__ = createDefaultDomainResolver(ENGINEERING_APP_ID);
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
    setupStandaloneGlobals();
    // 关键：在独立运行模式下，确保菜单注册表已初始化
    // 先初始化菜单注册表，再注册菜单，确保菜单在 AppLayout 渲染前已准备好
    const initMenuRegistry = async () => {
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
    };
    await initMenuRegistry();
    registerManifestMenusForApp(ENGINEERING_APP_ID);
    registerManifestTabsForApp(ENGINEERING_APP_ID);
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
      
      if (isProductionSubdomain && hostname === 'engineering.bellis.com.cn' && to.path.startsWith('/engineering/')) {
        const normalized = to.path.substring('/engineering'.length) || '/';
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
    console.warn('[engineering-app] Router error:', error);
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
        fullPath = currentPath.startsWith('/engineering') ? currentPath : `/engineering${to.path === '/' ? '' : to.path}`;
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
    scope: 'engineering',
  });

  // Initialize theme
  themePlugin = createThemePlugin();

  app = createApp(App);
  app.use(router);
  app.use(createPinia());
  app.use(ElementPlus);
  app.use(i18nPlugin);
  app.use(themePlugin);

  if (isStandalone && router) {
    await setupStandalonePlugins(app, router);
  }

  // 查找挂载点：
  // - qiankun 模式下：直接使用 props.container（即 #subapp-viewport），不要查找或创建 #app
  // - 独立运行模式下：使用 #app
  let mountPoint: HTMLElement | null = null;
  
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // qiankun 模式：直接使用 container（layout-app 传递的 #subapp-viewport）
    if (container && container instanceof HTMLElement) {
      mountPoint = container;
    } else {
      throw new Error('[engineering-app] qiankun 模式下未提供容器元素');
    }
  } else {
    // 独立运行模式：使用 #app
    const appElement = document.querySelector('#app') as HTMLElement;
    if (!appElement) {
      throw new Error('[engineering-app] 独立运行模式下未找到 #app 元素');
    }
    mountPoint = appElement;
  }
  
  if (!mountPoint) {
    throw new Error('[engineering-app] 无法找到挂载节点');
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
    registerManifestMenusForApp(ENGINEERING_APP_ID);
    // 手动触发响应式更新，确保 Vue 能够检测到菜单变化
    if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
      const { triggerRef } = await import('vue');
      triggerRef((window as any).__BTC_MENU_REGISTRY__);
    }
  } catch (error) {
    // 静默失败
  }

  app.mount(mountPoint);

  // 在 qiankun 环境下，同步初始路由
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && router) {
    router.isReady().then(() => {
      if (!router) return;
      // 从浏览器 URL 提取子应用路由
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/engineering')) {
        const subRoute = currentPath.slice('/engineering'.length) || '/';
        // 如果当前路由不匹配，则同步到子应用路由
        if (router.currentRoute.value.path !== subRoute) {
          router.replace(subRoute).catch(() => {});
        }
      } else {
        // 如果不是 /engineering 路径，默认跳转到首页
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
            console.warn('[engineering-app] Auth API logout function not available globally.');
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
  try {
    await render(props);
    
    // 通知主应用：子应用已就绪
    if (props.onReady) {
      props.onReady();
    }
    window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'engineering' }}));
  } catch (error) {
    console.error('[engineering-app] ❌ mount 失败:', error, {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      props,
    });
    throw error;
  }
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

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
renderWithQiankun({
  bootstrap,
  mount,
  update,
  unmount,
});

// 标准 ES 模块导出（qiankun 需要）
export default { bootstrap, mount, unmount };

// 导出 timeouts 配置，供 single-spa 使用
// 注意：qiankun 封装后，优先读取主应用 start 中的 lifeCycles 配置
// 这里的配置作为 fallback，主应用配置为准
// 优化后：开发环境 8 秒，生产环境 3-5 秒
const isDev = import.meta.env.DEV;
export const timeouts = {
  bootstrap: {
    millis: isDev ? 8000 : 3000, // 开发环境 8 秒，生产环境 3 秒
    dieOnTimeout: !isDev, // 生产环境超时直接报错，快速发现问题
    warningMillis: isDev ? 4000 : 1500, // 一半时间后开始警告
  },
  mount: {
    millis: isDev ? 8000 : 5000, // 开发环境 8 秒，生产环境 5 秒
    dieOnTimeout: !isDev,
    warningMillis: isDev ? 4000 : 2500,
  },
  unmount: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: 1500,
  },
};

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
          // 如果 __USE_LAYOUT_APP__ 已设置，说明 layout-app 会通过 qiankun 挂载子应用，不需要独立渲染
          if (!(window as any).__USE_LAYOUT_APP__) {
            // layout-app 加载失败或不需要加载，独立渲染
            render().catch((error) => {
              console.error('[engineering-app] 独立运行失败:', error);
            });
          }
          // 否则，layout-app 会通过 qiankun 挂载子应用，不需要独立渲染
        })
        .catch((error) => {
      console.error('[engineering-app] 初始化 layout-app 失败:', error);
          // layout-app 加载失败，独立渲染
          render().catch((err) => {
            console.error('[engineering-app] 独立运行失败:', err);
          });
        });
    }).catch((error) => {
      console.error('[engineering-app] 导入 init-layout-app 失败:', error);
      // 导入失败，直接渲染
      render().catch((err) => {
        console.error('[engineering-app] 独立运行失败:', err);
    });
  });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
  render().catch((error) => {
    console.error('[engineering-app] 独立运行失败:', error);
  });
  }
}
