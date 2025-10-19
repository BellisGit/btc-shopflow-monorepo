import axios, { AxiosRequestConfig } from 'axios';
import { useMessage } from './use-message';
import { responseInterceptor } from '@btc/shared-utils';

/**
 * HTTP 请求工具 - 基于 axios，参考 cool-admin 的实现
 */
export class Http {
  private baseURL: string;
  private axiosInstance: any;

  constructor(baseURL = '') {
    this.baseURL = baseURL;

    // 创建 axios 实例
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: false,
    });

    // 强制设置 baseURL（防止 axios 实例创建时丢失）
    this.axiosInstance.defaults.baseURL = this.baseURL;

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        // 获取 token
        const token = localStorage.getItem('token') || '';
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 添加租户ID请求头
        config.headers['X-Tenant-Id'] = 'INTRA_1758330466';

        config.headers['Content-Type'] = 'application/json';
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // 设置响应拦截器的消息处理器
    const message = useMessage();
    responseInterceptor.setMessageHandler({
      success: (msg: string) => message.success(msg),
      error: (msg: string) => message.error(msg),
      warning: (msg: string) => message.warning(msg),
      info: (msg: string) => message.info(msg),
    });

    // 响应拦截器 - 使用新的响应拦截工具
    const interceptor = responseInterceptor.createResponseInterceptor();
    this.axiosInstance.interceptors.response.use(
      interceptor.onFulfilled,
      interceptor.onRejected
    );
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.axiosInstance.get(url, { params });
    return response;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post(url, data);
    return response;
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put(url, data);
    return response;
  }

  async delete<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.delete(url, { data });
    return response;
  }

  async request<T = any>(options: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request(options);
    return response;
  }
}

export const http = new Http('');


/**
 * 基础服务类 - 参考 cool-admin 的 BaseService
 */
export class BaseService {
  private namespace?: string;

  constructor(namespace?: string) {
    if (namespace) {
      this.namespace = namespace;
    }
  }

  // 发送请求
  async request(options: AxiosRequestConfig = {}) {
    let url = options.url;

    if (url && url.indexOf('http') < 0) {
      if (this.namespace) {
        url = this.namespace + url;
      }
    }

    return http.request({
      ...options,
      url
    });
  }

  // 获取列表
  async list(data: any) {
    return this.request({
      url: '/list',
      method: 'POST',
      data
    });
  }

  // 分页查询 - 使用 POST 请求
  async page(data: any) {
    return this.request({
      url: '/page',
      method: 'POST',
      data
    });
  }

  // 获取信息
  async info(params: any) {
    return this.request({
      url: '/info',
      method: 'GET',
      params
    });
  }

  // 更新数据
  async update(data: any) {
    return this.request({
      url: '/update',
      method: 'POST',
      data
    });
  }

  // 删除数据
  async delete(data: any) {
    return this.request({
      url: '/delete',
      method: 'POST',
      data
    });
  }

  // 添加数据
  async add(data: any) {
    return this.request({
      url: '/add',
      method: 'POST',
      data
    });
  }
}

/**
 * 创建标准 CRUD 服务 - 参考 cool-admin 的模式
 */
export function createCrudService(resource: string) {
  const service = new BaseService(`/${resource}`);

  return {
    // 分页查询 - 使用 POST 请求，参数在请求体中
    page: async (params: any) => {
      // 转换参数格式，适配后端 API
      const requestData = {
        pageNumber: params.page || params.pageNumber || 1,
        pageSize: params.size || params.pageSize || 20,
        keyword: params.keyword || params.keyWord,
        ...params // 包含其他参数如 departmentIds 等
      };

      const response = await service.page(requestData);

      // 转换响应格式，适配前端 CRUD 组件
      return {
        list: response.records || response.list || [],
        total: response.totalRow || response.total || 0,
        pageNumber: response.pageNumber || requestData.pageNumber,
        pageSize: response.pageSize || requestData.pageSize,
        totalPage: response.totalPage || Math.ceil((response.totalRow || response.total || 0) / requestData.pageSize)
      };
    },

    // 获取列表
    list: async (params?: any) => {
      return service.list(params || {});
    },

    // 获取详情
    info: async (params: any) => {
      return service.info(params);
    },

    // 添加数据
    add: async (data: any) => {
      return service.add(data);
    },

    // 更新数据
    update: async (data: any) => {
      return service.update(data);
    },

    // 删除数据
    delete: async (data: { ids: (string | number)[] }) => {
      return service.delete(data);
    }
  };
}

/**
 * 创建模拟 CRUD 服务 - 用于开发测试
 */
export function createMockCrudService(resource: string) {
  return {
    // 分页查询
    page: async (params: any) => {
      console.log(`[Mock] ${resource} page called with:`, params);
      return {
        list: [],
        total: 0,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        totalPage: 0
      };
    },

    // 获取列表
    list: async (params?: any) => {
      console.log(`[Mock] ${resource} list called with:`, params);
      return [];
    },

    // 获取详情
    info: async (params: any) => {
      console.log(`[Mock] ${resource} info called with:`, params);
      return null;
    },

    // 添加数据
    add: async (data: any) => {
      console.log(`[Mock] ${resource} add called with:`, data);
      return { success: true };
    },

    // 更新数据
    update: async (data: any) => {
      console.log(`[Mock] ${resource} update called with:`, data);
      return { success: true };
    },

    // 删除数据
    delete: async (data: { ids: (string | number)[] }) => {
      console.log(`[Mock] ${resource} delete called with:`, data);
      return { success: true };
    }
  };
}

