import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { authApi } from '@/modules/api-services';
import { useUser } from '@/composables/useUser';
import { getCookie } from '@/utils/cookie';

export function usePasswordLogin() {
  const router = useRouter();
  const { setUserInfo } = useUser();
  const { t } = useI18n();

  // 表单数据
  const form = reactive({
    username: localStorage.getItem('username') || '',
    password: ''
  });

  // 加载状态
  const loading = ref(false);

  // 提交登录
  const submit = async (formData: { username: string; password: string }) => {
    try {
      loading.value = true;

      // 调用登录接口
      // 注意：token 会在 cookie 中，字段名为 access_token，不需要从响应中读取
      const response = await authApi.login({
        username: formData.username,
        password: formData.password
      });

      ElMessage.success(t('登录成功'));

      // token 已经通过 cookie 自动保存（字段名：access_token）
      // 为了兼容性，也从 cookie 读取 token 保存到 localStorage（如果存在）
      const token = getCookie('access_token');
      if (token) {
        localStorage.setItem('token', token);
      }

      // 保存用户信息（如果响应中包含用户信息）
      if (response && response.user) {
        setUserInfo(response.user);
      }

      // 保存用户名到 localStorage（记住用户名）
      localStorage.setItem('username', formData.username);

      // 跳转到首页
      router.push('/');
    } catch (error: any) {
      console.error('登录错误:', error);
      ElMessage.error(error.message || t('登录失败'));
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
