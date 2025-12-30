import { BtcMessage } from '@btc/shared-components';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { authApi } from '@/modules/api-services';
import { useUser } from './useUser';
// 使用动态导入避免循环依赖
// import { useProcessStore } from '@/store/process';
import { deleteCookie, getCookieDomain } from '@/utils/cookie';
import { appStorage } from '@/utils/app-storage';
import { useCrossDomainBridge } from '@btc/shared-core';
import { onMounted, onUnmounted } from 'vue';

/**
 * 退出登录 composable
 */
export function useLogout() {
  const router = useRouter();
  const { t } = useI18n();
  const { clearUserInfo } = useUser();
  // 延迟获取 processStore，避免循环依赖
  let processStore: ReturnType<typeof import('@/store/process').useProcessStore> | null = null;

  const getProcessStore = async () => {
    if (!processStore) {
      const { useProcessStore } = await import('@/store/process');
      processStore = useProcessStore();
    }
    return processStore;
  };

  // 初始化跨域通信桥
  const bridge = useCrossDomainBridge();
  let unsubscribeLogout: (() => void) | null = null;
  let isLoggingOut = false; // 防止重复执行登出逻辑

  // 判断是否是同一个应用
  // 在开发环境中，即使 origin 相同，路径不同也是不同应用（如 /admin/... 和 /）
  // 在生产环境中，通过 origin 判断（不同子域名是不同的应用）
  const isSameApp = (origin: string): boolean => {
    // 如果 origin 不同，肯定是不同应用
    if (origin !== window.location.origin) {
      return false;
    }

    // 在开发环境中，即使 origin 相同，路径不同也是不同应用
    // 例如：主应用在 /，管理应用在 /admin/...，它们的 origin 都是 http://10.80.8.199:8080
    // 但由于路径不同，应该视为不同应用，需要处理登出/登录消息
    if (import.meta.env.DEV) {
      return false; // 在开发环境中，即使 origin 相同，也认为是不同应用（因为路径不同）
    }

    // 生产环境中，origin 相同就是同一个应用（不同子域名有不同的 origin）
    return true;
  };

  // 处理登录消息：当其他应用登录时，更新本地状态并刷新页面
  const handleLoginMessage = async (payload: any, origin: string) => {
    // 如果是同一个应用触发的登录，不需要再次处理
    if (isSameApp(origin)) {
      return;
    }

    // 更新登录状态标记
    const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
    appStorage.settings.set({ ...currentSettings, is_logged_in: true });

      // 启动用户检查轮询
    try {
      const { startUserCheckPolling } = await import('@btc/shared-core/composables/user-check');
      startUserCheckPolling(true);
    } catch (error) {
      // 静默失败
    }

    // 检查是否在登录页
    const currentPath = window.location.pathname;
    const isOnLoginPage = currentPath === '/login' || currentPath.startsWith('/login?');
    
    if (isOnLoginPage) {
      // 在登录页，获取重定向路径并跳转
      // 关键：从当前页面的 URL 查询参数中获取 redirect，确保每个标签页跳转到自己的目标页面
      const urlParams = new URLSearchParams(window.location.search);
      let redirect = urlParams.get('redirect');
      
      // 如果没有 redirect 参数，尝试从 localStorage 获取保存的退出前路径
      if (!redirect) {
        try {
          const { getAndClearLogoutRedirectPath } = await import('@btc/auth-shared/composables/redirect');
          redirect = getAndClearLogoutRedirectPath();
        } catch (error) {
          // 静默失败
        }
      }
      
      // 解码 redirect 参数（可能被 URL 编码）
      const redirectPath = redirect ? decodeURIComponent(redirect).split('?')[0] : '/';

      // 重定向到目标页面
      router.replace(redirectPath).catch(() => {
        // 如果路由跳转失败，使用 window.location
        window.location.href = redirectPath;
      });
    } else {
      // 不在登录页，刷新当前页面以重新检查登录状态
      // 这样可以确保页面能够正确读取 cookie 并更新状态
      // 使用 window.location.reload() 刷新页面，确保 cookie 被正确读取
      window.location.reload();
    }
  };

  // 关键：立即设置订阅，不等待组件挂载（确保消息监听器尽早设置）
  unsubscribeLogout = bridge.subscribe('logout', async (payload, origin) => {
    // 避免重复执行
    if (isLoggingOut) {
      return;
    }
    
    // 如果是同一个应用触发的登出，不需要再次执行
    // 在开发环境中，即使 origin 相同，如果路径不同，也认为是不同应用，需要处理
    if (isSameApp(origin)) {
      return;
    }

    // 执行统一登出逻辑
    await performLogoutCleanup(true); // true 表示是远程触发的登出
  });

  // 订阅登录消息
  const unsubscribeLogin = bridge.subscribe('login', handleLoginMessage);

  onUnmounted(() => {
    if (unsubscribeLogout) {
      unsubscribeLogout();
    }
    if (unsubscribeLogin) {
      unsubscribeLogin();
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
      // 关键：停止 user-check 轮询，清除 sessionStorage 中的状态
      try {
        const { stopDynamicPolling } = await import('@/utils/domain-cache');
        stopDynamicPolling(true);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to stop user-check polling on logout:', error);
        }
      }

      // 停止全局用户检查轮询
      try {
        const { stopUserCheckPolling } = await import('@btc/shared-core/composables/user-check');
        stopUserCheckPolling();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to stop global user check polling on logout:', error);
        }
      }

      // 仅在本地的登出操作中调用后端 API
      if (!isRemoteLogout) {
        try {
          await authApi.logout();
        } catch (error: any) {
          console.warn('Logout API failed, but continue with frontend cleanup:', error);
        }
      }

      // 清除 cookie 中的 token（需要指定正确的 domain 才能删除跨域 cookie）
      const cookieDomain = getCookieDomain();
      deleteCookie('access_token', {
        ...(cookieDomain ? { domain: cookieDomain } : {}),
        path: '/'
      });

      // 清除登录状态标记（从统一的 settings 存储中移除）
      const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
      if (currentSettings.is_logged_in) {
        delete currentSettings.is_logged_in;
        appStorage.settings.set(currentSettings);
      }

      // 清除所有认证相关数据（使用统一存储管理器）
      appStorage.auth.clear();
      appStorage.user.clear();

      // 清除用户状态
      clearUserInfo();

      // 清除标签页（Process Store）
      const store = await getProcessStore();
      store.clear();

      // 仅在本地的登出操作中显示提示
      if (!isRemoteLogout) {
        BtcMessage.success(t('common.logoutSuccess'));
      }

      // 跳转到登录页
      const { getCurrentUnifiedPath } = await import('@btc/auth-shared/composables/redirect');
      const currentPath = getCurrentUnifiedPath();
      router.replace({
        path: '/login',
        query: { 
          logout: '1',
          ...(currentPath && currentPath !== '/login' ? { redirect: currentPath } : {})
        }
      });
    } catch (error: any) {
      console.error('Logout cleanup error:', error);
      // 即使出错也要重置标志
      isLoggingOut = false;
    } finally {
      // 延迟重置标志，确保清理完成
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
        // 通信桥失败不影响登出流程
        if (import.meta.env.DEV) {
          console.warn('Failed to broadcast logout message:', error);
        }
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      // 即使出错也尝试执行清理
      await performLogoutCleanup(false);
    }
  };

  return {
    logout
  };
}

