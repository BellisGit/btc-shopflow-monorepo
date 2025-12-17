import { BtcMessage } from '@btc/shared-components';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUser } from '@btc/shared-components';
import { useProcessStore } from '@btc/shared-components';
import { deleteCookie } from '@/utils/cookie';
// finance-app 没有本地的 app-storage，使用全局的
const getAppStorage = () => {
  return (window as any).__APP_STORAGE__ || (window as any).appStorage;
};

// 声明全局 authApi 接口
declare global {
  interface Window {
    __APP_AUTH_API__?: {
      logout: () => Promise<void>;
      [key: string]: any;
    };
  }
}

/**
 * 退出登录 composable
 */
export function useLogout() {
  const router = useRouter();
  const { t } = useI18n();
  const { clearUserInfo } = useUser();
  const processStore = useProcessStore();

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      // 调用后端 logout API（通过全局 authApi，由 system-app 提供）
      // 注意：即使后端 API 失败，前端也要执行清理操作
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
      deleteCookie('access_token');

      // 清除登录状态标记（从统一的 settings 存储中移除）
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

      // 清除所有 sessionStorage（可选，根据需求决定）
      // sessionStorage.clear();

      // 清除用户状态
      clearUserInfo();

      // 清除标签页（Process Store）
      processStore.clear();

      // 清除其他可能的缓存
      // 如果有使用 IndexedDB，也需要清除
      // 如果有使用其他缓存库，也需要清除

      // 显示退出成功提示
      BtcMessage.success(t('common.logoutSuccess'));

      // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
      // 判断是否在生产环境的子域名下
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      // 在生产环境子域名下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (isProductionSubdomain) {
        window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
      } else {
        // 开发环境：使用路由跳转，添加 logout=1 参数
        router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    } catch (error: any) {
      // 即使出现错误，也执行清理操作
      console.error('Logout error:', error);

      // 强制清除所有缓存
      deleteCookie('access_token');

      // 清除登录状态标记（从统一的 settings 存储中移除）
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
      clearUserInfo();
      processStore.clear();

      // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
      // 判断是否在生产环境的子域名下
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      // 在生产环境子域名下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (isProductionSubdomain) {
        window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
      } else {
        // 开发环境：使用路由跳转，添加 logout=1 参数
        router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    }
  };

  return {
    logout
  };
}

