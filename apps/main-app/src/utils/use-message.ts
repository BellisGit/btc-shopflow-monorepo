/**
 * 消息管理器辅助函数
 * 提供统一的消息发送接口
 */
export function useMessage() {
  const messageManager = (window as any).messageManager;

  if (!messageManager) {
    console.warn('MessageManager not initialized yet');
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {}
    };
  }

  return {
    success: (message: string) => messageManager.enqueue('success', message),
    error: (message: string) => messageManager.enqueue('error', message),
    warning: (message: string) => messageManager.enqueue('warning', message),
    info: (message: string) => messageManager.enqueue('info', message)
  };
}
