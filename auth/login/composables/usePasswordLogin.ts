import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { authApi } from '@/modules/api-services';
import { useUser } from '@/composables/useUser';
import { getCookie } from '@/utils/cookie';
import { appStorage } from '@/utils/app-storage';

export function usePasswordLogin() {
  const router = useRouter();
  const route = useRoute();
  const { setUserInfo } = useUser();
  const { t } = useI18n();

  // 表单数据
  // 从统一存储中获取用户名
  const getStoredUsername = (): string => {
    return appStorage.user.getUsername() || '';
  };

  const form = reactive({
    username: getStoredUsername(),
    password: ''
  });

  // 加载状态
  const loading = ref(false);

  // 提交登录
  const submit = async (formData: { username: string; password: string }) => {
    try {
      loading.value = true;

      // 调用登录接口
      // 注意：token 会在 http-only cookie 中，前端无法直接读取
      // 响应拦截器会处理响应，对于 code: 200 的响应会返回 data 字段
      // 如果响应中没有 data 字段，会返回 undefined，但这也表示登录成功（没有抛出错误）
      const response = await authApi.login({
        username: formData.username,
        password: formData.password
      });

      // 如果代码执行到这里，说明没有抛出错误，登录成功
      // 响应拦截器已经处理了响应，如果 code 不是 200，会抛出错误
      // 所以这里不需要再检查响应格式，直接认为登录成功
      BtcMessage.success(t('登录成功'));

      // 设置登录状态标记到统一的 settings 存储中
      const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
      appStorage.settings.set({ ...currentSettings, is_logged_in: true });

      // 优先从响应体获取 token（如果后端返回）
      let token: string | null = null;
      if (response?.token) {
        token = response.token;
      } else if (response?.accessToken) {
        token = response.accessToken;
      } else if (response?.data?.token) {
        token = response.data.token;
      } else if (response?.data?.accessToken) {
        token = response.data.accessToken;
      }

      // 如果从响应体中找到了 token，设置到 cookie（不再保存到 localStorage）
      if (token) {
        // 清理旧的 localStorage 键（迁移）
        appStorage.auth.setToken(token);
        
        // 设置 cookie
        const { setCookie, getCookieDomain } = await import('@/utils/cookie');
        const isHttps = window.location.protocol === 'https:';
        setCookie('access_token', token, 7, {
          sameSite: isHttps ? 'None' : undefined,
          secure: isHttps,
          path: '/',
          domain: getCookieDomain(),
        });
      }

      // 保存用户信息（使用后端返回的准确数据）
      const userData = response?.user || response?.data?.user;
      if (userData) {
        // 处理用户信息：删除 name 字段，将 name 的值赋给 username（使用后端权威值）
        const processedUser = { ...userData };
        if (processedUser.name) {
          processedUser.username = processedUser.name; // 使用后端返回的 name 作为 username
          delete processedUser.name; // 删除 name 字段
        }
        // 使用 appStorage.user.set 确保同时更新 localStorage 和 cookie
        appStorage.user.set(processedUser);
      }

      // 等待状态更新，确保路由守卫能正确识别登录状态
      await new Promise(resolve => setTimeout(resolve, 100));

      // 启动用户检查轮询（登录后强制立即检查，获取最新的剩余时间）
      try {
        const { startUserCheckPolling } = await import('@btc/shared-core/composables/user-check');
        startUserCheckPolling(true);
      } catch (error) {
        console.warn('[usePasswordLogin] Failed to start user check polling:', error);
      }

      // 跳转到首页或 redirect 页面
      // 优先级：URL 参数中的 redirect > 保存的退出前路径 > 默认路径
      const { handleCrossAppRedirect, getAndClearLogoutRedirectPath } = await import('@btc/auth-shared/composables/redirect');
      
      let redirectPath: string;
      const urlRedirect = route.query.redirect as string;
      if (urlRedirect) {
        // 优先使用 URL 参数中的 redirect
        redirectPath = urlRedirect.split('?')[0];
      } else {
        // 如果没有 URL 参数，尝试从 localStorage 获取保存的退出前路径
        const savedPath = getAndClearLogoutRedirectPath();
        redirectPath = savedPath || '/';
      }
      
      // 尝试跨应用重定向，如果是子应用路径会使用window.location跳转
      const isCrossAppRedirect = handleCrossAppRedirect(redirectPath, router);
      
      // 如果不是跨应用跳转，使用router跳转
      if (!isCrossAppRedirect) {
        router.push(redirectPath);
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      BtcMessage.error(error.message || t('登录失败'));
      throw error;
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
