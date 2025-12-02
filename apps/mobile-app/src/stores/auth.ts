import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/auth';

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
  }

  function init() {
    const storedToken = localStorage.getItem('mobile_token');
    const storedUser = localStorage.getItem('mobile_user');
    if (storedToken) {
      token.value = storedToken;
    }
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

