import axios, { AxiosRequestConfig } from 'axios';
import { getCookie, setCookie } from '@btc/shared-core/utils/cookie';
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
      timeout: 120000, // 增加到 120 秒（2分钟），避免长时间请求超时
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

        // 检查是否是一键登录相关的接口（不需要携带cookie和token）
        const url = config.url || '';
        const isNumberAuthEndpoint = 
          url.includes('/system/auth/getAuthToken') ||
          url.includes('/system/auth/getPhoneWithToken');

        if (!isNumberAuthEndpoint) {
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
              const hostname = window.location.hostname;
              // 对于生产环境，设置 domain 以便跨子域名共享 cookie
              const domain = hostname.includes('bellis.com.cn') ? '.bellis.com.cn' : undefined;
              setCookie('access_token', storageToken, 7, {
                sameSite: isHttps ? 'None' : undefined,
                secure: isHttps,
                path: '/',
                domain,
              });
            }
          }
        } else {
          // 一键登录接口：不添加 Authorization header
          delete config.headers['Authorization'];
        }

        // 根据 baseURL 是否为跨域请求，动态设置 withCredentials
        // 注意：只有一键登录接口不携带cookie，其他接口都应该携带cookie
        const isCrossOrigin = dynamicBaseURL && (dynamicBaseURL.startsWith('http://') || dynamicBaseURL.startsWith('https://'));
        if (isNumberAuthEndpoint) {
          // 一键登录接口：不设置 withCredentials，避免携带cookie
          config.withCredentials = false;
        } else if (isCrossOrigin) {
          // 跨域请求：根据实际情况决定是否携带cookie
          // 如果后端支持CORS withCredentials，可以设置为true
          config.withCredentials = true;
        } else {
          // 同源请求（通过代理）：使用 withCredentials 发送 cookie
          config.withCredentials = true;
          // 同源请求可以发送 X-Tenant-Id
          config.headers['X-Tenant-Id'] = 'INTRA_1758330466';
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
      const originalResponseData = response.data;

      // 处理标准的 API 响应格式：{ code, msg, data }
      // 如果响应包含 code 字段，说明是标准格式
      if (originalResponseData && typeof originalResponseData === 'object' && 'code' in originalResponseData) {
        const { code, msg, data } = originalResponseData;

        // 如果 code 不是 200，抛出错误
        if (code !== 200) {
          const errorMessage = msg || '请求失败';
          return Promise.reject(new Error(errorMessage));
        }

        // code 为 200 时，返回 data 字段的内容
        // 对于登录/注册接口，需要特殊处理 token 提取
        const isLoginResponse = response.config?.url?.includes('/login') || response.config?.url?.includes('/register');
        if (isLoginResponse) {
          const authStore = useAuthStore();

          // 从 data 中提取 token
          let tokenFromBody: string | null = null;
          if (data) {
            tokenFromBody = data.access_token || data.accessToken || data.token;
          }

          // 如果从 data 中找到了 token，立即保存
          if (tokenFromBody) {
            // 保存到 authStore
            authStore.setToken(tokenFromBody);

            // 手动设置 cookie
            const isHttps = window.location.protocol === 'https:';
            const hostname = window.location.hostname;
            // 对于生产环境，设置 domain 以便跨子域名共享 cookie
            const domain = hostname.includes('bellis.com.cn') ? '.bellis.com.cn' : undefined;
            setCookie('access_token', tokenFromBody, 7, {
              sameSite: isHttps ? 'None' : undefined,
              secure: isHttps,
              path: '/',
              domain,
            });
          } else {
            // 如果 data 中没有 token，尝试从 cookie 读取
            const cookieToken = getCookie('access_token');
            if (cookieToken && cookieToken.trim()) {
              authStore.setToken(cookieToken);
            }
          }
        }

        // 返回 data 字段的内容
        return data;
      }

      // 如果不是标准格式，按原来的逻辑处理（向后兼容）
      // 检查是否是登录接口的响应
      const isLoginResponse = response.config?.url?.includes('/login') || response.config?.url?.includes('/register');

      // 如果是登录响应，尝试从响应中提取 token 并保存
      if (isLoginResponse) {
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
          if (cookieToken && cookieToken.trim()) {
            authStore.setToken(cookieToken);
          }
        }
      }

      return originalResponseData;
    };

    const onRejected = async (error: any) => {
      // 处理错误响应
      if (error.response) {
        // 服务器返回了错误状态码
        const { status, data } = error.response;

        // 401 未授权，清除 token 并跳转到登录页
        if (status === 401) {
          const authStore = useAuthStore();
          authStore.logout();
          
          // 跳转到登录页（排除登录和注册接口本身）
          const url = error.config?.url || '';
          const isAuthEndpoint = url.includes('/login') || url.includes('/register') || url.includes('/auth/');
          if (!isAuthEndpoint) {
            // 使用动态导入避免循环依赖
            import('@/router').then(({ default: router }) => {
              const currentPath = router.currentRoute.value.fullPath;
              router.push({ name: 'Login', query: { oauth_callback: currentPath } });
            });
          }
        }

        // 优先从响应数据中提取错误信息
        // 后端可能返回标准格式：{ code, msg, data }
        let errorMessage: string;
        if (data && typeof data === 'object') {
          // 如果响应数据是标准格式，优先使用 msg
          if ('msg' in data && data.msg) {
            errorMessage = data.msg;
          } else if ('message' in data && data.message) {
            errorMessage = data.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else {
            errorMessage = '请求失败';
          }
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = '请求失败';
        }

        return Promise.reject(new Error(errorMessage));
      } else if (error.request) {
        // 请求已发出但没有收到响应
        return Promise.reject(new Error('网络错误，请检查网络连接'));
      } else {
        // 其他错误（包括从 onFulfilled 中抛出的业务逻辑错误）
        // 这些错误已经包含了正确的错误信息（msg），直接返回
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

