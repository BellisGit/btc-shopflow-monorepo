/**
 * 通用退出登录 composable
 * 可以在所有应用中使用，支持退出后保存当前路径以便登录后返回
 */
import { useRouter } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { onUnmounted } from 'vue';
import { useCrossDomainBridge } from './useCrossDomainBridge';
import { logoutCore, type LogoutCoreOptions } from '../auth/logoutCore';
import { logger } from '../utils/logger/index';

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

  // 初始化跨域通信桥
  const bridge = useCrossDomainBridge();
  let unsubscribeLogout: (() => void) | null = null;
  let isLoggingOut = false; // 防止重复执行登出逻辑

  // 统一的登出清理逻辑（重构为调用 logoutCore + 路由重定向）
  const performLogoutCleanup = async (isRemoteLogout = false) => {
    if (isLoggingOut) {
      return; // 防止重复执行
    }
    isLoggingOut = true;

    try {
      // 调用 logoutCore 纯函数处理核心逻辑
      const logoutCoreOptions: LogoutCoreOptions = {
        ...(options.authApi !== undefined && { authApi: options.authApi }),
        ...(options.clearUserInfo !== undefined && { clearUserInfo: options.clearUserInfo }),
        ...(options.getProcessStore !== undefined && { getProcessStore: options.getProcessStore }),
        ...(options.deleteCookie !== undefined && { deleteCookie: options.deleteCookie }),
        ...(options.getAppStorage !== undefined && { getAppStorage: options.getAppStorage }),
        isRemoteLogout,
        ...(!isRemoteLogout && {
          onSuccess: async (message: string) => {
            // 显示退出成功提示
            try {
              const { BtcMessage } = await import('@btc/shared-components');
              if (BtcMessage && typeof BtcMessage.success === 'function') {
                BtcMessage.success(message);
              } else {
                const globalBtcMessage = (window as any).BtcMessage;
                if (globalBtcMessage && typeof globalBtcMessage.success === 'function') {
                  globalBtcMessage.success(message);
                }
              }
            } catch (error) {
              console.warn('[useLogout] Failed to show logout success message:', error);
            }
          },
        }),
      };

      const success = await logoutCore(logoutCoreOptions);

      if (!success) {
        logger.error('[useLogout] Logout core failed');
        isLoggingOut = false;
        return;
      }

      // 路由重定向逻辑（仅在本地退出时执行）
      // 立即跳转，不创建定时器，避免内存泄漏
      if (!isRemoteLogout) {
        // 直接跳转到登录页，不进行复杂的 URL 构建
        const currentPath = window.location.pathname + window.location.search;
        const oauthCallbackParam = currentPath && currentPath !== '/login' && !currentPath.startsWith('/login?')
          ? `&oauth_callback=${encodeURIComponent(currentPath)}`
          : '';
        window.location.href = `/login?logout=1${oauthCallbackParam}`;
      }
    } catch (error: any) {
      logger.error('Logout cleanup error:', error);
      isLoggingOut = false;
    } finally {
      // 如果页面不跳转（远程退出），立即重置标志
      // 如果页面跳转，标志会在页面卸载时自动失效，不需要定时器
      if (isRemoteLogout) {
        isLoggingOut = false;
      }
      // 本地退出时，页面会跳转，标志会在跳转时失效，不需要定时器
    }
  };

  // 判断是否是同一个应用（在开发环境中，即使 origin 相同，路径不同也是不同应用）
  const isSameApp = (origin?: string): boolean => {
    // 如果没有 origin，认为是不同应用
    if (!origin) {
      return false;
    }

    // 如果 origin 不同，肯定是不同应用
    if (origin !== window.location.origin) {
      return false;
    }

    // 在开发环境中，即使 origin 相同，也需要通过路径判断是否是同一个应用
    // 例如：/admin/... 和 / 是不同的应用
    if (import.meta.env.DEV) {
      // 在开发环境中，即使 origin 相同，也认为是不同应用（因为路径不同）
      return false;
    }

    // 生产环境中，origin 相同就是同一个应用
    return true;
  };

  // 处理登录消息：当其他应用登录时，刷新页面
  const handleLoginMessage = (_payload?: any, origin?: string) => {
    if (isSameApp(origin)) {
      return;
    }
    // 简单刷新页面
    window.location.reload();
  };

  // 关键：立即设置订阅，不等待组件挂载（确保消息监听器尽早设置）
  unsubscribeLogout = bridge.subscribe('logout', (_payload, origin) => {
    // 避免重复执行
    if (isLoggingOut) {
      return;
    }

    // 如果是同一个应用触发的登出，不需要再次执行
    // 在开发环境中，即使 origin 相同，如果路径不同，也认为是不同应用，需要处理
    if (isSameApp(origin)) {
      return;
    }

    // 执行统一登出逻辑（异步处理）
    performLogoutCleanup(true).catch((error) => {
      logger.error('[useLogout] Error in logout cleanup:', error);
    }); // true 表示是远程触发的登出
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
    // 执行本地登出清理
    await performLogoutCleanup(false);
    // 通知其他标签页（通过通信桥）
    try {
      bridge.sendMessage('logout', { timestamp: Date.now() });
    } catch (error) {
      // 静默失败
    }
  };

  return {
    logout
  };
}

