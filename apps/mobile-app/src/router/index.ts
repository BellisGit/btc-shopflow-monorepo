import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

/**
 * 动态导入 @btc/shared-core
 * 所有应用都打包 @btc/shared-core，所以可以直接使用动态导入
 */
async function importSharedCore() {
  return await import('@btc/shared-core');
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/pages/Login.vue'),
    meta: {
      public: true,
      title: '登录',
      isPage: true,
      pageType: 'login'
    },
  },
  {
    path: '/login/sms',
    name: 'LoginSms',
    component: () => import('@/modules/auth/pages/LoginSms.vue'),
    meta: {
      public: true,
      title: '短信验证码登录',
      isPage: true,
      pageType: 'login'
    },
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/modules/auth/register/pages/Register.vue'),
    meta: {
      public: true,
      title: '新用户注册',
      isPage: true
    },
  },
  {
    path: '/auth/phone-author',
    name: 'PhoneAuthor',
    component: () => import('@/modules/auth/pages/PhoneAuthor.vue'),
    meta: {
      public: true,
      title: '授权登录',
      isPage: true
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
          isPage: true
        },
      },
      {
        path: 'query',
        name: 'Query',
        component: () => import('@/modules/base/pages/Query.vue'),
        meta: {
          title: '查询',
          isPage: true
        },
      },
      {
        path: 'scanner',
        name: 'Scanner',
        component: () => import('@/modules/inventory/pages/Scanner.vue'),
        meta: {
          title: '扫码',
          isPage: true
        },
      },
      {
        path: 'inventory/sessions',
        name: 'InventorySessions',
        component: () => import('@/modules/inventory/pages/SessionList.vue'),
        meta: {
          title: '盘点会话',
          isPage: true
        },
      },
      {
        path: 'inventory/scanner/:sessionId?',
        name: 'InventoryScanner',
        component: () => import('@/modules/inventory/pages/Scanner.vue'),
        meta: {
          title: '扫码盘点',
          isPage: true
        },
      },
      {
        path: 'inventory/entry',
        name: 'InventoryEntry',
        component: () => import('@/modules/inventory/pages/CountEntry.vue'),
        meta: {
          title: '录入盘点',
          isPage: true
        },
      },
      {
        path: 'sync',
        name: 'Sync',
        component: () => import('@/modules/sync/pages/SyncStatus.vue'),
        meta: {
          title: '数据同步',
          isPage: true
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
      isPage: true,
      pageType: 'error'
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由级别loading的延迟定时器
let routeLoadingTimer: ReturnType<typeof setTimeout> | null = null;
// 路由级别loading的延迟时间（毫秒）
const ROUTE_LOADING_DELAY = 300;

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

  // 后端使用 httpOnly cookie 进行认证，前端无法读取
  // 所有页面都直接放行，由后端 API 来验证 cookie
  // 如果 API 返回 401，HTTP 拦截器会处理跳转到登录页
  // 公开页面（登录、注册、手机号登录等）直接放行
  if (to.meta.public) {
    next();
    return;
  }

  // 需要认证的页面也直接放行，由后端 API 验证
  // 如果后端返回 401，HTTP 拦截器会处理

  // 清除之前的延迟定时器
  if (routeLoadingTimer) {
    clearTimeout(routeLoadingTimer);
    routeLoadingTimer = null;
  }

  // 检查是否有应用级别loading正在显示
  const isAppLoadingVisible = ((): boolean => {
    try {
      const appLoadingEl = document.querySelector('.app-loading') as HTMLElement;
      if (!appLoadingEl) {
        return false;
      }
      const style = window.getComputedStyle(appLoadingEl);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             parseFloat(style.opacity) > 0;
    } catch (e) {
      return false;
    }
  })();

  // 延迟显示路由loading（如果应用loading未显示）
  if (!isAppLoadingVisible) {
    routeLoadingTimer = setTimeout(async () => {
      try {
        const sharedCore = await importSharedCore();
        if (sharedCore?.routeLoadingService) {
          sharedCore.routeLoadingService.show();
        }
      } catch (error) {
        // 静默失败
      }
    }, ROUTE_LOADING_DELAY);
  }

  next();
});

// 路由后置守卫：清除路由loading的延迟定时器并隐藏路由loading
router.afterEach(async () => {
  // 清除延迟定时器
  if (routeLoadingTimer) {
    clearTimeout(routeLoadingTimer);
    routeLoadingTimer = null;
  }
  
  // 隐藏路由loading
  try {
    const sharedCore = await importSharedCore();
    if (sharedCore?.routeLoadingService) {
      sharedCore.routeLoadingService.hide();
    }
  } catch (error) {
    // 静默失败
  }
});

// 关键：参考 cool-admin，在路由解析完成后立即关闭 Loading（beforeResolve）
// 这样可以在路由解析完成后、组件渲染前就关闭 loading，比等待应用挂载更快
// 关键优化：立即关闭 loading，确保与 cool-admin 一致的性能
let loadingClosed = false;
router.beforeResolve(async () => {
  // 清除路由loading的延迟定时器（路由即将解析完成，不需要再显示路由loading）
  if (routeLoadingTimer) {
    clearTimeout(routeLoadingTimer);
    routeLoadingTimer = null;
  }
  
  // 隐藏路由loading（如果正在显示）
  try {
    const sharedCore = await importSharedCore();
    if (sharedCore?.routeLoadingService) {
      sharedCore.routeLoadingService.hide();
    }
  } catch (error) {
    // 静默失败
  }

  if (!loadingClosed) {
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      // 关键：立即隐藏并移除 loading，确保与 cool-admin 一致的性能
      // 使用内联样式确保优先级，立即隐藏
      loadingEl.style.setProperty('display', 'none', 'important');
      loadingEl.style.setProperty('visibility', 'hidden', 'important');
      loadingEl.style.setProperty('opacity', '0', 'important');
      loadingEl.style.setProperty('pointer-events', 'none', 'important');
      loadingEl.classList.add('is-hide');
      
      // 延迟移除 DOM 元素（不影响显示，只是清理）
      setTimeout(() => {
        try {
          loadingEl.remove();
        } catch {
          // 忽略移除错误
        }
      }, 350);
      
      loadingClosed = true;
    }
  }
});

export default router;

