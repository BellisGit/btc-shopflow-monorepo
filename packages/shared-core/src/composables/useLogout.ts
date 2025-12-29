/**
 * 通用退出登录 composable
 * 可以在所有应用中使用，支持退出后保存当前路径以便登录后返回
 */

import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

export interface UseLogoutOptions {
  /**
   * 自定义 authApi（可选）
   * 如果不提供，会尝试从全局 __APP_AUTH_API__ 获取
   */
  authApi?: {
    logout: () => Promise<void>;
    [key: string]: any;
  };
  /**
   * 自定义清理用户信息的函数（可选）
   */
  clearUserInfo?: () => void;
  /**
   * 自定义获取 processStore 的函数（可选）
   */
  getProcessStore?: () => Promise<any>;
  /**
   * 自定义清除 cookie 的函数（可选）
   */
  deleteCookie?: (name: string, options?: any) => void;
  /**
   * 自定义获取 appStorage 的函数（可选）
   */
  getAppStorage?: () => any;
}

/**
 * 通用退出登录 composable
 * 
 * @param options - 可选配置项
 * @returns logout 函数
 */
export function useLogout(options: UseLogoutOptions = {}) {
  const router = useRouter();
  const { t } = useI18n();

  const logout = async () => {
    try {
      // 停止全局用户检查轮询
      try {
        const { stopUserCheckPolling } = await import('./user-check');
        stopUserCheckPolling();
      } catch (error) {
        // 如果导入失败，静默处理
        if (import.meta.env.DEV) {
          console.warn('Failed to stop global user check polling on logout:', error);
        }
      }

      // 调用后端 logout API
      try {
        const authApi = options.authApi || (window as any).__APP_AUTH_API__;
        if (authApi?.logout) {
          await authApi.logout();
        }
      } catch (error: any) {
        // 后端 API 失败不影响前端清理
        console.warn('Logout API failed, but continue with frontend cleanup:', error);
      }

      // 清除 cookie 中的 token
      const deleteCookieFn = options.deleteCookie || (await import('@btc/shared-utils/cookie')).deleteCookie;
      deleteCookieFn('access_token');

      // 清除登录状态标记（从统一的 settings 存储中移除）
      const getAppStorageFn = options.getAppStorage || (() => (window as any).__APP_STORAGE__ || (window as any).appStorage);
      const appStorage = getAppStorageFn();
      if (appStorage) {
        const currentSettings = (appStorage.settings?.get() as Record<string, any>) || {};
        if (currentSettings.is_logged_in) {
          delete currentSettings.is_logged_in;
          appStorage.settings?.set(currentSettings);
        }
        appStorage.auth?.clear();
        appStorage.user?.clear();
      }

      // 清除 localStorage 中的 is_logged_in 标记（向后兼容）
      localStorage.removeItem('is_logged_in');

      // 清除用户状态
      try {
        const { storage } = await import('@btc/shared-utils');
        storage.remove('user');
        // 清理旧的 localStorage 数据（向后兼容）
        localStorage.removeItem('btc_user');
        localStorage.removeItem('user');
      } catch (e) {
        // 静默失败
      }

      // 清除标签页（Process Store）
      if (options.getProcessStore) {
        try {
          const processStore = await options.getProcessStore();
          processStore.clear();
        } catch (e) {
          // 静默失败
        }
      } else {
        try {
          const sharedComponents = await import('@btc/shared-components') as typeof import('@btc/shared-components');
          const { useProcessStore } = sharedComponents;
          const processStore = useProcessStore();
          processStore.clear();
        } catch (e) {
          // 静默失败
        }
      }

      // 自定义清理用户信息
      if (options.clearUserInfo) {
        options.clearUserInfo();
      }

      // 显示退出成功提示
      const { BtcMessage } = await import('@btc/shared-components');
      BtcMessage.success(t('common.logoutSuccess'));

      // 跳转到登录页，添加 logout=1 参数和 redirect 参数（当前路径），让路由守卫知道这是退出登录
      // 判断是否在生产环境的子域名下
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      // 在生产环境子域名下或 qiankun 环境下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
        // 构建登录页 URL，包含当前路径作为 redirect 参数
        const { buildLogoutUrl } = await import('@btc/auth-shared/composables/redirect');
        if (isProductionSubdomain) {
          window.location.href = buildLogoutUrl(`${protocol}//bellis.com.cn/login`);
        } else {
          window.location.href = buildLogoutUrl('/login');
        }
      } else {
        // 开发环境独立运行模式：使用路由跳转，添加 logout=1 参数和 redirect 参数
        const { getCurrentUnifiedPath } = await import('@btc/auth-shared/composables/redirect');
        const currentPath = getCurrentUnifiedPath();
        router.replace({
          path: '/login',
          query: { 
            logout: '1',
            ...(currentPath && currentPath !== '/login' ? { redirect: currentPath } : {})
          }
        });
      }
    } catch (error: any) {
      // 即使出现错误，也执行清理操作
      console.error('Logout error:', error);

      // 强制清除所有缓存
      try {
        const deleteCookieFn = options.deleteCookie || (await import('@btc/shared-utils/cookie')).deleteCookie;
        deleteCookieFn('access_token');
      } catch (e) {
        // 静默失败
      }

      try {
        const getAppStorageFn = options.getAppStorage || (() => (window as any).__APP_STORAGE__ || (window as any).appStorage);
        const appStorage = getAppStorageFn();
        if (appStorage) {
          const currentSettings = (appStorage.settings?.get() as Record<string, any>) || {};
          if (currentSettings.is_logged_in) {
            delete currentSettings.is_logged_in;
            appStorage.settings?.set(currentSettings);
          }
          localStorage.removeItem('is_logged_in');
          appStorage.auth?.clear();
          appStorage.user?.clear();
        }

        const { storage } = await import('@btc/shared-utils');
        storage.remove('user');
        localStorage.removeItem('btc_user');
        localStorage.removeItem('user');

        if (options.getProcessStore) {
          const processStore = await options.getProcessStore();
          processStore.clear();
        } else {
          const sharedComponents = await import('@btc/shared-components') as typeof import('@btc/shared-components');
          const { useProcessStore } = sharedComponents;
          const processStore = useProcessStore();
          processStore.clear();
        }

        if (options.clearUserInfo) {
          options.clearUserInfo();
        }
      } catch (e) {
        // 静默失败
      }

      // 跳转到登录页，添加 logout=1 参数和 redirect 参数（当前路径）
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
        // 构建登录页 URL，包含当前路径作为 redirect 参数
        const { buildLogoutUrl } = await import('@btc/auth-shared/composables/redirect');
        if (isProductionSubdomain) {
          window.location.href = buildLogoutUrl(`${protocol}//bellis.com.cn/login`);
        } else {
          window.location.href = buildLogoutUrl('/login');
        }
      } else {
        // 开发环境独立运行模式：使用路由跳转，添加 logout=1 参数和 redirect 参数
        const { getCurrentUnifiedPath } = await import('@btc/auth-shared/composables/redirect');
        const currentPath = getCurrentUnifiedPath();
        router.replace({
          path: '/login',
          query: { 
            logout: '1',
            ...(currentPath && currentPath !== '/login' ? { redirect: currentPath } : {})
          }
        });
      }
    }
  };

  return {
    logout
  };
}

