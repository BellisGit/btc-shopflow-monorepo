import epsData from 'virtual:eps';
import { http } from '../utils/http';

// 创建兜底服务对象
const createFallbackService = (serviceName: string) => ({
  namespace: serviceName,
  list: async () => {
    console.warn(`EPS服务不存在: ${serviceName}.list`);
    return { list: [], total: 0, page: 1, size: 50 };
  },
  page: async () => {
    console.warn(`EPS服务不存在: ${serviceName}.page`);
    return { list: [], total: 0, page: 1, size: 20 };
  },
  info: async () => {
    console.warn(`EPS服务不存在: ${serviceName}.info`);
    return null;
  },
  add: async () => {
    console.warn(`EPS服务不存在: ${serviceName}.add`);
    throw new Error('服务不存在');
  },
  update: async () => {
    console.warn(`EPS服务不存在: ${serviceName}.update`);
    throw new Error('服务不存在');
  },
  delete: async () => {
    console.warn(`EPS服务不存在: ${serviceName}.delete`);
    throw new Error('服务不存在');
  },
  deleteBatch: async () => {
    console.warn(`EPS服务不存在: ${serviceName}.deleteBatch`);
    throw new Error('服务不存在');
  }
});

// 从虚拟模块中提取 eps 对象
// epsData 的结构是 { service: {...}, list: [...], isUpdate: false }
const eps = {
  service: epsData.service || {},
  list: epsData.list || []
};

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

      // EPS 服务请求处理

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
    // 如果没有传递参数，使用空对象
    if (!data) {
      data = {};
    }

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
    // 如果没有传递参数，使用空对象
    if (!data) {
      data = {};
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

  // 删除数据（单个删除）
  async delete(data?: any) {
    try {
      // 单个删除：直接拼接 ID 到 URL
      let id = data;

      // 如果传递的是对象且包含id字段
      if (data && typeof data === 'object' && data.id) {
        id = data.id;
      }

      // 如果传递的是数组，取第一个元素
      if (Array.isArray(data)) {
        id = data[0];
      }

      return await this.request({
        url: `/delete/${id}`,
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('EPS服务调用失败:', error);
      throw error; // 删除操作失败时抛出错误
    }
  }

  // 批量删除数据
  async deleteBatch(data?: any) {
    try {
      // 批量删除：使用 POST 方法发送 ID 数组
      let ids = data;

      // 如果传递的是对象且包含ids字段
      if (data && typeof data === 'object' && data.ids && Array.isArray(data.ids)) {
        ids = data.ids;
      }

      return await this.request({
        url: '/delete/batch',
        method: 'POST',
        data: ids // 直接传递 ID 数组
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
      throw error; // 添加操作失败时抛出错误
    }
  }
}

// 创建 EPS 服务
export function createEps() {
  // 设置 request 方法
  function set(d: Record<string, any>, visited: WeakSet<object> = new WeakSet()) {
    // 如果已经访问过此对象，跳过（防止循环引用）
    if (d && typeof d === 'object' && d !== null && visited.has(d)) {
      return;
    }
    if (d && typeof d === 'object' && d !== null) {
      visited.add(d);
    }

    if (d.namespace) {
      const a = new BaseService(d.namespace);

      // 为每个 API 方法创建实际的 HTTP 请求函数
      for (const i in d) {
        const methodInfo = d[i];

        if (methodInfo && typeof methodInfo === 'object' && methodInfo.path) {
          const { path, method = 'GET' } = methodInfo;

          a[i] = function (data?: Record<string, any>) {
            // 对于 list 和 page 方法，必须传递对象参数
            // 如果未传递参数（undefined 或 null），使用空对象 {}
            if (i === 'list' || i === 'page') {
              if (data === undefined || data === null) {
                data = {};
              }
            }

            // 处理删除方法的路径参数
            let processedPath = path;
            let requestData = data;

            if (i.toLowerCase().includes('delete')) {
              if (path.includes('{id}')) {
                // 单个删除方法：替换 {id} 为实际 ID
                let idValue = null;

                if (Array.isArray(data)) {
                  // 处理数组格式的参数 [id] - 取第一个元素
                  idValue = data[0];
                } else if (data && typeof data === 'object') {
                  // 处理对象格式的参数，支持多种字段名
                  idValue = data.id || data.ids || (Array.isArray(data.ids) ? data.ids[0] : null);
                } else if (typeof data === 'string') {
                  // 处理字符串格式的参数 'id'
                  idValue = data;
                }

                if (idValue !== null && idValue !== undefined) {
                  processedPath = path.replace(/{id}/g, idValue);
                  requestData = undefined; // 删除方法不需要请求体
                } else {
                  console.warn(`EPS删除 - 无法提取有效的ID值:`, data);
                  // 如果无法提取ID，保持原路径，让后端返回错误
                }
              } else if (i.toLowerCase().includes('batch')) {
                // 批量删除方法：直接使用路径，数据作为请求体
                processedPath = path;
                requestData = data; // 批量删除需要请求体
              }
            }

            try {
              return a.request({
                url: processedPath,
                method: method.toLowerCase(),
                [method.toLowerCase() === 'post' || method.toLowerCase() === 'put' ? 'data' : 'params']: requestData
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
      // 递归处理嵌套对象时传递 visited Set
      for (const i in d) {
        if (d[i] && typeof d[i] === 'object') {
          set(d[i], visited);
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
          if (!service.deleteBatch) {
            service.deleteBatch = async () => {
              console.warn(`EPS服务不存在: ${path.join('.')}.${key}.deleteBatch`);
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

// 创建代理对象，动态处理服务访问
// 使用 WeakMap 缓存代理对象，避免重复代理
const proxyCache = new WeakMap();

// 创建一个共享的空对象代理，避免无限递归
// 先创建一个空对象，然后创建代理
const sharedEmptyObj = {};
const sharedEmptyProxy = new Proxy(sharedEmptyObj, {
  get() {
    // 空代理对象的所有属性访问都返回 undefined
    return undefined;
  }
});

function createServiceProxy(serviceObj: any): any {
  // 如果已经代理过，直接返回缓存的代理
  if (proxyCache.has(serviceObj)) {
    return proxyCache.get(serviceObj);
  }

  // 只对对象创建代理，非对象类型直接返回
  if (typeof serviceObj !== 'object' || serviceObj === null) {
    return serviceObj;
  }

  const proxy = new Proxy(serviceObj, {
    get(target, prop) {
      const value = target[prop];

      if (value !== undefined) {
        // 如果属性存在，继续递归代理
        if (typeof value === 'object' && value !== null) {
          return createServiceProxy(value);
        }
        return value;
      }

      // 如果属性不存在，返回代理对象或兜底服务
      if (typeof prop === 'string') {
        // 检查是否是服务方法调用
        const commonMethods = ['list', 'page', 'info', 'add', 'update', 'delete', 'deleteBatch'];
        if (commonMethods.includes(prop)) {
          // 返回兜底服务方法
          const fallbackService = createFallbackService('unknown');
          return fallbackService[prop];
        }

        // 使用共享的空代理对象，避免每次创建新的代理导致无限递归
        return sharedEmptyProxy;
      }

      return undefined;
    }
  });

  // 缓存代理对象
  proxyCache.set(serviceObj, proxy);
  return proxy;
}

// 初始化 EPS 服务
createEps();

// 导出 EPS 服务对象（动态生成，使用代理处理不存在的服务）
export const service = createServiceProxy(eps.service);

// 默认导出
export default service;
