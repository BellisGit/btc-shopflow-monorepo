/**
 * 通用退出登录 composable
 * 可以在所有应用中使用，支持退出后保存当前路径以便登录后返回
 */

import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { onUnmounted } from 'vue';
import { useCrossDomainBridge } from './useCrossDomainBridge';

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

  // 初始化跨域通信桥
  const bridge = useCrossDomainBridge();
  let unsubscribeLogout: (() => void) | null = null;
  let isLoggingOut = false; // 防止重复执行登出逻辑

  // 统一的登出清理逻辑
  const performLogoutCleanup = async (isRemoteLogout = false) => {
    if (isLoggingOut) {
      return; // 防止重复执行
    }
    isLoggingOut = true;

    try {
      // 停止全局用户检查轮询
      try {
        const { stopUserCheckPolling } = await import('./user-check');
        stopUserCheckPolling();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to stop global user check polling on logout:', error);
        }
      }

      // 仅在本地的登出操作中调用后端 API
      if (!isRemoteLogout) {
        try {
          const authApi = options.authApi || (window as any).__APP_AUTH_API__;
          if (authApi?.logout) {
            await authApi.logout();
          }
        } catch (error: any) {
          console.warn('Logout API failed, but continue with frontend cleanup:', error);
        }
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

      // 仅在本地的登出操作中显示提示
      if (!isRemoteLogout) {
        const { BtcMessage } = await import('@btc/shared-components');
        BtcMessage.success(t('common.logoutSuccess'));
      }

      // 跳转到登录页
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      if (isProductionSubdomain || qiankunWindow.__POWERED_BY_QIANKUN__) {
        const { buildLogoutUrl } = await import('@btc/auth-shared/composables/redirect');
        if (isProductionSubdomain) {
          window.location.href = buildLogoutUrl(`${protocol}//bellis.com.cn/login`);
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

  // 处理登录消息：当其他应用登录时，更新本地状态并刷新页面
  const handleLoginMessage = async (payload: any, origin: string) => {
    // 如果是自己触发的登录，不需要再次处理
    if (origin === window.location.origin) {
      return;
    }

    // 更新登录状态标记
    const getAppStorageFn = options.getAppStorage || (() => (window as any).__APP_STORAGE__ || (window as any).appStorage);
    const appStorage = getAppStorageFn();
    if (appStorage) {
      const currentSettings = (appStorage.settings?.get() as Record<string, any>) || {};
      appStorage.settings?.set({ ...currentSettings, is_logged_in: true });
    }

    // 启动用户检查轮询
    try {
      const { startUserCheckPolling } = await import('./user-check');
      startUserCheckPolling(true);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[useLogout] Failed to start user check polling on login:', error);
      }
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
          if (import.meta.env.DEV) {
            console.warn('[useLogout] Failed to get logout redirect path:', error);
          }
        }
      }
      
      // 解码 redirect 参数（可能被 URL 编码）
      const redirectPath = redirect ? decodeURIComponent(redirect).split('?')[0] : '/';

      // 重定向到目标页面
      if (qiankunWindow.__POWERED_BY_QIANKUN__) {
        // qiankun 环境下使用 router
        router.replace(redirectPath).catch(() => {
          // 如果路由跳转失败，使用 window.location
          window.location.href = redirectPath;
        });
      } else {
        // 独立运行环境，使用 window.location 确保 cookie 被正确读取
        window.location.href = redirectPath;
      }
    } else {
      // 不在登录页，刷新当前页面以重新检查登录状态
      // 这样可以确保页面能够正确读取 cookie 并更新状态
      // 使用 window.location.reload() 刷新页面，确保 cookie 被正确读取
      window.location.reload();
    }
  };

  // 判断是否是同一个应用（在开发环境中，即使 origin 相同，路径不同也是不同应用）
  const isSameApp = (origin: string): boolean => {
    // 如果 origin 不同，肯定是不同应用
    if (origin !== window.location.origin) {
      return false;
    }

    // 在开发环境中，即使 origin 相同，也需要通过路径判断是否是同一个应用
    // 例如：/admin/... 和 / 是不同的应用
    if (import.meta.env.DEV) {
      const currentPath = window.location.pathname;
      const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/dashboard', '/personnel'];
      
      // 检查当前路径是否属于某个子应用
      const currentIsSubApp = knownSubAppPrefixes.some(prefix => currentPath.startsWith(prefix));
      
      // 如果当前路径是子应用路径，那么只有来自其他子应用或主应用的消息才需要处理
      // 如果当前路径是主应用路径（/ 或 /data/...），那么只有来自子应用的消息才需要处理
      // 由于我们无法从消息中获取发送方的路径，我们采用更宽松的策略：
      // 在开发环境中，只要 origin 相同，就认为是同一个应用（避免误处理）
      // 但实际上，我们应该允许处理，因为即使是同一个 origin，不同路径也是不同应用
      
      // 更准确的判断：如果消息来源的 origin 和当前 origin 相同，且都在开发环境
      // 我们需要通过其他方式判断，但由于消息中没有路径信息，我们采用保守策略
      // 实际上，在开发环境中，我们应该允许处理，因为不同路径代表不同应用
      // 但为了避免循环处理，我们需要检查是否是同一个标签页
      // 由于 BroadcastChannel 会向所有标签页广播，包括发送者自己
      // 我们需要通过其他方式判断是否是同一个标签页发送的
      
      // 临时方案：在开发环境中，如果 origin 相同，也允许处理（因为不同路径是不同应用）
      // 但需要防止重复处理（通过 isLoggingOut 标志）
      return false; // 在开发环境中，即使 origin 相同，也认为是不同应用（因为路径不同）
    }

    // 生产环境中，origin 相同就是同一个应用
    return true;
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

