import type { RouteRecordRaw } from 'vue-router';

export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'system-home',
    component: () => import('../../modules/home/views/index.vue'),
    meta: { isHome: true, process: false, tabLabelKey: 'menu.system.home' },
  },
  // 数据管理
  {
    path: '/data/files/list',
    name: 'DataFilesList',
    component: () => import('../../modules/data/views/files/list/index.vue'),
    meta: { titleKey: 'menu.data.files.list' },
  },
  {
    path: '/data/files/templates',
    name: 'DataFilesTemplates',
    component: () => import('../../modules/data/views/files/templates/index.vue'),
    meta: { titleKey: 'menu.data.files.templates' },
  },
  {
    path: '/data/files/preview',
    name: 'DataFilesPreview',
    component: () => import('../../modules/data/views/files/preview/index.vue'),
    meta: { titleKey: 'menu.data.files.preview' },
  },
  {
    path: '/data/inventory/check',
    name: 'DataInventoryCheck',
    component: () => import('../../modules/data/views/inventory/check/index.vue'),
    meta: { titleKey: 'menu.data.inventory' },
  },
  {
    path: '/data/dictionary',
    redirect: '/data/dictionary/file-categories',
  },
  {
    path: '/data/dictionary/file-categories',
    name: 'DataDictionaryFileCategories',
    component: () => import('../../modules/data/views/dictionary/file-categories/index.vue'),
    meta: { titleKey: 'menu.data.dictionary.file_categories' },
  },
  {
    path: '/data/recycle',
    name: 'DataRecycle',
    component: () => import('../../modules/data/views/recycle/index.vue'),
    meta: { titleKey: 'menu.data.recycle' },
  },
];

