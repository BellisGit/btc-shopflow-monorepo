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

      // 检查是否是 FormData
      const isFormData = config.data instanceof FormData ||
                        (config.data && config.data.constructor?.name === 'FormData');

      // 如果是 FormData，不设置 Content-Type，让浏览器自动设置（包括 boundary）
      // 否则设置为 application/json
      if (!isFormData) {
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }
      } else {
        // FormData 上传时，删除 Content-Type，让浏览器自动设置（包括 boundary）
        delete config.headers['Content-Type'];
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器 - 提取业务数据
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const responseData = response.data;
      
      // 如果没有 data，返回原始响应
      if (!responseData) {
        return response;
      }

      // 检查是否是标准 API 响应格式 { code: 200, msg: '...', data: {...} }
      if (responseData && typeof responseData === 'object' && responseData.code !== undefined) {
        const { code, data, msg } = responseData;

        // 成功响应（code: 200, 1000, 2000）
        if (code === 1000 || code === 2000) {
          // 返回 data 字段
          return data;
        }

        // code: 200 且消息不包含错误关键词
        if (code === 200) {
          const errorKeywords = [
            '不存在', '错误', '失败', '异常', '无效', '过期', '拒绝', '禁止',
            '未找到', '无法', '不能', '缺少', '不足'
          ];
          
          const hasErrorKeyword = errorKeywords.some(keyword => msg?.includes(keyword));
          
          if (!hasErrorKeyword) {
            // 成功响应，提取 data.data（嵌套的 data）
            if (data && typeof data === 'object' && 'data' in data && !Array.isArray(data)) {
              return data.data;
            }
            // 如果没有嵌套的 data，直接返回 data
            return data;
          }
        }

        // 其他情况（业务错误），返回原始响应对象，让调用方处理
        return response;
      }

      // 如果响应格式不符合标准格式，返回原始响应
      return response;
    },
    (_error) => {
      // 网络错误或 HTTP 错误 - 静默处理，不抛出错误
      // 返回一个已解决的Promise，避免未处理的Promise rejection
      return Promise.resolve();
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

    try {
      const response = await axiosInstance.request(config);
      return response;
    } catch (error) {
      console.error('[Request] 请求失败:', error);
      throw error;
    }
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
