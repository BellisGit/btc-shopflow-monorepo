;
import { showToast } from 'vant';
import { useAuthStore } from '@/stores/auth';
import { logger } from '@btc/shared-core';

export function useLogin() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const loading = ref(false);
  const errorMessage = ref('');

  const login = async (username: string, password: string) => {
    if (loading.value) return;

    errorMessage.value = '';
    loading.value = true;

    try {
      // TODO: 调用登录 API
      // const response = await loginApi.login({
      //   username,
      //   password,
      // });

      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟登录成功
      const mockToken = 'mock-token-' + Date.now();
      const mockUser = {
        id: 1,
        username,
        name: username,
      };

      authStore.login(mockToken, mockUser);

      showToast({
        type: 'success',
        message: '登录成功',
        duration: 1500,
      });

      const redirect = (route.query.oauth_callback as string) || '/query';
      // 只取路径部分，忽略查询参数，避免循环重定向
      const redirectPath = redirect.split('?')[0];
      router.push(redirectPath);
    } catch (error: any) {
      logger.error('[Login] Failed:', error);
      errorMessage.value = error?.message || '登录失败，请检查用户名和密码';
      showToast({
        type: 'fail',
        message: errorMessage.value,
        duration: 2000,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    errorMessage,
    login,
  };
}

