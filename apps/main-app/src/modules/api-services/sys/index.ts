/**
 * 系统级别自定义 API 服务
 * 存放不属于 EPS 的系统管理类接口
 */

// 暂时使用简化实现
/**
 * 系统 API 服务对象
 */
export const sysApi = {
  apiDocs: {
    /**
     * 分页查询接口文档列表
     */
    page(_params?: Record<string, any>) {
      return Promise.reject(new Error('Not implemented'));
    },

    /**
     * 获取接口文档列表（不分页）
     */
    list(_params?: Record<string, any>) {
      return Promise.reject(new Error('Not implemented'));
    }
  }
};
