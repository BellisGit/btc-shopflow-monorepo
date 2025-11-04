import axios, { AxiosRequestConfig } from 'axios';
import { responseInterceptor } from '@btc/shared-utils';
import { requestLogger } from './request-logger';
import { createHttpRetry, RETRY_CONFIGS } from '@/composables/useRetry';
import { getCookie, deleteCookie } from './cookie';

/**
 * HTTP 请求工具 - 基于 axios，参考 cool-admin 的实现
 */
export class Http {
  public baseURL: string;
  private axiosInstance: any;
  private retryManager: ReturnType<typeof createHttpRetry>;
  // 刷新 token 相关状态
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL = '') {
    this.baseURL = baseURL;

    // 创建重试管理器
    this.retryManager = createHttpRetry(RETRY_CONFIGS.standard);

    // 创建 axios 实例
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: true, // 启用 cookie 支持
    });


    // 强制设置 baseURL（防止 axios 实例创建时丢失）
    this.axiosInstance.defaults.baseURL = this.baseURL;

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        // 优先从 cookie 获取 token（字段名：access_token），如果没有则从 localStorage 获取（兼容旧代码）
        // 注意：HttpOnly cookie 无法通过 JavaScript 读取，但浏览器会自动在请求中发送
        const token = getCookie('access_token') || localStorage.getItem('token') || '';
        
        
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 确保 withCredentials 设置为 true（覆盖任何可能的配置覆盖）
        config.withCredentials = true;

        // 添加租户ID请求头
        config.headers['X-Tenant-Id'] = 'INTRA_1758330466';

        // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
        // 否则设置为 application/json
        const isFormData = config.data instanceof FormData || (config.data && config.data.constructor?.name === 'FormData');
        if (!isFormData) {
        config.headers['Content-Type'] = 'application/json';
        } else {
          // FormData 上传时，删除 Content-Type，让浏览器自动设置（包括 boundary）
          delete config.headers['Content-Type'];
        }

        // 记录请求开始时间，用于计算耗时
        config.metadata = { startTime: Date.now() };

        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器会自动使用 messageManager，不需要设置 messageHandler

    // 响应拦截器 - 使用新的响应拦截工具
    const interceptor = responseInterceptor.createResponseInterceptor();

    // 包装响应拦截器，添加请求日志记录和 token 刷新逻辑
    const onFulfilled = (response: any) => {
      // 检查是否是登录接口的响应
      const isLoginResponse = response.config?.url?.includes('/login');
      
      // 调试日志：检查响应拦截器调用
      console.log('[Http.onFulfilled] 收到 Axios 响应:', {
        url: response.config?.url,
        hasData: !!response.data,
        dataCode: response.data?.code,
        dataMsg: response.data?.msg
      });
      
      this.recordRequestLog(response, 'success');
      const result = interceptor.onFulfilled(response);
      
      // 调试日志：检查拦截器返回结果
      console.log('[Http.onFulfilled] 拦截器返回结果:', {
        resultType: typeof result,
        isResponseObject: result && result.data && result.status && result.headers,
        hasList: result && typeof result === 'object' && 'list' in result,
        hasTotal: result && typeof result === 'object' && 'total' in result
      });
      
      // 如果是登录响应，尝试从响应中提取 token 并保存
      if (isLoginResponse) {
        // 保存原始响应数据，因为拦截器可能会修改
        const originalResponseData = response.data;
        
        // 检查 Set-Cookie headers，尝试从 cookie 字符串中提取 token 值
        const setCookieHeaders = response.headers?.getSetCookie?.() || [];
        if (setCookieHeaders.length > 0) {
          // 查找包含 access_token 的 cookie
          const accessTokenCookie = setCookieHeaders.find((cookie: string) => 
            cookie.includes('access_token')
          );
          if (accessTokenCookie) {
            // 尝试从 cookie 字符串中提取 token 值（仅用于调试，实际可能是 HttpOnly）
            const tokenMatch = accessTokenCookie.match(/access_token=([^;]+)/);
            if (tokenMatch && tokenMatch[1]) {
              const extractedToken = tokenMatch[1];
              // 保存到 localStorage 作为备份（即使 cookie 无法发送，也能用 Authorization header）
              localStorage.setItem('token', extractedToken);
            }
          }
        }
        
        // 延迟检查 cookie（等待浏览器设置完成）
        setTimeout(() => {
          const token = getCookie('access_token') || localStorage.getItem('token');
          if (!token) {
            // 尝试从原始响应数据中提取 token（可能在不同层级）
            let tokenValue: string | null = null;
            
            // 检查原始响应数据
            if (originalResponseData) {
              tokenValue = originalResponseData.token || 
                          originalResponseData.accessToken ||
                          originalResponseData.data?.token ||
                          originalResponseData.data?.accessToken ||
                          originalResponseData.data?.data?.token;
            }
            
            // 检查拦截器处理后的结果
            if (!tokenValue && result) {
              tokenValue = result.token || 
                          result.accessToken ||
                          result.data?.token ||
                          result.data?.accessToken;
            }
            
            if (tokenValue) {
              localStorage.setItem('token', tokenValue);
            }
          }
        }, 100);
      }
      
      return result;
    };

    const onRejected = async (error: any) => {
      const originalRequest = error.config;

      // 检查是否是 401 错误（未授权）
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        // 检查是否是刷新 token 的请求本身，避免无限循环
        if (originalRequest.url?.includes('/refresh/access-token')) {
          // 刷新 token 请求也返回 401，说明 session 已失效，需要重新登录
          this.recordRequestLog(error.response || { config: error.config }, 'failed');
          return interceptor.onRejected(error);
        }

        // 如果正在刷新中，将请求加入队列
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.refreshSubscribers.push((token: string) => {
              // 更新请求的 Authorization header
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              // 重试原请求
              this.axiosInstance(originalRequest)
                .then(resolve)
                .catch(reject);
            });
          });
        }

        // 标记正在刷新
        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          // 导入 authApi（动态导入避免循环依赖）
          const { authApi } = await import('@/modules/api-services');
          
          // 调用刷新 token API
          await authApi.refreshAccessToken();
          
          // 从 cookie 获取新的 token
          const newToken = getCookie('access_token');
          
          if (newToken) {
            // 通知所有等待的请求
            this.refreshSubscribers.forEach(cb => cb(newToken));
            this.refreshSubscribers = [];
            
            // 更新原请求的 Authorization header
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // 重试原请求
            this.isRefreshing = false;
            return this.axiosInstance(originalRequest);
          } else {
            throw new Error('刷新 token 后未获取到新的 token');
          }
        } catch (refreshError) {
          // 刷新失败，清空队列并跳转登录
          this.refreshSubscribers = [];
          this.isRefreshing = false;
          
          // 清除 cookie 和 localStorage
          deleteCookie('access_token');
          localStorage.removeItem('token');
          
          // 记录日志并使用响应拦截器处理错误（会跳转登录页）
          this.recordRequestLog(error.response || { config: error.config }, 'failed');
          return interceptor.onRejected(error);
        }
      }

      // 其他错误正常处理
      this.recordRequestLog(error.response || { config: error.config }, 'failed');
      return interceptor.onRejected(error);
    };

    this.axiosInstance.interceptors.response.use(
      onFulfilled,
      onRejected
    );
  }

  /**
   * 限制对象大小，防止过大的数据导致问题
   */
  private limitObjectSize(obj: any, maxDepth: number, maxSize: number): any {
    if (maxDepth <= 0 || maxSize <= 0) {
      return '[数据过大，已截断]';
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return obj.length > maxSize ? obj.substring(0, maxSize) + '...' : obj;
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      const limitedArray: any[] = [];
      let currentSize = 0;
      for (let i = 0; i < obj.length && currentSize < maxSize; i++) {
        const limitedItem = this.limitObjectSize(obj[i], maxDepth - 1, maxSize - currentSize);
        limitedArray.push(limitedItem);
        currentSize += JSON.stringify(limitedItem).length;
      }
      return limitedArray;
    }

    if (typeof obj === 'object') {
      const limitedObj: any = {};
      let currentSize = 0;
      for (const key in obj) {
        if (currentSize >= maxSize) {
          limitedObj['...'] = '[更多数据已截断]';
          break;
        }
        const limitedValue = this.limitObjectSize(obj[key], maxDepth - 1, maxSize - currentSize);
        limitedObj[key] = limitedValue;
        currentSize += JSON.stringify(limitedValue).length;
      }
      return limitedObj;
    }

    return obj;
  }

  /**
   * 记录请求日志
   */
  private recordRequestLog(response: any, status: 'success' | 'failed') {
    try {
      const config = response?.config || {};
      
      // 检查用户是否已登录，未登录时不记录日志
      const token = getCookie('access_token') || localStorage.getItem('token') || '';
      if (!token) {
        return; // 未登录用户不记录请求日志
      }

      // 获取用户信息
      let userId: number | undefined;
      let userName: string | undefined;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user?.id;
          userName = user?.name || user?.username;
        }
      } catch (err) {
        // 获取用户信息失败，仍然记录日志但不包含用户信息
        console.warn('获取用户信息失败:', err);
      }

      // 如果没有用户ID，说明未登录或用户信息不完整，不记录日志
      if (!userId) {
        return;
      }

      // 过滤不需要记录的接口（登录、验证码等公开接口）
      const url = config.url || '';
      const filteredPaths = [
        '/login',
        '/register',
        '/captcha',
        '/code/sms/send',
        '/code/email/send',
        '/refresh/access-token',
        '/logout',
        '/api/system/log/sys/request/update',
        '/api/system/log/sys/operation/update'
      ];
      
      if (filteredPaths.some(path => url.includes(path))) {
        return; // 跳过这些接口的日志记录
      }

      const startTime = config.metadata?.startTime || Date.now();
      const duration = Date.now() - startTime;

      // 处理请求参数，确保是对象格式而不是字符串
      let params = {};
      if (config.method === 'GET') {
        // GET请求的参数
        params = config.params || {};
      } else {
        // POST/PUT/DELETE请求的数据
        if (typeof config.data === 'string') {
          try {
            // 限制字符串长度，避免过长的数据
            const dataStr = config.data.length > 10000 ? config.data.substring(0, 10000) + '...' : config.data;
            // 如果是JSON字符串，尝试解析
            params = JSON.parse(dataStr);
          } catch {
            // 解析失败，使用原始字符串（截断）
            const dataStr = config.data.length > 1000 ? config.data.substring(0, 1000) + '...' : config.data;
            params = { raw: dataStr };
          }
        } else {
          // 已经是对象格式，限制深度和大小
          params = this.limitObjectSize(config.data || {}, 5, 10000);
        }
      }

      // 记录请求日志
      requestLogger.add({
        userId,
        username: userName || '',
        requestUrl: config.url || '',
        params, // 传入对象格式，在 add 方法中会被转换为 JSON 字符串
        ip: '', // 由后端从请求头中获取真实IP
        duration,
        status,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any); // 使用 as any 避免类型检查，因为 params 在 add 方法中会被处理
    } catch (error) {
      // 日志记录失败不应影响主业务流程
      console.error('记录请求日志失败:', error);
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.get(url, { params }),
      RETRY_CONFIGS.fast
    );
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.post(url, data),
      RETRY_CONFIGS.standard
    );
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.put(url, data),
      RETRY_CONFIGS.standard
    );
  }

  async delete<T = any>(url: string, data?: any): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.delete(url, { data }),
      RETRY_CONFIGS.standard
    );
  }

  async request<T = any>(options: AxiosRequestConfig): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.request(options),
      RETRY_CONFIGS.standard
    );
  }

  // 检查拦截器状态的方法
  checkInterceptors() {
  }

  /**
   * 获取重试状态
   */
  getRetryStatus() {
    return this.retryManager.getStatus();
  }

  /**
   * 重置重试状态
   */
  resetRetry() {
    this.retryManager.reset();
  }

  // 测试响应拦截器的方法
  testResponseInterceptor() {
    const interceptor = responseInterceptor.createResponseInterceptor();


    // 模拟一个成功的响应
    const mockResponse = {
      data: { code: 200, msg: '测试消息', data: null },
      status: 200,
      config: { url: '/test' }
    };


    try {
      const result = interceptor.onFulfilled(mockResponse);
    } catch (error) {
      console.error('Interceptor error:', error);
    }
  }

  // 检查是否为真正的成功响应
  private isRealSuccessResponse(code: number, msg?: string): boolean {
    // 明确的成功状态码
    if (code === 2000 || code === 1000) {
      return true;
    }

    // 对于 code: 200，需要检查消息内容
    if (code === 200) {
      // 如果没有消息，认为是成功
      if (!msg) {
        return true;
      }

      // 检查消息是否包含错误关键词
      const errorKeywords = [
        '不存在',
        '错误',
        '失败',
        '异常',
        '无效',
        '过期',
        '拒绝',
        '禁止',
        '未找到',
        '无法',
        '不能',
        '缺少',
        '不足'
      ];

      // 如果消息包含错误关键词，认为是错误响应
      const hasErrorKeyword = errorKeywords.some(keyword =>
        msg.includes(keyword)
      );

      return !hasErrorKeyword;
    }

    // 其他状态码都不是成功
    return false;
  }

  // 重新创建响应拦截器的方法
  async recreateResponseInterceptor() {
    // 清除现有的响应拦截器
    this.axiosInstance.interceptors.response.clear();

    // 直接创建新的响应拦截器（绕过模块缓存）
    const interceptor = {
      onFulfilled: (response: any) => {
        const { data, status } = response;

        // 如果响应数据为空，检查HTTP状态码
        if (!data) {
          // 对于404等错误状态码，即使没有响应体也要按错误处理
          if (status === 404) {
            const error = new Error('请求的资源不存在');
            (error as any).code = 404;
            (error as any).response = response;
            return Promise.reject(error);
          }
          // 其他空响应按成功处理
          return response;
        }

        // 检查是否为真正的成功响应
        const { code, msg } = data;
        if (code === undefined || code === null) {
          return data;
        }

        // 检查是否为真正的成功响应
        const isRealSuccess = this.isRealSuccessResponse(code, msg);
        if (isRealSuccess) {
          return data.data;
        }

        // 业务错误，抛出错误
        const error = new Error(msg || '未知错误');
        (error as any).code = code;
        (error as any).response = response;
        return Promise.reject(error);
      },

      onRejected: (error: any) => {
        // 检查是否是业务错误
        if (error.code && typeof error.code === 'number') {
          return Promise.reject(error);
        } else {
          return Promise.reject(error);
        }
      }
    };

    this.axiosInstance.interceptors.response.use(
      interceptor.onFulfilled,
      interceptor.onRejected
    );
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
export function createMockCrudService(_resource: string) {
  return {
    // 分页查询
    page: async (params: any) => {
      return {
        list: [],
        total: 0,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        totalPage: 0
      };
    },

    // 获取列表
    list: async (_params?: any) => {
      return [];
    },

    // 获取详情
    info: async (_params: any) => {
      return {};
    },

    // 添加数据
    add: async (_data: any) => {
      // 不返回任何值，符合 CrudService 的 void 返回类型
    },

    // 更新数据
    update: async (_data: any) => {
      // 不返回任何值，符合 CrudService 的 void 返回类型
    },

    // 删除数据
    delete: async (_ids: (string | number)[]) => {
      // 不返回任何值，符合 CrudService 的 void 返回类型
    }
  };
}

