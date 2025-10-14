/**
 * 服务构建器
 * 从 EPS 数据动态生成 service 对象
 */

import { BaseService } from './base';

export interface ApiMethod {
  name: string;
  method: string;
  path: string;
  summary?: string;
}

export interface ServiceModule {
  api: ApiMethod[];
}

export type EpsData = Record<string, ServiceModule>;

/**
 * 动态服务类型
 */
export type DynamicService = Record<string, Record<string, (data?: any) => Promise<any>>>;

export class ServiceBuilder {
  /**
   * 从 EPS 数据构建服务对象
   * @param epsData - virtual:eps 提供的数据
   */
  build(epsData: EpsData): DynamicService {
    const service: DynamicService = {};

    // 遍历每个模块
    for (const [moduleName, moduleData] of Object.entries(epsData)) {
      service[moduleName] = {};

      // 遍历每个 API
      const apis = moduleData.api || [];
      for (const api of apis) {
        // 为每个 API 创建方法
        service[moduleName][api.name] = (data?: any) => {
          return BaseService.request({
            url: api.path,
            method: api.method,
            // GET 请求使用 params，其他使用 data
            ...(api.method.toLowerCase() === 'get'
              ? { params: data }
              : { data }),
          });
        };
      }
    }

    return service;
  }
}

