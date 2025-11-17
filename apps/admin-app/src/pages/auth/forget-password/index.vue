<template>
  <BtcAuthLayout>
    <div class="login-card">
      <BtcAuthHeader />

      <div class="card-content">
        <!-- 返回登录链接 - 与登录页面的"前往注册"链接位置一致 -->
        <div class="back-to-login-wrapper">
          <div class="back-to-login">
            <router-link to="/login" class="back-to-login-link">
              {{ t('返回登录') }}
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
import BtcForgetPasswordForm from './components/forget-password-form/index.vue';
import { useForgetPassword } from './composables/useForgetPassword';
import '../shared/styles/index.scss';

defineOptions({
  name: 'ForgetPassword'
});

const { t } = useI18n();
const formRef = ref();

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

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await resetPassword(formRef.value.formRef);
};
</script>

<style lang="scss">
// 忘记密码页面样式已经在共享样式中定义
</style>

