/**
 * 消息管理器辅助函数
 * 提供统一的消息发送接口
 */
// @ts-expect-error - 类型声明文件可能未构建，但运行时可用
import { BtcMessage } from '@btc/shared-components';

export function useMessage() {
  return {
    success: (message: string) => BtcMessage.success(message),
    error: (message: string) => BtcMessage.error(message),
    warning: (message: string) => BtcMessage.warning(message),
    info: (message: string) => BtcMessage.info(message)
  };
}

