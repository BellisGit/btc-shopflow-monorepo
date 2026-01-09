import { ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/services/auth';
import { getCookie } from '@btc/shared-core/utils/cookie';

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

      // 从响应中获取 token（支持多种字段名）
      let token: string | null = 
        response?.access_token || 
        response?.accessToken || 
        response?.token ||
        response?.data?.access_token ||
        response?.data?.accessToken ||
        response?.data?.token ||
        null;

      // 如果响应中没有 token，尝试从 store 读取（响应拦截器可能已经处理）
      if (!token || !token.trim()) {
        token = authStore.token || null;
      }

      // 关键：如果响应体或 store 中有 token，保存到 authStore
      // 如果没有 token，但登录接口返回成功（没有抛出错误），说明后端已经设置了 http-only cookie
      // 这种情况下，浏览器会自动在后续请求中发送 cookie，不需要前端保存 token
      // 但我们需要设置用户信息，让路由守卫能正确判断（通过 user 信息判断是否已登录）
      if (token && token.trim()) {
        authStore.setToken(token);
      }
      // 注意：即使没有 token，只要登录接口返回成功，就应该认为登录成功
      // 因为后端已经设置了 http-only cookie，浏览器会自动在后续请求中发送

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

      // 等待状态更新后再跳转
      await nextTick();

      // 显示成功提示
      showToast({
        type: 'success',
        message: '登录成功',
        duration: 1000,
      });

      // 跳转到查询页面或 oauth_callback 页面
      const redirect = (route.query.oauth_callback as string) || '/query';
      const redirectPath = redirect.split('?')[0];
        await router.replace(redirectPath);
    } catch (error: any) {
      // 友好的错误提示
      let friendlyMessage = '登录失败，请稍后重试';
      if (error?.message) {
        // 将常见的技术性错误转换为友好提示
        const msg = error.message.toLowerCase();
        if (msg.includes('network') || msg.includes('timeout')) {
          friendlyMessage = '网络连接失败，请检查网络后重试';
        } else if (msg.includes('phone') || msg.includes('手机号')) {
          friendlyMessage = '手机号格式不正确';
        } else if (msg.includes('code') || msg.includes('验证码')) {
          friendlyMessage = '验证码错误或已过期';
        } else if (msg.includes('用户不存在') || msg.includes('not found')) {
          friendlyMessage = '该手机号未注册';
        } else {
          // 如果是中文错误信息，直接使用
          if (/[\u4e00-\u9fa5]/.test(error.message)) {
            friendlyMessage = error.message;
          }
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
    login,
  };
}

