import axios, { AxiosRequestConfig } from 'axios';
import { getCookie, setCookie } from './cookie';
import { useAuthStore } from '@/stores/auth';

/**
 * 获取动态 baseURL
 * 移动应用直接请求生产环境后端，避免协议问题
 */
function getDynamicBaseURL(): string {
  // 优先使用环境变量（使用 try-catch 避免生产环境 import.meta 问题）
  try {
    const env = (import.meta as any).env;
    if (env?.VITE_API_BASE_URL) {
      return env.VITE_API_BASE_URL;
    }
    // 允许通过 VITE_DIRECT_API_BASE_URL 指向特定调试地址（需自行信任证书）
    if (env?.VITE_DIRECT_API_BASE_URL) {
      return env.VITE_DIRECT_API_BASE_URL;
    }
  } catch (e) {
    // 运行时无法访问 import.meta 时（如真机 WebView），统一走 /api（由 Nginx 代理）
    return '/api';
  }

  // 默认：全部走 /api，让 Nginx 处理真正的后端地址，避免浏览器证书错误
  return '/api';
}

/**
 * HTTP 请求工具 - 移动端版本
 */
export class Http {
  public baseURL: string;
  private axiosInstance: any;

  constructor(baseURL = '') {
    // 如果未提供 baseURL，使用动态 baseURL
    this.baseURL = baseURL || getDynamicBaseURL();

    // 创建 axios 实例
    // 注意：withCredentials 在请求拦截器中根据是否跨域动态设置
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });

    // 强制设置 baseURL
    this.axiosInstance.defaults.baseURL = this.baseURL;

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        // 动态更新 baseURL（确保使用最新的 baseURL）
        const dynamicBaseURL = getDynamicBaseURL();
        config.baseURL = dynamicBaseURL;
        this.axiosInstance.defaults.baseURL = dynamicBaseURL;

        // 从 cookie 或 localStorage 获取 token
        const cookieToken = getCookie('access_token');
        const authStore = useAuthStore();
        const storageToken = authStore.token;
        const token = cookieToken || storageToken || '';

        // 如果有 token，设置 Authorization header
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;

          // 如果 cookie 不存在但 storage 中有 token，尝试重新设置 cookie
          if (!cookieToken && storageToken) {
            const isHttps = window.location.protocol === 'https:';
            setCookie('access_token', storageToken, 7, {
              sameSite: isHttps ? 'None' : undefined,
              secure: isHttps,
              path: '/',
            });
          }
        }

        // 根据 baseURL 是否为跨域请求，动态设置 withCredentials
        const isCrossOrigin = dynamicBaseURL && (dynamicBaseURL.startsWith('http://') || dynamicBaseURL.startsWith('https://'));
        if (isCrossOrigin) {
          // 跨域请求：不设置 withCredentials，避免 CORS 错误
          config.withCredentials = false;
          // 跨域请求不发送 X-Tenant-Id（服务器可能不允许此请求头）
        } else {
          // 同源请求（通过代理）：使用 withCredentials 发送 cookie
          config.withCredentials = true;
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
    const onFulfilled = (response: any) => {
      // 检查是否是登录接口的响应
      const isLoginResponse = response.config?.url?.includes('/login') || response.config?.url?.includes('/register');

      // 如果是登录响应，尝试从响应中提取 token 并保存
      if (isLoginResponse) {
        const originalResponseData = response.data;
        const authStore = useAuthStore();

        // 从响应体中提取 token
        // 支持多种字段名：access_token, accessToken, token
        // 同时检查响应是否被包装在 data 字段中
        let tokenFromBody: string | null = null;
        if (originalResponseData) {
          // 直接检查响应数据
          tokenFromBody = originalResponseData.access_token || originalResponseData.accessToken || originalResponseData.token;

          // 如果响应数据被包装在 data 字段中
          if (!tokenFromBody && originalResponseData.data) {
            const data = originalResponseData.data;
            tokenFromBody = data.access_token || data.accessToken || data.token;
          }
        }

        // 如果从响应体中找到了 token，立即保存
        if (tokenFromBody) {
          // 保存到 authStore
          authStore.setToken(tokenFromBody);

          // 手动设置 cookie
          const isHttps = window.location.protocol === 'https:';
          setCookie('access_token', tokenFromBody, 7, {
            sameSite: isHttps ? 'None' : undefined,
            secure: isHttps,
            path: '/',
          });
        } else {
          // 如果响应体没有 token，尝试从 cookie 读取
          const cookieToken = getCookie('access_token');
          if (cookieToken) {
            authStore.setToken(cookieToken);
          }
        }
      }

      return response.data;
    };

    const onRejected = async (error: any) => {
      // 处理错误响应
      if (error.response) {
        // 服务器返回了错误状态码
        const { status, data } = error.response;

        // 401 未授权，清除 token
        if (status === 401) {
          const authStore = useAuthStore();
          authStore.logout();
        }

        // 抛出错误，包含错误信息
        const errorMessage = data?.message || data?.msg || error.message || '请求失败';
        return Promise.reject(new Error(errorMessage));
      } else if (error.request) {
        // 请求已发出但没有收到响应
        return Promise.reject(new Error('网络错误，请检查网络连接'));
      } else {
        // 其他错误
        return Promise.reject(error);
      }
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
}

// 使用动态 baseURL 初始化
export const http = new Http();

