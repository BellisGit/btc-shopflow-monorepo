import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { AppLayout } from '@btc/shared-components';

// 基础路由（页面组件）
const pageRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'logistics-home',
    component: () => import('../../modules/home/views/index.vue'),
      meta: { isHome: true, process: false, tabLabelKey: 'app.placeholder.disabledHome' },
  },
  {
    path: '/procurement',
    name: 'logistics-procurement',
    component: () => import('../../modules/procurement/views/index.vue'),
    meta: {
      tabLabelKey: 'menu.procurement',
      labelKey: 'menu.procurement',
      breadcrumbs: [
        { labelKey: 'menu.procurement', icon: 'ShoppingCart' },
      ],
    },
  },
  {
    path: '/procurement/auxiliary',
    name: 'logistics-procurement-auxiliary',
    component: () => import('../../modules/procurement/views/auxiliary/index.vue'),
    meta: {
      labelKey: 'menu.procurement.auxiliary',
      breadcrumbs: [
        { labelKey: 'menu.procurement', icon: 'ShoppingCart' },
        { labelKey: 'menu.procurement.auxiliary', icon: 'Collection' },
      ],
      tabLabelKey: 'menu.procurement.auxiliary',
    },
  },
  {
    path: '/procurement/packaging',
    name: 'logistics-procurement-packaging',
    component: () => import('../../modules/procurement/views/packaging/index.vue'),
    meta: {
      labelKey: 'menu.procurement.packaging',
      breadcrumbs: [
        { labelKey: 'menu.procurement', icon: 'ShoppingCart' },
        { labelKey: 'menu.procurement.packaging', icon: 'CollectionTag' },
      ],
      tabLabelKey: 'menu.procurement.packaging',
    },
  },
  {
    path: '/procurement/supplier',
    name: 'logistics-procurement-supplier',
    component: () => import('../../modules/procurement/views/supplier/index.vue'),
    meta: {
      labelKey: 'menu.procurement.supplier',
      breadcrumbs: [
        { labelKey: 'menu.procurement', icon: 'ShoppingCart' },
        { labelKey: 'menu.procurement.supplier', icon: 'User' },
      ],
      tabLabelKey: 'menu.procurement.supplier',
    },
  },
  {
    path: '/warehouse',
    name: 'logistics-warehouse',
    component: () => import('../../modules/warehouse/views/index.vue'),
    meta: {
      tabLabelKey: 'menu.warehouse',
      labelKey: 'menu.warehouse',
      breadcrumbs: [
        { labelKey: 'menu.warehouse', icon: 'FolderOpened' },
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
      labelKey: 'menu.warehouse.material.list',
      breadcrumbs: [
        { labelKey: 'menu.warehouse', icon: 'FolderOpened' },
        { labelKey: 'menu.warehouse.material', icon: 'Files' },
        { labelKey: 'menu.warehouse.material.list', icon: 'List' },
      ],
      tabLabelKey: 'menu.warehouse.material.list',
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
      labelKey: 'menu.inventory_management.storage_location',
      breadcrumbs: [
        { labelKey: 'menu.inventory_management', icon: 'Odometer' },
        { labelKey: 'menu.inventory_management.storage_location', icon: 'Location' },
      ],
      tabLabelKey: 'menu.inventory_management.storage_location',
    },
  },
  {
    path: '/inventory/info',
    name: 'logistics-inventory-info',
    component: () => import('../../modules/inventory/views/info/index.vue'),
    meta: {
      labelKey: 'menu.inventory_management.info',
      breadcrumbs: [
        { labelKey: 'menu.inventory_management', icon: 'Odometer' },
        { labelKey: 'menu.inventory_management.info', icon: 'Document' },
      ],
      tabLabelKey: 'menu.inventory_management.info',
    },
  },
  {
    path: '/inventory/detail',
    name: 'logistics-inventory-detail',
    component: () => import('../../modules/inventory/views/detail/index.vue'),
    meta: {
      labelKey: 'menu.inventory_management.detail',
      breadcrumbs: [
        { labelKey: 'menu.inventory_management', icon: 'Odometer' },
        { labelKey: 'menu.inventory_management.detail', icon: 'Histogram' },
      ],
      tabLabelKey: 'menu.inventory_management.detail',
    },
  },
  {
    path: '/inventory/result',
    name: 'logistics-inventory-result',
    component: () => import('../../modules/inventory/views/result/index.vue'),
    meta: {
      labelKey: 'menu.inventory_management.result',
      breadcrumbs: [
        { labelKey: 'menu.inventory_management', icon: 'Odometer' },
        { labelKey: 'menu.inventory_management.result', icon: 'List' },
      ],
      tabLabelKey: 'menu.inventory_management.result',
    },
  },
  {
    path: '/customs',
    name: 'logistics-customs',
    component: () => import('../../modules/customs/views/index.vue'),
    meta: {
      tabLabelKey: 'menu.customs_module',
      labelKey: 'menu.customs_module',
      breadcrumbs: [
        { labelKey: 'menu.overview', icon: 'Coin' },
        { labelKey: 'menu.customs_module', icon: 'MapLocation' },
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
      labelKey: 'menu.warehouse.config.storage_location',
      breadcrumbs: [
        { labelKey: 'menu.warehouse', icon: 'FolderOpened' },
        { labelKey: 'menu.warehouse.config', icon: 'Setting' },
        { labelKey: 'menu.warehouse.config.storage_location', icon: 'Location' },
      ],
      tabLabelKey: 'menu.warehouse.config.storage_location',
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
