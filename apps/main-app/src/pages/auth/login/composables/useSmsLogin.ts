import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { authApi } from '@/modules/api-services';
import { useUser } from '@/composables/useUser';
import { getCookie } from '@/utils/cookie';

export function useSmsLogin() {
  const router = useRouter();
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
      // 注意：token 会在 cookie 中，字段名为 access_token
      // 同时检查响应体中是否包含 token（向后兼容）
      const response = await authApi.loginBySms({
        phone: formData.phone,
        smsCode: formData.smsCode,
        smsType: 'login'
      });

      ElMessage.success(t('登录成功'));

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

      // 保存 token 到 localStorage（无论来源）
      if (token) {
        localStorage.setItem('token', token);
      } else {
        // 调试：检查登录响应和 cookie
        if (import.meta.env.DEV) {
          console.warn('[SMS Login] No token found:', {
            responseKeys: response ? Object.keys(response) : [],
            response: response,
            cookies: document.cookie.split(';').map(c => c.trim()),
            hasAccessTokenInCookie: document.cookie.includes('access_token')
          });
        }
      }

      // 保存用户信息（如果响应中包含用户信息）
      if (response && response.user) {
        setUserInfo(response.user);
      }

      // 跳转到首页
      router.push('/');
    } catch (error: any) {
      console.error('登录错误:', error);
      ElMessage.error(error.message || t('登录失败'));
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
