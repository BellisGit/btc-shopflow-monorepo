import { db } from '@/db';

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

export async function enqueueOp(op: { type: string; payload: any }) {
  await db.pending_ops.add({
    type: op.type,
    payload: op.payload,
    ts: Date.now(),
    retries: 0,
  });

  // 注册后台同步（如果支持）
  if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
    try {
      await (self as any).registration.sync.register('sync-pending-ops');
    } catch (error) {
      console.warn('[BackgroundSync] Failed to register sync:', error);
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

  localStorage.setItem('last_sync_time', Date.now().toString());
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

