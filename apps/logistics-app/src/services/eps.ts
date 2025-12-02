import epsModule, { service as rawService, list as rawList } from 'virtual:eps';
import { wrapServiceTree } from '@btc/shared-core';

/**
 * 获取全局共享的 EPS 服务
 * 优先从 window.__APP_EPS_SERVICE__ 获取（由 system-app、layout-app 或其他应用提供）
 */
const getGlobalEpsService = (): any => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
  
  if (globalService && typeof globalService === 'object') {
    // 检查服务是否有有效的内容（不是空对象或 null）
    const keys = Object.keys(globalService);
    if (keys.length > 0) {
      return globalService;
    }
  }
  
  return null;
};

// 优先使用全局共享的 EPS 服务（由 system-app 或 layout-app 提供）
const globalService = getGlobalEpsService();

let localService: any;
let localList: any[] = [];

// 如果没有全局服务，使用本地构建的服务
if (!globalService) {
  const localRaw = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
  localService = wrapServiceTree(localRaw);
  localList = rawList ?? (epsModule as any)?.list ?? [];
  
  // 如果子应用独立运行，也将本地服务暴露到全局，供其他组件使用
  if (typeof window !== 'undefined') {
    (window as any).__APP_EPS_SERVICE__ = localService;
  }
}

// 使用全局服务（如果存在），否则使用本地服务
const service = globalService || localService;
const list = globalService ? ([] as any[]) : localList; // 全局服务可能没有 list，保持兼容性

// 将服务暴露到全局，确保其他模块也能访问
// 但如果已经有全局服务，不要覆盖它（避免覆盖 layout-app 提供的全局服务）
if (typeof window !== 'undefined' && !globalService) {
  (window as any).__APP_EPS_SERVICE__ = service;
}

export { service, list };
export default service;
