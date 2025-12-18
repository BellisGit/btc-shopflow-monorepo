import type { RouteRecordRaw } from 'vue-router';

export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'system-home',
    component: () => import('../../modules/home/views/index.vue'),
    meta: { isHome: true, process: false, tabLabelKey: 'menu.system.home' },
  },
  // 个人信息页面（不在菜单中）
  {
    path: 'profile',
    name: 'Profile',
    component: () => import('../../pages/profile/index.vue'),
    meta: {
      titleKey: 'common.profile',
      // 不在菜单中显示
    },
  },
  // 数据管理
  {
    path: 'data/files/list',
    name: 'DataFilesList',
    component: () => import('../../modules/data/views/files/list/index.vue'),
    meta: { titleKey: 'menu.data.files.list' },
  },
  {
    path: 'data/files/template',
    name: 'DataFilesTemplate',
    component: () => import('../../modules/data/views/files/template/index.vue'),
    meta: { titleKey: 'menu.data.files.template' },
  },
  {
    path: 'data/files/preview',
    name: 'DataFilesPreview',
    component: () => import('../../modules/data/views/files/preview/index.vue'),
    meta: { titleKey: 'menu.data.files.preview' },
  },
  {
    path: 'inventory/dataSource/bom',
    name: 'InventoryDataSourceBom',
    component: () => import('../../modules/data/views/inventory/bom/index.vue'),
    meta: { titleKey: 'menu.inventory.dataSource.bom' },
  },
  {
    path: 'inventory/dataSource/list',
    name: 'InventoryDataSourceList',
    component: () => import('../../modules/data/views/inventory/list/index.vue'),
    meta: { titleKey: 'menu.inventory.dataSource.list' },
  },
  {
    path: 'inventory/dataSource/ticket',
    name: 'InventoryDataSourceTicket',
    component: () => import('../../modules/data/views/inventory/ticket/index.vue'),
    meta: { titleKey: 'menu.inventory.dataSource.ticket' },
  },
  {
    path: 'inventory/process',
    name: 'InventoryProcess',
    component: () => import('../../modules/data/views/inventory/process/index.vue'),
    meta: { titleKey: 'menu.inventory.process' },
  },
  {
    path: 'inventory/check',
    name: 'InventoryCheck',
    component: () => import('../../modules/data/views/inventory/check/index.vue'),
    meta: { titleKey: 'menu.inventory.result' },
  },
  {
    path: 'inventory/confirm',
    name: 'InventoryConfirm',
    component: () => import('../../modules/data/views/inventory/confirm/index.vue'),
    meta: { titleKey: 'menu.inventory.confirm' },
  },
  {
    path: 'data/dictionary',
    redirect: 'data/dictionary/file-categories',
  },
  {
    path: 'data/dictionary/file-categories',
    name: 'DataDictionaryFileCategories',
    component: () => import('../../modules/data/views/dictionary/file-categories/index.vue'),
    meta: { titleKey: 'menu.data.dictionary.file_categories' },
  },
  {
    path: 'data/recycle',
    name: 'DataRecycle',
    component: () => import('../../modules/data/views/recycle/index.vue'),
    meta: { titleKey: 'menu.data.recycle' },
  },
];

