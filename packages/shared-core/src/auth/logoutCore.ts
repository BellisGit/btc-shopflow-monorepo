/**
 * 退出登录核心逻辑（纯函数，无路由耦合）
 * 负责清理凭证、调用API、设置标记等，但不处理路由重定向
 */

import { sessionStorage } from '@btc/shared-core/utils/storage/session';

export interface LogoutCoreOptions {
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
  /**
   * 是否远程退出（不调用API，不显示提示）
   */
  isRemoteLogout?: boolean;
  /**
   * 显示退出成功提示的回调函数（可选）
   * 如果不提供，不会显示提示
   */
  onSuccess?: (message: string) => void;
}

/**
 * 退出登录核心函数（纯逻辑，无路由耦合）
 * @param options - 退出配置项（适配不同应用的差异）
 * @returns Promise<boolean> - 退出是否成功
 */
export async function logoutCore(options: LogoutCoreOptions = {}): Promise<boolean> {
  const {
    authApi,
    clearUserInfo,
    getProcessStore,
    deleteCookie: deleteCookieFn,
    getAppStorage,
    isRemoteLogout = false,
    onSuccess,
  } = options;

  try {
    // 停止全局用户检查轮询
    try {
      const { stopUserCheckPolling } = await import('../composables/user-check');
      stopUserCheckPolling();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to stop global user check polling on logout:', error);
      }
    }

    // 仅在本地的登出操作中调用后端 API
    if (!isRemoteLogout) {
      try {
        const api = authApi || (window as any).__APP_AUTH_API__;
        if (api?.logout) {
          await api.logout();
        }
      } catch (error: any) {
        console.warn('Logout API failed, but continue with frontend cleanup:', error);
      }
    }

    // 关键：先清除登录状态标记，确保 isAuthenticated() 立即返回 false
    // 这样路由守卫在检查时就不会因为 cookie 清除延迟而误判
    const getAppStorageFn = getAppStorage || (() => (window as any).__APP_STORAGE__ || (window as any).appStorage);
    const appStorage = getAppStorageFn();

    // 关键：使用 removeItem 方法删除 is_logged_in 字段
    // 因为 appStorage.settings.set() 使用合并逻辑，无法删除字段
    // removeItem 会正确删除字段并同步到 cookie
    if (appStorage?.settings) {
      try {
        appStorage.settings.removeItem('is_logged_in');
      } catch (e) {
        // 如果 removeItem 失败，尝试直接操作 cookie
        try {
          const { getCookie } = await import('../utils/cookie');
          const { syncSettingsToCookie } = await import('../utils');
          const settingsCookie = getCookie('btc_settings');
          if (settingsCookie) {
            try {
              const settings = JSON.parse(decodeURIComponent(settingsCookie));
              if (settings.is_logged_in) {
                delete settings.is_logged_in;
                // 直接同步到 cookie，确保 is_logged_in 字段被删除
                syncSettingsToCookie(settings);
              }
            } catch (e2) {
              // 静默失败
            }
          }
        } catch (e2) {
          // 静默失败
        }
      }
    }

    // 清除 appStorage 中的其他认证相关数据
    if (appStorage) {
      // 安全调用 clear 方法，确保对象存在
      if (appStorage.auth && typeof appStorage.auth.clear === 'function') {
        appStorage.auth.clear();
      }
      if (appStorage.user && typeof appStorage.user.clear === 'function') {
        appStorage.user.clear();
      }
    }

    // 清除 localStorage 中的 is_logged_in 标记（向后兼容）
    localStorage.removeItem('is_logged_in');

    // 关键：设置退出登录标记到 sessionStorage，用于路由守卫判断
    // 退出登录后短时间内（5秒），即使 isAuthenticated() 返回 true，也允许访问登录页
    // 这样可以解决 cookie 清除延迟导致的重定向问题
    try {
      sessionStorage.set('logout_timestamp', Date.now());
      // 5 秒后自动清除标记
      setTimeout(() => {
        try {
          sessionStorage.remove('logout_timestamp');
        } catch (e) {
          // 静默失败
        }
      }, 5000);
    } catch (e) {
      // 静默失败
    }

    // 清除 cookie 中的 token
    const deleteCookie = deleteCookieFn || (await import('../utils/cookie')).deleteCookie;
    deleteCookie('access_token');

    // 关键：清除 btc_user cookie（用于用户认证检查）
    // 注意：btc_user cookie 可能设置了 domain，需要确保清除时也使用相同的 domain
    try {
      deleteCookie('btc_user');
    } catch (e) {
      // 如果清除失败，尝试使用默认的 deleteCookie（可能没有 domain 参数）
      const { deleteCookie: defaultDeleteCookie } = await import('../utils/cookie');
      defaultDeleteCookie('btc_user');
    }

    // 清除用户状态
    try {
      const { storage } = await import('../utils');
      storage.remove('user');
      localStorage.removeItem('btc_user');
      localStorage.removeItem('user');
    } catch (e) {
      // 静默失败
    }

    // 清除标签页（Process Store）
    if (getProcessStore) {
      try {
        const processStore = await getProcessStore();
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
    if (clearUserInfo) {
      clearUserInfo();
    }

    // 仅在本地的登出操作中显示提示
    if (!isRemoteLogout && onSuccess) {
      try {
        // 尝试获取国际化文本
        let message = '退出成功';
        try {
          const { useI18n } = await import('vue-i18n');
          // 注意：这里不能直接使用 useI18n()，因为不在组件上下文中
          // 所以需要从全局获取 i18n 实例
          const i18n = (window as any).__APP_I18N__ || (window as any).i18n;
          if (i18n?.global?.t) {
            message = i18n.global.t('common.logoutSuccess') || message;
          }
        } catch (e) {
          // 如果获取失败，使用默认消息
        }
        onSuccess(message);
      } catch (error) {
        console.warn('[logoutCore] Failed to show logout success message:', error);
      }
    }

    return true;
  } catch (error: any) {
    console.error('[logoutCore] Logout cleanup error:', error);
    return false;
  }
}

