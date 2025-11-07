import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { authApi } from '@/modules/api-services';
import { useUser } from '@/composables/useUser';
import { getCookie } from '@/utils/cookie';
import { appStorage } from '@/utils/app-storage';

export function usePasswordLogin() {
  const router = useRouter();
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
      // 注意：token 会在 cookie 中，字段名为 access_token
      // 同时检查响应体中是否包含 token（向后兼容）
      const response = await authApi.login({
        username: formData.username,
        password: formData.password
      });

      BtcMessage.success(t('登录成功'));

      // 优先从响应体获取 token（如果后端返回）
      let token: string | null = null;
      if (response?.token) {
        token = response.token;
      } else if (response?.accessToken) {
        token = response.accessToken;
      } else {
        // 如果响应体没有 token，尝试从 cookie 读取
        token = getCookie('access_token');
      }

      // 保存 token 到统一存储（无论来源）
      if (token) {
        appStorage.auth.setToken(token);
      }

      // 保存用户信息（如果响应中包含用户信息）
      if (response && response.user) {
        setUserInfo(response.user);
      }

      // 保存用户名到统一存储（记住用户名）
      appStorage.user.setUsername(formData.username);

      // 跳转到首页
      router.push('/');
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
