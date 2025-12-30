/**
 * 跨子域通信桥类型定义
 */

import type { Ref } from 'vue';

export interface BridgeMessage {
  type: string;
  payload?: any;
  origin?: string;
  timestamp?: number;
}

export interface UseCrossDomainBridgeOptions {
  bridgeUrl?: string;
  onMessage?: (message: BridgeMessage) => void;
  autoCreateIframe?: boolean;
  iframeId?: string;
  enabled?: boolean;
}

export interface UseCrossDomainBridgeReturn {
  sendMessage: (type: string, payload?: any) => void;
  subscribe: (type: string, handler: (payload?: any, origin?: string) => void) => () => void;
  isReady: Ref<boolean>;
  destroy: () => void;
}

export declare function useCrossDomainBridge(
  options?: UseCrossDomainBridgeOptions
): UseCrossDomainBridgeReturn;

