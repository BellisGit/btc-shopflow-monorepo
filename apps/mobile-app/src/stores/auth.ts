;
import { storage } from '@btc/shared-utils';
import { authApi } from '@/services/auth';
import { getCookie, deleteCookie } from '@btc/shared-core/utils/cookie';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<any>(null);

  // 判断是否已认证
  // 注意：如果 cookie 是 http-only，JavaScript 无法读取，但浏览器会自动在请求中发送
  // 所以即使 token 为 null，如果有用户信息，也应该认为已登录（由后端验证 cookie）
  const isAuthenticated = computed(() => {
    // 如果有 token，肯定已登录
    if (token.value) {
      return true;
    }
    // 如果没有 token，但有用户信息，说明可能是 http-only cookie 的情况
    // 这种情况下，浏览器会自动发送 cookie，由后端验证
    if (user.value?.id) {
      return true;
    }
    return false;
  });

  function setToken(newToken: string | null) {
    token.value = newToken;
    if (newToken) {
      storage.set('mobile_token', newToken);
    } else {
      storage.remove('mobile_token');
    }
  }

  function setUser(userData: any) {
    user.value = userData;
    if (userData) {
      storage.set('mobile_user', userData);
    } else {
      storage.remove('mobile_user');
    }
  }

  function login(loginToken: string, userData: any) {
    setToken(loginToken);
    setUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
    
    // 清除 cookie 中的 token
    // 需要同时清除带 domain 和不带 domain 的 cookie，确保在所有环境下都能正确清除
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isProduction = hostname.includes('bellis.com.cn');
    
    if (isProduction) {
      // 生产环境：清除带 domain 的 cookie
      deleteCookie('access_token', {
        domain: '.bellis.com.cn',
        path: '/',
      });
    }
    
    // 清除不带 domain 的 cookie（开发环境和生产环境都需要）
    deleteCookie('access_token', {
      path: '/',
    });
  }

  function init() {
    // 优先从 cookie 读取 token（如果 cookie 存在，说明可能已经登录）
    // 这可以处理从其他应用（如主应用）登录后，cookie 已经设置的情况
    const cookieToken = getCookie('access_token');
    
    // 如果 cookie 中有 token，优先使用 cookie 中的 token
    if (cookieToken) {
      token.value = cookieToken;
      storage.set('mobile_token', cookieToken);
    } else {
      // 如果 cookie 中没有，尝试从 storage 读取
      const storedToken = storage.get<string>('mobile_token');
      if (storedToken) {
        token.value = storedToken;
      }
    }
    
    // 读取用户信息
    const storedUser = storage.get<any>('mobile_user');
    if (storedUser) {
      user.value = storedUser;
    }
  }

  /**
   * 从服务器刷新用户信息
   */
  async function refreshUserInfo() {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('[Auth] Failed to refresh user info', error);
      throw error;
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    setUser,
    login,
    logout,
    init,
    refreshUserInfo,
  };
});

