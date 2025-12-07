import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './bootstrap';
import { isDev } from './config';
import { registerAppEnvAccessors } from '@configs/layout-bridge';
import { getAppBySubdomain } from '@configs/app-scanner';
import { setAppBySubdomainFn } from '@btc/subapp-manifests';
import { isMainApp } from '@configs/unified-env-config';
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

registerAppEnvAccessors();

// 注入 getAppBySubdomain 函数到 subapp-manifests
setAppBySubdomainFn(getAppBySubdomain);

// 注入 isMainApp 函数到 shared-components（异步导入，避免构建时错误）
// @ts-expect-error - 动态导入路径，TypeScript 无法在编译时解析
import('@btc/shared-components/components/layout/app-layout/utils').then(utils => {
  utils.setIsMainAppFn(isMainApp);
}).catch(() => {
  // 静默处理导入失败，不影响应用启动
  if (import.meta.env.DEV) {
    console.warn('[system-app] 无法导入 setIsMainAppFn，跳过设置');
  }
});

const app = createApp(App);

// 全局错误处理：捕获并显示错误
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue Error Handler]', err, info);
};

// 在 bootstrap 之前就注册组件，确保组件在任何地方使用前都已注册
// 使用 typeof 确保组件被实际引用，避免被 tree-shake 掉
if (typeof BtcSvg !== 'undefined') {
  app.component('BtcSvg', BtcSvg);
  app.component('btc-svg', BtcSvg);
} else {
  console.error('[BtcSvg] 组件导入失败，请检查 @btc/shared-components 构建');
}

// 等待 EPS 服务加载完成后再暴露到全局
// 因为 eps-service chunk 是动态导入的，需要等待它加载完成
// 优化：减少等待时间，使用渐进式轮询间隔，更快响应
async function waitForEpsService(maxWaitTime = 2000, initialInterval = 50): Promise<any> {
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
  return {};
}


/**
 * 移除 Loading 元素的统一函数
 * 确保 Loading 元素被可靠地移除，避免页面一直显示 loading 状态
 */
function removeLoadingElement() {
  const loadingEl = document.getElementById('Loading');
  if (loadingEl) {
    // 立即隐藏（使用内联样式确保优先级）
    loadingEl.style.setProperty('display', 'none', 'important');
    loadingEl.style.setProperty('visibility', 'hidden', 'important');
    loadingEl.style.setProperty('opacity', '0', 'important');
    loadingEl.style.setProperty('pointer-events', 'none', 'important');

    // 添加淡出类（如果 CSS 中有定义）
    loadingEl.classList.add('is-hide');

    // 延迟移除，确保动画完成（300ms 过渡时间 + 50ms 缓冲）
    setTimeout(() => {
      try {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        } else if (loadingEl.isConnected) {
          // 如果 parentNode 为 null 但元素仍在 DOM 中，直接移除
          loadingEl.remove();
        }
      } catch (error) {
        // 如果移除失败，至少确保元素被隐藏
        loadingEl.style.setProperty('display', 'none', 'important');
      }
    }, 350);
  }
}

// 关键：添加超时机制，确保 Loading 元素最终会被移除
// 即使应用启动失败或卡住，也要在超时后移除 Loading
const LOADING_TIMEOUT = 10000; // 10 秒超时（缩短超时时间，更快响应）
const loadingTimeoutId = setTimeout(() => {
  removeLoadingElement();
  // 超时后，尝试直接挂载应用（如果还没挂载）
  const appEl = document.getElementById('app');
  if (appEl && !appEl.querySelector('.system-app')) {
    try {
      app.mount('#app');
    } catch (error) {
      console.error('[system-app] 强制挂载失败:', error);
    }
  }
}, LOADING_TIMEOUT);

// 启动（等待 EPS 服务加载完成后再启动应用）
// 关键：为整个启动流程添加超时保护
const startupPromise = waitForEpsService()
  .then((service) => {
    if (typeof window !== 'undefined') {
      (window as any).__BTC_SERVICE__ = service;
      // 暴露到全局，供所有子应用共享使用
      (window as any).__APP_EPS_SERVICE__ = service;
      (window as any).service = service; // 也设置到 window.service，保持兼容性
    }

    // EPS 服务加载完成后，再启动应用
    // 为 bootstrap 添加超时保护
    const bootstrapPromise = bootstrap(app);
    const bootstrapTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Bootstrap 超时（8秒）')), 8000);
    });
    return Promise.race([bootstrapPromise, bootstrapTimeout]);
  })
  .then(async () => {
  // 等待路由就绪后再挂载应用，确保路由正确匹配
  // 从 bootstrap/core/router 导入 router 实例
  const { router } = await import('./bootstrap/core/router');
  if (router) {
    try {
      // 关键：添加超时机制，避免 router.isReady() 一直等待导致应用无法挂载
      // 如果路由守卫有问题或路由匹配失败，超时后继续挂载，让路由守卫在挂载后执行
      const routerReadyPromise = router.isReady();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('路由就绪超时')), 3000); // 缩短到3秒超时
      });

      await Promise.race([routerReadyPromise, timeoutPromise]);
    } catch (error) {
      // 路由就绪检查失败或超时，继续挂载
    }
  }

  // 检查 #app 元素是否存在
  const appEl = document.getElementById('app');
  if (!appEl) {
    throw new Error('#app 元素不存在');
  }

  try {
    app.mount('#app');

    // 关键：应用挂载后，立即关闭并移除 Loading 元素（不等待任何其他操作）
    // 这是最重要的步骤，确保用户能看到应用界面，而不是一直显示 loading
    clearTimeout(loadingTimeoutId); // 清除超时定时器
    removeLoadingElement();

    // 关键：挂载后立即触发路由导航，确保路由守卫能够执行
    // 如果当前路由未匹配或未认证，路由守卫会自动重定向到登录页
    // 注意：Loading 元素已经移除，这里只是确保路由正确导航
    // 使用 setTimeout 确保在下一个事件循环中执行，不阻塞 Loading 移除
    if (router) {
      setTimeout(async () => {
        try {
          // 检查当前路由是否已匹配
          const currentRoute = router.currentRoute.value;
          if (currentRoute.matched.length === 0) {
            // 触发路由导航，让路由守卫处理重定向
            try {
              await router.push(currentRoute.fullPath);
            } catch (navError) {
              // 如果导航失败，直接重定向到登录页
              try {
                await router.replace('/login');
              } catch (redirectError) {
                console.error('[system-app] 重定向到登录页失败:', redirectError);
              }
            }
          } else {
            // 即使路由已匹配，也要确保路由守卫执行了认证检查
            // 如果未认证，路由守卫会自动重定向到登录页
            // 触发一次路由导航，确保路由守卫执行
            try {
              await router.push(currentRoute.fullPath);
            } catch (error) {
              // 忽略错误，路由守卫可能已经处理了
            }
          }
        } catch (error) {
          console.error('[system-app] 路由导航处理失败:', error);
        }
      }, 200);
    }
  } catch (mountError) {
    // 即使挂载失败，也要移除 Loading 元素
    clearTimeout(loadingTimeoutId);
    removeLoadingElement();
    throw mountError;
  }

    // 注册开发工具组件（在所有环境下都加载，由组件内部逻辑决定是否显示）
    // 组件内部会检查：开发环境或允许的用户（如 moselu）才显示
    import('./components/DevTools/index.vue').then(({ default: DevTools }) => {
      const devToolsApp = createApp(DevTools);
      const container = document.createElement('div');
      document.body.appendChild(container);
      devToolsApp.mount(container);
    }).catch(err => {
      console.warn('开发工具加载失败:', err);
    });
  })
  .catch(err => {
    console.error('[system-app] 应用启动失败:', err);

    // 清除超时定时器
    clearTimeout(loadingTimeoutId);

    // 关键：即使启动失败，也要移除 Loading 元素
    removeLoadingElement();
  });
