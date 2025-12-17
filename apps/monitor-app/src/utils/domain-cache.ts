/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */

interface ServiceType {
  admin?: {
    iam?: {
      domain?: {
        me?: () => Promise<unknown>;
      };
    };
  };
}

let domainListCache: { data: unknown; timestamp: number } | null = null;
let pendingRequest: Promise<unknown> | null = null;
const CACHE_DURATION = 5000; // 缓存5秒

/**
 * 获取域列表（带缓存和请求锁）
 */
export async function getDomainList(service: ServiceType): Promise<unknown> {
  const now = Date.now();

  // 检查缓存是否有效
  if (domainListCache && (now - domainListCache.timestamp) < CACHE_DURATION) {
    return domainListCache.data;
  }

  // 如果已经有请求在进行，等待该请求完成
  if (pendingRequest) {
    return await pendingRequest;
  }

  // 创建新请求
  pendingRequest = (async () => {
    try {
      if (service.admin?.iam?.domain?.me) {
        const response = await service.admin.iam.domain.me();
      // 更新缓存
      domainListCache = { data: response, timestamp: Date.now() };
      return response;
      }
      return null;
    } finally {
      // 清除请求锁
      pendingRequest = null;
    }
  })();

  return await pendingRequest;
}

/**
 * 清除缓存（用于强制刷新）
 */
export function clearDomainCache(): void {
  domainListCache = null;
  pendingRequest = null;
}
