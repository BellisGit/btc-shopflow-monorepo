import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { getCookie } from '@/utils/cookie';

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
    path: '/login/sms',
    name: 'LoginSms',
    component: () => import('@/modules/auth/pages/LoginSms.vue'),
    meta: {
      public: true,
      title: '短信验证码登录',
    },
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/modules/auth/register/pages/Register.vue'),
    meta: {
      public: true,
      title: '新用户注册',
    },
  },
  {
    path: '/',
    component: () => import('@/modules/base/components/Layout.vue'),
    redirect: '/query',
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
        path: 'query',
        name: 'Query',
        component: () => import('@/modules/base/pages/Query.vue'),
        meta: {
          title: '查询',
        },
      },
      {
        path: 'scanner',
        name: 'Scanner',
        component: () => import('@/modules/inventory/pages/Scanner.vue'),
        meta: {
          title: '扫码',
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
    next();
    return;
  }

  const authStore = useAuthStore();
  
  // 在路由守卫中，如果 store 中没有 token，但 cookie 中有 token，尝试同步
  // 这可以处理从其他应用登录后，cookie 已经设置但 store 未初始化的情况
  // 注意：如果 cookie 是 http-only，getCookie 无法读取，但浏览器会自动在请求中发送
  // 所以即使无法读取 cookie，如果有用户信息，也应该认为已登录（由后端验证）
  if (!authStore.isAuthenticated) {
    const cookieToken = getCookie('access_token');
    if (cookieToken) {
      authStore.setToken(cookieToken);
    }
    // 如果无法读取 cookie（可能是 http-only），但有用户信息，也应该认为已登录
    // 这种情况下，浏览器会自动发送 cookie，由后端验证
  }

  // 如果用户已登录，访问登录页时重定向到查询页面或 redirect 参数指定的页面
  if (to.meta.public && authStore.isAuthenticated) {
    const redirect = (to.query.redirect as string) || '/query';
    // 只取路径部分，忽略查询参数，避免循环重定向
    const redirectPath = redirect.split('?')[0];
    next(redirectPath);
    return;
  }

  // 公开页面（登录、注册、手机号登录等）直接放行
  if (to.meta.public) {
    next();
    return;
  }

  // 需要认证的页面
  if (authStore.isAuthenticated) {
    next();
  } else {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  }
});

export default router;

