import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './bootstrap';
import { registerAppEnvAccessors } from '@btc/shared-core/configs/layout-bridge';
import { getAppBySubdomain } from '@btc/shared-core/configs/app-scanner';
import { setAppBySubdomainFn } from '@btc/shared-core/manifest';
import { isMainApp } from '@btc/shared-core/configs/unified-env-config';
import { removeLoadingElement } from '@btc/shared-core';
import { appStorage } from './utils/app-storage';
// 动态导入避免构建时错误（延迟到运行时导入）

// 注意：HTTP URL 拦截逻辑已在 index.html 中实现（内联脚本，最早执行）
// 这里不再需要重复拦截，避免多次重写同一原型导致的不确定行为
// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
import 'virtual:svg-icons';
// 关键：确保 Element Plus 样式在最前面加载，避免被其他样式覆盖
// 开启样式隔离后，需要确保 Element Plus 样式在主应用中被正确加载
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
// 关键：直接导入确保构建时被正确打包，避免通过 SCSS @use 导入时的路径解析问题
import '@btc/shared-components/styles/dark-theme.css';
// 关键：在关闭样式隔离的情况下，需要在主应用入口直接引入样式，确保样式被正确加载
// 虽然 bootstrap/core/ui.ts 中也引入了，但在入口文件引入可以确保样式在应用启动时就被处理
import '@btc/shared-components/styles/index.scss';
// 关键：显式导入 BtcSvg 组件，确保在生产环境构建时被正确打包
// 即使组件在 bootstrap/core/ui.ts 中已经注册，这里显式导入可以确保组件被包含在构建产物中
import { BtcSvg } from '@btc/shared-components';
// 移除可能残留的布局类
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('col-mobile', 'col-tablet', 'col-desktop');
}

registerAppEnvAccessors();

// 初始化全局响应式布局断点监听（已禁用，避免影响全局样式）
// initGlobalBreakpoints();

// 注入 getAppBySubdomain 函数到 subapp-manifests
setAppBySubdomainFn(getAppBySubdomain);

// 注入 isMainApp 函数到 shared-components（同步导入，确保在菜单组件初始化前已注入）
// 关键：使用同步导入，确保菜单激活逻辑能正确判断主应用路由
import { setIsMainAppFn } from '@btc/shared-components';
setIsMainAppFn(isMainApp);

// 暴露 appStorage 到全局（供共享组件版本的 user-info 使用）
// 关键：同步暴露，确保共享组件在初始化时就能获取到 appStorage
if (typeof window !== 'undefined' && typeof (window as any).__APP_STORAGE__ === 'undefined') {
  (window as any).__APP_STORAGE__ = appStorage;
  (window as any).appStorage = appStorage;
}

const app = createApp(App);

// 在 bootstrap 之前就注册组件，确保组件在任何地方使用前都已注册
// 使用 typeof 确保组件被实际引用，避免被 tree-shake 掉
if (typeof BtcSvg !== 'undefined') {
  app.component('BtcSvg', BtcSvg);
  app.component('btc-svg', BtcSvg);
}

// 等待 EPS 服务加载完成后再暴露到全局
// 因为 eps-service chunk 是动态导入的，需要等待它加载完成
// 优化：减少等待时间，使用渐进式轮询间隔，更快响应
// 关键：如果 EPS 服务加载失败或超时，不阻塞应用启动，返回空对象
async function waitForEpsService(maxWaitTime = 1000, initialInterval = 50): Promise<any> {
  const startTime = Date.now();

  // 首先尝试直接导入（如果 eps-service chunk 已经加载，这会立即返回）
  try {
    const epsModule = await import('./services/eps');
    const service = epsModule.service || epsModule.default;

    // 检查服务是否有有效内容（不是空对象）
    if (service && typeof service === 'object' && Object.keys(service).length > 0) {
      return service;
    }
  } catch (error) {
    // 如果导入失败（chunk 还没加载），继续等待
    // 不打印日志，避免控制台噪音
  }

  // 检查全局是否已经有服务（可能已经被其他脚本加载）
  const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
  if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
    return globalService;
  }

  // 渐进式轮询：开始时使用较短的间隔，逐渐增加
  let currentInterval = initialInterval;
  let attemptCount = 0;

  while (Date.now() - startTime < maxWaitTime) {
    try {
      // 再次尝试导入
      const epsModule = await import('./services/eps');
      const service = epsModule.service || epsModule.default;

      if (service && typeof service === 'object' && Object.keys(service).length > 0) {
        return service;
      }
    } catch (error) {
      // 继续等待
    }

    // 检查全局是否已经有服务（可能已经被其他脚本加载）
    const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
    if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
      return globalService;
    }

    // 渐进式增加轮询间隔：前几次使用短间隔，之后逐渐增加
    attemptCount++;
    if (attemptCount <= 5) {
      currentInterval = initialInterval; // 前 5 次保持短间隔（50ms）
    } else if (attemptCount <= 10) {
      currentInterval = 100; // 接下来 5 次使用 100ms
    } else {
      currentInterval = 150; // 之后使用 150ms
    }

    await new Promise(resolve => setTimeout(resolve, currentInterval));
  }

  // 如果等待超时，尝试最后一次导入（作为兜底）
  try {
    const epsModule = await import('./services/eps');
    const service = epsModule.service || epsModule.default;
    if (service && typeof service === 'object' && Object.keys(service).length > 0) {
      return service;
    }
  } catch (error) {
    // 静默处理，不打印错误
  }

  // 返回空对象作为兜底，不阻塞应用启动
  // 不打印警告，避免控制台噪音（EPS 服务可以在后台继续加载）
  // 关键：即使 EPS 服务未加载完成，也继续启动应用，EPS 服务可以在后台异步加载
  return {};
}

// 优化：在后台异步加载 EPS 服务，不阻塞应用启动
// 这样即使 EPS 服务很大，也不会阻塞 DOMContentLoaded
if (typeof window !== 'undefined') {
  // 使用 requestIdleCallback 或 setTimeout 在后台加载 EPS 服务
  const loadEpsServiceInBackground = () => {
    import('./services/eps').then((epsModule) => {
      const service = epsModule.service || epsModule.default;
      if (service && typeof service === 'object' && Object.keys(service).length > 0) {
        // 更新全局服务
        (window as any).__BTC_SERVICE__ = service;
        (window as any).__APP_EPS_SERVICE__ = service;
        (window as any).service = service;
      }
    }).catch(() => {
      // 静默失败，不影响应用运行
    });
  };

  // 使用 requestIdleCallback 在浏览器空闲时加载，如果没有则使用 setTimeout
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(loadEpsServiceInBackground, { timeout: 2000 });
  } else {
    setTimeout(loadEpsServiceInBackground, 100);
  }
}


/**
 * 移除 Loading 元素的统一函数
 * 确保 Loading 元素被可靠地移除，避免页面一直显示 loading 状态
 */
// 使用全局根级 Loading 服务
let rootLoadingInitialized = false;

// 初始化全局根级 Loading
async function initRootLoading() {
  if (rootLoadingInitialized) {
    return;
  }

  // 关键：如果是子应用路由或登录页，不应该显示"拜里斯科技"loading
  // 子应用的loading由appLoadingService统一管理
  // 登录页不需要显示全局loading
  // 关键：立即检查并隐藏#Loading元素（如果存在），避免显示"拜里斯科技"
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/docs', '/dashboard', '/personnel'];
    const isSubAppRoute = knownSubAppPrefixes.some(prefix => pathname.startsWith(prefix));
    const isLoginPage = pathname === '/login' || pathname.startsWith('/login?');

    if (isSubAppRoute || isLoginPage) {
      // 子应用路由或登录页，立即隐藏"拜里斯科技"loading
      // 使用 is-hide 类，样式已在 loading.css 中定义
      const systemLoadingEl = document.getElementById('Loading');
      if (systemLoadingEl) {
        systemLoadingEl.classList.add('is-hide');
      }
      // 不显示"拜里斯科技"loading
      return;
    }
  }

  try {
    const loadingModule = await import('@btc/shared-core');
    const rootLoadingService = loadingModule.rootLoadingService;
    if (rootLoadingService && typeof rootLoadingService.show === 'function') {
      rootLoadingService.show('正在初始化应用...');
      rootLoadingInitialized = true;
    } else {
      throw new Error('rootLoadingService 未定义或方法不存在');
    }
  } catch (error) {
    console.warn('[system-app] 无法加载 RootLoadingService，使用备用方案', error);
    // 备用方案：直接操作 DOM（向后兼容）
    // 使用类名切换，样式已在 loading.css 中定义
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      loadingEl.classList.remove('is-hide');
    }
  }
}

// 隐藏全局根级 Loading
async function hideRootLoading() {
  try {
    const loadingModule = await import('@btc/shared-core');
    const rootLoadingService = loadingModule.rootLoadingService;
    if (rootLoadingService && typeof rootLoadingService.hide === 'function') {
      rootLoadingService.hide();
    } else {
      throw new Error('rootLoadingService 未定义或方法不存在');
    }
  } catch (error) {
    console.warn('[system-app] 无法加载 RootLoadingService，使用备用方案', error);
    // 备用方案：直接操作 DOM（向后兼容）
    // 使用类名切换，样式已在 loading.css 中定义
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      loadingEl.classList.add('is-hide');
    }
  }
}

let isAppMounted = false; // 跟踪应用是否已挂载

// Loading 超时定时器 ID
let loadingTimeoutId: ReturnType<typeof setTimeout> | null = null;

// 确保 Loading 被移除的函数（立即隐藏 loading）
async function ensureLoadingRemoved(): Promise<void> {
  await hideRootLoading();
}

// 初始化全局根级 Loading
initRootLoading();

// 启动应用（优化：不等待 EPS 服务，立即启动应用）
// 关键：EPS 服务已经在后台异步加载，不需要等待它完成
// 这样可以更快地显示应用界面，提升用户体验
// @ts-expect-error: startupPromise 未使用，保留用于未来功能
const startupPromise = Promise.resolve()
  .then(async () => {
    // 尝试快速获取 EPS 服务（如果已经加载）
    // 但不等待，立即继续启动流程
    const quickEpsCheck = waitForEpsService(200, 20).catch(() => ({}));
    quickEpsCheck.then((service) => {
      if (service && typeof service === 'object' && Object.keys(service).length > 0) {
        if (typeof window !== 'undefined') {
          (window as any).__BTC_SERVICE__ = service;
          (window as any).__APP_EPS_SERVICE__ = service;
          (window as any).service = service;
        }
      }
    });

    // 暴露 authApi 到全局（异步加载，不阻塞启动）
    import('./modules/api-services/auth').then(({ authApi }) => {
      if (authApi && typeof (window as any).__APP_AUTH_API__ === 'undefined') {
        (window as any).__APP_AUTH_API__ = authApi;
      }
    }).catch(() => {
      // 静默失败，不影响应用运行
    });

    // 暴露域列表获取函数和清除函数（异步加载，不阻塞启动）
    import('./utils/domain-cache').then(({ getDomainList, clearDomainCache }) => {
      // 设置全局域列表获取函数（供共享组件版本的 menu-drawer 使用）
      if (getDomainList && typeof (window as any).__APP_GET_DOMAIN_LIST__ === 'undefined') {
        (window as any).__APP_GET_DOMAIN_LIST__ = getDomainList;
      }
      // 设置全局域列表缓存清除函数
      if (clearDomainCache && typeof (window as any).__APP_CLEAR_DOMAIN_CACHE__ === 'undefined') {
        (window as any).__APP_CLEAR_DOMAIN_CACHE__ = clearDomainCache;
      }
    }).catch(() => {
      // 静默失败，不影响应用运行
    });

    // 立即启动应用，不等待 EPS 服务
    // 为 bootstrap 添加超时保护
    const bootstrapPromise = bootstrap(app).catch((error) => {
      console.error('[main-app] Bootstrap 过程失败:', error);
      throw error;
    });
    const bootstrapTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Bootstrap 超时（8秒）')), 8000);
    });
    return Promise.race([bootstrapPromise, bootstrapTimeout]);
  })
  .then(async () => {
  // 优化：不等待路由就绪，立即挂载应用
  // 路由可以在应用挂载后异步初始化，不阻塞首次渲染

  // 检查 #app 元素是否存在
  const appEl = document.getElementById('app');
  if (!appEl) {
    throw new Error('#app 元素不存在');
  }

  try {
    // 关键：检查应用是否已经挂载，避免重复挂载
    if (!isAppMounted) {
      app.mount('#app');
      isAppMounted = true; // 标记应用已挂载
    }

    // 关键：应用挂载后，立即关闭全局根级 Loading（不等待任何其他操作）
    // 参考 cool-admin：在路由 beforeResolve 中已经关闭了 loading，这里作为兜底
    // 如果路由 beforeResolve 还没执行，这里确保 loading 被关闭
    await hideRootLoading();

    // 关键：立即触发路由导航，不延迟（参考 cool-admin）
    // Loading 已经在 router.beforeResolve 中关闭，这里立即导航确保路由正确
    // 使用 nextTick 确保在下一个事件循环中执行，但不延迟太久
    import('vue').then(({ nextTick }) => {
      nextTick(async () => {
      try {
        // 异步获取 router 实例
        const { router } = await import('./bootstrap/core/router');
        if (!router) return;

        // 快速检查路由是否就绪（最多等待 500ms）
        try {
          const routerReadyPromise = router.isReady();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('路由就绪超时')), 500);
          });
          await Promise.race([routerReadyPromise, timeoutPromise]);
        } catch (error) {
          // 路由就绪检查失败或超时，继续导航
        }

        // 检查当前路由是否已匹配
        const currentRoute = router.currentRoute.value;
        if (currentRoute.matched.length === 0) {
          // 关键：先检查认证状态，只有未认证时才重定向到登录页
          // 如果已认证但路由未匹配，可能是路由配置问题，不应该重定向到登录页
          const { isAuthenticated } = await import('./router/index');
          const isAuth = isAuthenticated();

          if (!isAuth) {
            // 未认证，直接重定向到登录页，避免触发 router.push 导致组件守卫提取错误
            try {
              // 使用 router.replace 而不是 router.push，避免触发组件守卫提取
              await router.replace({
                path: '/login',
                query: { redirect: currentRoute.fullPath },
              });
            } catch (navError) {
              // 如果路由导航失败，使用 window.location 作为回退
              window.location.href = `/login?redirect=${encodeURIComponent(currentRoute.fullPath)}`;
            }
          } else {
            // 已认证但路由未匹配，可能是子应用路由或无效路由
            // 不要触发 router.push，避免 Vue Router 尝试提取 undefined 组件的守卫
            // 直接让应用正常显示（可能显示 Layout 或子应用挂载点）
            // 路由守卫已经处理了这种情况，不需要再次导航
          }
        } else {
          // 即使路由已匹配，也要确保路由守卫执行了认证检查
          // 如果未认证，路由守卫会自动重定向到登录页
          // 触发一次路由导航，确保路由守卫执行
          try {
            await router.push(currentRoute.fullPath);
          } catch (error) {
            // 忽略错误，路由守卫可能已经处理了
            // 如果是组件守卫提取错误，已经在全局错误处理器中处理了
          }
        }
      } catch (error) {
        // 路由导航处理失败
      }
      });
    });
  } catch (mountError) {
    // 即使挂载失败，也要移除 Loading 元素
    if (loadingTimeoutId) {
      clearTimeout(loadingTimeoutId);
      loadingTimeoutId = null;
    }
    await ensureLoadingRemoved(); // 立即隐藏loading
    removeLoadingElement(); // 延迟移除loading元素
    throw mountError;
  }

    // 设置全局对象，并挂载 DevTools
    (async () => {
      try {
        // 暴露 http 实例到全局，供 DevTools 使用
        try {
          const { http } = await import('./utils/http');
          if (http && typeof (window as any).__APP_HTTP__ === 'undefined') {
            (window as any).__APP_HTTP__ = http;
          }
        } catch (err) {
          // http 实例可能还未加载，忽略错误
        }

        // 暴露 EPS list 到全局，供 DevTools 使用
        try {
          const epsModule = await import('./services/eps');
          if (epsModule.list && typeof (window as any).__APP_EPS_LIST__ === 'undefined') {
            (window as any).__APP_EPS_LIST__ = epsModule.list;
            // epsList = epsModule.list;
          }
        } catch (err) {
          // EPS 服务可能还未加载，忽略错误
        }

        // 注意：DevTools 现在直接在 App.vue 中使用，不再需要在这里挂载
        // 这样可以确保 DevTools 在路由切换时不会卸载
      } catch (err) {
        // 静默失败，不影响应用运行
      }
    })();
  })
  .catch(async (error) => {
    // 应用启动失败
    console.error('[main-app] 应用启动失败:', error);

    // 清除超时定时器
    if (loadingTimeoutId) {
      clearTimeout(loadingTimeoutId);
      loadingTimeoutId = null;
    }

    // 关键：即使启动失败，也要移除 Loading 元素
    await ensureLoadingRemoved(); // 立即隐藏loading
    removeLoadingElement(); // 延迟移除loading元素

    // 尝试挂载应用，即使启动失败也显示错误信息
    try {
      const appEl = document.getElementById('app');
      if (appEl && !isAppMounted) {
        app.mount('#app');
        isAppMounted = true;
      }
    } catch (mountError) {
      console.error('[main-app] 应用挂载失败:', mountError);
    }
  });
