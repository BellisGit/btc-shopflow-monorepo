import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
import type { Pinia } from 'pinia';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { QiankunProps } from '@btc/shared-core';
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

export const createAdminApp = (props: QiankunProps = {}): AdminAppContext => {
  const app = createApp(App);
  const router = createAdminRouter();
  setupRouter(app, router);
  const pinia = setupStore(app);
  const theme = setupUI(app);
  const i18n = setupI18n(app, props.locale || 'zh-CN');
  
  // 注册 echarts 插件（v-chart 组件）
  app.use(echartsPlugin);

  // 路由初始化使用 Promise.resolve().then() 确保在下一个 tick 执行，不阻塞当前初始化
  // 注意：不要在 createAdminApp 中初始化路由，这可能导致路由状态不一致
  // 路由初始化应该在 mountAdminApp 中进行，确保在应用挂载后再初始化路由
  // if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  //   const initialRoute = deriveInitialSubRoute();
  //   // 使用 Promise.resolve().then() 确保路由替换在下一个 tick 执行，不阻塞当前初始化
  //   Promise.resolve().then(() => {
  //     router.replace(initialRoute).catch(() => {});
  //   });
  // }

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
  };

  context.translate = createTranslate(context);
  context.registerTabs = createRegisterTabs(context);

  return context;
};

export const mountAdminApp = (context: AdminAppContext, props: QiankunProps = {}) => {
  // 重置卸载标记
  isUnmounted = false;
  context.props = props;

  // 查找挂载点：优先从 props.container 中查找 #app，如果没有则使用 props.container 本身，最后回退到全局 #app
  // 与 logistics-app 保持一致，确保挂载逻辑可靠
  let mountPoint: string | HTMLElement =
    (props.container && (props.container.querySelector('#app') || props.container)) ||
    '#app';
  
  // 如果 mountPoint 是字符串，确保元素存在
  if (typeof mountPoint === 'string') {
    const element = document.querySelector(mountPoint);
    if (!element) {
      // 如果找不到 #app，尝试在容器中创建
      if (props.container && props.container instanceof HTMLElement) {
        const appDiv = document.createElement('div');
        appDiv.id = 'app';
        props.container.appendChild(appDiv);
        mountPoint = appDiv;
      } else {
        throw new Error(`[admin-app] 无法找到挂载节点 ${mountPoint}`);
      }
    } else {
      mountPoint = element as HTMLElement;
    }
  }

  // 先挂载 Vue 应用，确保 DOM 已准备好
  context.app.mount(mountPoint);

  setupRouteSync(context);
  setupHostLocationBridge(context);
  setupEventBridge(context);
  ensureCleanUrl(context);
  context.registerTabs(props);

  // 独立运行时：初始化菜单和 tabbar
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    import('../micro/index').then(({ registerManifestMenusForApp, registerManifestTabsForApp }) => {
      registerManifestTabsForApp('admin').catch(console.error);
      registerManifestMenusForApp('admin').catch(console.error);
    });
  }

  // 路由初始化：在应用挂载后立即初始化路由，确保路由状态一致
  // 使用 router.isReady() 确保路由系统已准备好，然后使用 nextTick 确保 DOM 已更新
  // 关键：在路由初始化完成后再调用 onReady，确保应用完全准备好
  context.router.isReady().then(() => {
    return import('vue').then(({ nextTick }) => {
      return new Promise<void>((resolve) => {
        nextTick(() => {
          if (qiankunWindow.__POWERED_BY_QIANKUN__) {
            const initialRoute = deriveInitialSubRoute();
            // 如果当前路由不匹配，则替换为初始路由
            if (context.router.currentRoute.value.matched.length === 0 || context.router.currentRoute.value.fullPath !== initialRoute) {
              context.router.replace(initialRoute).then(() => {
                // 检查路由是否匹配成功
                if (context.router.currentRoute.value.matched.length === 0) {
                  // 如果路由未匹配，尝试使用默认路由
                  context.router.replace('/').catch((error) => {
                    console.error('[admin-app] 使用默认路由失败:', error);
                  }).finally(() => {
                    resolve();
                  });
                } else {
                  resolve();
                }
              }).catch((error) => {
                console.error('[admin-app] 路由初始化失败:', error);
                // 如果路由初始化失败，尝试使用默认路由
                context.router.replace('/').catch((err) => {
                  console.error('[admin-app] 使用默认路由也失败:', err);
                }).finally(() => {
                  resolve();
                });
              });
            } else {
              resolve();
            }
          } else {
            // 非 qiankun 环境，确保路由已初始化
            if (context.router.currentRoute.value.matched.length === 0) {
              console.warn('[admin-app] 非 qiankun 环境，路由未匹配，尝试使用默认路由 /');
              context.router.replace('/').catch((error) => {
                console.error('[admin-app] 使用默认路由失败:', error);
              }).finally(() => {
                resolve();
              });
            } else {
              resolve();
            }
          }
        });
      });
    });
  }).then(() => {
    // 路由初始化完成后，调用 onReady 回调
    if (props.onReady) {
      props.onReady();
    }

    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: 'admin' } }));
    }
  }).catch((error) => {
    console.error('[admin-app] 路由准备失败:', error);
    // 即使路由初始化失败，也要调用 onReady，确保 loading 状态被清除
    if (props.onReady) {
      props.onReady();
    }
  });
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

export const unmountAdminApp = (context: AdminAppContext, props: QiankunProps = {}) => {
  // 标记应用已卸载，阻止路由同步
  isUnmounted = true;

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
