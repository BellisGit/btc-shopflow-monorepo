/**
 * 基础服务类
 * 封装 fetch API 请求
 */

export interface RequestConfig {
  url: string;
  method?: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number; // 超时时间（毫秒）
}

export class BaseService {
  /**
   * 发起 HTTP 请求
   */
  static async request<T = unknown>(config: RequestConfig): Promise<T> {
    const { url, method = 'GET', params, data, headers = {}, timeout = 10000 } = config;

    // 构建完整 URL（处理查询参数）
    let fullUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      const queryString = searchParams.toString();
      fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    }

    // 超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // 构建请求配置
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };

    // 添加请求体（POST/PUT/PATCH）
    if (data && method.toUpperCase() !== 'GET') {
      fetchOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        // 尝试获取错误响应体
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      // 处理空响应或非 JSON 响应
      const text = await response.text();
      if (!text) return undefined as T;

      try {
        return JSON.parse(text) as T;
      } catch {
        return text as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // 区分超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      console.error('Request failed:', error);
      throw error;
    }
  }
}

