/**
 * 基础服务类
 * 基于统一的 request 函数，参考 cool-admin 的实现
 */

import { request, type Request } from './request';

export interface BaseServiceOptions {
  namespace?: string;
  request?: Request;
}

export class BaseService {
  private namespace: string;
  private request: Request;

  constructor(options: BaseServiceOptions = {}) {
    this.namespace = options.namespace || '';
    this.request = options.request || request;
  }

  /**
   * 静态请求方法
   */
  static async request(options: any): Promise<any> {
    return request(options);
  }

  /**
   * 发起 HTTP 请求
   */
  protected async http<T = any>(options: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
  }): Promise<T> {
    const { url, method = 'GET', data, params } = options;

    // 构建完整 URL
    const fullUrl = this.namespace ? `${this.namespace}${url}` : url;

    return this.request({
      url: fullUrl,
      method,
      data,
      params,
    });
  }

  /**
   * 列表查询
   */
  async list(data?: any): Promise<any[]> {
    return this.http({
      url: '/list',
      method: 'POST',
      data,
    });
  }

  /**
   * 分页查询
   */
  async page(data: any): Promise<{
    list: any[];
    pagination: {
      page: number;
      size: number;
      total: number;
    };
  }> {
    return this.http({
      url: '/page',
      method: 'POST',
      data,
    });
  }

  /**
   * 详情查询
   */
  async info(params: any): Promise<any> {
    return this.http({
      url: '/info',
      method: 'GET',
      params,
    });
  }

  /**
   * 新增
   */
  async add(data: any): Promise<any> {
    return this.http({
      url: '/add',
      method: 'POST',
      data,
    });
  }

  /**
   * 更新
   */
  async update(data: any): Promise<any> {
    return this.http({
      url: '/update',
      method: 'POST',
      data,
    });
  }

  /**
   * 删除
   */
  async delete(data: { ids: (string | number)[] }): Promise<any> {
    return this.http({
      url: '/delete',
      method: 'POST',
      data,
    });
  }
}

