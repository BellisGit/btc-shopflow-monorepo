<template>
  <div class="sms-login">
    <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form">
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
              :disabled="!canSend || !form.phone"
              :loading="sending"
              @click="handleSendSmsCode"
              class="sms-btn"
            >
              {{ countdown > 0 ? `${countdown}s` : t('获取验证码') }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="smsCode">
        <BtcSmsCodeInput
          v-model="form.smsCode"
          :disabled="!hasSent"
          @complete="handleCodeComplete"
        />
      </el-form-item>
    </el-form>

    <!-- 登录按钮 -->
    <div class="op">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="!form.smsCode || form.smsCode.length !== 6"
        @click="handleSubmit"
      >
        {{ t('立即登录') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useSmsCode } from '@btc/shared-core';
import { codeApi } from '@/modules/api-services';
import BtcSmsCodeInput from '../../../shared/components/sms-code-input/index.vue';

defineOptions({
  name: 'BtcSmsForm'
});

interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  submit: [form: { phone: string; smsCode: string }];
  'send-sms': [];
  'code-complete': [];
}>();

const { t } = useI18n();

// 表单数据
const form = reactive({
  phone: '',
  smsCode: ''
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
  ]
});

const formRef = ref<FormInstance>();

// 使用验证码 Composable
const {
  countdown,
  sending,
  hasSent,
  canSend,
  send: sendCode
} = useSmsCode({
  sendSmsCode: codeApi.sendSmsCode,
  countdown: 60,
  minInterval: 60,
  onSuccess: () => {
    ElMessage.success(t('验证码已发送'));
    emit('send-sms');
  },
  onError: (error) => {
    ElMessage.error(error.message || t('发送验证码失败'));
  }
});

// 发送验证码
const handleSendSmsCode = async () => {
  if (!formRef.value) return;

  try {
    // 验证手机号
    await formRef.value.validateField('phone');
    
    // 使用验证码 Composable 发送
    await sendCode(form.phone, 'login');
  } catch {
    // 验证失败或发送失败，错误已通过 onError 回调处理
  }
};

// 手机号输入框回车事件
const handlePhoneEnter = () => {
  if (!hasSent.value) {
    handleSendSmsCode();
  }
};

// 验证码输入完成
const handleCodeComplete = () => {
  emit('code-complete');
};

// 提交函数
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    emit('submit', { ...form });
  } catch {
    // 验证失败
  }
};

// 暴露表单数据和方法供父组件使用
defineExpose({
  form,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  countdown,
  hasSent,
  handleSendSmsCode
});
</script>

<style lang="scss" scoped>
.sms-login {
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

    :deep(.sms-btn) {
      font-size: 14px;
      padding: 8px 12px;
      height: auto;
      min-width: 80px;
      border: none;
      background: none;
      color: var(--el-text-color-regular);
      transition: all 0.3s ease;

      &:hover:not(.is-disabled) {
        color: var(--el-color-primary);
        background-color: rgba(64, 158, 255, 0.1);
      }

      &:active:not(.is-disabled) {
        transform: translateY(1px);
        background-color: rgba(64, 158, 255, 0.2);
      }

      &.is-disabled {
        color: var(--el-text-color-disabled) !important;
        background: none !important;
        border: none !important;
        cursor: not-allowed !important;
      }
    }
  }

  .op {
    width: 100%;
    margin-top: 8px;

    .el-button {
      width: 100%;
    }
  }
}
</style>
