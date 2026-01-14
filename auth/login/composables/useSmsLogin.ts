import { logger } from '@btc/shared-core';
import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { authApi } from '@/modules/api-services';
import { useUser } from '@/composables/useUser';
import { getCookie, setCookie, getCookieDomain } from '@/utils/cookie';
import { appStorage } from '@/utils/app-storage';

export function useSmsLogin() {
  const router = useRouter();
  const route = useRoute();
  const { setUserInfo } = useUser();
  const { t } = useI18n();

  // 表单数据
  const form = reactive({
    phone: '',
    smsCode: ''
  });

  // 加载状态
  const loading = ref(false);

  // 提交登录
  const submit = async (formData: { phone: string; smsCode: string }) => {
    try {
      loading.value = true;

      // 调用短信登录接口
      // 关键：只要请求返回 200（没有抛出错误），就认为登录成功
      // 响应拦截器会处理响应，如果 code 不是 200，会抛出错误
      // 所以这里不需要检查响应格式，直接认为登录成功
      await authApi.loginBySms({
        phone: formData.phone,
        smsCode: formData.smsCode,
        smsType: 'login'
      });

      // 如果代码执行到这里，说明请求返回了 200，登录成功
      // 不进行额外的鉴权检查，直接跳转
      BtcMessage.success(t('登录成功'));

      // 设置登录状态标记到统一的 settings 存储中
      const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
      appStorage.settings.set({ ...currentSettings, is_logged_in: true });
      
      // 记录登录时间，用于存储有效性检查的宽限期
      try {
        import('@btc/shared-core/utils/storage-validity-check').then(({ recordLoginTime }) => {
          recordLoginTime();
        }).catch(() => {
          // 静默失败，不影响登录流程
        });
      } catch (error) {
        // 静默失败，不影响登录流程
      }

      // 跳转到首页或 oauth_callback 页面
      // 优先级：URL 参数中的 oauth_callback > 保存的退出前路径 > 默认路径
      const { handleCrossAppRedirect, getAndClearLogoutRedirectPath } = await import('@btc/auth-shared/composables/redirect');
      
      let redirectPath: string;
      // 读取 oauth_callback 参数
      const urlOAuthCallback = route.query.oauth_callback as string;
      if (urlOAuthCallback) {
        // 使用 URL 参数中的 oauth_callback
        // 保留完整的路径，包括查询参数和 hash
        redirectPath = decodeURIComponent(urlOAuthCallback);
      } else {
        // 如果没有 URL 参数，尝试从 localStorage 获取保存的退出前路径
        const savedPath = getAndClearLogoutRedirectPath();
        redirectPath = savedPath || '/';
      }
      
      // 尝试跨应用重定向，如果是子应用路径会使用window.location跳转
      const isCrossAppRedirect = await handleCrossAppRedirect(redirectPath, router);
      
      // 如果不是跨应用跳转
      if (!isCrossAppRedirect) {
        // 关键：cookie 已经在响应拦截器中同步设置好了，理论上可以立即使用 router.push
        // 但是，如果路由守卫的认证检查失败（可能是 cookie 读取时序问题），使用 window.location 作为回退
        router.push(redirectPath).catch((error) => {
          // 如果路由跳转失败（可能是路由未匹配或认证检查失败），使用 window.location 作为回退
          // 这样可以确保 cookie 被正确读取，路由守卫能够正确识别认证状态
          logger.warn('[useSmsLogin] Router push failed, using window.location as fallback:', error);
          window.location.href = redirectPath;
        });
      }
    } catch (error: any) {
      logger.error('登录错误:', error);
      BtcMessage.error(error.message || t('登录失败'));
      // 不再抛出错误，避免在父组件中产生未处理的错误
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    loading,
    submit
  };
}
