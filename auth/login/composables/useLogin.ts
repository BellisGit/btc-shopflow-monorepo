import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBase } from '/$/base';
import { usePasswordLogin } from './usePasswordLogin';
import { useSmsLogin } from './useSmsLogin';
import { useQrLogin } from './useQrLogin';

export function useLogin() {
  const { app } = useBase();
  const { t } = useI18n();

  // 当前登录模式
  const currentLoginMode = ref<'password' | 'sms' | 'qr'>('password');

  // 加载状态
  const isSaving = ref(false);

  // 获取子组件的逻辑
  const passwordLogin = usePasswordLogin();
  const smsLogin = useSmsLogin();
  const qrLogin = useQrLogin();

  // 切换登录模式
  const handleSwitchLoginMode = (mode: 'password' | 'sms' | 'qr') => {
    currentLoginMode.value = mode;
  };

  // 切换QR登录
  const toggleQrLogin = () => {
    const newMode = currentLoginMode.value === 'qr' ? 'password' : 'qr';
    currentLoginMode.value = newMode;
  };

  // 计算属性
  const toggleIcon = computed(() => currentLoginMode.value === 'qr' ? 'pc' : 'qr');
  const toggleLabel = computed(() => currentLoginMode.value === 'qr' ? '账号登录' : '扫码登录');

  // 引用（这些现在在LoginView组件内部管理）

  // 确保app对象有info属性
  const appInfo = app?.info || { name: 'BTC Admin', version: '1.0.0' };

  return {
    // 状态
    currentLoginMode,
    isSaving,


    // 计算属性
    toggleIcon,
    toggleLabel,

    // 方法
    handleSwitchLoginMode,
    toggleQrLogin,

    // 国际化
    t,

    // 应用信息
    app: { info: appInfo },

    // 密码登录
    passwordForm: passwordLogin.form,
    passwordLoading: passwordLogin.loading,
    passwordRules: passwordLogin.rules,
    passwordSubmit: passwordLogin.submit,

    // 短信登录
    smsForm: smsLogin.form,
    smsSaving: smsLogin.saving,
    smsCountdown: smsLogin.smsCountdown,
    hasSentSms: smsLogin.hasSentSms,
    sendSmsCode: smsLogin.sendSmsCode,
    handlePhoneEnter: smsLogin.handlePhoneEnter,
    onCodeComplete: smsLogin.onCodeComplete,
    onLogin: smsLogin.onLogin,

    // 二维码登录
    qrCodeUrl: qrLogin.qrUrl,
    refreshQrCode: qrLogin.refreshQrCode
  };
}
