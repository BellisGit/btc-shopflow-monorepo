import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout } from '@btc/shared-components';
import { systemRoutes } from './system';

/**
 * 将相对路径转换为绝对路径
 */
function normalizeRoutePath(route: RouteRecordRaw, basePath: string = ''): RouteRecordRaw {
  const normalized = { ...route };

  // 处理路径：空字符串表示父路由的根路径，在 qiankun 模式下应该是 basePath
  if (!normalized.path || normalized.path === '') {
    normalized.path = basePath || '/';
  } else if (!normalized.path.startsWith('/')) {
    // 相对路径：添加 basePath 前缀
    normalized.path = `${basePath}/${normalized.path}`.replace(/\/+/g, '/');
  } else if (basePath && normalized.path !== '/') {
    // 绝对路径但不是根路径：添加 basePath 前缀
    normalized.path = `${basePath}${normalized.path}`.replace(/\/+/g, '/');
  }

  // 处理 redirect
  if (normalized.redirect) {
    if (typeof normalized.redirect === 'string') {
      if (!normalized.redirect.startsWith('/')) {
        normalized.redirect = `${basePath}/${normalized.redirect}`.replace(/\/+/g, '/');
      } else if (basePath && normalized.redirect !== '/') {
        normalized.redirect = `${basePath}${normalized.redirect}`.replace(/\/+/g, '/');
      }
    } else if (typeof normalized.redirect === 'object' && normalized.redirect.path) {
      if (!normalized.redirect.path.startsWith('/')) {
        normalized.redirect = {
          ...normalized.redirect,
          path: `${basePath}/${normalized.redirect.path}`.replace(/\/+/g, '/'),
        };
      } else if (basePath && normalized.redirect.path !== '/') {
        normalized.redirect = {
          ...normalized.redirect,
          path: `${basePath}${normalized.redirect.path}`.replace(/\/+/g, '/'),
        };
      }
    }
  }

  // 递归处理子路由
  if (normalized.children && Array.isArray(normalized.children)) {
    normalized.children = normalized.children.map(child => normalizeRoutePath(child, ''));
  }

  return normalized;
}

/**
 * 获取系统应用路由配置
 * - qiankun 模式：直接返回页面路由（由主应用提供 Layout），路径需要以 "/" 开头
 *   在 qiankun 模式下，子应用使用 createMemoryHistory()，路径应该是相对于子应用的
 *   空路径应该转换为 "/"，其他相对路径转换为绝对路径（如 "/data/files/list"）
 * - layout-app 模式：直接返回页面路由（由 layout-app 提供 Layout），路径需要以 "/" 开头
 * - 独立运行时：使用 AppLayout 包裹所有路由，路径为 /system，子路由使用相对路径
 */
export const getSystemRoutes = (): RouteRecordRaw[] => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // qiankun 模式或 layout-app 模式：需要将相对路径转换为绝对路径
  // 关键：Vue Router 要求顶级路由必须以 "/" 开头
  // 在 qiankun 模式下，子应用使用 createMemoryHistory()，路径应该是相对于子应用的
  // 空路径应该转换为 "/"，其他相对路径转换为绝对路径
  if (!isStandalone || isUsingLayoutApp) {
    return systemRoutes.map(route => {
      const normalized = { ...route };

      // 对于空路径，转换为 "/"（qiankun 模式下子应用的根路径）
      if (!normalized.path || normalized.path === '') {
        normalized.path = '/';
      } else if (!normalized.path.startsWith('/')) {
        // 对于相对路径，转换为绝对路径（以 "/" 开头）
        normalized.path = `/${normalized.path}`;
      }

      // 处理 redirect
      if (normalized.redirect) {
        if (typeof normalized.redirect === 'string') {
          if (!normalized.redirect.startsWith('/')) {
            normalized.redirect = `/${normalized.redirect}`;
          }
        } else if (typeof normalized.redirect === 'object' && normalized.redirect.path) {
          if (!normalized.redirect.path.startsWith('/')) {
            normalized.redirect = {
              ...normalized.redirect,
              path: `/${normalized.redirect.path}`,
            };
          }
        }
      }

      return normalized;
    });
  }

  // 独立运行：使用 AppLayout 包裹所有路由
  // 关键：系统应用应该使用 /system 前缀，子路由使用相对路径（会被自动拼接）
  return [
    {
      path: '/system',
      component: AppLayout,
      children: systemRoutes,
    },
    // 兼容生产环境子域名：如果没有 /system 前缀，重定向到 /system
    {
      path: '/',
      redirect: '/system',
    },
  ];
};

// 为了向后兼容，也导出一个常量（在模块加载时检测）
export const systemAppRoutes: RouteRecordRaw[] = getSystemRoutes();

