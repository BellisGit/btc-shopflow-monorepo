/**
 * 用于测试的 EPS Mock 数据
 */

export const mockEpsData = {
  user: [
    {
      path: '/admin/user/list',
      method: 'POST',
      name: 'list',
      summary: '用户列表',
    },
    {
      path: '/admin/user/add',
      method: 'POST',
      name: 'add',
      summary: '添加用户',
    },
    {
      path: '/admin/user/update',
      method: 'POST',
      name: 'update',
      summary: '更新用户',
    },
    {
      path: '/admin/user/delete',
      method: 'POST',
      name: 'delete',
      summary: '删除用户',
    },
    {
      path: '/admin/user/info',
      method: 'GET',
      name: 'info',
      summary: '用户详情',
    },
  ],
  order: [
    {
      path: '/admin/order/page',
      method: 'POST',
      name: 'page',
      summary: '订单分页',
    },
    {
      path: '/admin/order/info',
      method: 'GET',
      name: 'info',
      summary: '订单详情',
    },
    {
      path: '/admin/order/create',
      method: 'POST',
      name: 'create',
      summary: '创建订单',
    },
    {
      path: '/admin/order/cancel',
      method: 'POST',
      name: 'cancel',
      summary: '取消订单',
    },
  ],
  product: [
    {
      path: '/admin/product/list',
      method: 'POST',
      name: 'list',
      summary: '产品列表',
    },
    {
      path: '/admin/product/add',
      method: 'POST',
      name: 'add',
      summary: '添加产品',
    },
    {
      path: '/admin/product/update',
      method: 'POST',
      name: 'update',
      summary: '更新产品',
    },
    {
      path: '/admin/product/delete',
      method: 'POST',
      name: 'delete',
      summary: '删除产品',
    },
  ],
};

/**
 * 模拟 EPS API 响应
 */
export function createMockEpsResponse() {
  return {
    code: 1000,
    data: mockEpsData,
    message: 'success',
  };
}
