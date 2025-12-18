import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { AppLayout } from '@btc/shared-components';

// 基础路由（页面组件）
const pageRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'logistics-home',
    component: () => import('../../modules/home/views/index.vue'),
    meta: { isHome: true, process: false, tabLabelKey: 'logistics.placeholder.disabledHome' },
  },
  {
    path: '/procurement',
    name: 'logistics-procurement',
    component: () => import('../../modules/procurement/views/index.vue'),
    meta: {
      tabLabelKey: 'menu.logistics.procurementModule',
      labelKey: 'menu.logistics.procurementModule',
      breadcrumbs: [
        { labelKey: 'menu.logistics.procurementModule', icon: 'ShoppingCart' },
      ],
    },
  },
  {
    path: '/procurement/auxiliary',
    name: 'logistics-procurement-auxiliary',
    component: () => import('../../modules/procurement/views/auxiliary/index.vue'),
    meta: {
      labelKey: 'menu.logistics.procurement.auxiliary',
      breadcrumbs: [
        { labelKey: 'menu.logistics.procurementModule', icon: 'ShoppingCart' },
        { labelKey: 'menu.logistics.procurement.auxiliary', icon: 'Collection' },
      ],
      tabLabelKey: 'menu.logistics.procurement.auxiliary',
    },
  },
  {
    path: '/procurement/packaging',
    name: 'logistics-procurement-packaging',
    component: () => import('../../modules/procurement/views/packaging/index.vue'),
    meta: {
      labelKey: 'menu.logistics.procurement.packaging',
      breadcrumbs: [
        { labelKey: 'menu.logistics.procurementModule', icon: 'ShoppingCart' },
        { labelKey: 'menu.logistics.procurement.packaging', icon: 'CollectionTag' },
      ],
      tabLabelKey: 'menu.logistics.procurement.packaging',
    },
  },
  {
    path: '/procurement/supplier',
    name: 'logistics-procurement-supplier',
    component: () => import('../../modules/procurement/views/supplier/index.vue'),
    meta: {
      labelKey: 'menu.logistics.procurement.supplier',
      breadcrumbs: [
        { labelKey: 'menu.logistics.procurementModule', icon: 'ShoppingCart' },
        { labelKey: 'menu.logistics.procurement.supplier', icon: 'User' },
      ],
      tabLabelKey: 'menu.logistics.procurement.supplier',
    },
  },
  {
    path: '/warehouse',
    name: 'logistics-warehouse',
    component: () => import('../../modules/warehouse/views/index.vue'),
    meta: {
      tabLabelKey: 'menu.logistics.warehouseModule',
      labelKey: 'menu.logistics.warehouseModule',
      breadcrumbs: [
        { labelKey: 'menu.logistics.warehouseModule', icon: 'FolderOpened' },
      ],
    },
  },
  {
    path: '/warehouse/material',
    redirect: '/warehouse/material/list',
    meta: {
      process: false,
    },
  },
  {
    path: '/warehouse/material/list',
    name: 'logistics-warehouse-material-list',
    component: () => import('../../modules/warehouse/views/material/list/index.vue'),
    meta: {
      labelKey: 'menu.logistics.warehouse.material.list',
      breadcrumbs: [
        { labelKey: 'menu.logistics.warehouseModule', icon: 'FolderOpened' },
        { labelKey: 'menu.logistics.warehouse.material', icon: 'Files' },
        { labelKey: 'menu.logistics.warehouse.material.list', icon: 'List' },
      ],
      tabLabelKey: 'menu.logistics.warehouse.material.list',
    },
  },
  {
    path: '/inventory',
    redirect: '/inventory/info',
    meta: {
      process: false,
    },
  },
  {
    path: '/inventory/storage-location',
    name: 'logistics-inventory-storage-location',
    component: () => import('../../modules/warehouse/views/config/storage-location/index.vue'),
    meta: {
      labelKey: 'menu.logistics.inventoryManagement.storageLocation',
      breadcrumbs: [
        { labelKey: 'menu.logistics.inventoryManagement', icon: 'Odometer' },
        { labelKey: 'menu.logistics.inventoryManagement.storageLocation', icon: 'Location' },
      ],
      tabLabelKey: 'menu.logistics.inventoryManagement.storageLocation',
    },
  },
  {
    path: '/inventory/info',
    name: 'logistics-inventory-info',
    component: () => import('../../modules/inventory/views/info/index.vue'),
    meta: {
      labelKey: 'menu.logistics.inventoryManagement.info',
      breadcrumbs: [
        { labelKey: 'menu.logistics.inventoryManagement', icon: 'Odometer' },
        { labelKey: 'menu.logistics.inventoryManagement.info', icon: 'Document' },
      ],
      tabLabelKey: 'menu.logistics.inventoryManagement.info',
    },
  },
  {
    path: '/inventory/detail',
    name: 'logistics-inventory-detail',
    component: () => import('../../modules/inventory/views/detail/index.vue'),
    meta: {
      labelKey: 'menu.logistics.inventoryManagement.detail',
      breadcrumbs: [
        { labelKey: 'menu.logistics.inventoryManagement', icon: 'Odometer' },
        { labelKey: 'menu.logistics.inventoryManagement.detail', icon: 'Histogram' },
      ],
      tabLabelKey: 'menu.logistics.inventoryManagement.detail',
    },
  },
  {
    path: '/inventory/result',
    name: 'logistics-inventory-result',
    component: () => import('../../modules/inventory/views/result/index.vue'),
    meta: {
      labelKey: 'menu.logistics.inventoryManagement.result',
      breadcrumbs: [
        { labelKey: 'menu.logistics.inventoryManagement', icon: 'Odometer' },
        { labelKey: 'menu.logistics.inventoryManagement.result', icon: 'List' },
      ],
      tabLabelKey: 'menu.logistics.inventoryManagement.result',
    },
  },
  {
    path: '/customs',
    name: 'logistics-customs',
    component: () => import('../../modules/customs/views/index.vue'),
    meta: {
      tabLabelKey: 'logistics.menu.customsModule',
      labelKey: 'menu.logistics.customsModule',
      breadcrumbs: [
        { labelKey: 'menu.logistics.overview', icon: 'Coin' },
        { labelKey: 'menu.logistics.customsModule', icon: 'MapLocation' },
      ],
    },
  },
  {
    path: '/warehouse/config',
    redirect: '/warehouse/config/storage-location',
    meta: {
      process: false,
    },
  },
  {
    path: '/warehouse/config/storage-location',
    name: 'logistics-warehouse-config-storage-location',
    component: () => import('../../modules/warehouse/views/config/storage-location/index.vue'),
    meta: {
      labelKey: 'menu.logistics.warehouse.config.storageLocation',
      breadcrumbs: [
        { labelKey: 'menu.logistics.warehouseModule', icon: 'FolderOpened' },
        { labelKey: 'menu.logistics.warehouse.config', icon: 'Setting' },
        { labelKey: 'menu.logistics.warehouse.config.storageLocation', icon: 'Location' },
      ],
      tabLabelKey: 'menu.logistics.warehouse.config.storageLocation',
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
