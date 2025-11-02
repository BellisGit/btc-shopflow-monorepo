<template>
  <BtcAuthLayout>
    <div class="login-card">
      <BtcAuthHeader>
        <template #toggle>
          <BtcQrToggleBtn
            :icon="toggleInfo.icon"
            :label="toggleInfo.label"
            @click="handleToggleQrLogin"
          />
        </template>
      </BtcAuthHeader>

      <div class="card-content">

    <!-- 登录模式切换Tabs（仅在非二维码模式显示） -->
    <BtcLoginTabs
      v-if="currentLoginMode !== 'qr'"
      :current-mode="currentLoginMode"
      @tab-change="handleSwitchLoginMode"
    />

    <!-- 账密登录表单 -->
    <BtcPasswordForm
      v-if="currentLoginMode === 'password'"
      :loading="passwordLoading"
      @submit="handlePasswordSubmit"
    />

    <!-- 短信验证码登录表单 -->
    <BtcSmsForm
      v-if="currentLoginMode === 'sms'"
      :loading="smsLoading"
      @submit="handleSmsSubmit"
      @send-sms="handleSendSms"
      @code-complete="handleCodeComplete"
    />

    <!-- 二维码登录表单 -->
    <BtcQrForm
      v-if="currentLoginMode === 'qr'"
      :qr-code-url="qrCodeUrl"
      @refresh="handleRefreshQrCode"
    />

    <!-- 第三方登录（仅在非二维码模式显示） -->
    <BtcThirdPartyLogin v-if="currentLoginMode !== 'qr'" />

    <!-- 协议文本（仅在非二维码模式显示） -->
    <BtcAgreementText v-if="currentLoginMode !== 'qr'" />
      </div>
    </div>

    <BtcAuthFooter />
  </BtcAuthLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BtcAuthLayout from '../shared/components/auth-layout/index.vue';
import BtcAuthHeader from '../shared/components/auth-header/index.vue';
import BtcAuthFooter from '../shared/components/auth-footer/index.vue';
import BtcQrToggleBtn from '../shared/components/qr-toggle-btn/index.vue';
import BtcLoginTabs from '../shared/components/login-tabs/index.vue';
import BtcPasswordForm from './components/password-form/index.vue';
import BtcSmsForm from './components/sms-form/index.vue';
import BtcQrForm from './components/qr-form/index.vue';
import BtcThirdPartyLogin from '../shared/components/third-party-login/index.vue';
import BtcAgreementText from '../shared/components/agreement-text/index.vue';
import { useAuthTabs, type LoginMode } from '../shared/composables/useAuthTabs';
import { usePasswordLogin } from './composables/usePasswordLogin';
import { useSmsLogin } from './composables/useSmsLogin';
import { useQrLogin } from './composables/useQrLogin';
import '../shared/styles/index.scss';

defineOptions({
  name: 'Login'
});

const { t } = useI18n();

// 登录模式管理
const { currentLoginMode, switchLoginMode, toggleQrLogin, getToggleInfo } = useAuthTabs('password');

// 账密登录
const { loading: passwordLoading, submit: passwordSubmit } = usePasswordLogin();

// 短信登录
const { loading: smsLoading, submit: smsSubmit } = useSmsLogin();

// 二维码登录
const { qrCodeUrl, refreshQrCode } = useQrLogin();

// 切换登录模式
const handleSwitchLoginMode = (mode: LoginMode) => {
  switchLoginMode(mode);
};

// 切换二维码登录
const handleToggleQrLogin = () => {
  toggleQrLogin();
};

// 获取切换按钮信息
const toggleInfo = computed(() => {
  return getToggleInfo();
});

// 账密登录提交
const handlePasswordSubmit = async (form: { username: string; password: string }) => {
  await passwordSubmit(form);
};

// 短信登录提交
const handleSmsSubmit = async (form: { phone: string; smsCode: string }) => {
  await smsSubmit(form);
};

// 发送短信验证码（已由SmsForm内部处理，这里只是占位）
const handleSendSms = () => {
  // 可以在这里添加额外的逻辑
};

// 验证码输入完成（已由SmsForm内部处理，这里只是占位）
const handleCodeComplete = () => {
  // 可以在这里添加自动登录逻辑
};

// 刷新二维码
const handleRefreshQrCode = () => {
  refreshQrCode();
};
</script>

<style lang="scss">
// 登录页面特定样式（如果需要）可以在共享样式基础上扩展
</style>
