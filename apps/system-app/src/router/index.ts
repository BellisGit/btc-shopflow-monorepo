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
import { getTabsForNamespace } from '../store/tabRegistry';
import { getAppBySubdomain } from '@configs/app-scanner';

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
    meta: { isMainApp: true }, // 标记为主应用路由，便于调试
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
  {
    path: '/monitor',
    component: Layout,
    meta: { title: 'Monitor App', isHome: true, isSubApp: true },
  },
  {
    path: '/monitor/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Monitor App', isSubApp: true },
  },
  {
    path: '/docs',
    component: Layout,
    meta: { title: 'Docs App', isHome: true, isSubApp: true },
  },
  {
    path: '/docs/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Docs App', isSubApp: true },
  },
];

// 创建 router 实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true,
});

// 路由错误处理
router.onError((error) => {
  console.error('[system-app] Router error:', error);
  // 如果是组件加载失败，尝试重新加载
  if (error.message && error.message.includes('Failed to fetch dynamically imported module')) {
    console.warn('[system-app] Component load failed, page will be empty. Error:', error);
  }
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
 * 因此通过检查 cookie、localStorage 中的登录状态标记、token 和用户信息来判断
 */
function isAuthenticated(): boolean {
  // 关键：在子域名环境下，即使无法读取 HttpOnly cookie，也应该尝试其他方式判断
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
  
  // 1. 检查 cookie 中的 token（优先，因为跨子域名共享）
  // 注意：如果 cookie 是 HttpOnly 的，getCookie 无法读取，但浏览器会自动在请求中发送
  // 在子域名环境下，即使无法读取 HttpOnly cookie，也应该认为可能已认证（由后端验证）
  const cookieToken = getCookie('access_token');
  if (cookieToken) {
    return true;
  }

  // 2. 在主域名（bellis.com.cn）下，必须严格检查认证状态
  // 不能假设已认证，必须通过实际的认证标记来判断
  // 只有在子域名环境下，才允许通过其他方式判断（因为子应用的认证由子应用自己处理）
  
  // 3. 检查登录状态标记（从统一的 settings 存储中读取）
  const settings = appStorage.settings.get() as Record<string, any> | null;
  const isLoggedIn = settings?.is_logged_in === true;
  if (isLoggedIn) {
    return true;
  }

  // 4. 检查 localStorage 中的 token
  const storageToken = appStorage.auth.getToken();
  if (storageToken) {
    return true;
  }

  // 5. 检查用户信息是否存在
  const userInfo = appStorage.user.get();
  if (userInfo?.id) {
    return true;
  }

  // 6. 在子域名环境下，如果无法读取 cookie，尝试通过其他方式判断
  // 如果 cookie 是 HttpOnly 的，前端无法读取，但浏览器会自动发送给后端
  // 注意：这仅适用于子域名环境，主域名必须严格检查
  if (isProductionSubdomain) {
    // 在子域名环境下，即使无法读取 HttpOnly cookie，也应该假设可能已认证
    // 因为浏览器会自动发送 cookie 给后端，后端会验证
    // 如果后端验证失败，会在响应中返回 401，由 HTTP 拦截器处理
    // 这里返回 true，让请求继续，由后端验证
    return true;
  }

  // 主域名下，如果没有找到任何认证标记，返回 false
  return false;
}

/**
 * 规范化路径：如果路径缺少应用前缀，尝试从 tabRegistry 中查找并添加前缀
 * 例如：/test/api-test-center -> /admin/test/api-test-center
 */
function normalizeRoutePath(path: string): string | null {
  // 如果路径已经有应用前缀，不需要规范化
  const subAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance'];
  if (subAppPrefixes.some(prefix => path.startsWith(prefix))) {
    return null;
  }

  // 如果是系统域路径，不需要规范化
  if (path === '/' || path === '/profile' || path.startsWith('/data') || path.startsWith('/login') || path.startsWith('/forget-password') || path.startsWith('/register')) {
    return null;
  }

  // 遍历所有应用的 tabRegistry，查找匹配的路径
  // 子应用列表
  const subApps = ['admin', 'logistics', 'engineering', 'quality', 'production', 'finance'];
  
  for (const appName of subApps) {
    try {
      const tabs = getTabsForNamespace(appName);
      for (const tab of tabs) {
        // 移除应用前缀后比较
        const appPrefix = `/${appName}`;
        const pathWithoutPrefix = tab.path.startsWith(appPrefix) 
          ? tab.path.substring(appPrefix.length) || '/'
          : tab.path;
        
        // 如果路径匹配（去掉应用前缀后），返回完整路径
        if (pathWithoutPrefix === path || pathWithoutPrefix === `${path}/`) {
          console.log(`[Router] 规范化路径: ${path} -> ${tab.path} (应用: ${appName})`);
          return tab.path;
        }
      }
    } catch (error) {
      // 如果某个应用的 tabRegistry 未加载，继续查找下一个
      continue;
    }
  }

  return null;
}

// 路由前置守卫：处理认证、Loading 显示和侧边栏
router.beforeEach((to, from, next) => {
  // 关键：路径规范化 - 确保子应用路径有正确的前缀
  const normalizedPath = normalizeRoutePath(to.path);
  if (normalizedPath) {
    next({
      path: normalizedPath,
      query: to.query,
      hash: to.hash,
      replace: true,
    });
    return;
  }

  // 关键：在子域名环境下，如果是子应用域名，不应该由 system-app 进行认证检查
  // 子应用的认证应该由子应用自己处理（通过 layout-app 或子应用自己的路由守卫）
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
  // 使用顶层导入的应用扫描器（app-scanner 在构建时已加载）
  const appBySubdomain = getAppBySubdomain(hostname);
  const currentSubdomainApp = appBySubdomain?.id;
  
  // 关键：在子域名环境下，如果是子应用域名，跳过 system-app 的认证检查
  // 因为子域名访问时，应该由 layout-app 或子应用自己处理认证
  // 只有在主域名（bellis.com.cn）或开发环境下，system-app 才进行认证检查
  if (isProductionSubdomain && currentSubdomainApp) {
    // 子域名环境下，跳过 system-app 的认证检查，让子应用或 layout-app 处理
    // 但是，如果是登录页等公开页面，仍然需要处理
    const isPublicPage = to.meta?.public === true || 
                         to.path === '/login' || 
                         to.path === '/forget-password' || 
                         to.path === '/register';
    
    if (isPublicPage) {
      // 公开页面，直接放行
      next();
      return;
    }
    
    // 非公开页面，在子域名环境下，应该由子应用或 layout-app 处理认证
    // 这里直接放行，让子应用的路由守卫处理
    next();
    return;
  }

  // 检查是否为公开页面（不需要认证）
  const isPublicPage = to.meta?.public === true;
  
  // 关键：在主域名（bellis.com.cn）下，必须严格检查认证状态
  // 不能假设已认证，必须通过实际的认证标记来判断
  const isAuthenticatedUser = isAuthenticated();
  
  console.log('[Router Guard]', {
    path: to.path,
    isPublicPage,
    isAuthenticatedUser,
    hostname: typeof window !== 'undefined' ? window.location.hostname : '',
  });

  // 如果是登录页且用户已认证，重定向到首页
  // 但是，如果查询参数中有 logout=1，说明是退出登录，应该允许访问登录页
  if (to.path === '/login' && isAuthenticatedUser && !to.query.logout) {
    const redirect = (to.query.redirect as string) || '/';
    // 只取路径部分，忽略查询参数，避免循环重定向
    const redirectPath = redirect.split('?')[0];
    console.log('[Router Guard] 已认证用户访问登录页，重定向到:', redirectPath);
    next(redirectPath);
    return;
  }

  // 如果不是公开页面，检查认证状态
  if (!isPublicPage) {
    if (!isAuthenticatedUser) {
      // 未认证，重定向到登录页，并保存原始路径以便登录后跳转
      console.log('[Router Guard] 未认证，重定向到登录页，原始路径:', to.fullPath);
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

// 路由守卫：调试路由匹配情况
router.afterEach((to, from) => {
  // 生产环境调试：如果路由未匹配，记录详细信息
  if (import.meta.env.PROD && to.matched.length === 0) {
    console.error('[system-app Router] 路由未匹配:', {
      path: to.path,
      fullPath: to.fullPath,
      name: to.name,
      matched: to.matched,
      params: to.params,
      query: to.query,
      location: window.location.href,
    });
  }
  
  // 如果路由已匹配，记录匹配信息（仅在生产环境且是根路径时）
  if (import.meta.env.PROD && to.path === '/' && to.matched.length > 0) {
    console.log('[system-app Router] 路由匹配成功:', {
      path: to.path,
      matched: to.matched.map(m => ({ path: m.path, name: m.name, component: m.components })),
    });
  }
});

// 路由守卫：自动添加标签到 Tabbar（仅主应用路由）
router.afterEach((to) => {
  // 清理所有 ECharts 实例和相关的 DOM 元素（tooltip、toolbox 等），防止页面切换时残留
  // 使用统一的清理函数，自动清理所有图表组件
  try {
    // 动态导入清理函数，使用具体路径避免与静态导入冲突
    import('@btc/shared-components/charts/utils/cleanup').then(({ cleanupAllECharts }) => {
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
