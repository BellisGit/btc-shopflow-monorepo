import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useBtc } from '/@/btc';
import { service } from '/@/btc';

export function useSmsLogin() {
  const { router } = useBtc();
  const { t } = useI18n();

  // 表单数据
  const form = reactive({
    phone: '',
    smsCode: ''
  });

  // 状态
  const saving = ref(false);
  const smsCountdown = ref(0);
  const hasSentSms = ref(false);

  // 发送短信验证码
  const sendSmsCode = async () => {
    if (!form.phone) {
      ElMessage.warning(t('请输入手机号'));
      return;
    }

    try {
      await service.base.sys.user.sendSmsCode({ phone: form.phone });
      hasSentSms.value = true;
      smsCountdown.value = 60;

      // 倒计时
      const timer = setInterval(() => {
        smsCountdown.value--;
        if (smsCountdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      ElMessage.success(t('验证码已发送'));
    } catch (error: any) {
      ElMessage.error(error.message || t('发送失败'));
    }
  };

  // 处理手机号输入
  const handlePhoneEnter = () => {
    if (form.phone && form.phone.length === 11) {
      sendSmsCode();
    }
  };

  // 登录
  const onLogin = async () => {
    if (!form.phone || !form.smsCode) {
      ElMessage.warning(t('请完善信息'));
      return;
    }

    try {
      saving.value = true;

      await service.base.sys.user.smsLogin(form);

      ElMessage.success(t('登录成功'));
      router.push('/');
    } catch (error: any) {
      ElMessage.error(error.message || t('登录失败'));
    } finally {
      saving.value = false;
    }
  };

  // 验证码输入完成
  const onCodeComplete = (code: string) => {
    form.smsCode = code;
    if (form.smsCode && form.smsCode.length === 6) {
      onLogin();
    }
  };

  return {
    form,
    saving,
    smsCountdown,
    hasSentSms,
    sendSmsCode,
    handlePhoneEnter,
    onCodeComplete,
    onLogin,
    t
  };
}
