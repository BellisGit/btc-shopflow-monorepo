import { ElMessage } from 'element-plus';

interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

interface PageResponse<T = any> {
  pageNumber: number;
  pageSize: number;
  records: T[];
  totalRow: number;
  totalPage: number;
}

/**
 * HTTP 请求工具
 */
export class Http {
  private baseURL: string;

  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const fullUrl = `${this.baseURL}${url}`;

    // 获取 token（从 localStorage 或其他存储）
    const token = localStorage.getItem('token') || '';

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.code !== 2000) {
        throw new Error(result.msg || 'Request failed');
      }

      return result.data;
    } catch (error: any) {
      ElMessage.error(error.message || 'Network error');
      throw error;
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const query = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${url}${query}`, { method: 'GET' });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

export const http = new Http();

/**
 * 创建标准 CRUD 服务
 */
export function createCrudService(resource: string) {
  return {
    page: async (params: { page: number; size: number; keyword?: string }) => {
      const response = await http.get<PageResponse>(`/${resource}/page`, {
        pageNumber: params.page,
        pageSize: params.size,
      });

      return {
        list: response.records || [],
        total: response.totalRow || 0,
      };
    },

    add: async (data: any) => {
      const result = await http.post(`/${resource}/add`, data);
      return result || data;
    },

    update: async (data: any) => {
      const result = await http.put(`/${resource}/update`, data);
      return result || data;
    },

    delete: async ({ ids }: { ids: (string | number)[] }) => {
      // 删除每个 ID
      await Promise.all(ids.map(id => http.delete(`/${resource}/delete/${id}`)));
    },
  };
}

