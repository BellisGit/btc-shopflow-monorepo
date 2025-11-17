import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '@/stores/auth';

export function usePhoneLogin() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const loading = ref(false);

  const login = async (phone: string) => {
    if (loading.value) return;

    loading.value = true;

    try {
      // TODO: 调用手机号登录 API
      // const response = await loginApi.phoneLogin({ phone });

      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟登录成功
      const mockToken = 'mock-token-' + Date.now();
      const mockUser = {
        id: 1,
        phone,
        name: phone,
      };

      authStore.login(mockToken, mockUser);

      showToast({
        type: 'success',
        message: '登录成功',
        duration: 1500,
      });

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

