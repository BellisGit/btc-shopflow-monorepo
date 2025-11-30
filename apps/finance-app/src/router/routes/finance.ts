import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { AppLayout } from '@btc/shared-components';

// 判断是否独立运行
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;

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
        { labelKey: 'menu.finance.inventoryManagement' },
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
        { labelKey: 'menu.finance.inventoryManagement' },
        { labelKey: 'menu.finance.inventoryManagement.result' },
      ],
      tabLabelKey: 'menu.finance.inventoryManagement.result',
    },
  },
];

// 独立运行时：使用 AppLayout 包裹所有路由
// qiankun 模式：直接返回页面路由（由主应用提供 Layout）
export const financeRoutes: RouteRecordRaw[] = isStandalone
  ? [
      {
        path: '/',
        component: AppLayout, // Use AppLayout from shared package
        children: pageRoutes,
      },
    ]
  : pageRoutes;
