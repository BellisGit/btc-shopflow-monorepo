import { ref, reactive, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { http } from '@/utils/http';
import { useUser } from '@/composables/useUser';

export function useLogin() {
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

  // 表单验证规则
  const rules = {
    username: [
      { required: true, message: t('请输入用户名或邮箱'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('请输入密码'), trigger: 'blur' }
    ]
  };

  // 提交登录
  const submit = async () => {
    // 基础验证
    if (!form.username) {
      ElMessage.error(t('用户名不能为空'));
      return;
    }

    if (!form.password) {
      ElMessage.error(t('密码不能为空'));
      return;
    }

    try {
      loading.value = true;

      // 调用登录接口
      const response = await http.post<{
        token: string;
        refreshToken?: string;
        expiresIn?: number;
        user?: any;
      }>('/base/open/login', {
        username: form.username,
        password: form.password
      });

      if (response) {
        ElMessage.success(t('登录成功'));

        // 保存 token
        if (response.token) {
          localStorage.setItem('token', response.token);
          
          // 如果有 refreshToken，也保存
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        }

        // 保存用户信息
        if (response.user) {
          setUserInfo(response.user);
        }

        // 保存用户名到 localStorage（记住用户名）
        localStorage.setItem('username', form.username);

        // 使用 nextTick 确保状态更新后再跳转
        await nextTick();
        router.push('/');
      } else {
        ElMessage.error(t('登录失败'));
      }
    } catch (error: any) {
      // 安全地记录错误信息
      const errorInfo = {
        message: error.message || 'Unknown error',
        response: error.response
      };
      console.error('登录错误:', errorInfo);
      ElMessage.error(error.message || t('登录失败'));
      
      // 返回错误，让调用方刷新验证码
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    loading,
    rules,
    submit
  };
}

