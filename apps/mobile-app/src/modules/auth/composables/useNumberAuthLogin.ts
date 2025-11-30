import { ref, computed, nextTick } from 'vue';
import { showToast } from 'vant';
import { useRouter, useRoute } from 'vue-router';

import { authApi } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import { callNumberAuthSdk, ensureNumberAuthSdkLoaded } from '../numberAuth';
import type { NumberAuthConfigResponse } from '@/types/numberAuth';

function extractToken(response: any): string | null {
  if (!response) return null;
  return response.access_token || response.accessToken || response.token || null;
}

export function useNumberAuthLogin() {
  const loading = ref(false);
  const authStore = useAuthStore();
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
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 200));
    const redirect = (route.query.redirect as string) || '/home';
    try {
      await router.replace(redirect);
    } catch {
      window.location.href = redirect;
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
      await ensureNumberAuthSdkLoaded();
      const config: NumberAuthConfigResponse = await authApi.getNumberAuthConfig();
      if (!config || !config.sdkPayload) {
        throw new Error('未获取到号码认证参数');
      }

      const carrierResult = await callNumberAuthSdk({
        vendor: config.vendor,
        method: config.sdkPayload.method,
        data: config.sdkPayload.data,
        extraOptions: config.sdkPayload.extraOptions,
      });

      const loginResult = await authApi.loginByNumberAuth({
        vendor: config.vendor,
        carrierResult: carrierResult.payload,
        context: config.loginContext,
      });

      const token = extractToken(loginResult);
      if (!token) {
        throw new Error('后端未返回访问令牌');
      }

      authStore.setToken(token);
      authStore.setUser(loginResult.user || null);

      showToast({
        type: 'success',
        message: '登录成功',
        duration: 800,
      });

      await redirectAfterLogin();
    } catch (error: any) {
      const message =
        error?.message ||
        error?.msg ||
        '一键登录失败，请确认已开启蜂窝网络或稍后再试';
      showToast({
        type: 'fail',
        message,
        duration: 2500,
      });
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('[NumberAuth]', error);
      }
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

