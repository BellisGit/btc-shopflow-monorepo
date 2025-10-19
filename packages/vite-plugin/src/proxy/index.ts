// 代理配置处理

export function getProxyTarget(proxy: any) {
  try {
    // 直接从传入的 proxy 配置中获取目标地址
    if (proxy && typeof proxy === 'object') {
      // 查找第一个代理配置的 target
      for (const [, config] of Object.entries(proxy)) {
        if (config && typeof config === 'object' && 'target' in config) {
          const target = (config as any).target;
          if (target && typeof target === 'string') {
            console.log(`[btc-proxy] Using proxy target: ${target}`);
            return target;
          }
        }
      }
    }
  } catch (err) {
    console.error('[btc-proxy] Failed to get proxy target:', err);
  }

  return '';
}
