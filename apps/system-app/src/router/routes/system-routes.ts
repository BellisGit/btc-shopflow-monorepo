import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { AppLayout } from '@btc/shared-components';
import { systemRoutes } from './system';

/**
 * 获取系统应用路由配置
 * - qiankun 模式：直接返回页面路由（由主应用提供 Layout）
 * - 独立运行时：使用 AppLayout 包裹所有路由
 */
export const getSystemRoutes = (): RouteRecordRaw[] => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;

  // qiankun 模式：直接返回页面路由（由主应用提供 Layout）
  if (!isStandalone) {
    return systemRoutes;
  }

  // 独立运行：使用 AppLayout 包裹所有路由
  return [
    {
      path: '/',
      component: AppLayout,
      children: systemRoutes,
    },
  ];
};

// 为了向后兼容，也导出一个常量（在模块加载时检测）
export const systemAppRoutes: RouteRecordRaw[] = getSystemRoutes();

