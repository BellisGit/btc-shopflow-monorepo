import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { SubAppContext } from './types';
import { ensureLeadingSlash, normalizeToHostPath, getCurrentHostPath, extractHostSubRoute } from './utils';

let syncingFromSubApp = false;
let syncingFromHost = false;

/**
 * 同步子路由到主机（标准化模板）
 */
export function syncHostWithSubRoute(fullPath: string, basePath: string, context?: SubAppContext): void {
  // 如果应用已卸载，不再同步路由
  if (context?.isUnmounted) {
    return;
  }
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ || syncingFromHost) {
    return;
  }

  // 确保 fullPath 是有效的路径，如果已经是完整路径则直接使用
  let targetUrl = fullPath || basePath;

  // 如果 fullPath 已经是完整路径（以 basePath 开头），直接使用
  // 否则确保它以 basePath 开头
  if (!targetUrl.startsWith(basePath)) {
    // 如果 fullPath 是相对路径，拼接 base path
    if (targetUrl === '/' || targetUrl === '') {
      targetUrl = basePath;
    } else {
      targetUrl = `${basePath}${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`;
    }
  }

  const currentUrl = getCurrentHostPath();

  if (currentUrl === targetUrl) {
    return;
  }

  syncingFromSubApp = true;
  window.history.pushState(window.history.state, '', targetUrl);
}

/**
 * 同步主机路由到子应用（标准化模板）
 */
export function syncSubRouteWithHost(context: SubAppContext, appId: string, basePath: string): void {
  // 如果应用已卸载，不再同步路由
  if (context.isUnmounted) {
    return;
  }
  // 关键：在 layout-app 环境下也需要同步路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return;
  }

  const targetRoute = extractHostSubRoute(appId, basePath);
  const normalizedTarget = ensureLeadingSlash(targetRoute);
  const currentRoute = ensureLeadingSlash(
    context.router.currentRoute.value.fullPath || context.router.currentRoute.value.path || '/',
  );

  // 比较路径（去掉 query 和 hash 进行比较）
  const currentPath = currentRoute.split('?')[0].split('#')[0];
  const targetPath = normalizedTarget.split('?')[0].split('#')[0];

  if (targetPath === currentPath) {
    // 路径相同，不需要更新（query 和 hash 的变化会由路由本身处理）
    return;
  }

  syncingFromHost = true;
  context.router.replace(normalizedTarget).catch(() => {}).finally(() => {
    syncingFromHost = false;
  });
}

/**
 * 触发路由变化事件（提取为独立函数，便于复用）
 */
function triggerRouteChangeEvent(
  to: any,
  context: SubAppContext,
  basePath: string
): void {
  // 如果应用已卸载，不再同步路由
  if (context.isUnmounted) {
    return;
  }

  const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
  const fullPath = normalizeToHostPath(relativeFullPath, basePath);

  // 关键：如果是首页（meta.isHome === true），不触发路由变化事件，避免添加 tab
  if (to.meta?.isHome === true) {
    return;
  }

  // 优先使用 tabLabelKey，如果没有则使用 titleKey（admin-app 使用 titleKey）
  const tabLabelKey = (to.meta?.tabLabelKey ?? to.meta?.titleKey) as string | undefined;
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
    } else if (typeof tabLabelKey === 'string' && tabLabelKey.length > 0) {
      // 如果 tabLabelKey 看起来像 i18n key（包含点号，如 'menu.xxx'），则使用它作为 labelKey
      // 这样可以支持所有应用的 i18n key（menu.*, logistics.*, finance.* 等）
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
}

/**
 * 设置路由同步监听（标准化模板）
 */
export function setupRouteSync(context: SubAppContext, appId: string, basePath: string): void {
  // 关键：在 layout-app 环境下也需要设置路由同步
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return;
  }

  context.cleanup.routerAfterEach = context.router.afterEach((to: any) => {
    // 如果应用已卸载，不再同步路由
    if (context.isUnmounted) {
      return;
    }

    // 清理所有 ECharts 实例和相关的 DOM 元素（tooltip、toolbox 等），防止页面切换时残留
    // 这是全局逻辑，因为多个应用都使用 ECharts
    try {
      import('@btc/shared-components').then((sharedComponents: any) => {
        const cleanupAllECharts = (sharedComponents as any).cleanupAllECharts;
        if (cleanupAllECharts) {
          cleanupAllECharts();
        }
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

    const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
    const fullPath = normalizeToHostPath(relativeFullPath, basePath);

    // 只在非同步状态下同步到主机（避免循环）
    if (!syncingFromHost) {
      syncHostWithSubRoute(fullPath, basePath, context);
    }

    // 触发路由变化事件
    triggerRouteChangeEvent(to, context, basePath);
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
          triggerRouteChangeEvent(currentRoute, context, basePath);
        }
      });
    });
  }).catch(() => {
    // 如果路由就绪失败，静默处理
  });
}

/**
 * 设置主机位置桥接（标准化模板）
 */
export function setupHostLocationBridge(context: SubAppContext, appId: string, basePath: string): void {
  // 关键：在 layout-app 环境下也需要设置路由同步
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return;
  }

  const handleRoutingEvent = () => {
    if (syncingFromSubApp) {
      syncingFromSubApp = false;
      return;
    }

    syncSubRouteWithHost(context, appId, basePath);
  };

  // qiankun 环境下监听 single-spa 事件
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.addEventListener('single-spa:routing-event', handleRoutingEvent);
    context.cleanup.listeners.push(['single-spa:routing-event', handleRoutingEvent]);
  }

  // layout-app 和 qiankun 环境下都需要监听 popstate 事件
  // layout-app 的 router.afterEach 会触发 popstate 事件
  window.addEventListener('popstate', handleRoutingEvent);
  context.cleanup.listeners.push(['popstate', handleRoutingEvent]);

  handleRoutingEvent();
}

/**
 * 确保 URL 干净（标准化模板）
 */
export function ensureCleanUrl(context: SubAppContext): void {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  context.router.isReady().then(() => {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('/') && currentPath !== '/') {
      window.history.replaceState(window.history.state, '', currentPath.slice(0, -1) + window.location.search + window.location.hash);
    }
  });
}
