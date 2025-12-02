import { ref, computed, nextTick } from 'vue';
import { showToast } from 'vant';
import { useRouter, useRoute } from 'vue-router';

import { authApi } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import {
  callNumberAuthSdk,
  ensureNumberAuthSdkLoaded,
  detectAvailableVendor,
  getDefaultMethod,
  isAliyunSdkAvailable,
} from '../numberAuth';
import type { NumberAuthConfigResponse, NumberAuthVendor, NumberAuthMethod } from '@/types/numberAuth';

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
    // 只取路径部分，忽略查询参数，避免循环重定向
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
      await ensureNumberAuthSdkLoaded();

      // 尝试从后端获取配置，如果失败则使用H5 SDK自动检测
      let config: NumberAuthConfigResponse | null = null;
      let vendor: NumberAuthVendor;
      let method: NumberAuthMethod;
      let sdkData: Record<string, any> = {};
      let extraOptions: Record<string, any> | undefined = undefined;
      let loginContext: Record<string, any> | undefined = undefined;
      const isAliyun = isAliyunSdkAvailable(); // 记录是否使用阿里云SDK

      // 如果使用阿里云SDK，不需要后端配置，直接调用
      if (isAliyun) {
        // 阿里云SDK可以直接调用，不需要后端配置参数
        vendor = 'CM'; // 占位值，实际由后端通过阿里云SDK验证
        method = 'getTokenInfo'; // 占位值
        sdkData = {};
      } else {
        // 使用运营商SDK，尝试从后端获取配置
        try {
          config = await authApi.getNumberAuthConfig();
          if (config && config.sdkPayload) {
            // 使用后端返回的配置
            vendor = config.vendor;
            method = config.sdkPayload.method;
            sdkData = config.sdkPayload.data || {};
            extraOptions = config.sdkPayload.extraOptions;
            loginContext = config.loginContext;
          } else {
            // 后端未返回配置，使用H5 SDK自动检测
            const detectedVendor = detectAvailableVendor();
            if (!detectedVendor) {
              throw new Error('未检测到可用的号码认证SDK，请确认已正确加载SDK');
            }
            vendor = detectedVendor;
            method = getDefaultMethod(detectedVendor);
            // H5 SDK可以直接调用，不需要额外的data参数
            sdkData = {};
          }
        } catch (error: any) {
          // 后端接口调用失败，使用H5 SDK自动检测
          if (import.meta.env.DEV) {
            console.warn('[NumberAuth] 后端配置获取失败，使用H5 SDK自动检测:', error);
          }
          const detectedVendor = detectAvailableVendor();
          if (!detectedVendor) {
            throw new Error('未检测到可用的号码认证SDK，请确认已正确加载SDK');
          }
          vendor = detectedVendor;
          method = getDefaultMethod(detectedVendor);
          sdkData = {};
        }
      }

      const carrierResult = await callNumberAuthSdk({
        vendor,
        method,
        data: sdkData,
        extraOptions,
      });

      // 如果使用阿里云SDK且返回了spToken，使用新的验证接口
      let loginResult: any;
      if (isAliyun && carrierResult.payload?.spToken) {
        // 使用新的验证spToken接口
        loginResult = await authApi.verifySpToken({
          spToken: carrierResult.payload.spToken,
        });
      } else {
        // 使用原有的号码认证登录接口（兼容运营商SDK）
        loginResult = await authApi.loginByNumberAuth({
          vendor,
          carrierResult: carrierResult.payload,
          context: loginContext,
        });
      }

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

