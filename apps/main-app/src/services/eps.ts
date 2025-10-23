import eps from 'virtual:eps';
import { http } from '../utils/http';

// 基础服务类
export class BaseService {
  namespace?: string;
  [key: string]: any; // 允许动态添加方法

  constructor(namespace?: string) {
    if (namespace) {
      this.namespace = namespace;
    }
  }

  // 发送请求
  async request(options: Record<string, any> = {}) {
    let url = options.url;

    if (url && url.indexOf('http') < 0) {
      if (this.namespace) {
        // namespace已经包含完整的prefix（包括admin前缀），直接拼接
        const namespace = this.namespace.startsWith('/') ? this.namespace : '/' + this.namespace;
        url = namespace + url;
        // 确保URL以/开头，这样axios会将其视为绝对路径
        if (!url.startsWith('/')) {
          url = '/' + url;
        }
      }

      // 使用项目的 HTTP 工具
      return http.request({
        ...options,
        url
      });
    }

    return http.request(options);
  }

  // 获取列表
  async list(data?: Record<string, any>) {
    try {
      return await this.request({
        url: '/list',
        method: 'POST',
        data
      });
    } catch (error) {
      console.warn('EPS服务调用失败，返回空数据:', error);
      return {
        list: [],
        total: 0,
        page: 1,
        size: 50
      };
    }
  }

  // 分页查询
  async page(data?: Record<string, any>) {
    // 如果没有传递参数，使用默认参数
    if (!data) {
      data = {
        sort: 'createdAt',
        order: 'asc',
        page: 1,
        size: 20
      };
    }

    try {
      return await this.request({
        url: '/page',
        method: 'POST',
        data
      });
    } catch (error) {
      console.warn('EPS服务调用失败，返回空数据:', error);
      return {
        list: [],
        total: 0,
        page: 1,
        size: 20
      };
    }
  }

  // 获取信息
  async info(params?: Record<string, any>) {
    try {
      return await this.request({
        url: '/info',
        params
      });
    } catch (error) {
      console.warn('EPS服务调用失败，返回空数据:', error);
      return null;
    }
  }

  // 更新数据
  async update(data?: Record<string, any>) {
    try {
      return await this.request({
        url: '/update',
        method: 'POST',
        data
      });
    } catch (error) {
      console.warn('EPS服务调用失败:', error);
      throw error; // 更新操作失败时抛出错误
    }
  }

  // 删除数据
  async delete(data?: Record<string, any>) {
    try {
      return await this.request({
        url: '/delete',
        method: 'POST',
        data
      });
    } catch (error) {
      console.warn('EPS服务调用失败:', error);
      throw error; // 删除操作失败时抛出错误
    }
  }

  // 添加数据
  async add(data?: Record<string, any>) {
    try {
      return await this.request({
        url: '/add',
        method: 'POST',
        data
      });
    } catch (error) {
      console.warn('EPS服务调用失败:', error);
      throw error; // 添加操作失败时抛出错误
    }
  }
}

// 创建 EPS 服务
export function createEps() {
  // 设置 request 方法
  function set(d: Record<string, any>) {
    if (d.namespace) {
      const a = new BaseService(d.namespace);

      // 为每个 API 方法创建实际的 HTTP 请求函数
      for (const i in d) {
        const methodInfo = d[i];

        if (methodInfo && typeof methodInfo === 'object' && methodInfo.path) {
          const { path, method = 'GET' } = methodInfo;

          a[i] = function (data?: Record<string, any>) {
            // 对于 list 和 page 方法，如果没有传递参数，使用默认参数
            if ((i === 'list' || i === 'page') && !data) {
              const defaultParams = {
                sort: 'createdAt',
                order: 'asc',
                page: 1,
                size: i === 'list' ? 50 : 20
              };
              data = defaultParams;
            }

            try {
              return a.request({
                url: path,
                method: method.toLowerCase(),
                [method.toLowerCase() === 'post' || method.toLowerCase() === 'put' ? 'data' : 'params']: data
              });
            } catch (error) {
              console.warn(`EPS服务调用失败 (${d.namespace}.${i}):`, error);
              // 对于查询操作，返回空数据；对于修改操作，抛出错误
              if (['list', 'page', 'info'].includes(i)) {
                return {
                  list: [],
                  total: 0,
                  page: 1,
                  size: i === 'list' ? 50 : 20
                };
              } else {
                throw error;
              }
            }
          };
        } else if (typeof methodInfo === 'function') {
          // 检查是否是 Mock 函数（通过函数体内容判断）
          const funcStr = methodInfo.toString();
          if (funcStr.includes('mockResponse') || funcStr.includes('code: 1000')) {
            // 替换为 BaseService 的对应方法，保持 this 绑定
            if (a[i] && typeof a[i] === 'function') {
              d[i] = a[i].bind(a);
            }
          }
        }
      }

      // 将 BaseService 的方法复制到服务对象，保持 this 绑定
      for (const i in a) {
        if (typeof a[i] === 'function') {
          d[i] = a[i].bind(a);
        } else {
          d[i] = a[i];
        }
      }

    } else {
      // 递归处理嵌套对象
      for (const i in d) {
        if (d[i] && typeof d[i] === 'object') {
          set(d[i]);
        }
      }
    }
  }

  // 遍历每一个方法
  set(eps.service);

  // 添加兜底机制，确保即使服务不存在也不会报错
  function addFallbackService(obj: any, path: string[] = []) {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        if (obj[key].namespace) {
          // 这是一个服务对象
          const service = obj[key];
          if (!service.list) {
            service.list = async () => {
              console.warn(`EPS服务不存在: ${path.join('.')}.${key}.list`);
              return { list: [], total: 0, page: 1, size: 50 };
            };
          }
          if (!service.page) {
            service.page = async () => {
              console.warn(`EPS服务不存在: ${path.join('.')}.${key}.page`);
              return { list: [], total: 0, page: 1, size: 20 };
            };
          }
          if (!service.info) {
            service.info = async () => {
              console.warn(`EPS服务不存在: ${path.join('.')}.${key}.info`);
              return null;
            };
          }
          if (!service.add) {
            service.add = async () => {
              console.warn(`EPS服务不存在: ${path.join('.')}.${key}.add`);
              throw new Error('服务不存在');
            };
          }
          if (!service.update) {
            service.update = async () => {
              console.warn(`EPS服务不存在: ${path.join('.')}.${key}.update`);
              throw new Error('服务不存在');
            };
          }
          if (!service.delete) {
            service.delete = async () => {
              console.warn(`EPS服务不存在: ${path.join('.')}.${key}.delete`);
              throw new Error('服务不存在');
            };
          }
        } else {
          // 递归处理嵌套对象
          addFallbackService(obj[key], [...path, key]);
        }
      }
    }
  }

  // 添加兜底服务
  addFallbackService(eps.service);

}

// 初始化 EPS 服务
createEps();

// 导出 EPS 服务对象（动态生成）
export const service = eps.service;

// 默认导出
export default service;
