<template>
  <div class="register-form">
    <!-- 用户名输入 -->
    <div class="register-form__field-wrapper">
      <van-field
        v-model="formData.username"
        name="username"
        placeholder="请输入用户名"
        maxlength="20"
        :rules="usernameRules"
        left-icon="user-o"
        class="register-form__field"
      />
    </div>

    <!-- 手机号输入 -->
    <div class="register-form__field-wrapper">
      <van-field
        v-model="formData.phone"
        name="phone"
        placeholder="请输入手机号"
        type="tel"
        maxlength="11"
        :rules="phoneRules"
        left-icon="phone-o"
        @blur="handlePhoneBlur"
        class="register-form__field"
      />
    </div>

    <!-- 验证码输入 -->
    <div class="register-form__field-wrapper">
      <van-field
        v-model="formData.smsCode"
        name="smsCode"
        placeholder="请输入验证码"
        type="number"
        maxlength="6"
        :rules="smsCodeRules"
        :disabled="!hasSentSms"
        left-icon="shield-o"
        class="register-form__field"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :disabled="!canSendSmsComputed || countdown > 0"
            :loading="sendingSms"
            @click="handleSendSmsCode"
            class="register-form__sms-button"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </van-button>
        </template>
      </van-field>
    </div>

    <!-- 注册按钮 -->
    <van-button
      type="primary"
      :loading="loading"
      :disabled="!canSubmit"
      @click="handleSubmit"
      class="register-form__submit-btn"
    >
      立即注册
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { Field, Button, showToast } from 'vant';
import { useSmsCode } from '../../composables/useSmsCode';
import { useRegister } from '../../composables/useRegister';

defineOptions({
  name: 'RegisterForm',
});

interface Props {
  modelValue?: {
    username: string;
    phone: string;
    smsCode: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    username: '',
    phone: '',
    smsCode: '',
  }),
});

const emit = defineEmits<{
  'update:modelValue': [value: { username: string; phone: string; smsCode: string }];
  submit: [data: { username: string; phone: string; smsCode: string }];
}>();

// 表单数据
const formData = reactive({
  username: props.modelValue.username,
  phone: props.modelValue.phone,
  smsCode: props.modelValue.smsCode,
});

// 验证码逻辑
const { countdown, sendingSms, hasSentSms, createCanSendSms, sendSmsCode, validatePhone } = useSmsCode('register');
const canSendSmsComputed = createCanSendSms(() => formData.phone);

// 注册逻辑
const { loading, register } = useRegister();

// 验证规则
const usernameRules = [
  { required: true, message: '请输入用户名' },
  { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/, message: '用户名长度为2-20个字符，支持中文、英文、数字和下划线' },
];

const phoneRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
];

const smsCodeRules = [
  { required: true, message: '请输入验证码' },
  { pattern: /^\d{6}$/, message: '验证码为6位数字' },
];

// 是否可以提交
const canSubmit = computed(() => {
  return (
    /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/.test(formData.username) &&
    /^1[3-9]\d{9}$/.test(formData.phone) &&
    /^\d{6}$/.test(formData.smsCode)
  );
});

// 手机号失焦验证
const handlePhoneBlur = () => {
  validatePhone(formData.phone);
};

// 发送验证码
const handleSendSmsCode = async () => {
  await sendSmsCode(formData.phone);
};

// 提交注册
const handleSubmit = async () => {
  if (!canSubmit.value) {
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/.test(formData.username)) {
      showToast({
        type: 'fail',
        message: '请输入正确的用户名',
        duration: 2000,
      });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      showToast({
        type: 'fail',
        message: '请输入正确的手机号',
        duration: 2000,
      });
      return;
    }
    if (!/^\d{6}$/.test(formData.smsCode)) {
      showToast({
        type: 'fail',
        message: '请输入6位数字验证码',
        duration: 2000,
      });
      return;
    }
    return;
  }

  emit('submit', { ...formData });
  await register({ ...formData });
};
</script>

<style lang="scss" scoped>
@use '../../styles/register-form' as *;
</style>

