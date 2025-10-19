import { eps } from 'virtual:eps';
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
    return this.request({
      url: '/list',
      method: 'POST',
      data
    });
  }

  // 分页查询
  async page(data?: Record<string, any>) {
    return this.request({
      url: '/page',
      method: 'POST',
      data
    });
  }

  // 获取信息
  async info(params?: Record<string, any>) {
    return this.request({
      url: '/info',
      params
    });
  }

  // 更新数据
  async update(data?: Record<string, any>) {
    return this.request({
      url: '/update',
      method: 'POST',
      data
    });
  }

  // 删除数据
  async delete(data?: Record<string, any>) {
    return this.request({
      url: '/delete',
      method: 'POST',
      data
    });
  }

  // 添加数据
  async add(data?: Record<string, any>) {
    return this.request({
      url: '/add',
      method: 'POST',
      data
    });
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
          const { path, method = 'get' } = methodInfo;

          a[i] = function (data?: Record<string, any>) {
            return a.request({
              url: path,
              method,
              [method.toLowerCase() === 'post' ? 'data' : 'params']: data
            });
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

}

// 初始化 EPS 服务
createEps();

// 导出 EPS 服务对象（动态生成）
export const service = eps.service;

// 默认导出
export default service;
