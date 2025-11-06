<template>
  <BtcDialog
    v-model="visible"
    :width="dialogWidth"
    padding="0"
    :hide-header="true"
    :scrollbar="false"
    class="identity-verify-dialog"
  >
    <div class="identity-verify">
      <!-- 关闭按钮（绝对定位在整个 dialog body 的右上角） -->
      <el-icon class="identity-verify__close-icon" @click="handleClose">
        <Close />
      </el-icon>

      <!-- 顶部Header区域（左右分栏） -->
      <div class="identity-verify__header">
        <!-- Header左侧：标题 -->
        <div class="identity-verify__header-left">
          <div class="identity-verify__header-title">验证身份</div>
        </div>
        <!-- Header右侧：提示语 -->
        <div class="identity-verify__header-right">
          <div class="identity-verify__header-desc">
            为确保账号
            <span class="identity-verify__header-account">{{ accountName }}</span>
            是您本人操作，请任意选择一种方式验证身份
          </div>
        </div>
      </div>

      <!-- 内容Content区域（左右分栏） -->
      <div class="identity-verify__content">
        <!-- Content左侧：垂直 tabs -->
        <div class="identity-verify__content-left">
          <div class="verify-tabs">
            <div
              class="verify-tabs__item"
              :class="{ 'is-active': currentVerifyType === 'phone' }"
              @click="switchVerifyType('phone')"
            >
              手机号验证
            </div>
            <div
              class="verify-tabs__item"
              :class="{ 'is-active': currentVerifyType === 'email' }"
              @click="switchVerifyType('email')"
            >
              邮箱验证
            </div>
          </div>
        </div>

        <!-- 右侧验证表单 -->
        <div class="identity-verify__content-right">
          <div class="verify-form">
            <!-- 表单内容区域（使用百分比高度） -->
            <div class="verify-form__content">
              <!-- 手机号验证表单 -->
              <template v-if="currentVerifyType === 'phone'">
                <div class="verify-form__item">
                  <span class="verify-form__item-label">手机号</span>
                  <div class="verify-form__item-text">
                    <span v-if="loadingPhone" class="verify-form__item-loading">
                      <el-icon class="is-loading">
                        <Loading />
                      </el-icon>
                      加载中...
                    </span>
                    <span v-else-if="phoneForm.phone" class="verify-form__item-value">
                      {{ maskedPhone }}
                    </span>
                    <span v-else class="verify-form__item-placeholder">-</span>
                  </div>
                </div>

                <div class="verify-form__item verify-form__item-code">
                  <label for="phone-sms-code-0" class="verify-form__item-label">验证码</label>
                  <div class="verify-form__item-code-wrapper">
                    <BtcSmsCodeInput
                      id-prefix="phone-sms-code"
                      v-model="phoneForm.smsCode"
                      size="small"
                      :disabled="!smsHasSent || verifying"
                      @complete="handleSmsCodeComplete"
                    />
                    <el-button
                      class="send-code-btn"
                      type="primary"
                      plain
                      size="large"
                      :disabled="!smsCanSend || !phoneForm.phone || verifying"
                      :loading="smsSending"
                      @click="handleSendSmsCode"
                    >
                      {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
                    </el-button>
                  </div>
                </div>

                <div class="verify-form__item">
                  <el-button
                    class="verify-form__item-button"
                    type="primary"
                    size="large"
                    :loading="verifying"
                    :disabled="!phoneForm.smsCode || phoneForm.smsCode.length !== 6"
                    @click="handleVerify"
                  >
                    立即验证
                  </el-button>
                </div>

                <div v-if="verifyError" class="verify-form__item-error">
                  {{ verifyError }}
                </div>
              </template>

              <!-- 邮箱验证表单 -->
              <template v-else>
                <div class="verify-form__item">
                  <span class="verify-form__item-label">邮箱</span>
                  <div class="verify-form__item-text">
                    <span v-if="loadingEmail" class="verify-form__item-loading">
                      <el-icon class="is-loading">
                        <Loading />
                      </el-icon>
                      加载中...
                    </span>
                    <span v-else-if="emailForm.email" class="verify-form__item-value">
                      {{ maskedEmail }}
                    </span>
                    <span v-else class="verify-form__item-placeholder">-</span>
                  </div>
                </div>

                <div class="verify-form__item verify-form__item-code">
                  <label for="email-sms-code-0" class="verify-form__item-label">验证码</label>
                  <div class="verify-form__item-code-wrapper">
                    <BtcSmsCodeInput
                      id-prefix="email-sms-code"
                      v-model="emailForm.emailCode"
                      size="small"
                      :disabled="!emailHasSent || verifying"
                      @complete="handleEmailCodeComplete"
                    />
                    <el-button
                      class="send-code-btn"
                      type="primary"
                      plain
                      size="large"
                      :disabled="emailCountdown > 0 || emailSending || !emailForm.email || verifying"
                      :loading="emailSending"
                      @click="handleSendEmailCode"
                    >
                      {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
                    </el-button>
                  </div>
                </div>

                <div class="verify-form__item">
                  <el-button
                    class="verify-form__item-button"
                    type="primary"
                    size="large"
                    :loading="verifying"
                    :disabled="!emailForm.emailCode || emailForm.emailCode.length !== 6"
                    @click="handleVerify"
                  >
                    立即验证
                  </el-button>
                </div>

                <div v-if="verifyError" class="verify-form__item-error">
                  {{ verifyError }}
                </div>
              </template>
            </div>

            <!-- 分隔线和提示区域（固定高度占比） -->
            <div class="verify-form__footer">
              <div class="verify-form__divider"></div>

              <div class="verify-form__item-tip">
                <template v-if="currentVerifyType === 'phone'">
                  <div>1. 接收验证码的手机号为您账号中绑定的安全手机号</div>
                  <div>2. 发送验证码后，您可以在手机短信中获取（1分钟内未收到，建议在垃圾短信中查看）</div>
                </template>
                <template v-else>
                  <div>验证码已发送至您的邮箱，请查收。如未收到，请检查垃圾邮件或稍后重试。</div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BtcDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Loading } from '@element-plus/icons-vue';
import { useIdentityVerify, type VerifyType } from '../composables/useIdentityVerify';
import { service } from '@services/eps';
import { userStorage } from '@/utils/storage-manager';
import { hidePhone } from '@btc/shared-utils';
import BtcSmsCodeInput from '@/pages/auth/shared/components/sms-code-input/index.vue';

defineOptions({
  name: 'BtcIdentityVerify'
});

interface Props {
  modelValue: boolean;
  userInfo: {
    phone?: string;
    email?: string;
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [];
  'cancel': [];
}>();

// 显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 账号显示（使用用户名）
const accountName = computed(() => {
  return userStorage.getName() || '您';
});

// 脱敏手机号显示
const maskedPhone = computed(() => {
  if (!phoneForm.phone) {
    return '';
  }
  return hidePhone(phoneForm.phone);
});

// 脱敏邮箱显示
const maskedEmail = computed(() => {
  if (!emailForm.email) {
    return '';
  }
  // 邮箱脱敏：显示前3位和@后的域名，中间用***代替
  const email = emailForm.email;
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) {
    return email;
  }
  const prefix = email.substring(0, Math.min(3, atIndex));
  const suffix = email.substring(atIndex);
  return `${prefix}***${suffix}`;
});

// 响应式宽度 - 统一使用40%左右，让内容能够适应
const dialogWidth = computed(() => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth <= 480) {
      return 'calc(100% - 24px)';
    } else if (window.innerWidth <= 768) {
      return 'calc(100% - 32px)';
    }
  }
  // 统一使用40%左右，确保内容不会挤在左侧
  return '40%';
});

// 加载状态
const loadingPhone = ref(false);
const loadingEmail = ref(false);

// 使用身份验证 Composable
const {
  currentVerifyType,
  phoneForm,
  emailForm,
  verifying,
  verifyError,
  smsCountdown,
  smsSending,
  smsHasSent,
  smsCanSend,
  sendSmsCode,
  emailCountdown,
  emailSending,
  emailHasSent,
  sendEmailCode,
  verify,
  reset,
  switchVerifyType: switchType
} = useIdentityVerify({
  userInfo: props.userInfo,
  onSuccess: () => {
    // 验证成功后只触发success事件，不关闭弹窗
    // 由页面处理后续逻辑（如打开编辑表单）
    emit('success');
  },
  onError: (error) => {
    console.error('验证失败:', error);
  }
});

// 切换验证方式
const switchVerifyType = (type: VerifyType) => {
  switchType(type);
};

// 发送手机验证码
const handleSendSmsCode = async () => {
  try {
    await sendSmsCode(phoneForm.phone, 'verify');
  } catch (error) {
    // 错误已通过 composable 处理
  }
};

// 发送邮箱验证码
const handleSendEmailCode = async () => {
  try {
    await sendEmailCode();
  } catch (error) {
    // 错误已通过 composable 处理
  }
};

// 验证码输入完成
const handleSmsCodeComplete = () => {
  // 可以自动触发验证
};

const handleEmailCodeComplete = () => {
  // 可以自动触发验证
};

// 执行验证
const handleVerify = async () => {
  await verify();
};

// 关闭弹窗
const handleClose = () => {
  if (verifying.value) {
    return; // 验证进行中不允许关闭
  }
  reset();
  emit('cancel');
  visible.value = false;
};

// 获取安全手机号
const fetchSecurePhone = async () => {
  if (loadingPhone.value || phoneForm.phone) {
    return; // 已加载或正在加载
  }

  loadingPhone.value = true;
  try {
    const profileService = service.system?.base?.profile;
    if (!profileService) {
      ElMessage.warning('用户信息服务不可用');
      return;
    }

    // 使用 verify API 获取脱敏手机号
    const data = await profileService.verify({
      type: 'phone'
    });

    if (data?.phone) {
      phoneForm.phone = data.phone;
    }
  } catch (error: any) {
    console.error('获取安全手机号失败:', error);
    ElMessage.error(error?.message || '获取安全手机号失败');
  } finally {
    loadingPhone.value = false;
  }
};

// 获取安全邮箱
const fetchSecureEmail = async () => {
  if (loadingEmail.value || emailForm.email) {
    return; // 已加载或正在加载
  }

  loadingEmail.value = true;
  try {
    const profileService = service.system?.base?.profile;
    if (!profileService) {
      ElMessage.warning('用户信息服务不可用');
      return;
    }

    // 使用 verify API 获取脱敏邮箱
    const data = await profileService.verify({
      type: 'email'
    });

    if (data?.email) {
      emailForm.email = data.email;
    }
  } catch (error: any) {
    console.error('获取安全邮箱失败:', error);
    ElMessage.error(error?.message || '获取安全邮箱失败');
  } finally {
    loadingEmail.value = false;
  }
};

// 监听弹窗打开和验证方式切换，加载对应的安全信息
watch([visible, currentVerifyType], ([isVisible, verifyType]) => {
  if (isVisible) {
    if (verifyType === 'phone') {
      fetchSecurePhone();
    } else {
      fetchSecureEmail();
    }
  } else {
    reset();
  }
}, { immediate: true });

// 监听弹窗关闭，重置状态
watch(visible, (val) => {
  if (!val) {
    reset();
  }
});
</script>

<style lang="scss">
// 设置 el-dialog__body 为定位上下文，使关闭按钮可以相对于它定位
.identity-verify-dialog {
  :deep(.el-dialog__body) {
    position: relative;
  }
}
</style>

<style lang="scss" scoped>
@use '../styles/identity-verify.scss' as *;
</style>

