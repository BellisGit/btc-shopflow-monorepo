import type { RouteRecordRaw } from 'vue-router';

export const financeRoutes: RouteRecordRaw[] = [
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

