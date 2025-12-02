import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type RouteLocationNormalized,
} from 'vue-router';
import Layout from '../modules/base/components/layout/index.vue';
import { config } from '../config';
import { tSync } from '../i18n/getters';
// 使用动态导入避免循环依赖
// import { useProcessStore, getCurrentAppFromPath } from '../store/process';
import { registerManifestTabsForApp, registerManifestMenusForApp } from '../micro/index';
import { systemRoutes } from './routes/system';
import { getCookie } from '../utils/cookie';
import { appStorage } from '../utils/app-storage';

const routes: RouteRecordRaw[] = [
  // 登录页面（不在 Layout 中）- 使用根目录 auth 包
  {
    path: '/login',
    name: 'Login',
    component: () => import('@auth/login/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.login'
    }
  },
  // 忘记密码页面（不在 Layout 中）- 使用根目录 auth 包
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('@auth/forget-password/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.login.password.forgot'
    }
  },
  // 注册页面（不在 Layout 中）- 使用根目录 auth 包
  {
    path: '/register',
    name: 'Register',
    component: () => import('@auth/register/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.register'
    }
  },
  // 系统域路由（主应用路由）
  {
    path: '/',
    component: Layout,
    children: systemRoutes,
  },
  // 子应用路由占位（qiankun会接管，这里只需要Layout）
  {
    path: '/admin',
    component: Layout,
    meta: { title: 'Admin App', isHome: true, isSubApp: true },
  },
  {
    path: '/admin/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Admin App', isSubApp: true },
  },
  {
    path: '/logistics',
    component: Layout,
    meta: { title: 'Logistics App', isHome: true, isSubApp: true },
  },
  {
    path: '/logistics/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Logistics App', isSubApp: true },
  },
  {
    path: '/engineering',
    component: Layout,
    meta: { title: 'Engineering App', isHome: true, isSubApp: true },
  },
  {
    path: '/engineering/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Engineering App', isSubApp: true },
  },
  {
    path: '/quality',
    component: Layout,
    meta: { title: 'Quality App', isHome: true, isSubApp: true },
  },
  {
    path: '/quality/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Quality App', isSubApp: true },
  },
  {
    path: '/production',
    component: Layout,
    meta: { title: 'Production App', isHome: true, isSubApp: true },
  },
  {
    path: '/production/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Production App', isSubApp: true },
  },
  {
    path: '/finance',
    component: Layout,
    meta: { title: 'Finance App', isHome: true, isSubApp: true },
  },
  {
    path: '/finance/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Finance App', isSubApp: true },
  },
];

// 创建 router 实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true,
});

// 保存当前路由，用于语言切换时更新标题
let currentRoute: RouteLocationNormalized | null = null;

/**
 * 更新浏览器标题（同步，无闪烁）
 * 使用 meta.titleKey 作为单一事实来源
 */
function updateDocumentTitle(to: RouteLocationNormalized) {
  currentRoute = to;

  const titleKey = to.meta?.titleKey as string | undefined;

  if (titleKey) {
    // 同步获取国际化标题
    const translatedTitle = tSync(titleKey);

    // 如果返回的是键值本身，说明国际化还没加载完成，延迟重试
    if (translatedTitle === titleKey) {
      // 先设置默认标题，避免显示 key
      document.title = config.app.name;

      // 多次重试翻译，确保国际化加载完成
      const retryTranslation = (attempt: number = 1) => {
        if (attempt > 5) return; // 最多重试5次

        setTimeout(() => {
          const retryTitle = tSync(titleKey);
          if (retryTitle !== titleKey) {
            document.title = retryTitle;
          } else {
            // 继续重试
            retryTranslation(attempt + 1);
          }
        }, attempt * 100); // 递增延迟：100ms, 200ms, 300ms, 400ms, 500ms
      };

      retryTranslation();
    } else {
      // 翻译成功，直接设置标题
      document.title = translatedTitle;
    }
  } else {
    // 回退到系统名称
    document.title = config.app.name;
  }
}

/**
 * 监听语言切换，更新浏览器标题（同步方式）
 */
export function setupI18nTitleWatcher() {
  // 监听 localStorage 中的语言变化（跨标签页）
  window.addEventListener('storage', (e) => {
    if (e.key === 'locale' && currentRoute) {
      // 语言切换时，同步更新当前页面的标题
      updateDocumentTitle(currentRoute);
    }
  });

  // 监听自定义事件（同一标签页的语言切换）
  window.addEventListener('language-change', () => {
    if (currentRoute) {
      // 延迟一点时间，确保 i18n 已经更新
      setTimeout(() => {
        updateDocumentTitle(currentRoute!);
      }, 50);
    }
  });
}

/**
 * 检查用户是否已认证
 * 注意：后端设置了 http-only cookie，前端无法直接读取
 * 因此通过检查 localStorage 中的登录状态标记、token 和用户信息来判断
 */
function isAuthenticated(): boolean {
  // 1. 检查登录状态标记（登录成功时设置）
  const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
  if (isLoggedIn) {
    return true;
  }

  // 2. 检查 localStorage 中的 token
  const storageToken = appStorage.auth.getToken();
  if (storageToken) {
    return true;
  }

  // 3. 检查用户信息是否存在
  const userInfo = appStorage.user.get();
  if (userInfo?.id) {
    return true;
  }

  return false;
}

// 路由前置守卫：处理认证、Loading 显示和侧边栏
router.beforeEach((to, from, next) => {
  // 检查是否为公开页面（不需要认证）
  const isPublicPage = to.meta?.public === true;
  const isAuthenticatedUser = isAuthenticated();

  // 如果是登录页且用户已认证，重定向到首页
  if (to.path === '/login' && isAuthenticatedUser) {
    const redirect = (to.query.redirect as string) || '/';
    // 只取路径部分，忽略查询参数，避免循环重定向
    const redirectPath = redirect.split('?')[0];
    next(redirectPath);
    return;
  }

  // 如果不是公开页面，检查认证状态
  if (!isPublicPage) {
    if (!isAuthenticatedUser) {
      // 未认证，重定向到登录页，并保存原始路径以便登录后跳转
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  // 检查是否为文档相关路由（只支持 /docs 前缀）
  const isDocsRoute = to.path === '/docs' || to.path.startsWith('/docs/');

  if (isDocsRoute) {
    // 检查 iframe 是否已经加载完成（通过全局状态）
    const docsIframeLoaded = (window as any).__DOCS_IFRAME_LOADED__ || false;

    if (docsIframeLoaded) {
      // iframe 已加载，瞬间切换（禁用过渡动画）
      document.body.classList.add('docs-mode-instant'); // 禁用动画的类
      document.body.classList.add('docs-mode');

      // 下一帧移除 instant 类，恢复正常动画（为下次切换准备）
      requestAnimationFrame(() => {
        document.body.classList.remove('docs-mode-instant');
      });
    } else {
      // iframe 未加载，显示 Loading（带动画）
      const el = document.getElementById('Loading');
      if (el) {
        // 更新文字
        const titleEl = el.querySelector('.preload__title');
        if (titleEl) {
          titleEl.textContent = '正在加载资源';
        }

        const subtitleEl = el.querySelector('.preload__sub-title');
        if (subtitleEl) {
          subtitleEl.textContent = '部分资源可能加载时间较长，请耐心等待';
        }

        // 显示 Loading
        el.classList.remove('is-hide');
      }
    }
  }

  // 如果从文档中心离开，移除 docs-mode 类
  const wasDocsRoute = from.path === '/docs' || from.path.startsWith('/docs/');

  if (wasDocsRoute && !isDocsRoute) {
    const docsIframeLoaded = (window as any).__DOCS_IFRAME_LOADED__ || false;

    if (docsIframeLoaded) {
      // iframe 已加载，瞬间切换（禁用过渡动画）
      document.body.classList.add('docs-mode-instant'); // 禁用动画的类
      document.body.classList.remove('docs-mode');

      // 下一帧移除 instant 类，恢复正常动画
      requestAnimationFrame(() => {
        document.body.classList.remove('docs-mode-instant');
      });
    }
  }

  // 继续路由导航
  next();
});

// 路由守卫：自动添加标签到 Tabbar（仅主应用路由）
router.afterEach((to) => {
  // 清理所有 ECharts 实例和相关的 DOM 元素（tooltip、toolbox 等），防止页面切换时残留
  // 使用统一的清理函数，自动清理所有图表组件
  try {
    // 动态导入清理函数，避免在路由文件中直接导入导致循环依赖
    import('@btc/shared-components').then(({ cleanupAllECharts }) => {
      cleanupAllECharts();
    }).catch(() => {
      // 如果导入失败，使用备用清理逻辑
      try {
        const tooltipElements = document.querySelectorAll('.echarts-tooltip');
        tooltipElements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
        const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
        toolboxElements.forEach(el => {
          if (el.parentNode && el.parentNode === document.body) {
            el.parentNode.removeChild(el);
          }
        });
      } catch (fallbackError) {
        // 忽略错误
      }
    });
  } catch (error) {
    // 忽略错误
  }
  // 动态更新浏览器标题
  updateDocumentTitle(to);

  // 检查是否是系统域路径（包括根路径、/profile 和 /data/* 路径）
  const isSystemPath = to.path === '/' || to.path === '/profile' || to.path.startsWith('/data');

  // 如果是系统域路径，确保菜单已注册
  if (isSystemPath) {
    registerManifestTabsForApp('system');
    registerManifestMenusForApp('system');
  }

  // 如果是首页（isHome=true），将所有标签设为未激活
  if (to.meta?.isHome === true || to.path === '/') {
    // 动态导入避免循环依赖
    import('../store/process').then(({ useProcessStore }) => {
    const process = useProcessStore();
    process.list.forEach((tab) => {
      tab.active = false;
      });
    }).catch(() => {
      // 忽略错误
    });
    return;
  }

  // 直接跳过标记为子应用的路由
  if (to.meta?.isSubApp === true) {
    return;
  }

  // 规范化路径（移除末尾斜杠）
  const normalizedPath = to.path.replace(/\/$/, '');

  // 跳过子应用的根路径
  const appRoots = ['/', '/admin', '/logistics', '/engineering', '/quality', '/production', '/finance'];
  if (appRoots.includes(normalizedPath)) {
    return;
  }

  // 主应用是系统域（默认域），只处理系统域的路由
  // 子应用路由前缀列表（包括管理域和其他子应用）
  const subAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance'];
  // 检查是否是系统域根路径（精确匹配 /）
  const isSystemRoot = to.path === '/';
  // 检查是否是子应用路由
  const isSubAppRoute = !isSystemRoot && subAppPrefixes.some((prefix) =>
    to.path.startsWith(prefix)
  );

  if (isSubAppRoute || isSystemRoot) {
    return;
  }

  // 只添加有效的系统域路由（必须有 name）
  if (!to.name) {
    return;
  }

  // 跳过个人信息页面（不在菜单中，不需要添加到标签页）
  if (to.path === '/profile') {
    return;
  }

  // 使用 store 添加路由到标签页（动态导入避免循环依赖）
  import('../store/process').then(({ useProcessStore, getCurrentAppFromPath }) => {
  const process = useProcessStore();
  const currentApp = getCurrentAppFromPath(to.path);

  // 再次确认：只添加系统域的路由（不是子应用）
  if (currentApp === 'system') {
    // 系统域路由，添加到标签页
  process.add({
    path: to.path,
    fullPath: to.fullPath,
    name: to.name as string,
    meta: to.meta as any,
      });
    }
    // 其他子应用路由，不添加到标签页
  }).catch(() => {
    // 忽略错误
  });
});

export default router;
