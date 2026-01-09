import { ref, computed } from 'vue';
import { showToast } from 'vant';
import { useRouter, useRoute } from 'vue-router';

export function useNumberAuthLogin() {
  const loading = ref(false);
  const router = useRouter();
  const route = useRoute();

  const supported = computed(() => {
    if (typeof window === 'undefined') return false;
    const isHttps = window.location?.protocol === 'https:';
    const connection = (navigator as any)?.connection;
    const isCellular = connection?.type ? connection.type === 'cellular' : true;
    return isHttps && isCellular;
  });

  const redirectAfterLogin = async () => {
    const redirect = (route.query.oauth_callback as string) || '/query';
    const redirectPath = redirect.split('?')[0];
    try {
      await router.replace(redirectPath);
    } catch {
      window.location.href = redirectPath;
    }
  };

  const login = async () => {
    if (loading.value) return;
    if (!supported.value) {
      showToast({
        type: 'fail',
        message: '当前网络环境暂不支持号码认证，请改用短信验证码登录',
        duration: 2500,
      });
      return;
    }

    loading.value = true;
    try {
      // 跳转到空白授权页面，授权逻辑在 PhoneAuthor.vue 中处理
      await router.push({
        name: 'PhoneAuthor',
        query: route.query,
      });
    } catch (error: any) {
      console.error('跳转到授权页面失败:', error);
      showToast({
        message: '跳转失败，请重试',
        type: 'fail',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    supported,
    login,
  };
}
