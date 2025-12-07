/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 *
 * 参考 cool-admin 的架构设计，采用模块化目录结构
 */

import type { App } from 'vue';

// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';

// 核心模块
import { setupStore, setupUI, setupRouter, setupI18n, setupEps } from './core';
import { resolveAppLogoUrl } from '@configs/layout-bridge';

// 处理器模块
import { createMessageHandler, initMessageManager, createNotificationHandler, initNotificationManager } from './handlers';

// 集成模块
import { autoDiscoverPlugins, setupMicroApps, setupInterceptors } from './integrations';

// 管理器实例
import { notificationManager } from '../utils/notification-manager';
import { BtcMessage } from '@btc/shared-components';
import { appStorage } from '../utils/app-storage';
// 用户设置（现在都在 app-src chunk 中，可以使用静态导入）
import { initSettingsConfig } from '../plugins/user-setting/composables/useSettingsState';

/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 */
export async function bootstrap(app: App) {
  // 0. 初始化存储管理器（必须在最前面）
  appStorage.init();

  // 1. 核心模块初始化
  setupEps(app);        // EPS 服务（必须在最前面）
  setupStore(app);      // 状态管理
  setupRouter(app);     // 路由配置
  setupUI(app);         // UI框架配置
  setupI18n(app);       // 国际化配置

  // 注意：Loading 元素的移除由 main.ts 统一处理
  // 这里不再处理，避免与 main.ts 的逻辑冲突

  // 2. 集成模块初始化
  // 初始化设置配置（现在都在 app-src chunk 中，使用静态导入）
  await initSettingsConfig();

  await autoDiscoverPlugins(app);  // 自动发现插件
  await setupMicroApps(app);       // 微前端设置
  setupInterceptors();             // 拦截器配置

  // 3. 处理器初始化
  const notificationHandler = createNotificationHandler();

  initNotificationManager(notificationHandler);

  // 4. 全局暴露
  (window as any).notificationHandler = notificationHandler;
  (window as any).notificationManager = notificationManager;
  (window as any).BtcMessage = BtcMessage;

  // 暴露 cleanupBadge 方法（生命周期管理器需要）
  (window as any).cleanupNotificationBadge = notificationHandler.cleanupBadge;

  // 暴露 authApi 到全局，供所有子应用使用
  // 使用动态导入避免循环依赖
  import('../modules/api-services/auth').then(({ authApi }) => {
    (window as any).__APP_AUTH_API__ = authApi;
  }).catch((error) => {
    console.warn('[bootstrap] Failed to expose authApi globally:', error);
  });

  // 暴露 Logo URL 获取函数，保持与其他应用的一致性
  (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();

  // 全局捕获未处理的Promise rejection，防止控制台打印错误
  window.addEventListener('unhandledrejection', (event) => {
    // 检查是否是HTTP错误
    if (event.reason && event.reason.name === 'AxiosError') {
      // 检查是否是接口测试中心的请求（通过URL路径判断）
      const url = event.reason.config?.url || '';
      const isTestCenterRequest = url.includes('/api/system/test/');

      if (!isTestCenterRequest) {
        // 静默处理非测试中心的axios错误，不打印到控制台
        event.preventDefault();

        // 显示用户友好的错误消息
        const message = event.reason.response?.status === 404
          ? '请求的资源不存在'
          : '网络请求失败';

        if ((window as any).BtcMessage) {
          (window as any).BtcMessage.error(message);
        }
      }
      // 对于测试中心的请求，不拦截，让错误正常传播
    }
  });

  // 不再过滤 console.error，允许所有错误日志正常显示
  // 保留原始方法的引用，但不重写 console.error
  // 这样所有错误日志都能正常显示，包括调试日志

  // 重写XMLHttpRequest来拦截网络请求日志
  // 注意：index.html 中已经设置了 HTTP URL 拦截，这里只需要添加日志记录功能
  const currentXHROpen = XMLHttpRequest.prototype.open;
  const currentXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
    // 记录请求信息（用于日志拦截）
    (this as any)._method = method;
    (this as any)._url = url;
    // 调用当前的 open（index.html 中设置的拦截器）
    return currentXHROpen.call(this, method, url, async ?? true, user, password);
  };

  XMLHttpRequest.prototype.send = function(data?: any) {
    // 监听状态变化（用于日志拦截）
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 4) {
        // 检查是否是接口测试中心的请求
        const url = (this as any)._url || '';
        const isTestCenterRequest = url.includes('/api/system/test/');

        // 如果是404错误且不是测试中心的请求，阻止默认的错误日志显示
        if (this.status === 404 && !isTestCenterRequest) {
          // 静默处理404错误，不显示在控制台
          return;
        }
      }
    });

    // 调用当前的 send（index.html 中设置的拦截器）
    return currentXHRSend.call(this, data);
  };

  // 重写fetch来拦截网络请求日志
  // 注意：index.html 中已经设置了 HTTP URL 拦截，这里只需要添加错误处理
  const currentFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    // 调用当前的 fetch（index.html 中设置的拦截器）
    return currentFetch.call(this, input, init).catch((error) => {
      // 如果是网络错误，静默处理
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // 静默处理网络错误
        return Promise.reject(error);
      }
      return Promise.reject(error);
    });
  };
}

// 导出各个模块，供其他地方使用
export * from './core';
export * from './handlers';
export * from './integrations';
