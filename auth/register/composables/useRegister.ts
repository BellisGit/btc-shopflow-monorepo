import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
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
      { required: true, message: t('auth.validation.username_required'), trigger: 'blur' },
      { min: 2, max: 50, message: t('auth.validation.username_length'), trigger: 'blur' }
    ],
    phone: [
      { required: true, message: t('auth.validation.phone_required'), trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: t('auth.validation.phone_format'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('auth.validation.password_required'), trigger: 'blur' },
      { min: 6, max: 20, message: t('auth.validation.password_length'), trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: t('auth.validation.confirm_password_required'), trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: any) => {
          if (value !== form.password) {
            callback(new Error(t('auth.validation.confirm_password_mismatch')));
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

      BtcMessage.success(t('auth.message.register_success'));
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login?from=register');
      }, 1500);
    } catch (error: any) {
      console.error('注册失败:', error);
      BtcMessage.error(error.message || t('auth.message.register_failed'));
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

