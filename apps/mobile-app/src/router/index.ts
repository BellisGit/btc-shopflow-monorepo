import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/pages/Login.vue'),
    meta: {
      public: true,
      title: '登录',
    },
  },
  {
    path: '/',
    component: () => import('@/modules/base/components/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/modules/base/pages/Home.vue'),
        meta: {
          title: '首页',
        },
      },
      {
        path: 'inventory/sessions',
        name: 'InventorySessions',
        component: () => import('@/modules/inventory/pages/SessionList.vue'),
        meta: {
          title: '盘点会话',
        },
      },
      {
        path: 'inventory/scanner/:sessionId?',
        name: 'InventoryScanner',
        component: () => import('@/modules/inventory/pages/Scanner.vue'),
        meta: {
          title: '扫码盘点',
        },
      },
      {
        path: 'inventory/entry',
        name: 'InventoryEntry',
        component: () => import('@/modules/inventory/pages/CountEntry.vue'),
        meta: {
          title: '录入盘点',
        },
      },
      {
        path: 'sync',
        name: 'Sync',
        component: () => import('@/modules/sync/pages/SyncStatus.vue'),
        meta: {
          title: '数据同步',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/modules/base/pages/NotFound.vue'),
    meta: {
      title: '页面不存在',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.public || authStore.isAuthenticated) {
    next();
  } else {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  }
});

export default router;

