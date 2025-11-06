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
import { appStorage } from '@/utils/app-storage';
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
const accountName = computed(() => appStorage.user.getName() || '您');

// 验证码输入组件
const smsCodeInputComponent = BtcSmsCodeInput;

// 绑定流程：发送手机号验证码
// EPS 服务：POST /api/system/base/profile/bind/phone/send
// 参数：phone（必填），smsType（必填），值为 'bind'
const sendSmsCodeForBind = async (phone: string) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  await profileService.bindPhone({
    phone,
    smsType: 'bind'
  });
};

// 绑定流程：发送邮箱验证码
// EPS 服务：POST /api/system/base/profile/bind/email/send
// 邮箱接口需要传递 email（必填）和 scene（场景，必填），值为 'bind'
const sendEmailCodeForBind = async (email: string, scene?: string) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  await profileService.bindEmail({
    email,
    scene: scene || 'bind'
  });
};

// 验证流程：发送手机号验证码
// EPS 服务：POST /api/system/base/profile/verify/phone/send
// 方法名：sendPhone
// 参数：type（必填），值为 'auth'
const sendSmsCodeForVerify = async () => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  if (!profileService.sendPhone) {
    throw new Error('sendPhone 方法不可用，请检查 EPS 服务配置');
  }
  // POST 方法，需要传递 type 参数
  await profileService.sendPhone({ type: 'auth' });
};

// 验证流程：发送邮箱验证码
// EPS 服务：POST /api/system/base/profile/verify/email/send
// 方法名：sendEmail
// 参数：type（必填），值为 'auth'
const sendEmailCodeForVerify = async () => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  if (!profileService.sendEmail) {
    throw new Error('sendEmail 方法不可用，请检查 EPS 服务配置');
  }
  // POST 方法，需要传递 type 参数
  await profileService.sendEmail({ type: 'auth' });
};

// 统一的发送短信验证码函数（根据流程选择不同的 API）
const sendSmsCode = async (phone: string, smsType?: string) => {
  // 如果是绑定流程，使用绑定接口
  if (props.skipVerification && props.bindField === 'phone') {
    await sendSmsCodeForBind(phone);
  } else {
    // 验证流程，使用验证接口
    await sendSmsCodeForVerify();
  }
};

// 统一的发送邮箱验证码函数（根据流程选择不同的 API）
// 邮箱接口需要传递 email（必填）和 scene（场景，必填）
const sendEmailCode = async (email: string, scene?: string) => {
  // 如果是绑定流程，使用绑定接口，传递 scene: 'bind'
  if (props.skipVerification && props.bindField === 'email') {
    await sendEmailCodeForBind(email, scene || 'bind');
  } else {
    // 验证流程，使用验证接口（无参数，后端会使用当前用户邮箱）
    await sendEmailCodeForVerify();
  }
};

// 验证短信验证码
// 验证流程：POST /api/system/base/profile/verify/code（校验邮箱或者手机号验证码）
// 绑定流程：PUT /api/system/base/profile/phone/update（验证验证码并修改手机号）
const verifySmsCode = async (phone: string, smsCode: string, smsType?: string) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }

  // 对于验证流程，使用 verify/code 接口校验验证码
  // 对于绑定流程，验证码验证会在 saveBinding 时一起完成
  if (smsType === 'auth' || !smsType) {
    // 验证流程：使用 verify/code 接口校验验证码
    // EPS 服务：POST /api/system/base/profile/verify/code
    // 参数：type（必填，值为 'phone' 或 'email'），code（必填，验证码）
    // 注意：不需要传递 phone 或 email，后端会通过 cookie 获取当前用户信息
    if (!profileService.verifyCode) {
      throw new Error('verifyCode 方法不可用，请检查 EPS 服务配置');
    }
    const response = await profileService.verifyCode({
      type: 'phone',
      code: smsCode
    });
    // 检查响应中的 code，如果不是 200，抛出错误
    if (response && typeof response === 'object' && 'code' in response) {
      const responseObj = response as any;
      if (responseObj.code && responseObj.code !== 200) {
        throw new Error(responseObj.msg || '验证码校验失败');
      }
    }
  } else {
    // 绑定流程：验证码验证会在 saveBinding 时一起完成
    return Promise.resolve();
  }
};

// 验证邮箱验证码
// 验证流程：POST /api/system/base/profile/verify/code（校验邮箱或者手机号验证码）
// 绑定流程：PUT /api/system/base/profile/email/update（验证验证码并修改邮箱）
// 邮箱接口需要传递 email（必填）、code（验证码，必填）和 scene（场景，必填）
const verifyEmailCode = async (email: string, emailCode: string, scene?: string) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }

  // 对于验证流程，使用 verify/code 接口校验验证码
  // 对于绑定流程，验证码验证会在 saveBinding 时一起完成
  if (scene === 'auth' || !scene) {
    // 验证流程：使用 verify/code 接口校验验证码
    // EPS 服务：POST /api/system/base/profile/verify/code
    // 参数：type（必填，值为 'phone' 或 'email'），code（必填，验证码）
    // 注意：不需要传递 phone 或 email，后端会通过 cookie 获取当前用户信息
    if (!profileService.verifyCode) {
      throw new Error('verifyCode 方法不可用，请检查 EPS 服务配置');
    }
    const response = await profileService.verifyCode({
      type: 'email',
      code: emailCode
    });
    // 检查响应中的 code，如果不是 200，抛出错误
    if (response && typeof response === 'object' && 'code' in response) {
      const responseObj = response as any;
      if (responseObj.code && responseObj.code !== 200) {
        throw new Error(responseObj.msg || '验证码校验失败');
      }
    }
  } else {
    // 绑定流程：验证码验证会在 saveBinding 时一起完成
    return Promise.resolve();
  }
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
const saveBinding = async (params: {
  id?: number | string;
  phone?: string;
  email?: string;
  smsCode?: string;
  smsType?: string;
  emailCode?: string;
  scene?: string;
}) => {
  const profileService = service.system?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }

  // 手机号绑定：使用专门的 phone 接口，传递 phone, smsCode, smsType
  if (params.phone && params.smsCode) {
    await profileService.phone({
      phone: params.phone,
      smsCode: params.smsCode,
      smsType: params.smsType || 'bind'
    });
  }
  // 邮箱绑定：使用专门的 email 接口，传递 email, code, scene
  // 接口需要：email(必填), scene(场景，必填), code(验证码，必填)
  else if (params.email && params.emailCode) {
    await profileService.email({
      email: params.email,
      code: params.emailCode, // 接口需要 code 字段，不是 emailCode
      scene: params.scene || 'bind'
    });
  }
  // 其他情况：使用通用 update 接口
  else {
    await profileService.update(params);
  }
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

