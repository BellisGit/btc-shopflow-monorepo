import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { AppLayout } from '@btc/shared-components';

// 基础路由（页面组件）
const pageRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'finance-home',
    component: () => import('../../modules/home/views/index.vue'),
    meta: { isHome: true, process: false, tabLabelKey: 'menu.finance.home' },
  },
  {
    path: '/inventory',
    name: 'finance-inventory',
    component: () => import('../../modules/inventory/views/index.vue'),
    meta: {
      labelKey: 'menu.finance.inventoryManagement',
      breadcrumbs: [
        { labelKey: 'menu.finance.inventoryManagement', icon: 'Box' },
      ],
      tabLabelKey: 'menu.finance.inventoryManagement',
    },
  },
  {
    path: '/inventory/result',
    name: 'finance-inventory-result',
    component: () => import('../../modules/inventory/views/result/index.vue'),
    meta: {
      labelKey: 'menu.finance.inventoryManagement.result',
      breadcrumbs: [
        { labelKey: 'menu.finance.inventoryManagement', icon: 'Box' },
        { labelKey: 'menu.finance.inventoryManagement.result', icon: 'List' },
      ],
      tabLabelKey: 'menu.finance.inventoryManagement.result',
    },
  },
];

/**
 * 获取路由配置
 * - qiankun 模式：直接返回页面路由（由主应用提供 Layout）
 * - layout-app 模式：直接返回页面路由（由 layout-app 提供 Layout）
 * - 独立运行时：使用 AppLayout 包裹所有路由（与物流域保持一致）
 */
export const getFinanceRoutes = (): RouteRecordRaw[] => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 如果使用 layout-app，直接返回页面路由（layout-app 会提供布局）
  if (isUsingLayoutApp) {
    return pageRoutes;
  }

  // 独立运行且不使用 layout-app：使用 AppLayout 包裹所有路由
  const routes = isStandalone
    ? [
        {
          path: '/',
          component: AppLayout, // Use AppLayout from shared package
          children: pageRoutes,
        },
      ]
    : pageRoutes;
  return routes;
};

// 为了向后兼容，也导出一个常量（在模块加载时检测）
export const financeRoutes: RouteRecordRaw[] = getFinanceRoutes();
