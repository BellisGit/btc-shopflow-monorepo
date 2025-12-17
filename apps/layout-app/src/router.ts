/**
 * layout-app 路由配置
 *
 * 特点：
 * 1. 不包含任何业务路由
 * 2. 包含全局404处理（当qiankun子应用加载失败或路由未匹配时显示）
 * 3. 其他路由交给 qiankun 子应用处理
 */

import { createRouter, createWebHistory } from 'vue-router';

// 路由配置：包含404页面和catchAll路由
const routes = [
  {
    path: '/404',
    name: 'NotFound404',
    component: () => import('./pages/404/index.vue'),
    meta: {
      titleKey: 'common.page_not_found',
    },
  },
  {
    path: '/',
    name: 'root',
    // 空组件，实际内容由 qiankun 子应用提供
    component: { template: '<div></div>' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'subapp',
    // 空组件，实际内容由 qiankun 子应用提供
    // 如果qiankun未匹配到子应用，路由守卫会重定向到404
    component: { template: '<div></div>' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 根据路径获取应用前缀
const getAppPrefix = (pathname: string): string => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/logistics')) return 'logistics';
  if (pathname.startsWith('/engineering')) return 'engineering';
  if (pathname.startsWith('/quality')) return 'quality';
  if (pathname.startsWith('/production')) return 'production';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/monitor')) return 'monitor';
  return 'system';
};

// 初始化：获取当前路径的应用前缀
let previousAppPrefix = getAppPrefix(window.location.pathname);

// 设置全局状态，供路由守卫和qiankun错误处理使用
if (typeof window !== 'undefined') {
  (window as any).__LAYOUT_APP_QIANKUN_LOADING__ = false;
  (window as any).__LAYOUT_APP_QIANKUN_LOAD_FAILED__ = false;
}

// 路由守卫：处理未匹配的路由，在qiankun加载失败时显示404
router.beforeEach((to, _from, next) => {
  // 404页面直接放行
  if (to.path === '/404') {
    next();
    return;
  }

  // 最优先：检查是否是静态 HTML 文件（duty 下的页面）
  // 这些页面应该由服务器直接提供，完全绕过 Vue Router
  if (to.path.startsWith('/duty/')) {
    // 使用 next(false) 取消 Vue Router 的导航，让浏览器直接请求静态文件
    next(false);
    return;
  }

  // 检查是否是公开页面（登录、注册、忘记密码），这些页面不应该重定向到404
  const publicPages = ['/login', '/register', '/forget-password'];
  const isPublicPage = publicPages.includes(to.path);

  if (isPublicPage) {
    // 公开页面，直接放行
    next();
    return;
  }

  // 检查是否是已知的子应用路径前缀
  const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/monitor', '/docs'];
  const isSubAppRoute = knownSubAppPrefixes.some(prefix => to.path.startsWith(prefix));

  if (isSubAppRoute) {
    // 子应用路由：放行让qiankun处理
    // 如果qiankun加载失败，onError会处理并重定向到404
    next();
    return;
  }

  // 其他路由：直接放行（可能是根路径或其他路径，由qiankun或其他逻辑处理）
  next();
});

router.afterEach((to) => {
  // 跳过404页面
  if (to.path === '/404') {
    return;
  }

  const currentAppPrefix = getAppPrefix(to.path);

  // 关键：如果 layout-app 被子应用嵌入（__BTC_LAYOUT_APP_EMBEDDED_BY_SUBAPP__ 为 true），
  // 或者在使用 layout-app 环境下（__USE_LAYOUT_APP__ 为 true，生产环境子域名模式），
  // 每次路由变化都触发 popstate，让子应用能够同步路由并立即渲染内容
  const isEmbeddedBySubApp = typeof window !== 'undefined' && !!(window as any).__BTC_LAYOUT_APP_EMBEDDED_BY_SUBAPP__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  if (isEmbeddedBySubApp || isUsingLayoutApp) {
    // 嵌入模式或 layout-app 模式：每次路由变化都触发 popstate，确保子应用能收到路由同步信号
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        // 触发 popstate 事件，让子应用的 setupHostLocationBridge 能够同步路由
        window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
      });
    });
  } else {
    // 独立运行模式（qiankun 模式）：只在跨应用切换时触发 qiankun 重新匹配
    if (previousAppPrefix && previousAppPrefix !== currentAppPrefix) {
      // 使用 nextTick 确保路由切换完成后再触发
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          // 触发 popstate 事件，让 qiankun 重新匹配路由
          // qiankun 内部使用 single-spa，会监听 popstate 事件来重新匹配应用
          window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
        });
      });
    }
  }

  previousAppPrefix = currentAppPrefix;
});

export default router;

