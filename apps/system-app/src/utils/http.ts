import axios, { AxiosRequestConfig } from 'axios';
import { responseInterceptor } from '@btc/shared-utils';
import { processURL } from '@btc/shared-core';
import { getCookie, setCookie } from './cookie';
import { appStorage } from './app-storage';
import { config } from '../config';

/**
 * HTTP 请求工具 - 简化版本
 */
export class Http {
  public baseURL: string;
  private axiosInstance: any;

  constructor(baseURL = '') {
    this.baseURL = baseURL;

    // 创建 axios 实例
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: true, // 始终设置为 true，发送 cookie
    });

    // 强制设置 baseURL
    this.axiosInstance.defaults.baseURL = this.baseURL;

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        // 动态更新 baseURL（支持运行时切换环境）
        const dynamicBaseURL = getDynamicBaseURL();
        
        // 处理 URL 和 baseURL（避免重复拼接 /api）
        if (config.url) {
          const processed = processURL(dynamicBaseURL, config.url);
          config.url = processed.url;
          config.baseURL = processed.baseURL;
        } else {
          config.baseURL = dynamicBaseURL;
        }
        this.axiosInstance.defaults.baseURL = config.baseURL;
        
        // 优先从 cookie 获取 token（字段名：access_token），如果没有则从统一存储获取
        // 注意：HttpOnly cookie 无法通过 JavaScript 读取，但浏览器会自动在请求中发送
        const cookieToken = getCookie('access_token');
        const storageToken = appStorage.auth.getToken();
        const token = cookieToken || storageToken || '';


        // 如果有 token，设置 Authorization header
        // 即使 cookie 是 HttpOnly 的，浏览器也会自动发送 cookie，但设置 Authorization header 可以确保兼容性
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;

          // 关键：如果 cookie 不存在但 storage 中有 token，尝试重新设置 cookie
          // 注意：浏览器不允许手动设置 Cookie 头（Refused to set unsafe header "Cookie"）
          // 所以只能通过设置 cookie 来让浏览器自动发送
          if (!cookieToken && storageToken) {
            // 尝试重新设置 cookie（即使可能失败，也要尝试）
            const isHttps = window.location.protocol === 'https:';
            setCookie('access_token', storageToken, 7, {
              sameSite: isHttps ? 'None' : undefined,
              secure: isHttps,
              path: '/',
            });
          }
        }

        // 始终设置 withCredentials 为 true，发送 cookie
        config.withCredentials = true;
        
        // 根据请求类型决定是否发送 X-Tenant-Id
        const isCrossOrigin = config.baseURL && (config.baseURL.startsWith('http://') || config.baseURL.startsWith('https://'));
        if (isCrossOrigin) {
          // 跨域请求不发送 X-Tenant-Id（服务器可能不允许此请求头）
          // 如果需要，应该由服务器在 Access-Control-Allow-Headers 中允许
        } else {
          // 同源请求可以发送 X-Tenant-Id
        config.headers['X-Tenant-Id'] = 'INTRA_1758330466';
        }

        const isFormData = config.data instanceof FormData || (config.data && config.data.constructor?.name === 'FormData');
        if (!isFormData) {
          config.headers['Content-Type'] = 'application/json';
        } else {
          delete config.headers['Content-Type'];
        }

        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    const interceptor = responseInterceptor.createResponseInterceptor();

    const onFulfilled = (response: any) => {
      // 检查是否是登录接口的响应
      const isLoginResponse = response.config?.url?.includes('/login');

      const result = interceptor.onFulfilled(response);

      // 如果是登录响应，尝试从响应中提取 token 并保存
      if (isLoginResponse) {
        // 保存原始响应数据，因为拦截器可能会修改
        const originalResponseData = response.data;

        // 检查 Set-Cookie headers，尝试从 cookie 字符串中提取 token 值
        // 注意：在浏览器中，Set-Cookie 响应头可能无法直接访问（出于安全考虑）
        // 但我们可以尝试从响应头中读取
        const setCookieHeaders = response.headers?.['set-cookie'] || [];
        if (setCookieHeaders.length > 0) {
          // 查找包含 access_token 的 cookie
          const accessTokenCookie = Array.isArray(setCookieHeaders)
            ? setCookieHeaders.find((cookie: string) => cookie.includes('access_token'))
            : setCookieHeaders.includes('access_token') ? setCookieHeaders : null;

          if (accessTokenCookie) {
            // 尝试从 cookie 字符串中提取 token 值（仅用于调试，实际可能是 HttpOnly）
            const tokenMatch = typeof accessTokenCookie === 'string'
              ? accessTokenCookie.match(/access_token=([^;]+)/)
              : null;
            if (tokenMatch && tokenMatch[1]) {
              const extractedToken = tokenMatch[1];
              // 保存到统一存储作为备份（即使 cookie 无法发送，也能用 Authorization header）
              appStorage.auth.setToken(extractedToken);
            }
          }
        }

        // 立即从响应体中提取 token（代理已经添加到响应体中）
        // 注意：originalResponseData 是 response.data，包含完整的响应结构
        // result 是经过 responseInterceptor 处理后的数据，可能只包含 data 字段
        let tokenFromBody: string | null = null;

        // 优先检查原始响应数据（代理添加的 token 在这里）
        if (originalResponseData) {
          tokenFromBody = originalResponseData.token ||
                        originalResponseData.accessToken;

        }

        // 如果原始响应数据中没有，检查拦截器处理后的结果
        if (!tokenFromBody && result) {
          // result 可能是处理后的数据，也可能还是完整的响应对象
          if (typeof result === 'object' && result !== null) {
            tokenFromBody = result.token ||
                          result.accessToken;

          }
        }

        // 如果从响应体中找到了 token，立即保存
        if (tokenFromBody) {
          // 保存到 storage
          appStorage.auth.setToken(tokenFromBody);

          // 关键：手动设置 cookie（因为后端需要从 cookie 中读取 token）
          const isHttps = window.location.protocol === 'https:';

          // 在 IP 地址环境下，不设置 SameSite（让浏览器使用默认值）
          // 在 HTTPS 环境下，使用 SameSite=None
          setCookie('access_token', tokenFromBody, 7, {
            sameSite: isHttps ? 'None' : undefined, // IP 地址 + HTTP：不设置 SameSite
            secure: isHttps, // 仅在 HTTPS 时设置 Secure
            path: '/',
          });
        }
      }

      return result;
    };

    const onRejected = async (error: any) => {
      return interceptor.onRejected(error);
    };

    this.axiosInstance.interceptors.response.use(
      onFulfilled,
      onRejected
    );
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.axiosInstance.get(url, { params });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.axiosInstance.post(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.axiosInstance.put(url, data);
  }

  async delete<T = any>(url: string, data?: any): Promise<T> {
    return this.axiosInstance.delete(url, { data });
  }

  async request<T = any>(options: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.request(options);
  }

  getRetryStatus() {
    return { retryCount: 0, isRetrying: false };
  }

  resetRetry() {
    // 简化版本，不需要重试功能
  }

  recreateResponseInterceptor() {
    // 简化版本，不需要重新创建拦截器
  }

  /**
   * 动态修改 baseURL（用于开发环境切换 API 服务器）
   * 注意：在开发环境中，可以直接使用完整 URL 或 /api 路径
   */
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * 获取当前的 baseURL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}


/**
 * 判断是否在开发环境中运行
 */
function isDevelopment(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);
}

/**
 * 获取动态 baseURL（支持开发环境切换）
 * 开发环境：使用 /api（通过 vite 代理）或完整 URL（直接请求生产后端）
 */
function getDynamicBaseURL(): string {
  let baseURL: string;
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dev_api_base_url');
    if (stored) {
      // 自动清理：将旧的 /api-prod 路径转换为完整 URL（兼容旧数据）
      if (stored === '/api-prod') {
        localStorage.setItem('dev_api_base_url', 'https://api.bellis.com.cn/api');
        return 'https://api.bellis.com.cn/api';
      }
      baseURL = stored;
    } else {
      baseURL = config.api.baseURL;
    }
  } else {
    baseURL = config.api.baseURL;
  }
  
  // 清理 baseURL 中可能存在的重复 /api
  // 如果 baseURL 是完整 URL 且以 /api/api 结尾，移除一个 /api
  if ((baseURL.startsWith('http://') || baseURL.startsWith('https://')) && baseURL.endsWith('/api/api')) {
    const cleaned = baseURL.replace(/\/api\/api$/, '/api');
    // 如果是从 localStorage 读取的，更新存储的值
    if (typeof window !== 'undefined' && localStorage.getItem('dev_api_base_url') === baseURL) {
      localStorage.setItem('dev_api_base_url', cleaned);
    }
    return cleaned;
  }
  
  return baseURL;
}

// 从 localStorage 读取 API baseURL（如果存在），否则使用配置中的默认值
function getInitialBaseURL(): string {
  return getDynamicBaseURL();
}

export const http = new Http(getInitialBaseURL());
