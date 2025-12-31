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
import { useCrossDomainBridge } from '@btc/shared-core';
import { onMounted, onUnmounted } from 'vue';

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

  // 初始化跨域通信桥
  const bridge = useCrossDomainBridge();
  let unsubscribeLogout: (() => void) | null = null;
  let isLoggingOut = false; // 防止重复执行登出逻辑

  // 监听来自其他标签页的登出消息
  onMounted(() => {
    unsubscribeLogout = bridge.subscribe('logout', async (payload, origin) => {
      // 避免重复执行
      if (isLoggingOut) {
        return;
      }
      
      // 如果是自己触发的登出，不需要再次执行
      if (origin === window.location.origin) {
        return;
      }

      // 执行统一登出逻辑
      await performLogoutCleanup(true); // true 表示是远程触发的登出
    });
  });

  onUnmounted(() => {
    if (unsubscribeLogout) {
      unsubscribeLogout();
    }
  });

  /**
   * 统一的登出清理逻辑
   * @param isRemoteLogout 是否为远程触发的登出（不调用后端 API，不显示提示）
   */
  const performLogoutCleanup = async (isRemoteLogout = false) => {
    if (isLoggingOut) {
      return; // 防止重复执行
    }
    isLoggingOut = true;

    try {
      // 停止全局用户检查轮询
      try {
        const sharedCore = await import('@btc/shared-core');
        if (sharedCore && typeof sharedCore.stopUserCheckPolling === 'function') {
          sharedCore.stopUserCheckPolling();
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to stop global user check polling on logout:', error);
        }
      }

      // 仅在本地的登出操作中调用后端 API
      if (!isRemoteLogout) {
        try {
          const authApi = getAuthApi();
          await authApi.logout();
        } catch (error: any) {
          console.warn('Logout API failed, but continue with frontend cleanup:', error);
        }
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

      // 清除用户状态
      clearUserInfo();

      // 清除标签页（Process Store）
      processStore.clear();

      // 仅在本地的登出操作中显示提示
      if (!isRemoteLogout) {
        BtcMessage.success(t('common.logoutSuccess'));
      }

      // 跳转到登录页
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
      
      if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
        const { buildLogoutUrl } = await import('@btc/auth-shared/composables/redirect');
        if (isProductionSubdomain) {
          // 子域名下应该重定向到当前子域名的登录页面，而不是主域名
          const port = window.location.port ? `:${window.location.port}` : '';
          window.location.href = buildLogoutUrl(`${protocol}//${hostname}${port}/login`);
        } else {
          window.location.href = buildLogoutUrl('/login');
        }
      } else {
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
      console.error('Logout cleanup error:', error);
      isLoggingOut = false;
    } finally {
      setTimeout(() => {
        isLoggingOut = false;
      }, 1000);
    }
  };

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      // 执行本地登出清理
      await performLogoutCleanup(false);

      // 通知其他标签页（通过通信桥）
      try {
        bridge.sendMessage('logout', { timestamp: Date.now() });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to broadcast logout message:', error);
        }
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      await performLogoutCleanup(false);
    }
  };

  return {
    logout
  };
}

