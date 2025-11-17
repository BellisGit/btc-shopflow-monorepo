import { db } from '@/db';
import { processQueue } from './backgroundSync';

export async function pullUpdates(lastSyncTime?: number) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  
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
    console.error('[SyncService] Failed to pull updates:', error);
    throw error;
  }
}

export async function pushUpdates() {
  await processQueue();
}

export async function fullSync() {
  const lastSyncTime = Number(localStorage.getItem('last_sync_time') || 0);
  await pullUpdates(lastSyncTime);
  await pushUpdates();
}

