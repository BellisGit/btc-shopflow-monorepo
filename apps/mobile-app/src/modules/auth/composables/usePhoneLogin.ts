import { ref, nextTick } from 'vue';
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
      // 支持多种字段名：access_token, accessToken, token
      // 同时检查响应是否被包装在 data 字段中
      let token: string | null = null;

      // 检查响应本身
      if (response?.access_token) {
        token = response.access_token;
      } else if (response?.accessToken) {
        token = response.accessToken;
      } else if (response?.token) {
        token = response.token;
      }
      // 检查响应是否被包装在 data 字段中
      else if (response?.data) {
        const data = response.data;
        if (data.access_token) {
          token = data.access_token;
        } else if (data.accessToken) {
          token = data.accessToken;
        } else if (data.token) {
          token = data.token;
        }
      }

      // 如果响应体没有 token，尝试从 cookie 读取
      if (!token) {
        token = getCookie('access_token');
      }

      // 保存 token 到 authStore
      if (token) {
        // 检查 localStorage 是否可用（移动端浏览器应该支持）
        try {
          const testKey = '__localStorage_test__';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
        } catch (e) {
          throw new Error('浏览器不支持本地存储，请检查浏览器设置');
        }

        authStore.setToken(token);

        // 验证 token 是否成功保存
        const savedToken = localStorage.getItem('mobile_token');
        if (!savedToken || savedToken !== token) {
          throw new Error('Token 保存失败，请重试');
        }
      } else {
        throw new Error('登录失败：未获取到访问令牌，请检查后端返回的数据格式');
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

      // 等待状态更新后再跳转，确保路由守卫能正确识别登录状态
      await nextTick();

      // 额外等待一小段时间，确保 Pinia store 状态完全同步
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证登录状态
      if (!authStore.isAuthenticated) {
        // 再次尝试从 localStorage 读取
        const storedToken = localStorage.getItem('mobile_token');

        // 如果 localStorage 中有 token，但 store 中没有，重新初始化
        if (storedToken && !authStore.token) {
          authStore.setToken(storedToken);
          await nextTick();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 再次检查
        if (!authStore.isAuthenticated) {
          throw new Error('登录状态更新失败，请重试');
        }
      }

      // 显示成功提示（短暂显示后跳转）
      showToast({
        type: 'success',
        message: '登录成功',
        duration: 1000, // 缩短显示时间，加快跳转
      });

      // 等待一小段时间让 toast 显示，然后跳转
      await new Promise(resolve => setTimeout(resolve, 500));

      // 跳转到首页或 redirect 页面
      const redirect = (route.query.redirect as string) || '/home';
      // 只取路径部分，忽略查询参数，避免循环重定向
      const redirectPath = redirect.split('?')[0];

      // 使用 replace 而不是 push，避免用户在登录页面的历史记录中
      // 使用 window.location 作为备选方案，确保跳转成功
      try {
        await router.replace(redirectPath);
      } catch (routerError) {
        // 如果路由跳转失败，使用 window.location 作为备选
        window.location.href = redirectPath;
      }
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

