import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/auth';
import { getCookie, deleteCookie } from '@/utils/cookie';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<any>(null);

  const isAuthenticated = computed(() => !!token.value);

  function setToken(newToken: string | null) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('mobile_token', newToken);
    } else {
      localStorage.removeItem('mobile_token');
    }
  }

  function setUser(userData: any) {
    user.value = userData;
    if (userData) {
      localStorage.setItem('mobile_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('mobile_user');
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
      localStorage.setItem('mobile_token', cookieToken);
      console.log('[Auth] Token loaded from cookie');
    } else {
      // 如果 cookie 中没有，尝试从 localStorage 读取
      const storedToken = localStorage.getItem('mobile_token');
      if (storedToken) {
        token.value = storedToken;
        console.log('[Auth] Token loaded from localStorage');
      }
    }
    
    // 读取用户信息
    const storedUser = localStorage.getItem('mobile_user');
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        console.error('[Auth] Failed to parse stored user data', e);
      }
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

