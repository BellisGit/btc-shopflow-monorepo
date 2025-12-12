/**
 * EPS 服务模块
 * 提供统一的 EPS 服务加载和共享功能
 * 
 * 此模块用于所有应用共享 EPS 服务代码，避免每个应用都独立打包
 */

import { wrapServiceTree } from '../btc/service';

/**
 * EPS 服务数据接口
 */
export interface EpsServiceData {
  service: any;
  list: any[];
  isUpdate?: boolean;
}

/**
 * 获取全局共享的 EPS 服务
 * 优先从 window.__APP_EPS_SERVICE__ 获取（由 system-app、layout-app 或其他应用提供）
 */
export function getGlobalEpsService(): any {
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
}

/**
 * 创建 EPS 服务
 * 从 virtual:eps 模块加载 EPS 数据，并包装为服务对象
 * 
 * @param epsModule - 从 virtual:eps 导入的模块
 * @returns EPS 服务对象和列表
 */
export function createEpsService(epsModule: any): { service: any; list: any[] } {
  const rawService = epsModule?.service;
  const rawList = epsModule?.list || [];
  
  const raw = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
  const service = wrapServiceTree(raw);
  const list = rawList ?? (epsModule as any)?.list ?? [];
  
  return { service, list };
}

/**
 * 加载 EPS 服务
 * 优先使用全局共享的服务，如果没有则从 virtual:eps 加载本地服务
 * 
 * @param epsModule - 从 virtual:eps 导入的模块（可选）
 * @returns EPS 服务对象和列表
 */
export function loadEpsService(epsModule?: any): { service: any; list: any[] } {
  // 优先使用全局共享的 EPS 服务（由 system-app 或 layout-app 提供）
  const globalService = getGlobalEpsService();
  
  if (globalService) {
    // 使用全局服务
    return {
      service: globalService,
      list: [], // 全局服务可能没有 list，保持兼容性
    };
  }
  
  // 如果没有全局服务，使用本地构建的服务
  if (epsModule) {
    const { service, list } = createEpsService(epsModule);
    
    // 如果子应用独立运行，也将本地服务暴露到全局，供其他组件使用
    if (typeof window !== 'undefined') {
      (window as any).__APP_EPS_SERVICE__ = service;
    }
    
    return { service, list };
  }
  
  // 如果既没有全局服务，也没有本地模块，返回空服务
  return {
    service: {},
    list: [],
  };
}

/**
 * 导出 EPS 服务到全局
 * 确保其他模块也能访问
 * 
 * @param service - EPS 服务对象
 */
export function exportEpsServiceToGlobal(service: any): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // 如果已经有全局服务，不要覆盖它（避免覆盖 layout-app 提供的全局服务）
  if (!(window as any).__APP_EPS_SERVICE__) {
    (window as any).__APP_EPS_SERVICE__ = service;
    (window as any).service = service; // 也设置到 window.service，保持兼容性
    (window as any).__BTC_SERVICE__ = service; // 也设置到 __BTC_SERVICE__，保持兼容性
  }
}

