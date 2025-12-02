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

      // 设置登录状态标记（因为 http-only cookie 无法读取）
      localStorage.setItem('is_logged_in', 'true');

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

      // 保存 token 到 localStorage（如果存在）
      if (token) {
        localStorage.setItem('token', token);
        appStorage.auth.setToken(token);
      }

      // 保存用户信息（如果响应中包含用户信息）
      if (response && response.user) {
        setUserInfo(response.user);
      } else if (response && response.data && response.data.user) {
        setUserInfo(response.data.user);
      }

      // 保存用户名到统一存储（记住用户名）
      appStorage.user.setUsername(formData.username);

      // 等待状态更新，确保路由守卫能正确识别登录状态
      await new Promise(resolve => setTimeout(resolve, 100));

      // 跳转到首页或 redirect 页面
      const redirect = (route.query.redirect as string) || '/';
      // 只取路径部分，忽略查询参数，避免循环重定向
      const redirectPath = redirect.split('?')[0];
      router.push(redirectPath);
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
