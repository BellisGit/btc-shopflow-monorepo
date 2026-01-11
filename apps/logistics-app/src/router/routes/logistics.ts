import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout } from '@btc/shared-components';

// 基础路由（页面组件）
export const pageRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/procurement',
    meta: {
      process: false,
    },
  },
  {
    path: '/procurement',
    name: 'LogisticsProcurement',
    component: () => import('../../modules/procurement/views/index.vue'),
    meta: {
      titleKey: 'menu.procurement',
    },
  },

  {
    path: '/procurement/auxiliary',
    name: 'LogisticsProcurementAuxiliary',
    component: () => import('../../modules/procurement/views/auxiliary/index.vue'),
    meta: {
      titleKey: 'menu.procurement.auxiliary',
    },
  },
  {
    path: '/procurement/packaging',
    name: 'LogisticsProcurementPackaging',
    component: () => import('../../modules/procurement/views/packaging/index.vue'),
    meta: {
      titleKey: 'menu.procurement.packaging',
    },
  },
  {
    path: '/procurement/supplier',
    name: 'LogisticsProcurementSupplier',
    component: () => import('../../modules/procurement/views/supplier/index.vue'),
    meta: {
      titleKey: 'menu.procurement.supplier',
    },
  },
  {
    path: '/warehouse',
    name: 'LogisticsWarehouse',
    component: () => import('../../modules/warehouse/views/index.vue'),
    meta: {
      titleKey: 'menu.warehouse',
    },
  },
  {
    path: '/warehouse/material',
    name: 'LogisticsWarehouseMaterial',
    component: () => import('../../modules/warehouse/views/material/index.vue'),
    meta: {
      titleKey: 'menu.warehouse.material',
    },
  },
  {
    path: '/inventory',
    name: 'LogisticsInventory',
    component: () => import('../../modules/inventory/views/index.vue'),
    meta: {
      titleKey: 'menu.inventory_management',
    },
  },
  {
    path: '/inventory/storage-location',
    name: 'LogisticsInventoryStorageLocation',
    component: () => import('../../modules/warehouse/views/config/storage-location/index.vue'),
    meta: {
      titleKey: 'menu.inventory_management.storage_location',
    },
  },
  {
    path: '/inventory/info',
    name: 'LogisticsInventoryInfo',
    component: () => import('../../modules/inventory/views/info/index.vue'),
    meta: {
      titleKey: 'menu.inventory_management.info',
    },
  },
  {
    path: '/inventory/detail',
    name: 'LogisticsInventoryDetail',
    component: () => import('../../modules/inventory/views/detail/index.vue'),
    meta: {
      titleKey: 'menu.inventory_management.detail',
    },
  },
  {
    path: '/inventory/result',
    name: 'LogisticsInventoryResult',
    component: () => import('../../modules/inventory/views/result/index.vue'),
    meta: {
      titleKey: 'menu.inventory_management.result',
    },
  },
  {
    path: '/customs',
    name: 'LogisticsCustoms',
    component: () => import('../../modules/customs/views/index.vue'),
    meta: {
      titleKey: 'menu.customs_module',
    },
  },
];

/**
 * 获取路由配置
 * - qiankun 模式：直接返回页面路由（由主应用提供 Layout）
 * - layout-app 模式：直接返回页面路由（由 layout-app 提供 Layout）
 * - 独立运行时：使用 AppLayout 包裹所有路由
 * 注意：在函数中动态检测 isStandalone 和 isUsingLayoutApp，确保在运行时正确检测
 */
export const getLogisticsRoutes = (): RouteRecordRaw[] => {
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
export const logisticsRoutes: RouteRecordRaw[] = getLogisticsRoutes();
