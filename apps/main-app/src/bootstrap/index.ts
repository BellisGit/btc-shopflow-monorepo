/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 *
 * 参考 cool-admin 的架构设计，采用模块化目录结构
 */

import type { App } from 'vue';

// 核心模块
import { setupStore, setupUI, setupRouter, setupI18n } from './core';

// 处理器模块
import { createMessageHandler, initMessageManager, createNotificationHandler, initNotificationManager } from './handlers';

// 集成模块
import { autoDiscoverPlugins, setupMicroApps, setupInterceptors } from './integrations';

// 管理器实例
import { messageManager } from '../utils/message-manager';
import { notificationManager } from '../utils/notification-manager';

/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 */
export async function bootstrap(app: App) {
  // 1. 核心模块初始化
  setupStore(app);      // 状态管理
  setupRouter(app);     // 路由配置
  setupUI(app);         // UI框架配置
  setupI18n(app);       // 国际化配置

  // 2. 集成模块初始化
  await autoDiscoverPlugins(app);  // 自动发现插件
  await setupMicroApps(app);       // 微前端设置
  setupInterceptors();             // 拦截器配置

  // 3. 处理器初始化
  const messageHandler = createMessageHandler();
  const notificationHandler = createNotificationHandler();

  initMessageManager(messageHandler);
  initNotificationManager(notificationHandler);

  // 4. 全局暴露
  (window as any).messageHandler = messageHandler;
  (window as any).notificationHandler = notificationHandler;
  (window as any).messageManager = messageManager;
  (window as any).notificationManager = notificationManager;

  // 暴露 cleanupBadge 方法（生命周期管理器需要）
  (window as any).cleanupBadge = messageHandler.cleanupBadge;
  (window as any).cleanupNotificationBadge = notificationHandler.cleanupBadge;
}

// 导出各个模块，供其他地方使用
export * from './core';
export * from './handlers';
export * from './integrations';
