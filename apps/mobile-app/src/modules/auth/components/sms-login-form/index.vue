<template>
  <div class="sms-login-form">
        <!-- 手机号输入 -->
        <div class="form-field-wrapper">
          <van-field
            v-model="form.phone"
            name="phone"
            placeholder="请输入手机号"
            type="tel"
            maxlength="11"
            :rules="phoneRules"
            left-icon="phone-o"
            @focus="handleInputFocus"
            @blur="handlePhoneBlur"
            class="form-field"
          />
        </div>

        <!-- 验证码输入 -->
        <div class="form-field-wrapper">
          <van-field
            v-model="form.smsCode"
            name="smsCode"
            placeholder="请输入验证码"
            type="number"
            maxlength="6"
            :rules="smsCodeRules"
            :disabled="!hasSentSms"
            left-icon="shield-o"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            class="form-field"
          >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :disabled="!canSendSms || countdown > 0"
            :loading="sendingSms"
            @click="handleSendSmsCode"
            class="sms-button"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </van-button>
        </template>
      </van-field>
    </div>

    <!-- 登录按钮 -->
    <van-button
      type="primary"
      block
      round
      :loading="loading"
      @click="handleSubmit"
      class="sms-login-form__submit-btn"
    >
      立即登录
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { Field, Button, showToast } from 'vant';
import { usePhoneLogin } from '../../composables/usePhoneLogin';
import { useSmsCode } from '../../register/composables/useSmsCode';

interface Props {
  agreed?: boolean;
}

interface Emits {
  (e: 'focus'): void;
  (e: 'blur'): void;
}

const props = withDefaults(defineProps<Props>(), {
  agreed: false,
});

const emit = defineEmits<Emits>();

const { loading, login } = usePhoneLogin();

const form = reactive({
  phone: '',
  smsCode: '',
});

const { countdown, sendingSms, hasSentSms, createCanSendSms, sendSmsCode, validatePhone } = useSmsCode('login');
const canSendSms = createCanSendSms(() => form.phone);

const phoneRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
];

const smsCodeRules = [
  { required: true, message: '请输入验证码' },
  { pattern: /^\d{6}$/, message: '验证码为6位数字' },
];

const canSubmit = computed(() => /^1[3-9]\d{9}$/.test(form.phone) && /^\d{6}$/.test(form.smsCode));

const handleInputFocus = () => {
  emit('focus');
};

const handleInputBlur = () => {
  emit('blur');
};

const handlePhoneBlur = () => {
  validatePhone(form.phone);
  handleInputBlur();
};

const handleSendSmsCode = async () => {
  await sendSmsCode(form.phone);
};

const handleSubmit = async () => {
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast({ type: 'fail', message: '请输入正确的手机号', duration: 2000 });
    return;
  }

  if (!form.smsCode || !/^\d{6}$/.test(form.smsCode)) {
    showToast({ type: 'fail', message: '请输入6位数字验证码', duration: 2000 });
    return;
  }

  if (!props.agreed) {
    showToast({
      type: 'fail',
      message: '请阅读并同意服务协议和拜里斯隐私保护指引',
      duration: 2000,
    });
    return;
  }

  if (!canSubmit.value) {
    showToast({
      type: 'fail',
      message: '请填写正确的手机号与验证码',
      duration: 2000,
    });
    return;
  }

  try {
    await login(form.phone, form.smsCode);
  } catch {
    // 错误已在 login 中处理
  }
};
</script>

<style lang="scss" scoped>
.sms-login-form {
  --van-cell-background: rgba(60, 60, 60, 0.8);
  --van-cell-text-color: #fff;
  --van-field-label-color: #fff;
  --van-field-input-text-color: #fff;
  --van-field-placeholder-text-color: rgba(255, 255, 255, 0.5);
  --van-field-input-disabled-text-color: rgba(255, 255, 255, 0.7);
  --van-field-disabled-text-color: rgba(255, 255, 255, 0.7);
  --van-cell-border-radius: 24px;

  :deep(.form-field-wrapper) {
    margin-bottom: 16px;

    .van-cell {
      background: rgba(60, 60, 60, 0.8) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 24px !important;
      padding: 14px 20px !important;
      color: #fff !important;
      overflow: hidden !important;
    }

    .van-field--disabled.van-cell {
      background: rgba(60, 60, 60, 0.6) !important;
      border-color: rgba(255, 255, 255, 0.05) !important;
    }

    .van-field__label {
      color: #fff !important;
    }

    .van-field__control {
      color: #fff !important;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
      }

      &:disabled {
        color: rgba(255, 255, 255, 0.7) !important;
        -webkit-text-fill-color: rgba(255, 255, 255, 0.7) !important;
      }
    }

    // 优化左侧图标样式，确保清晰可见
    .van-field__left-icon {
      color: rgba(255, 255, 255, 0.8) !important;
      font-size: 20px !important;
      margin-right: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
      
      // 使用 SVG 图标时确保清晰度
      svg {
        width: 20px !important;
        height: 20px !important;
        fill: currentColor !important;
      }
    }
  }
}

.sms-login-form__submit-btn {
  margin-top: 16px;
}
</style>

