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
    path: '/auth/phone-login',
    name: 'PhoneLogin',
    component: () => import('@/modules/auth/pages/PhoneLogin.vue'),
    meta: {
      public: true,
      title: '手机号登录',
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
  // 移除 manifest 路由，让 Vite/VitePWA 直接提供文件
  // 注意：不要在这里定义 manifest 路由，否则会拦截 Vite 的静态文件服务
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
  // 排除静态资源路径，这些路径不应该进入 Vue Router
  // 应该由 Vite 开发服务器直接提供，但如果进入了路由系统，直接放行
  // 特别注意：manifest.webmanifest 必须完全排除，否则会拦截 VitePWA 的 manifest 生成
  // 检查路径（去除查询参数和 hash）
  const pathWithoutQuery = to.path.split('?')[0];
  
  if (
    pathWithoutQuery.startsWith('/icons/') ||
    pathWithoutQuery.startsWith('/assets/') ||
    pathWithoutQuery.startsWith('/manifest.webmanifest') || // 使用 startsWith 以支持版本号参数
    pathWithoutQuery === '/favicon.ico' ||
    pathWithoutQuery.endsWith('.png') ||
    pathWithoutQuery.endsWith('.svg') ||
    pathWithoutQuery.endsWith('.ico') ||
    pathWithoutQuery.endsWith('.webmanifest')
  ) {
    // 静态资源，直接放行，不进行认证检查
    // 注意：这不会阻止 Vite 提供文件，但如果请求进入了路由系统，至少不会重定向到登录页
    try {
      if ((import.meta as any).env?.DEV && pathWithoutQuery.startsWith('/manifest.webmanifest')) {
        console.log('[Router] Manifest request detected, allowing:', pathWithoutQuery);
      }
    } catch (e) {
      // 生产环境忽略调试日志
    }
    next();
    return;
  }

  const authStore = useAuthStore();

  // 公开页面（登录、注册、手机号登录等）直接放行
  if (to.meta.public) {
    next();
    return;
  }

  // 需要认证的页面
  if (authStore.isAuthenticated) {
    try {
      if ((import.meta as any).env?.DEV) {
        console.log('[Router] Authenticated user, allowing access:', to.path);
      }
    } catch (e) {
      // 生产环境忽略调试日志
    }
    next();
  } else {
    try {
      if ((import.meta as any).env?.DEV) {
        console.log('[Router] Unauthenticated user, redirecting to login:', to.fullPath);
      }
    } catch (e) {
      // 生产环境忽略调试日志
    }
    next({ name: 'Login', query: { redirect: to.fullPath } });
  }
});

export default router;

