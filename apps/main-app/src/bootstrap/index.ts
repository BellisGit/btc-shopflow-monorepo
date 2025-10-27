/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 *
 * 参考 cool-admin 的架构设计，采用模块化目录结构
 */

import type { App } from 'vue';

// 核心模块
import { setupStore, setupUI, setupRouter, setupI18n, setupEps } from './core';

// 处理器模块
import { createMessageHandler, initMessageManager, createNotificationHandler, initNotificationManager } from './handlers';

// 集成模块
import { autoDiscoverPlugins, setupMicroApps, setupInterceptors } from './integrations';

// 管理器实例
import { notificationManager } from '../utils/notification-manager';
import { BtcMessage } from '@btc/shared-components';

/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 */
export async function bootstrap(app: App) {
  // 1. 核心模块初始化
  setupEps(app);        // EPS 服务（必须在最前面）
  setupStore(app);      // 状态管理
  setupRouter(app);     // 路由配置
  setupUI(app);         // UI框架配置
  setupI18n(app);       // 国际化配置

  // 2. 集成模块初始化
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

  // 全局捕获未处理的Promise rejection，防止控制台打印错误
  window.addEventListener('unhandledrejection', (event) => {
    // 检查是否是HTTP错误
    if (event.reason && event.reason.name === 'AxiosError') {
      // 检查是否是接口测试中心的请求（通过URL路径判断）
      const url = event.reason.config?.url || '';
      const isTestCenterRequest = url.includes('/admin/system/test/');

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

  // 重写console.error来过滤HTTP错误
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');

    // 检查是否是接口测试中心的错误（通过堆栈信息判断）
    const stack = new Error().stack || '';
    const isTestCenterError = stack.includes('api-test-center') ||
                             stack.includes('runTest') ||
                             message.includes('测试错误详情');

    // 过滤掉非测试中心的HTTP错误信息
    if (!isTestCenterError && (
        message.includes('404 (Not Found)') ||
        message.includes('POST http://') ||
        message.includes('GET http://') ||
        message.includes('PUT http://') ||
        message.includes('DELETE http://'))) {
      // 静默处理，不打印到控制台
      return;
    }

    // 其他错误正常打印
    originalConsoleError.apply(console, args);
  };

  // 重写XMLHttpRequest来拦截网络请求日志
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
    (this as any)._method = method;
    (this as any)._url = url;
    return originalXHROpen.call(this, method, url, async ?? true, user, password);
  };

  XMLHttpRequest.prototype.send = function(data?: any) {
    // 监听状态变化
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 4) {
        // 检查是否是接口测试中心的请求
        const url = (this as any)._url || '';
        const isTestCenterRequest = url.includes('/admin/system/test/');

        // 如果是404错误且不是测试中心的请求，阻止默认的错误日志显示
        if (this.status === 404 && !isTestCenterRequest) {
          // 静默处理404错误，不显示在控制台
          return;
        }
      }
    });

    return originalXHRSend.call(this, data);
  };

  // 重写fetch来拦截网络请求日志
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    return originalFetch.call(this, input, init).catch((error) => {
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
