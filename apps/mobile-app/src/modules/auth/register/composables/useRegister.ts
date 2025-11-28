import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { authApi, type RegisterRequest } from '@/services/auth';

/**
 * 注册相关逻辑
 */
export function useRegister() {
  const router = useRouter();
  const route = useRoute();
  const loading = ref(false);

  /**
   * 提交注册
   */
  const register = async (data: RegisterRequest) => {
    if (loading.value) return;

    loading.value = true;

    try {
      await authApi.register(data);

      showToast({
        type: 'success',
        message: '注册成功',
        duration: 2000,
      });

      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push({ name: 'Login', query: route.query });
      }, 1500);
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

