import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { SubAppContext } from './types';

/**
 * 创建退出登录函数（标准化模板）
 */
export function createLogoutFunction(context: SubAppContext, appId: string): () => Promise<void> {
  return async () => {
    try {
      // 调用后端 logout API（通过全局 authApi，由 system-app 提供）
      try {
        const authApi = (window as any).__APP_AUTH_API__;
        if (authApi?.logout) {
          await authApi.logout();
        } else {
          console.warn('[useLogout] Auth API logout function not available globally.');
        }
      } catch (error: any) {
        // 后端 API 失败不影响前端清理
        console.warn('Logout API failed, but continue with frontend cleanup:', error);
      }

      // 清除 cookie 中的 token
      const { deleteCookie } = await import('@btc/shared-utils/cookie');
      deleteCookie('access_token');

      // 清除登录状态标记（从统一的 settings 存储中移除）
      const getAppStorage = () => {
        return (window as any).__APP_STORAGE__ || (window as any).appStorage;
      };
      const appStorage = getAppStorage();
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
      try {
        const sharedComponents = await import('@btc/shared-components') as typeof import('@btc/shared-components');
        const { useProcessStore } = sharedComponents;
        const processStore = useProcessStore();
        processStore.clear();
      } catch (e) {
        // 静默失败
      }

      // 显示退出成功提示
      const sharedComponents = await import('@btc/shared-components') as typeof import('@btc/shared-components');
      const { BtcMessage } = sharedComponents;
      const t = context.i18n?.i18n?.global?.t;
      if (t) {
        BtcMessage.success(t('common.logoutSuccess'));
      }

      // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
      // 判断是否在生产环境的子域名下
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      // 在生产环境子域名下或 qiankun 环境下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
        // 如果是生产环境子域名，跳转到主域名；否则保持当前域名
        if (isProductionSubdomain) {
          window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
        } else {
          window.location.href = '/login?logout=1';
        }
      } else {
        // 开发环境独立运行模式：使用路由跳转，添加 logout=1 参数
        context.router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    } catch (error: any) {
      // 即使出现错误，也执行清理操作
      console.error('Logout error:', error);

      // 强制清除所有缓存
      try {
        const { deleteCookie } = await import('@btc/shared-utils/cookie');
        deleteCookie('access_token');
      } catch (e) {
        // 静默失败
      }

      try {
        const getAppStorage = () => {
          return (window as any).__APP_STORAGE__ || (window as any).appStorage;
        };
        const appStorage = getAppStorage();
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

        const sharedComponents = await import('@btc/shared-components') as typeof import('@btc/shared-components');
        const { useProcessStore } = sharedComponents;
        const processStore = useProcessStore();
        processStore.clear();
      } catch (e) {
        // 静默失败
      }

      // 跳转到登录页
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
        if (isProductionSubdomain) {
          window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
        } else {
          window.location.href = '/login?logout=1';
        }
      } else {
        context.router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    }
  };
}
