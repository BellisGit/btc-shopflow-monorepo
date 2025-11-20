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
import { appStorage } from '../utils/app-storage';

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

  // 设置 loading 页面文本（在 i18n 初始化后）
  // 注释掉 Loading 元素的文本设置，因为 system-app 的 index.html 中没有 #Loading 元素
  // 如果存在 #Loading 元素（可能来自子应用），立即隐藏并移除它
  setTimeout(() => {
        const loading = document.getElementById('Loading');
        if (loading) {
      // 立即隐藏
      loading.style.display = 'none';
      loading.style.visibility = 'hidden';
      loading.style.opacity = '0';
      // 延迟移除
      setTimeout(() => {
        if (loading.parentNode) {
          loading.parentNode.removeChild(loading);
        }
      }, 100);
    }
    // try {
    //   const t = (app.config.globalProperties as any).$t;
    //   if (t) {
    //     const loading = document.getElementById('Loading');
    //     if (loading) {
    //       const nameEl = loading.querySelector('.preload__name');
    //       const titleEl = loading.querySelector('.preload__title');
    //       const subTitleEl = loading.querySelector('.preload__sub-title');

    //       if (nameEl) {
    //         nameEl.textContent = t('app.name') || '拜里斯车间管理系统';
    //       }
    //       if (titleEl) {
    //         titleEl.textContent = t('app.loading.title') || '正在加载资源';
    //       }
    //       if (subTitleEl) {
    //         subTitleEl.textContent = t('app.loading.subtitle') || '部分资源可能加载时间较长，请耐心等待';
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.warn('[i18n] Failed to set loading page text:', error);
    // }
  }, 0);

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
        const isTestCenterRequest = url.includes('/api/system/test/');

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
