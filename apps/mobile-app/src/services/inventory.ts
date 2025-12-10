import { requestAdapter } from '@/utils/requestAdapter';

/**
 * 盘点相关 API 服务
 */
export const inventoryApi = {
  /**
   * 扫码提交盘点数据
   * @param data 盘点数据
   */
  scan(data: { partName: string; position: string; partQty: number }) {
    // 接口路径：/api/system/auth/scan (baseURL 默认为 /api)
    // 禁用默认的成功提示，由调用方控制
    return requestAdapter.post('/system/auth/scan', data, { notifySuccess: false });
  },

  /**
   * 查询盘点记录
   * @param keyword 搜索关键字（物料编码、仓位、盘点人）
   */
  list(keyword: string) {
    return requestAdapter.post('/system/auth/list', { keyword });
  },
};

