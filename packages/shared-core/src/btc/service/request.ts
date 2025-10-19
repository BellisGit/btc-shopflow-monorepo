/**
 * 统一 HTTP 请求函数
 * 基于 axios，参考 cool-admin 的实现
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export interface RequestOptions extends AxiosRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  timeout?: number;
  baseURL?: string;
  permission?: string; // 添加权限字段
}

/**
 * 请求函数类型定义
 */
export type Request = (options: RequestOptions) => Promise<any>;

/**
 * 创建统一的 request 函数
 * @param baseURL 基础 URL
 * @returns Request 函数
 */
export function createRequest(baseURL = '/api'): Request {
  // 创建 axios 实例
  const axiosInstance = axios.create({
    baseURL,
    timeout: 30000,
    withCredentials: false,
  });

  // 请求拦截器
  axiosInstance.interceptors.request.use(
    (config) => {
      // 获取 token
      const token = localStorage.getItem('token') || '';
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // 设置默认 Content-Type
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const { code, data, message } = response.data as ApiResponse;

      // 成功响应
      if (code === 1000) {
        return data;
      }

      // 业务错误
      throw new Error(message || 'Request failed');
    },
    (error) => {
      // 网络错误或 HTTP 错误
      if (error.response) {
        const { status, data } = error.response;
        const message = data?.message || `HTTP ${status} Error`;
        throw new Error(message);
      } else if (error.request) {
        throw new Error('Network Error');
      } else {
        throw new Error(error.message || 'Request Error');
      }
    }
  );

  // 返回 request 函数
  return async (options: RequestOptions): Promise<any> => {
    const { url, method = 'GET', data, params, headers, timeout, baseURL: customBaseURL } = options;

    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      params,
      headers,
      timeout,
    };

    // 如果有自定义 baseURL，临时覆盖
    if (customBaseURL) {
      config.baseURL = customBaseURL;
    }

    return axiosInstance.request(config);
  };
}

/**
 * 默认的 request 实例
 */
export const request = createRequest();

/**
 * 创建带权限检查的 request 函数
 * @param permissions 权限映射
 * @param baseURL 基础 URL
 * @returns 带权限检查的 Request 函数
 */
export function createRequestWithPermission(
  permissions: Record<string, boolean> = {},
  baseURL = '/api'
): Request {
  const baseRequest = createRequest(baseURL);

  return async (options: RequestOptions): Promise<any> => {
    // 检查权限（如果有权限标识）
    const permissionKey = options.permission;
    if (permissionKey && permissions[permissionKey] === false) {
      throw new Error('Permission denied');
    }

    return baseRequest(options);
  };
}
