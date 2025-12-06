import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './bootstrap';
import { isDev } from './config';
import { registerAppEnvAccessors } from '@configs/layout-bridge';
import { currentEnvironment, currentSubApp } from '@configs/unified-env-config';
import { getMainApp, getAppBySubdomain } from '@configs/app-scanner';
import { setAppBySubdomainFn } from '@btc/subapp-manifests';
import { isMainApp } from '@configs/unified-env-config';
import { setIsMainAppFn } from '@btc/shared-components/components/layout/app-layout/utils';

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

// 注入 isMainApp 函数到 shared-components
setIsMainAppFn(isMainApp);

const app = createApp(App);

// 全局错误处理：暂时移除日志打印，查看原生错误
app.config.errorHandler = (err, instance, info) => {
  // 暂时不打印错误，让原生错误显示
  // 这样可以更清楚地看到错误的根本原因
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


// 启动（等待 EPS 服务加载完成后再启动应用）
waitForEpsService().then((service) => {
  if (typeof window !== 'undefined') {
    (window as any).__BTC_SERVICE__ = service;
    // 暴露到全局，供所有子应用共享使用
    (window as any).__APP_EPS_SERVICE__ = service;
    (window as any).service = service; // 也设置到 window.service，保持兼容性
  }
  
  // EPS 服务加载完成后，再启动应用
  return bootstrap(app);
}).then(async () => {
  // 等待路由就绪后再挂载应用，确保路由正确匹配
  // 从 bootstrap/core/router 导入 router 实例
  const { router } = await import('./bootstrap/core/router');
  if (router) {
    try {
      await router.isReady();
    } catch (error) {
      console.warn('[system-app] 路由就绪检查失败，继续挂载:', error);
    }
  }
  
  // 不再打印环境信息，改为在环境悬浮按钮中显示
  
  app.mount('#app');
  
  // 挂载后检查路由匹配情况
  if (import.meta.env.PROD && router) {
    const currentRoute = router.currentRoute.value;
    if (currentRoute.matched.length === 0) {
      console.error('[system-app] ⚠️ 应用挂载后路由未匹配:', {
        path: currentRoute.path,
        fullPath: currentRoute.fullPath,
        matched: currentRoute.matched,
        location: window.location.href,
      });
    } else {
      console.log('[system-app] ✅ 路由匹配成功:', {
        path: currentRoute.path,
        matched: currentRoute.matched.map(m => ({ path: m.path, name: m.name })),
      });
    }
  }

    // 应用挂载后，立即关闭并移除 Loading 元素
    // 添加淡出动画，然后移除元素
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      // 添加淡出类，触发 CSS 过渡动画
      loadingEl.classList.add('is-hide');
      // 延迟移除，确保动画完成（300ms 过渡时间 + 50ms 缓冲）
      setTimeout(() => {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        }
      }, 350);
    }

    // 仅在开发环境注册开发工具组件
    if (isDev) {
      import('./components/DevTools/index.vue').then(({ default: DevTools }) => {
        const devToolsApp = createApp(DevTools);
        const container = document.createElement('div');
        document.body.appendChild(container);
        devToolsApp.mount(container);
      }).catch(err => {
        console.warn('开发工具加载失败:', err);
      });
    }
  })
  .catch(err => {
    // console.error('BTC Shopflow 启动失败', err);
  });
