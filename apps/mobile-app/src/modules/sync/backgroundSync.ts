;
import { storage } from '@btc/shared-utils';
import { db } from '@/db';
import { getDeviceInfo } from '@/utils/device';

// 获取 API baseURL（使用 try-catch 避免生产环境 import.meta 问题）
function getApiBaseURL(): string {
  try {
    return (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.bellis.com.cn/api';
  } catch (e) {
    // 如果 import.meta 不可用，使用生产环境后端
    return 'https://api.bellis.com.cn/api';
  }
}

const API_BASE_URL = getApiBaseURL();

// 轮询间隔（毫秒）
const POLL_INTERVAL = 30 * 1000; // 30秒
let pollTimer: number | null = null;

/**
 * 启动轮询同步（用于不支持Background Sync的设备，如iOS）
 */
function startPollingSync() {
  if (pollTimer !== null) {
    return; // 已经在轮询
  }
  
  const deviceInfo = getDeviceInfo();
  console.info('[BackgroundSync] Starting polling sync for', deviceInfo.brand, deviceInfo.browser);
  
  // 立即执行一次
  processQueue().catch(err => {
    console.warn('[BackgroundSync] Polling sync error:', err);
  });
  
  // 设置定期轮询
  pollTimer = setInterval(() => {
    processQueue().catch(err => {
      console.warn('[BackgroundSync] Polling sync error:', err);
    });
  }, POLL_INTERVAL) as unknown as number;
}

/**
 * 停止轮询同步
 */
function stopPollingSync() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

/**
 * 使用页面可见性API触发同步（iOS降级方案）
 */
function setupVisibilitySync() {
  const deviceInfo = getDeviceInfo();
  
  // iOS设备：使用页面可见性API作为降级方案
  if (deviceInfo.isIOS || !deviceInfo.supportsBackgroundSync) {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // 页面变为可见时，立即处理队列
        processQueue().catch(err => {
          console.warn('[BackgroundSync] Visibility sync error:', err);
        });
      }
    });
    
    // 页面聚焦时也触发同步
    window.addEventListener('focus', () => {
      processQueue().catch(err => {
        console.warn('[BackgroundSync] Focus sync error:', err);
      });
    });
  }
}

// 初始化可见性同步
if (typeof document !== 'undefined') {
  setupVisibilitySync();
}

export async function enqueueOp(op: { type: string; payload: any }) {
  await db.pending_ops.add({
    type: op.type,
    payload: op.payload,
    ts: Date.now(),
    retries: 0,
  });

  const deviceInfo = getDeviceInfo();
  
  // 如果支持Background Sync，使用原生API
  if (deviceInfo.supportsBackgroundSync && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as any).sync.register('sync-pending-ops');
        console.info('[BackgroundSync] Background sync registered');
        return;
      }
    } catch (error) {
      console.warn('[BackgroundSync] Failed to register background sync:', error);
    }
  }
  
  // 降级方案：使用轮询或立即处理（iOS和其他不支持Background Sync的设备）
  if (deviceInfo.isIOS || !deviceInfo.supportsBackgroundSync) {
    console.info('[BackgroundSync] Using fallback sync method for', deviceInfo.brand);
    
    // 启动轮询（如果尚未启动）
    startPollingSync();
    
    // 立即尝试处理一次（如果网络可用）
    if (navigator.onLine) {
      processQueue().catch(err => {
        console.warn('[BackgroundSync] Immediate sync error:', err);
      });
    }
  }
}

export async function processQueue() {
  const ops = await db.pending_ops.where('retries').below(3).toArray();
  
  for (const op of ops) {
    try {
      await syncOp(op);
      await db.pending_ops.delete(op.id!);
    } catch (error) {
      console.error(`[BackgroundSync] Failed to sync op ${op.id}:`, error);
      await db.pending_ops.update(op.id!, {
        retries: (op.retries || 0) + 1,
      });
    }
  }

  storage.set('last_sync_time', Date.now().toString());
}

async function syncOp(op: any) {
  const endpoint = getEndpointForOpType(op.type);
  if (!endpoint) {
    throw new Error(`Unknown operation type: ${op.type}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(op.payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function getEndpointForOpType(type: string): string | null {
  const endpoints: Record<string, string> = {
    count: '/api/inventory/counts',
    session: '/api/inventory/sessions',
    attachment: '/api/inventory/attachments',
  };
  return endpoints[type] || null;
}

