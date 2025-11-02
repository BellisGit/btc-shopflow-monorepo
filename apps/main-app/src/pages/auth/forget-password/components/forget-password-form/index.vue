<template>
  <div class="forget-password-form">
    <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form">
      <!-- 手机号 -->
      <el-form-item prop="phone">
        <el-input
          v-model="form.phone"
          :placeholder="t('请输入手机号')"
          size="large"
          maxlength="11"
          @keyup.enter="handlePhoneEnter"
        >
          <template #suffix>
            <el-button
              :disabled="smsCountdown > 0 || !form.phone || sending"
              @click="handleSendSmsCode"
              class="sms-btn"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}s` : t('获取验证码') }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <!-- 验证码 -->
      <el-form-item prop="smsCode">
        <BtcSmsCodeInput
          v-model="form.smsCode"
          :disabled="!hasSentSms"
          @complete="handleCodeComplete"
        />
      </el-form-item>

      <!-- 新密码 -->
      <el-form-item prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          :placeholder="t('请输入新密码')"
          size="large"
          show-password
          maxlength="20"
        />
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          :placeholder="t('请确认新密码')"
          size="large"
          show-password
          maxlength="20"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
    </el-form>

    <!-- 提交按钮 -->
    <div class="op">
      <el-button type="primary" size="large" :loading="loading" @click="handleSubmit">
        {{ t('重置密码') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import BtcSmsCodeInput from '../../../shared/components/sms-code-input/index.vue';

defineOptions({
  name: 'BtcForgetPasswordForm'
});

interface Props {
  form: {
    phone: string;
    smsCode: string;
    newPassword: string;
    confirmPassword: string;
  };
  rules: any;
  loading?: boolean;
  sending?: boolean;
  smsCountdown?: number;
  hasSentSms?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'send-sms': [];
  'code-complete': [];
  'submit': [];
}>();

const { t } = useI18n();
const formRef = ref<FormInstance>();

// 手机号输入框回车事件
const handlePhoneEnter = () => {
  if (!props.hasSentSms) {
    emit('send-sms');
  }
};

// 发送验证码
const handleSendSmsCode = () => {
  emit('send-sms');
};

// 验证码输入完成
const handleCodeComplete = () => {
  emit('code-complete');
};

// 提交表单
const handleSubmit = () => {
  if (!formRef.value) return;
  emit('submit');
};

// 暴露表单引用供父组件使用
defineExpose({
  formRef,
  validate: () => formRef.value?.validate()
});
</script>

<style lang="scss" scoped>
.forget-password-form {
  display: flex;
  flex-direction: column;
  width: 100%;

  .form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .el-input {
      width: 100%;
    }
  }

  .op {
    width: 100%;
    margin-top: 4px;

    .el-button {
      width: 100%;
    }
  }
}
</style>

