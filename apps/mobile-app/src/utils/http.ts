import axios, { AxiosRequestConfig } from 'axios';
import { getCookie, setCookie } from './cookie';
import { useAuthStore } from '@/stores/auth';

/**
 * HTTP 请求工具 - 移动端版本
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
      withCredentials: true,
    });

    // 强制设置 baseURL
    this.axiosInstance.defaults.baseURL = this.baseURL;

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
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

        // 确保 withCredentials 设置为 true
        config.withCredentials = true;
        config.headers['X-Tenant-Id'] = 'INTRA_1758330466';

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
      const isLoginResponse = response.config?.url?.includes('/login');

      // 如果是登录响应，尝试从响应中提取 token 并保存
      if (isLoginResponse) {
        const originalResponseData = response.data;
        const authStore = useAuthStore();

        // 从响应体中提取 token
        let tokenFromBody: string | null = null;
        if (originalResponseData) {
          tokenFromBody = originalResponseData.token || originalResponseData.accessToken;
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

export const http = new Http('');

