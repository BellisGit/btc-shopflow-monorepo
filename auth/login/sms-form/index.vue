<template>
  <div class="sms-login">
    <btc-form :label-width="0" class="form" :disabled="saving">
      <el-form-item prop="phone">
        <el-input
          v-model="form.phone"
          :placeholder="props.t('请输入手机号')"
          maxlength="11"
          @keyup.enter="handlePhoneEnter"
        >
          <template #suffix>
            <el-button
              :disabled="smsCountdown > 0 || !form.phone"
              @click="sendSmsCode"
              class="sms-btn"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}s` : props.t('获取验证码') }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="smsCode">
        <sms-code-input
          v-model="form.smsCode"
          :disabled="!hasSentSms"
          @complete="onCodeComplete"
        />
      </el-form-item>
    </btc-form>

    <el-button
      type="primary"
      size="large"
      :loading="saving"
      :disabled="!form.smsCode || form.smsCode.length !== 6"
      @click="onLogin"
      class="login-button"
    >
      {{ props.t('立即登录') }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';

defineOptions({
  name: 'SmsLoginView'
});

interface Props {
  form: {
    phone: string;
    smsCode: string;
  };
  saving: boolean;
  smsCountdown: number;
  hasSentSms: boolean;
  sendSmsCode: () => void;
  handlePhoneEnter: () => void;
  onCodeComplete: () => void;
  onLogin: () => void;
  t: (key: string) => string;
}

const props = defineProps<Props>();

// 导入短信验证码输入组件
const SmsCodeInput = defineAsyncComponent(() => import('../../shared/components/inputs/index.vue'));
</script>

<style lang="scss" scoped>
.sms-login {
  .form {
    .el-form-item {
      margin-bottom: 16px;
    }

    .el-input {
      width: 100%;
    }

    .sms-btn {
      margin-left: 8px;
    }
  }

  .login-button {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
