/**
 * 通用退出登录 composable
 * 可以在所有应用中使用，支持退出后保存当前路径以便登录后返回
 */

import { useRouter } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { onUnmounted } from 'vue';
import { useCrossDomainBridge } from './useCrossDomainBridge';
import { logoutCore, type LogoutCoreOptions } from '../auth/logoutCore';

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
        console.error('[useLogout] Logout core failed');
        isLoggingOut = false;
        return;
      }

      // 路由重定向逻辑（仅在本地退出时执行）
      if (!isRemoteLogout) {
        // 延迟跳转，确保消息提示能够显示
        const redirectDelay = 1500;

        setTimeout(async () => {
          try {
            // 使用统一的环境检测
            const { getEnvironment, getCurrentSubApp } = await import('../configs/unified-env-config');
            const { buildLogoutUrlWithFullUrl } = await import('@btc/auth-shared/composables/redirect');

            const env = getEnvironment();
            const currentSubApp = getCurrentSubApp();
            const protocol = window.location.protocol;

            // 判断是否需要使用完整URL（跨子域名场景）
            const needsFullUrl = (env === 'test' || env === 'production') && currentSubApp;
            const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__;

            if (needsFullUrl || isQiankun) {
              // 测试/生产环境子应用或qiankun环境：使用完整URL作为redirect参数
              let baseLoginUrl: string;

              if (env === 'test') {
                baseLoginUrl = `${protocol}//test.bellis.com.cn/login`;
              } else if (env === 'production') {
                baseLoginUrl = `${protocol}//bellis.com.cn/login`;
              } else {
                baseLoginUrl = '/login';
              }

              const logoutUrl = await buildLogoutUrlWithFullUrl(baseLoginUrl);
              window.location.href = logoutUrl;
            } else {
              // 开发/预览环境或主应用：使用路径格式的redirect参数
              const { buildLogoutUrl } = await import('@btc/auth-shared/composables/redirect');
              const logoutUrl = await buildLogoutUrl('/login');

              // 调试信息（开发环境）
              if (import.meta.env.DEV) {
                console.log('[useLogout] 退出登录重定向:', {
                  logoutUrl,
                  hasLogoutParam: logoutUrl.includes('logout=1') || logoutUrl.includes('logout='),
                  hasOAuthCallbackParam: logoutUrl.includes('oauth_callback=')
                });
              }

              window.location.href = logoutUrl;
            }
          } catch (error) {
            // 如果导入失败，使用兜底方案
            console.error('[useLogout] Failed to build logout URL:', error);
            const currentPath = window.location.pathname + window.location.search;
            const oauthCallbackParam = currentPath && currentPath !== '/login' && !currentPath.startsWith('/login?')
              ? `&oauth_callback=${encodeURIComponent(currentPath)}`
              : '';
            window.location.href = `/login?logout=1${oauthCallbackParam}`;
          }
        }, redirectDelay);
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

  // 处理登录消息：当其他应用登录时，更新本地状态并刷新页面
  const handleLoginMessage = (_payload?: any, origin?: string) => {
    // 如果是同一个应用触发的登录，不需要再次处理
    // 使用 isSameApp 来判断，这样可以正确处理开发环境和生产环境的差异
    if (isSameApp(origin)) {
      return;
    }

    // 异步处理登录消息
    (async () => {
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
        // 关键：从当前页面的 URL 查询参数中获取 oauth_callback，确保每个标签页跳转到自己的目标页面
        const urlParams = new URLSearchParams(window.location.search);
        // 优先读取 oauth_callback 参数，如果没有则尝试 redirect（向后兼容）
        let redirect = urlParams.get('oauth_callback') || urlParams.get('redirect');

        // 如果没有 oauth_callback 参数，尝试从 localStorage 获取保存的退出前路径
        if (!redirect) {
          try {
            const { getAndClearLogoutRedirectPath } = await import('@btc/auth-shared/composables/redirect');
            redirect = getAndClearLogoutRedirectPath(); // 这个是同步的，保持不变
          } catch (error) {
            if (import.meta.env.DEV) {
              console.warn('[useLogout] Failed to get logout redirect path:', error);
            }
          }
        }

        // 解码 oauth_callback 参数（可能被 URL 编码）
        const redirectPath = redirect ? decodeURIComponent(redirect) : '/';

        // 尝试跨应用重定向（支持完整URL）
        try {
          const { handleCrossAppRedirect } = await import('@btc/auth-shared/composables/redirect');
          const isCrossAppRedirect = await handleCrossAppRedirect(redirectPath, router);

          // 如果不是跨应用跳转，使用路由跳转
          if (!isCrossAppRedirect) {
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
          }
        } catch (error) {
          // 如果导入失败，使用默认逻辑
          if (import.meta.env.DEV) {
            console.warn('[useLogout] Failed to handle cross app redirect:', error);
          }
          // 回退到简单的路径跳转
          const simplePath = redirectPath.split('?')[0] || '/';
          if (qiankunWindow.__POWERED_BY_QIANKUN__) {
            router.replace(simplePath).catch(() => {
              window.location.href = simplePath;
            });
          } else {
            window.location.href = simplePath;
          }
        }
      } else {
        // 不在登录页，刷新当前页面以重新检查登录状态
        // 这样可以确保页面能够正确读取 cookie 并更新状态
        // 使用 window.location.reload() 刷新页面，确保 cookie 被正确读取
        window.location.reload();
      }
    })();
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
      console.error('[useLogout] Error in logout cleanup:', error);
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

