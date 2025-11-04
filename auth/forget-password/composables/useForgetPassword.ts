import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSmsCode } from '@btc/shared-core';
import { authApi, codeApi } from '@/modules/api-services';

export function useForgetPassword() {
  const router = useRouter();
  const { t } = useI18n();

  // 表单数据
  const form = reactive({
    phone: '',
    smsCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 状态
  const loading = ref(false);

  // 使用验证码 Composable
  const {
    countdown: smsCountdown,
    sending,
    hasSent: hasSentSms,
    send: sendSmsCodeInternal
  } = useSmsCode({
    sendSmsCode: codeApi.sendSmsCode,
    countdown: 60,
    minInterval: 60,
    onSuccess: () => {
      ElMessage.success(t('验证码已发送'));
    },
    onError: (error) => {
      ElMessage.error(error.message || t('发送验证码失败'));
    }
  });

  // 表单验证规则
  const rules = reactive({
    phone: [
      { required: true, message: t('请输入手机号'), trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: t('请输入正确的手机号'), trigger: 'blur' }
    ],
    smsCode: [
      { required: true, message: t('请输入验证码'), trigger: 'blur' },
      { len: 6, message: t('验证码长度为6位'), trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: t('请输入新密码'), trigger: 'blur' },
      { min: 6, max: 20, message: t('密码长度在 6 到 20 个字符'), trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: t('请确认密码'), trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: Function) => {
          if (value !== form.newPassword) {
            callback(new Error(t('两次输入的密码不一致')));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  });

  // 发送验证码
  const sendSmsCode = async () => {
    if (!form.phone) {
      ElMessage.warning(t('请输入手机号'));
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      ElMessage.warning(t('请输入正确的手机号'));
      return;
    }

    try {
      // 使用验证码 Composable 发送
      await sendSmsCodeInternal(form.phone, 'reset');
    } catch (error) {
      // 错误已通过 onError 回调处理
    }
  };

  // 重置密码
  const resetPassword = async (formRef: any) => {
    if (!formRef) return;

    try {
      await formRef.validate();
      loading.value = true;

      await authApi.resetPassword({
        phone: form.phone,
        smsCode: form.smsCode,
        newPassword: form.newPassword
      });

      ElMessage.success(t('密码重置成功，请重新登录'));
      
      // 跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      if (error.message) {
        ElMessage.error(error.message);
      }
      throw error;
    } finally {
      loading.value = false;
    }
  };


  return {
    form,
    rules,
    loading,
    sending,
    smsCountdown,
    hasSentSms,
    sendSmsCode,
    resetPassword
  };
}

