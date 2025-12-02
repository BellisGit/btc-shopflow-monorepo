// layout-app 的 EPS 服务
// 使用从 system-app 复制的完整 EPS 数据
import epsModule, { service as rawService, list as rawList } from 'virtual:eps';
import { wrapServiceTree } from '@btc/shared-core';

const raw = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
const service = wrapServiceTree(raw);
const list = rawList ?? (epsModule as any)?.list ?? [];

// 立即将服务暴露到全局，供 shared-components 和其他应用使用
// 这确保了 layout-app 加载时，EPS 服务立即可用
if (typeof window !== 'undefined') {
  (window as any).__APP_EPS_SERVICE__ = service;
  (window as any).service = service; // 也设置到 window.service，保持兼容性
  (window as any).__BTC_SERVICE__ = service; // 也设置到 __BTC_SERVICE__，保持兼容性
  console.log('[layout-app] EPS 服务已暴露到全局，包含的模块:', Object.keys(service));
}

export { service, list };
export default service;

