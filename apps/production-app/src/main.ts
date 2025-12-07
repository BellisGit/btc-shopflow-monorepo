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
import { registerAppEnvAccessors, registerManifestMenusForApp, createAppStorageBridge, createDefaultDomainResolver, resolveAppLogoUrl, createSharedUserSettingPlugin } from '@configs/layout-bridge';
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

const shouldRunStandalone = () =>
  !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

const setupStandaloneGlobals = () => {
  registerAppEnvAccessors();
  (window as any).__APP_STORAGE__ = createAppStorageBridge(PRODUCTION_APP_ID);
  (window as any).__APP_EPS_SERVICE__ = {};
  (window as any).__APP_GET_DOMAIN_LIST__ = createDefaultDomainResolver(PRODUCTION_APP_ID);
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
    registerManifestMenusForApp(PRODUCTION_APP_ID);
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
  app.use(router);
  app.use(createPinia());
  app.use(ElementPlus);
  app.use(i18nPlugin);
  app.use(themePlugin);

  if (isStandalone && router) {
    await setupStandalonePlugins(app, router);
  }

  const mountPoint = container ? container.querySelector('#app') : '#app';
  if (mountPoint) {
    app.mount(mountPoint);

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
  }

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.addEventListener('language-change', handleLanguageChange as EventListener);
    window.addEventListener('theme-change', handleThemeChange as EventListener);
  }
}

// qiankun 生命周期钩子（标准 ES 模块导出格式）
function bootstrap() {
  // bootstrap 阶段不需要做任何初始化工作，所有初始化都在 mount 阶段完成
  // 直接返回已 resolve 的 Promise，避免超时警告
  return Promise.resolve(undefined);
}

async function mount(props: QiankunProps) {
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

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
renderWithQiankun({
  bootstrap,
  mount,
  update,
  unmount,
});

// 标准 ES 模块导出（qiankun 需要）
export default { bootstrap, mount, unmount };

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
              console.error('[production-app] 独立运行失败:', error);
            });
          }
          // 否则，layout-app 会通过 qiankun 挂载子应用，不需要独立渲染
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
