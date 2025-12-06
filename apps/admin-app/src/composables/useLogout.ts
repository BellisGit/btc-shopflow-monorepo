import { BtcMessage } from '@btc/shared-components';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
// 优先使用全局 authApi（由 system-app 提供），如果没有则使用本地的
import { authApi as localAuthApi } from '@/modules/api-services';
import { useUser } from './useUser';
import { useProcessStore } from '@/store/process';
import { deleteCookie } from '@/utils/cookie';
import { appStorage } from '@/utils/app-storage';

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
 * 获取 authApi（优先使用全局的，如果没有则使用本地的）
 */
const getAuthApi = () => {
  const globalAuthApi = (window as any).__APP_AUTH_API__;
  if (globalAuthApi && typeof globalAuthApi.logout === 'function') {
    return globalAuthApi;
  }
  return localAuthApi;
};

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
      // 调用后端 logout API（优先使用全局 authApi）
      // 注意：即使后端 API 失败，前端也要执行清理操作
      try {
        const authApi = getAuthApi();
        await authApi.logout();
      } catch (error: any) {
        // 后端 API 失败不影响前端清理
        console.warn('Logout API failed, but continue with frontend cleanup:', error);
      }

      // 清除 cookie 中的 token
      deleteCookie('access_token');
      
      // 清除登录状态标记（从统一的 settings 存储中移除）
      const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
      if (currentSettings.is_logged_in) {
        delete currentSettings.is_logged_in;
        appStorage.settings.set(currentSettings);
      }
      
      // 清除 localStorage 中的 is_logged_in 标记（向后兼容）
      localStorage.removeItem('is_logged_in');
      
      // 清除所有认证相关数据（使用统一存储管理器）
      appStorage.auth.clear();
      appStorage.user.clear();

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
      // 在 qiankun 环境下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (qiankunWindow.__POWERED_BY_QIANKUN__) {
        // qiankun 模式：跳转到主应用的登录页
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        // 如果是子域名，跳转到主域名；否则保持当前域名
        if (hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn') {
          window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
        } else {
          window.location.href = '/login?logout=1';
        }
      } else {
        // 独立运行模式：使用路由跳转，添加 logout=1 参数
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
      const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
      if (currentSettings.is_logged_in) {
        delete currentSettings.is_logged_in;
        appStorage.settings.set(currentSettings);
      }
      
      // 清除 localStorage 中的 is_logged_in 标记（向后兼容）
      localStorage.removeItem('is_logged_in');
      
      appStorage.auth.clear();
      appStorage.user.clear();
      clearUserInfo();
      processStore.clear();

      // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
      // 在 qiankun 环境下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (qiankunWindow.__POWERED_BY_QIANKUN__) {
        // qiankun 模式：跳转到主应用的登录页
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        // 如果是子域名，跳转到主域名；否则保持当前域名
        if (hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn') {
          window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
        } else {
          window.location.href = '/login?logout=1';
        }
      } else {
        // 独立运行模式：使用路由跳转，添加 logout=1 参数
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

