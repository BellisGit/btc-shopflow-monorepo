<template>
  <BtcAuthLayout class="glassmorphism">
    <div class="login-card">
      <BtcAuthHeader />

      <div class="card-content">
        <!-- 返回登录链接 - 与登录页面的"前往注册"链接位置一致 -->
        <div class="back-to-login-wrapper">
          <div class="back-to-login">
            <router-link to="/login" class="back-to-login-link">
              {{ t('auth.back_to_login') }}
              <el-icon class="arrow-right">
                <ArrowRight />
              </el-icon>
            </router-link>
          </div>
        </div>

        <BtcForgetPasswordForm
          :form="form"
          :rules="rules"
          :loading="loading"
          :sending="sending"
          :sms-countdown="smsCountdown"
          :has-sent-sms="hasSentSms"
          @send-sms="handleSendSmsCode"
          @code-complete="handleCodeComplete"
          @submit="handleSubmit"
          ref="formRef"
        />

        <!-- 协议文本 -->
        <BtcAgreementText 
          ref="agreementRef"
          @agreement-change="handleAgreementChange" 
        />
      </div>
    </div>

    <BtcAuthFooter />
  </BtcAuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowRight } from '@element-plus/icons-vue';
import BtcAuthLayout from '../shared/components/auth-layout/index.vue';
import BtcAuthHeader from '../shared/components/auth-header/index.vue';
import BtcAuthFooter from '../shared/components/auth-footer/index.vue';
import BtcForgetPasswordForm from './forget-password-form/index.vue';
import BtcAgreementText from '../shared/components/agreement-text/index.vue';
import { BtcMessage } from '@btc/shared-components';
import { useForgetPassword } from './composables/useForgetPassword';
import '../shared/styles/index.scss';

defineOptions({
  name: 'ForgetPassword'
});

const { t } = useI18n();
const formRef = ref();
const agreementRef = ref();
// 协议同意状态
const isAgreed = ref(false);

const {
  form,
  rules,
  loading,
  sending,
  smsCountdown,
  hasSentSms,
  sendSmsCode,
  resetPassword
} = useForgetPassword();

// 发送验证码
const handleSendSmsCode = () => {
  sendSmsCode();
};

// 验证码输入完成
const handleCodeComplete = () => {
  // 可以在这里添加额外逻辑
};

// 协议状态变化处理
const handleAgreementChange = (agreed: boolean) => {
  isAgreed.value = agreed;
};

// 检查协议同意状态
const checkAgreement = (): boolean => {
  if (!isAgreed.value) {
    BtcMessage.warning(t('auth.message.agreement_required'));
    return false;
  }
  return true;
};

// 提交表单
const handleSubmit = async () => {
  try {
  if (!formRef.value) return;
    if (!checkAgreement()) {
      return;
    }
  await resetPassword(formRef.value.formRef);
  } catch (error) {
    console.error('重置密码错误:', error);
    // 错误已在 useForgetPassword 中处理，这里只是防止未捕获的错误
  }
};
</script>

<style lang="scss">
// 忘记密码页面样式已经在共享样式中定义
</style>

