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

// 监听路由变化，只在跨应用切换时触发 qiankun 重新匹配
// 关键：同一应用内的路由切换不应该触发 qiankun 重新匹配，避免误卸载应用

// 根据路径获取应用前缀
const getAppPrefix = (pathname: string): string => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/logistics')) return 'logistics';
  if (pathname.startsWith('/engineering')) return 'engineering';
  if (pathname.startsWith('/quality')) return 'quality';
  if (pathname.startsWith('/production')) return 'production';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/monitor')) return 'monitor';
  return 'system';
};

// 初始化：获取当前路径的应用前缀
let previousAppPrefix = getAppPrefix(window.location.pathname);

router.afterEach((to) => {
  const currentAppPrefix = getAppPrefix(to.path);
  
  // 只在跨应用切换时触发 qiankun 重新匹配
  if (previousAppPrefix && previousAppPrefix !== currentAppPrefix) {
    // 使用 nextTick 确保路由切换完成后再触发
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        // 触发 popstate 事件，让 qiankun 重新匹配路由
        // qiankun 内部使用 single-spa，会监听 popstate 事件来重新匹配应用
        window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
      });
    });
  }
  
  previousAppPrefix = currentAppPrefix;
});

// layout-app 不需要任何路由守卫
// 所有业务逻辑由子应用处理

export default router;

