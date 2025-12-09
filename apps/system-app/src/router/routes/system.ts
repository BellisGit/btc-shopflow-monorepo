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
    path: 'data/inventory/bom',
    name: 'DataInventoryBom',
    component: () => import('../../modules/data/views/inventory/bom/index.vue'),
    meta: { titleKey: 'menu.inventory.dataSource.bom' },
  },
  {
    path: 'data/inventory/list',
    name: 'DataInventoryList',
    component: () => import('../../modules/data/views/inventory/list/index.vue'),
    meta: { titleKey: 'menu.inventory.dataSource.list' },
  },
  {
    path: 'data/inventory/ticket',
    name: 'DataInventoryTicket',
    component: () => import('../../modules/data/views/inventory/ticket/index.vue'),
    meta: { titleKey: 'menu.inventory.dataSource.ticket' },
  },
  {
    path: 'data/inventory/process',
    name: 'DataInventoryProcess',
    component: () => import('../../modules/data/views/inventory/process/index.vue'),
    meta: { titleKey: 'menu.inventory.process' },
  },
  {
    path: 'data/inventory/check',
    name: 'DataInventoryCheck',
    component: () => import('../../modules/data/views/inventory/check/index.vue'),
    meta: { titleKey: 'menu.inventory.result' },
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

