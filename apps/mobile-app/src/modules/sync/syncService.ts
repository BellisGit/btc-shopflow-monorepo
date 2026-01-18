;
import { storage } from '@btc/shared-utils';
import { db } from '@/db';
import { processQueue } from './backgroundSync';
import { logger } from '@btc/shared-core';

// 获取 API baseURL（使用 try-catch 避免生产环境 import.meta 问题）
function getApiBaseURL(): string {
  try {
    return (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.bellis.com.cn/api';
  } catch (e) {
    // 如果 import.meta 不可用，使用生产环境后端
    return 'https://api.bellis.com.cn/api';
  }
}

export async function pullUpdates(lastSyncTime?: number) {
  const API_BASE_URL = getApiBaseURL();
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/inventory/sync?since=${lastSyncTime || 0}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 更新本地数据
    if (data.items) {
      for (const item of data.items) {
        await db.items.put(item);
      }
    }
    
    if (data.locations) {
      for (const location of data.locations) {
        await db.locations.put(location);
      }
    }

    return data;
  } catch (error) {
    logger.error('[SyncService] Failed to pull updates:', error);
    throw error;
  }
}

export async function pushUpdates() {
  await processQueue();
}

export async function fullSync() {
  const lastSyncTime = Number(storage.get<number>('last_sync_time') || 0);
  await pullUpdates(lastSyncTime);
  await pushUpdates();
}

