import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/services/auth';
import { getCookie } from '@/utils/cookie';

export function usePhoneLogin() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const loading = ref(false);

  const login = async (phone: string, smsCode: string) => {
    if (loading.value) return;

    loading.value = true;

    try {
      // 调用手机号登录 API
      const response = await authApi.loginBySms({
        phone,
        smsCode,
        smsType: 'login'
      });

      // 优先从响应体获取 token（如果后端返回）
      let token: string | null = null;
      if (response?.token) {
        token = response.token;
      } else if (response?.accessToken) {
        token = response.accessToken;
      } else {
        // 如果响应体没有 token，尝试从 cookie 读取
        token = getCookie('access_token');
      }

      // 保存 token 到 authStore
      if (token) {
        authStore.setToken(token);
      } else {
        // 调试：检查登录响应和 cookie
        if (import.meta.env.DEV) {
          console.warn('[PhoneLogin] No token found:', {
            responseKeys: response ? Object.keys(response) : [],
            response: response,
            cookies: document.cookie.split(';').map(c => c.trim()),
            hasAccessTokenInCookie: document.cookie.includes('access_token')
          });
        }
      }

      // 保存用户信息（如果响应中包含用户信息）
      if (response && response.user) {
        authStore.setUser(response.user);
      } else {
        // 如果没有用户信息，创建一个基本的用户对象
        authStore.setUser({
          id: phone,
          phone,
          username: phone,
        });
      }

      showToast({
        type: 'success',
        message: '登录成功',
        duration: 1500,
      });

      // 跳转到首页或 redirect 页面
      const redirect = (route.query.redirect as string) || '/';
      router.push(redirect);
    } catch (error: any) {
      console.error('[PhoneLogin] Failed:', error);
      showToast({
        type: 'fail',
        message: error?.message || '登录失败',
        duration: 2000,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    login,
  };
}

