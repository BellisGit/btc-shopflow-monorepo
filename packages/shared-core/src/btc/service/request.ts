/**
 * 统一 HTTP 请求函数
 * 基于 axios，参考 cool-admin 的实现
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

/*
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}
*/

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
 * 判断是否在开发环境中运行
 * 未使用，保留以备将来使用
 */
/*
function isDevelopment(): boolean {
  if (typeof window === 'undefined') return false;
  // 检查是否是开发环境：localhost、127.0.0.1、IP 地址（非生产域名）
  const hostname = window.location.hostname;
  const port = window.location.port;
  // 开发环境特征：localhost、127.0.0.1、内网 IP、或者端口是开发服务器端口（如 8080, 9000 等）
  const isLocal = hostname === 'localhost' ||
                  hostname === '127.0.0.1' ||
                  /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);
  const isDevDomain = hostname.includes('dev') || hostname.includes('test');
  // 如果端口是常见的开发服务器端口，也认为是开发环境
  const isDevPort = Boolean(port && ['8080', '9000', '5173', '3000', '8081'].includes(port));
  return isLocal || isDevDomain || isDevPort;
}
*/

/**
 * 获取动态 baseURL：统一使用 /api，通过代理转发到后端
 * 开发环境：Vite 代理 /api 到 http://10.80.9.76:8115
 * 生产环境：Nginx 代理 /api 到 http://10.0.0.168:8115
 *
 * 注意：所有环境统一使用 /api，不再支持从 localStorage 读取 HTTP URL
 */
function getDynamicBaseURL(): string {
  // 强制验证：在 HTTPS 页面下，强制使用 /api，忽略所有其他值
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // HTTPS 页面：强制清理 localStorage 并返回 /api
    const stored = localStorage.getItem('dev_api_base_url');
    if (stored && stored !== '/api') {
      console.warn('[HTTP] HTTPS 页面：清理 localStorage 中的非 /api baseURL:', stored);
      localStorage.removeItem('dev_api_base_url');
    }
    return '/api';
  }

  // 开发环境（HTTP）：清理所有旧的 localStorage 数据（统一使用 /api，不再支持 HTTP URL）
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dev_api_base_url');
    // 清理所有非 /api 的值（包括 HTTP URL、/api-prod 等）
    if (stored && stored !== '/api') {
      console.warn('[HTTP] 清理 localStorage 中的非 /api baseURL:', stored);
      localStorage.removeItem('dev_api_base_url');
    }
  }

  // 统一返回 /api，由代理处理
  return '/api';
}

export function processURL(baseURL: string, url: string): { url: string; baseURL: string } {
  // 强制验证：在 HTTPS 页面下，baseURL 不能是 HTTP URL
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (baseURL.startsWith('http://')) {
      console.warn('[HTTP] processURL：检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:', baseURL);
      baseURL = '/api';
      // 清理 localStorage 中的 HTTP URL
      localStorage.removeItem('dev_api_base_url');
    }
  }

  // 首先清理 baseURL 中可能存在的重复 /api
  // 如果 baseURL 是完整 URL 且以 /api/api 结尾，移除一个 /api
  let cleanedBaseURL = baseURL;
  if ((cleanedBaseURL.startsWith('http://') || cleanedBaseURL.startsWith('https://')) && cleanedBaseURL.endsWith('/api/api')) {
    cleanedBaseURL = cleanedBaseURL.replace(/\/api\/api$/, '/api');
  }

  // 再次验证：确保清理后的 baseURL 不是 HTTP（在 HTTPS 页面下）
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (cleanedBaseURL.startsWith('http://')) {
      console.warn('[HTTP] processURL：检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:', cleanedBaseURL);
      cleanedBaseURL = '/api';
    }
  }

  // 处理 URL：统一移除 /api 前缀（如果存在），避免重复拼接
  let processedUrl = url;

  // 如果 URL 以 /api/ 开头，移除 /api/ 前缀
  if (processedUrl.startsWith('/api/')) {
    processedUrl = processedUrl.replace(/^\/api\//, '');
  } else if (processedUrl === '/api' || processedUrl.startsWith('/api?')) {
      // URL = '/api' 或 '/api?...'
    processedUrl = processedUrl === '/api' ? '' : processedUrl.replace(/^\/api/, '');
  }

  // 如果处理后的 URL 是绝对路径（以 / 开头），移除前导斜杠，使其成为相对路径
  // 这样 axios 会将相对路径拼接到 baseURL 后面
  if (processedUrl.startsWith('/')) {
    processedUrl = processedUrl.replace(/^\//, '');
  }

      return {
        url: processedUrl,
    baseURL: cleanedBaseURL
  };
}

/**
 * 创建统一的 request 函数
 * @param baseURL 基础 URL（如果为空字符串或未提供，则使用动态 baseURL）
 * @returns Request 函数
 */
export function createRequest(baseURL: string = ''): Request {
  // 如果 baseURL 为空字符串或未提供，使用动态 baseURL
  // 这样 virtual:eps 生成的代码（传入 ''）也能使用动态 baseURL
  let finalBaseURL = baseURL || getDynamicBaseURL();

  // 强制验证：在 HTTPS 页面下，baseURL 不能是 HTTP URL
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (finalBaseURL.startsWith('http://')) {
      console.warn('[HTTP] createRequest：检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:', finalBaseURL);
      finalBaseURL = '/api';
      // 清理 localStorage 中的 HTTP URL
      localStorage.removeItem('dev_api_base_url');
    } else if (finalBaseURL && finalBaseURL !== '/api') {
      // HTTPS 页面下，如果不是 /api，也强制使用 /api
      console.warn('[HTTP] createRequest：检测到 HTTPS 页面，强制使用 /api 代理，忽略 baseURL:', finalBaseURL);
      finalBaseURL = '/api';
    }
  }

  // 创建 axios 实例
  const axiosInstance = axios.create({
    baseURL: finalBaseURL,
    timeout: 120000, // 增加到 120 秒（2分钟），避免长时间请求超时
    withCredentials: true, // 始终设置为 true，发送 cookie
  });

  // 请求拦截器
  axiosInstance.interceptors.request.use(
    (config: any) => {
      // 强制验证：在 HTTPS 页面下，强制使用 /api，忽略所有其他值
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        // HTTPS 页面：强制清理 localStorage 并返回 /api
        const stored = localStorage.getItem('dev_api_base_url');
        if (stored && stored !== '/api') {
          console.warn('[HTTP] HTTPS 页面：清理 localStorage 中的非 /api baseURL:', stored);
          localStorage.removeItem('dev_api_base_url');
        }
        // 强制使用 /api，忽略任何其他值
        config.baseURL = '/api';
        axiosInstance.defaults.baseURL = '/api';

        // 处理 URL（移除 /api 前缀，避免重复拼接）
        if (config.url) {
          const processed = processURL('/api', config.url);
          config.url = processed.url;
          // 确保 baseURL 是 /api
          config.baseURL = '/api';
        }

        // 最终验证：确保 baseURL 不是 HTTP
        if (config.baseURL && config.baseURL.startsWith('http://')) {
          console.error('[HTTP] 严重错误：HTTPS 页面下 baseURL 仍然是 HTTP URL，强制修复为 /api');
          config.baseURL = '/api';
          axiosInstance.defaults.baseURL = '/api';
        }

        return config;
      }

      // 开发环境（HTTP）：正常处理
      // 动态更新 baseURL（支持运行时切换环境）
      const dynamicBaseURL = getDynamicBaseURL();

      // 处理 URL 和 baseURL（统一在这里处理，避免重复处理）
      // 如果请求中提供了自定义 baseURL，优先使用自定义的
      const finalBaseURL = config.baseURL || dynamicBaseURL;

      if (config.url) {
        const originalUrl = config.url;
        const processed = processURL(finalBaseURL, originalUrl);
        config.url = processed.url;
        config.baseURL = processed.baseURL;
      } else {
        config.baseURL = finalBaseURL;
      }

      // 获取 token
      const token = localStorage.getItem('token') || '';
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // 生产环境：添加 x-forward-host 请求头为根域
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const port = window.location.port || '';
        // 判断是否为生产环境：hostname 包含 bellis.com.cn 且不是开发/预览端口
        const isProduction = hostname.includes('bellis.com.cn') &&
                             !port.startsWith('41') &&
                             port !== '5173' &&
                             port !== '3000' &&
                             hostname !== 'localhost' &&
                             !hostname.startsWith('127.0.0.1') &&
                             !hostname.startsWith('10.') &&
                             !hostname.startsWith('192.168.');
        if (isProduction) {
          config.headers['x-forward-host'] = 'bellis.com.cn';
        }
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
    (error: any) => {
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
    (error: any) => {
      // 网络错误或 HTTP 错误 - 输出错误信息用于调试
      console.error('[Request] 请求错误:', error);
      // 返回一个已解决的Promise，避免未处理的Promise rejection
      return Promise.resolve();
    }
  );

  // 返回 request 函数
  return async (options: RequestOptions): Promise<any> => {
    const { url: originalUrl, method = 'GET', data, params, headers, timeout, baseURL: customBaseURL } = options;

    // 直接使用 axios 实例，URL 和 baseURL 的处理在拦截器中统一完成
    // 这样可以避免重复处理，确保 URL 处理的一致性
    const config: AxiosRequestConfig = {
      url: originalUrl, // 原始 URL，由拦截器处理
      method,
      data,
      params,
      headers,
      timeout,
      // 如果提供了自定义 baseURL，传递给拦截器处理
      baseURL: customBaseURL,
    };

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
 * 默认的 request 实例（延迟初始化，避免循环依赖和初始化顺序问题）
 */
let _requestInstance: Request | null = null;

function getRequest(): Request {
  if (!_requestInstance) {
    _requestInstance = createRequest();
  }
  return _requestInstance;
}

export const request: Request = ((options: RequestOptions) => {
  return getRequest()(options);
}) as Request;

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
