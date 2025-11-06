<template>
  <!-- 绑定流程：使用独立的绑定组件 -->
  <BtcBindingDialog
    v-if="skipVerification && bindField && (bindField === 'phone' || bindField === 'email')"
    v-model="visible"
    :user-info="userInfo"
    :account-name="accountName"
    :send-sms-code="sendSmsCode"
    :send-email-code="sendEmailCode"
    :verify-sms-code="verifySmsCode"
    :verify-email-code="verifyEmailCode"
    :save-binding="saveBinding"
    :sms-code-input-component="smsCodeInputComponent"
    :bind-field="bindField as 'phone' | 'email'"
    @success="handleSuccess"
    @cancel="handleCancel"
  />
  <!-- 验证流程：使用身份验证组件 -->
  <BtcIdentityVerify
    v-else
    v-model="visible"
    :user-info="userInfo"
    :account-name="accountName"
    :send-sms-code="sendSmsCode"
    :send-email-code="sendEmailCode"
    :verify-sms-code="verifySmsCode"
    :verify-email-code="verifyEmailCode"
    :check-phone-binding="checkPhoneBinding"
    :check-email-binding="checkEmailBinding"
    :sms-code-input-component="smsCodeInputComponent"
    :editing-field="editingField"
    @success="handleSuccess"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BtcIdentityVerify, BtcBindingDialog } from '@btc/shared-components';
import { service } from '@services/eps';
import { userStorage } from '@/utils/storage-manager';
import { authApi } from '@/modules/api-services';
import BtcSmsCodeInput from '@/pages/auth/shared/components/sms-code-input/index.vue';

interface Props {
  modelValue: boolean;
  userInfo: {
    id?: number | string;
    phone?: string;
    email?: string;
  };
  skipVerification?: boolean;
  bindField?: string | null;
  editingField?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [isBinding: boolean];
  'cancel': [];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 账号名称
const accountName = computed(() => userStorage.getName() || '您');

// 验证码输入组件
const smsCodeInputComponent = BtcSmsCodeInput;

// 发送短信验证码
// EPS 服务：GET /api/system/base/profile/phone/send（无参数）
const sendSmsCode = async (phone: string, smsType?: string) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  await profileService.sendPhone();
};

// 发送邮箱验证码
// EPS 服务：GET /api/system/base/profile/email/send（无参数）
const sendEmailCode = async (email: string, type?: string) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  await profileService.sendEmail();
};

// 验证短信验证码
const verifySmsCode = async (phone: string, smsCode: string, smsType?: string) => {
  await authApi.verifySmsCode({
    phone,
    smsCode,
    smsType: smsType || 'verify'
  });
};

// 验证邮箱验证码
const verifyEmailCode = async (email: string, emailCode: string, type?: string) => {
  await authApi.verifyEmailCode({
    email,
    emailCode,
    type: type || 'verify'
  });
};

// 检查手机号绑定状态
const checkPhoneBinding = async ({ type }: { type: 'phone' }) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  return await profileService.verify({ type });
};

// 检查邮箱绑定状态
const checkEmailBinding = async ({ type }: { type: 'email' }) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  return await profileService.verify({ type });
};

// 保存绑定信息
const saveBinding = async (params: { id?: number | string; phone?: string; email?: string }) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  await profileService.update(params);
};

const handleSuccess = () => {
  // 如果是绑定流程，传递 isBinding=true
  if (props.skipVerification) {
    emit('success', true);
  } else {
    // 验证流程，传递 isBinding=false
    emit('success', false);
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>

