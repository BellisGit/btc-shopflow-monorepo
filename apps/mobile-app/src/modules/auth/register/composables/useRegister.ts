import { showToast } from 'vant';
import { authApi, type RegisterRequest } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';

/**
 * 注册相关逻辑
 */
function extractTokenFromResponse(response: any): string | null {
  if (!response) return null;
  return response.access_token || response.accessToken || response.token || null;
}

export function useRegister() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const loading = ref(false);

  /**
   * 提交注册
   */
  const register = async (data: RegisterRequest) => {
    if (loading.value) return;

    loading.value = true;

    try {
      const registerResult = await authApi.register(data);

      // 提取 token
      const token = extractTokenFromResponse(registerResult);
      if (token) {
        // 保存 token 到 store
        authStore.setToken(token);
        authStore.setUser(registerResult.user || null);
      }

      showToast({
        type: 'success',
        message: '注册成功',
        duration: 1500,
      });

      // 注册成功后，跳转到授权页面
      if (token) {
        // 等待 toast 显示后再执行跳转
        setTimeout(async () => {
          await router.push({
            name: 'PhoneAuthor',
            query: route.query,
          });
        }, 1500);
      } else {
        // 没有 token，跳转到登录页
        setTimeout(() => {
          router.push({ name: 'Login', query: route.query });
        }, 1500);
      }
    } catch (error: any) {
      // 友好的错误提示
      let friendlyMessage = '注册失败，请稍后重试';
      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('network') || msg.includes('timeout')) {
          friendlyMessage = '网络连接失败，请检查网络后重试';
        } else if (msg.includes('exist') || msg.includes('已存在')) {
          friendlyMessage = '该手机号已被注册';
        } else if (msg.includes('phone') || msg.includes('手机号')) {
          friendlyMessage = '手机号格式不正确';
        } else if (msg.includes('code') || msg.includes('验证码')) {
          friendlyMessage = '验证码错误或已过期';
        } else if (/[\u4e00-\u9fa5]/.test(error.message)) {
          friendlyMessage = error.message;
        }
      }
      showToast({
        type: 'fail',
        message: friendlyMessage,
        duration: 2000,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    register,
  };
}

