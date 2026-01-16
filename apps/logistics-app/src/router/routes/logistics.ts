import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout } from '@btc/shared-components';
import { scanRoutesFromConfigFiles } from '@btc/shared-core/utils/route-scanner';
;

/**
 * 获取路由配置
 * - qiankun 模式：返回页面路由（登录页等由主应用提供）
 * - layout-app 模式：返回页面路由（由 layout-app 提供 Layout）
 * - 独立运行时：使用 BtcAppLayout 包裹所有路由
 * 
 * 自动路由发现：
 * - 从所有模块的 config.ts 中自动提取 views 和 pages 路由
 * - 完全按照 cool-admin 的方案，所有路由都从模块配置中自动发现
 */
export const getLogisticsRoutes = (): RouteRecordRaw[] => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 自动扫描模块配置中的路由
  let pageRoutes: RouteRecordRaw[] = [];
  
  try {
    // 扫描所有模块的 config.ts，提取路由
    const autoRoutes = scanRoutesFromConfigFiles('/src/modules/*/config.ts', {
      enableAutoDiscovery: true,
      preferManualRoutes: false,
      mergeViewsToChildren: false,
    });

    // 合并 views 和 pages 路由
    pageRoutes = [...autoRoutes.views, ...autoRoutes.pages];

    // 输出扫描结果（开发环境）
    if (import.meta.env.DEV) {
      console.info(
        `[logisticsRouter] Route discovery: ${autoRoutes.views.length} views, ${autoRoutes.pages.length} pages, ${autoRoutes.conflicts.length} conflicts`
      );
      if (autoRoutes.conflicts.length > 0) {
        console.warn(`[logisticsRouter] Route conflicts:`, autoRoutes.conflicts);
      }
    }
  } catch (error) {
    console.error(`[logisticsRouter] Failed to scan routes from modules:`, error);
    pageRoutes = [];
  }

  // 添加重定向路由（如果根路径没有路由）
  const hasRootRoute = pageRoutes.some(route => route.path === '/');
  if (!hasRootRoute) {
    pageRoutes.unshift({
      path: '/',
      redirect: '/procurement',
      meta: {
        process: false,
      },
    });
  }

  // 如果使用 layout-app，直接返回页面路由（layout-app 会提供布局）
  if (isUsingLayoutApp) {
    return pageRoutes;
  }

  // 独立运行且不使用 layout-app：使用 BtcAppLayout 包裹所有路由
  const routes = isStandalone
    ? [
        {
          path: '/',
          component: BtcAppLayout,
          children: pageRoutes,
        },
      ]
    : [
        ...pageRoutes, // 业务路由（qiankun 模式，由主应用提供 Layout）
      ];
  return routes;
};

// 为了向后兼容，保留导出（使用函数动态获取）
export const logisticsRoutes = getLogisticsRoutes();
