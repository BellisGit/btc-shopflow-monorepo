<template>
  <LoginMain
    :current-login-mode="currentLoginMode"
    :is-saving="isSaving"
    :toggle-icon="toggleIcon"
    :toggle-label="toggleLabel"
    :handle-switch-login-mode="handleSwitchLoginMode"
    :toggle-qr-login="toggleQrLogin"
    :t="t"
    :app="app"
    :password-form="passwordForm"
    :password-loading="passwordLoading"
    :password-rules="passwordRules"
    :password-submit="passwordSubmit"
    :sms-form="smsForm"
    :sms-saving="smsSaving"
    :sms-countdown="smsCountdown"
    :has-sent-sms="hasSentSms"
    :send-sms-code="sendSmsCode"
    :handle-phone-enter="handlePhoneEnter"
    :on-code-complete="onCodeComplete"
    :on-login="onLogin"
    :qr-code-url="qrCodeUrl"
    :refresh-qr-code="refreshQrCode"
  />
</template>

<script setup lang="ts">
import { useBase } from '/$/base';
import LoginMain from './main/index.vue';
import { useLogin } from './composables/useLogin';

defineOptions({
  name: 'Login'
});

const { app } = useBase();

const {
  currentLoginMode,
  isSaving,
  toggleIcon,
  toggleLabel,
  handleSwitchLoginMode,
  toggleQrLogin,
  t,
  // Password login props
  passwordForm,
  passwordLoading,
  passwordRules,
  passwordSubmit,
  // SMS login props
  smsForm,
  smsSaving,
  smsCountdown,
  hasSentSms,
  sendSmsCode,
  handlePhoneEnter,
  onCodeComplete,
  onLogin,
  // QR login props
  qrCodeUrl,
  refreshQrCode
} = useLogin();
</script>
