/**
 * 响应拦截器初始化
 * 用于设置路由实例，支持重定向功能
 */

import { responseInterceptor, type MessageHandler, type ConfirmHandler, type RouterHandler } from '@btc/shared-utils';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { Router } from 'vue-router';

/**
 * 初始化响应拦截器
 * @param router Vue Router 实例
 */
export function initResponseInterceptor(router: Router) {
  // 设置消息处理器 - 只使用 BtcMessage 系统
  const messageHandler: MessageHandler = {
    success: (message: string) => {
      const messageManager = (window as any).BtcMessage;
      if (messageManager && messageManager.success) {
        messageManager.success(message);
      } else {
        // 如果BtcMessage不可用，使用Element Plus的ElMessage作为后备
        ElMessage.success(message);
      }
    },
    error: (message: string) => {
      const messageManager = (window as any).BtcMessage;
      if (messageManager && messageManager.error) {
        messageManager.error(message);
      } else {
        // 如果BtcMessage不可用，使用Element Plus的ElMessage作为后备
        ElMessage.error(message);
      }
    },
    warning: (message: string) => {
      const messageManager = (window as any).BtcMessage;
      if (messageManager && messageManager.warning) {
        messageManager.warning(message);
      } else {
        // 如果BtcMessage不可用，使用Element Plus的ElMessage作为后备
        ElMessage.warning(message);
      }
    },
    info: (message: string) => {
      const messageManager = (window as any).BtcMessage;
      if (messageManager && messageManager.info) {
        messageManager.info(message);
      } else {
        // 如果BtcMessage不可用，使用Element Plus的ElMessage作为后备
        ElMessage.info(message);
      }
    }
  };

  // 设置确认对话框处理器
  const confirmHandler: ConfirmHandler = {
    confirm: (message: string, title = '确认') => {
      return ElMessageBox.confirm(message, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => true).catch(() => false);
    }
  };

  // 设置路由处理器
  const routerHandler: RouterHandler = {
    push: (path: string) => router.push(path)
  };

  // 配置响应拦截器
  responseInterceptor.setMessageHandler(messageHandler);
  responseInterceptor.setConfirmHandler(confirmHandler);
  responseInterceptor.setRouterHandler(routerHandler);
}

/**
 * 响应拦截器工具函数
 */
export { responseInterceptor } from '@btc/shared-utils';
