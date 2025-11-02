import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { http } from '@/utils/http';

export function useRegister() {
  const router = useRouter();
  const { t } = useI18n();

  const form = reactive({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const loading = ref(false);

  const rules = reactive({
    username: [
      { required: true, message: t('请输入用户名或邮箱'), trigger: 'blur' },
      { min: 2, max: 50, message: t('用户名长度在 2 到 50 个字符'), trigger: 'blur' }
    ],
    phone: [
      { required: true, message: t('请输入手机号'), trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: t('请输入正确的手机号'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('请输入密码'), trigger: 'blur' },
      { min: 6, max: 20, message: t('密码长度在 6 到 20 个字符'), trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: t('请再次输入密码'), trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: any) => {
          if (value !== form.password) {
            callback(new Error(t('两次输入的密码不一致')));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  });

  const register = async (formRef: any) => {
    if (!formRef) return;
    try {
      loading.value = true;
      await formRef.validate();

      // 调用注册 API
      await http.post('/base/open/register', {
        username: form.username,
        phone: form.phone,
        password: form.password
      });

      ElMessage.success(t('注册成功'));
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      console.error('注册失败:', error);
      ElMessage.error(error.message || t('注册失败，请重试'));
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    rules,
    loading,
    register
  };
}

