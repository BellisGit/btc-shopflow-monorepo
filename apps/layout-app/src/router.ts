/**
 * layout-app 路由配置
 * 
 * 特点：
 * 1. 不包含任何业务路由
 * 2. 不包含任何路由守卫（避免自动注册 manifest）
 * 3. 所有路由交给 qiankun 子应用处理
 */

import { createRouter, createWebHistory } from 'vue-router';

// 空路由配置：所有路径都交给 qiankun 处理
const routes = [
  {
    path: '/',
    name: 'root',
    // 空组件，实际内容由 qiankun 子应用提供
    component: { template: '<div></div>' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'subapp',
    // 空组件，实际内容由 qiankun 子应用提供
    component: { template: '<div></div>' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// layout-app 不需要任何路由守卫
// 所有业务逻辑由子应用处理

export default router;

