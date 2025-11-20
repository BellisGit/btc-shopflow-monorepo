import type { RouteRecordRaw } from 'vue-router';

export const logisticsRoutes: RouteRecordRaw[] = [
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
    path: '/warehouse/inventory',
    redirect: '/warehouse/inventory/info',
    meta: {
      process: false,
    },
  },
  {
    path: '/warehouse/inventory/info',
    name: 'logistics-warehouse-inventory-info',
    component: () => import('../../modules/warehouse/views/inventory/info/index.vue'),
    meta: {
      labelKey: 'menu.logistics.warehouse.inventory.info',
      breadcrumbs: [
        { labelKey: 'menu.logistics.warehouseModule', icon: 'FolderOpened' },
        { labelKey: 'menu.logistics.warehouse.inventory', icon: 'Odometer' },
        { labelKey: 'menu.logistics.warehouse.inventory.info', icon: 'Document' },
      ],
      tabLabelKey: 'menu.logistics.warehouse.inventory.info',
    },
  },
  {
    path: '/warehouse/inventory/detail',
    name: 'logistics-warehouse-inventory-detail',
    component: () => import('../../modules/warehouse/views/inventory/detail/index.vue'),
    meta: {
      labelKey: 'menu.logistics.warehouse.inventory.detail',
      breadcrumbs: [
        { labelKey: 'menu.logistics.warehouseModule', icon: 'FolderOpened' },
        { labelKey: 'menu.logistics.warehouse.inventory', icon: 'Odometer' },
        { labelKey: 'menu.logistics.warehouse.inventory.detail', icon: 'Histogram' },
      ],
      tabLabelKey: 'menu.logistics.warehouse.inventory.detail',
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
    path: '/config',
    name: 'logistics-config',
    component: () => import('../../modules/config/views/index.vue'),
    meta: {
      tabLabelKey: 'menu.logistics.config',
      labelKey: 'menu.logistics.config',
      breadcrumbs: [
        { labelKey: 'menu.logistics.config', icon: 'Setting' },
      ],
    },
  },
  {
    path: '/config/storage-location',
    name: 'logistics-config-storage-location',
    component: () => import('../../modules/config/views/storage-location/index.vue'),
    meta: {
      labelKey: 'menu.logistics.config.storageLocation',
      breadcrumbs: [
        { labelKey: 'menu.logistics.config', icon: 'Setting' },
        { labelKey: 'menu.logistics.config.storageLocation', icon: 'Location' },
      ],
      tabLabelKey: 'menu.logistics.config.storageLocation',
    },
  },
];

