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
// 应用全局样式（global.scss 中已通过 @import 导入共享组件样式）
// 注意：共享组件样式在 global.scss 中使用 @import 导入，确保构建时被正确合并
import './styles/global.scss';
import './styles/theme.scss';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { createI18nPlugin, createThemePlugin, resetPluginManager, usePluginManager } from '@btc/shared-core';
import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
import type { QiankunProps } from '@btc/shared-core';
import { getLocaleMessages, normalizeLocale } from './i18n/getters';
import { AppLayout } from '@btc/shared-components';
import { registerAppEnvAccessors, registerManifestMenusForApp, resolveAppLogoUrl } from '@configs/layout-bridge';
import { userSettingPlugin } from './plugins/user-setting';
import App from './App.vue';

let app: VueApp | null = null;
let router: Router | null = null;
let i18nPlugin: ReturnType<typeof createI18nPlugin> | null = null;
let themePlugin: ReturnType<typeof createThemePlugin> | null = null;
let routerUnwatch: (() => void) | null = null; // 路由监听器清理函数

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

const QUALITY_APP_ID = 'quality';

const shouldRunStandalone = () =>
  !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

const setupStandalonePlugins = async (appInstance: VueApp, routerInstance: Router) => {
  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(appInstance);
  pluginManager.setRouter(routerInstance);
  pluginManager.register(userSettingPlugin);
  await pluginManager.install(userSettingPlugin.name);
};

const setupStandaloneGlobals = async () => {
  registerAppEnvAccessors();

  await Promise.all([
    import('./services/eps')
      .then(({ service }) => {
        (window as any).__APP_EPS_SERVICE__ = service;
      })
      .catch(() => {
        console.warn('[quality-app] Failed to load EPS service');
      }),
    import('./utils/app-storage')
      .then(({ appStorage }) => {
        (window as any).__APP_STORAGE__ = appStorage;
      })
      .catch(() => {
        console.warn('[quality-app] Failed to load app storage');
      }),
    import('./utils/domain-cache')
      .then((module) => {
        if (module.getDomainList) {
          (window as any).__APP_GET_DOMAIN_LIST__ = module.getDomainList;
        }
      })
      .catch(() => {
        console.warn('[quality-app] Failed to load domain cache');
      }),
    import('./utils/loadingManager')
      .then(({ finishLoading }) => {
        (window as any).__APP_FINISH_LOADING__ = finishLoading;
      })
      .catch(() => {
        console.warn('[quality-app] Failed to load loading manager');
        (window as any).__APP_FINISH_LOADING__ = () => {};
      }),
    import('./composables/useLogout')
      .then(({ useLogout }) => {
        const { logout } = useLogout();
        (window as any).__APP_LOGOUT__ = logout;
      })
      .catch(() => {
        console.warn('[quality-app] Failed to load logout composable');
      }),
  ]);

  (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
  (window as any).__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];
};

async function render(props: QiankunProps = {}) {
  const { container } = props;

  // 判断是否独立运行
  const isStandalone = shouldRunStandalone();

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
  // 独立运行时：使用 Layout 包裹所有路由
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

  router.onError((error) => {
    console.warn('[quality-app] Router error:', error);
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
        fullPath = currentPath.startsWith('/quality') ? currentPath : `/quality${to.path === '/' ? '' : to.path}`;
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
    scope: 'quality',
  });

  // Initialize theme
  themePlugin = createThemePlugin();

  app = createApp(App);
  app.use(router);
  app.use(createPinia());
  app.use(ElementPlus);
  app.use(i18nPlugin);
  app.use(themePlugin);

  if (isStandalone) {
    await setupStandaloneGlobals();
    registerManifestMenusForApp(QUALITY_APP_ID);
    await setupStandalonePlugins(app, router);
  }

  // 关键：在 qiankun 模式下，直接使用 container（layout-app 传递的 #subapp-viewport）
  // 在独立运行模式下，使用 #app
  const mountPoint = container || document.querySelector('#app');
  if (mountPoint) {
    app.mount(mountPoint);

    // 在 qiankun 环境下，同步初始路由
    if (qiankunWindow.__POWERED_BY_QIANKUN__ && router) {
      router.isReady().then(() => {
        if (!router) return;
        // 从浏览器 URL 提取子应用路由
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/quality')) {
          const subRoute = currentPath.slice('/quality'.length) || '/';
          // 如果当前路由不匹配，则同步到子应用路由
          if (router.currentRoute.value.path !== subRoute) {
            router.replace(subRoute).catch(() => {});
          }
        } else {
          // 如果不是 /quality 路径，默认跳转到首页
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
  window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'quality' }}));
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
              console.error('[quality-app] 独立运行失败:', error);
            });
          }
          // 否则，layout-app 会通过 qiankun 挂载子应用，不需要独立渲染
        })
        .catch((error) => {
      console.error('[quality-app] 初始化 layout-app 失败:', error);
          // layout-app 加载失败，独立渲染
          render().catch((err) => {
            console.error('[quality-app] 独立运行失败:', err);
          });
        });
    }).catch((error) => {
      console.error('[quality-app] 导入 init-layout-app 失败:', error);
      // 导入失败，直接渲染
      render().catch((err) => {
        console.error('[quality-app] 独立运行失败:', err);
    });
  });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
    render().catch((error) => {
      console.error('[quality-app] 独立运行失败:', error);
    });
  }
}
