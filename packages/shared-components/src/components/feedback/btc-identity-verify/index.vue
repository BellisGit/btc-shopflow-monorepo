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
              :class="{
                'is-active': currentVerifyType === 'phone',
                'is-disabled': !canUsePhoneVerify
              }"
              @click="canUsePhoneVerify ? switchVerifyType('phone') : null"
            >
              手机号验证
            </div>
            <div
              class="verify-tabs__item"
              :class="{
                'is-active': currentVerifyType === 'email',
                'is-disabled': !canUseEmailVerify
              }"
              @click="canUseEmailVerify ? switchVerifyType('email') : null"
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
                    <el-input
                      v-else
                      v-model="phoneForm.phone"
                      placeholder="请输入手机号（用于验证和绑定）"
                      size="large"
                      :disabled="verifying"
                    />
                  </div>
                </div>

                <div class="verify-form__item verify-form__item-code">
                  <label for="phone-sms-code-0" class="verify-form__item-label">验证码</label>
                  <div class="verify-form__item-code-wrapper">
                    <component
                      :is="smsCodeInputComponent"
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
                    <div v-if="!hasPhone && phoneForm.phone" class="verify-form__item-hint">
                      验证成功后，该手机号将自动绑定
                    </div>
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
                    <el-input
                      v-else
                      v-model="emailForm.email"
                      placeholder="请输入邮箱（用于验证和绑定）"
                      size="large"
                      :disabled="verifying"
                    />
                  </div>
                </div>

                <div class="verify-form__item verify-form__item-code">
                  <label for="email-sms-code-0" class="verify-form__item-label">验证码</label>
                  <div class="verify-form__item-code-wrapper">
                    <component
                      :is="smsCodeInputComponent"
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
                  <div v-if="hasPhone">
                    1. 接收验证码的手机号为您账号中绑定的安全手机号
                  </div>
                  <div v-else>
                    1. 请输入您的手机号，验证码将发送至该手机号
                  </div>
                  <div>2. 发送验证码后，您可以在手机短信中获取（1分钟内未收到，建议在垃圾短信中查看）</div>
                  <div v-if="!hasPhone" class="verify-form__item-tip-highlight">
                    3. 验证成功后，该手机号将自动绑定到您的账号
                  </div>
                </template>
                <template v-else>
                  <div v-if="hasEmail">
                    验证码已发送至您的邮箱，请查收。如未收到，请检查垃圾邮件或稍后重试。
                  </div>
                  <div v-else>
                    <div>1. 请输入您的邮箱地址，验证码将发送至该邮箱</div>
                  </div>
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
import { ref, computed, watch, h } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Loading } from '@element-plus/icons-vue';
import { useIdentityVerify, type VerifyType } from './composables/useIdentityVerify';
import { hidePhone } from '@btc/shared-utils';
import BtcDialog from '@btc-common/dialog/index.vue';
import type { Component } from 'vue';

defineOptions({
  name: 'BtcIdentityVerify'
});

// 定义 API 函数类型
export interface VerifyPhoneApi {
  (params: { type: 'phone' }): Promise<string | { data: string; phone?: string }>;
}

export interface VerifyEmailApi {
  (params: { type: 'email' }): Promise<string | { data: string; email?: string }>;
}

interface Props {
  modelValue: boolean;
  userInfo: {
    id?: number | string;
    phone?: string;
    email?: string;
  };
  /** 账号名称（用于显示） */
  accountName?: string;
  /** 发送短信验证码函数 */
  sendSmsCode: (phone: string, smsType?: string) => Promise<void>;
  /** 发送邮箱验证码函数 */
  sendEmailCode: (email: string, type?: string) => Promise<void>;
  /** 验证短信验证码函数 */
  verifySmsCode: (phone: string, smsCode: string, smsType?: string) => Promise<void>;
  /** 验证邮箱验证码函数 */
  verifyEmailCode: (email: string, emailCode: string, type?: string) => Promise<void>;
  /** 检查手机号绑定状态 */
  checkPhoneBinding: VerifyPhoneApi;
  /** 检查邮箱绑定状态 */
  checkEmailBinding: VerifyEmailApi;
  /** 验证码输入组件 */
  smsCodeInputComponent?: Component;
  /** 当前正在编辑的字段（'phone' | 'email' | null），用于限制可用验证方式 */
  editingField?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  accountName: '您',
  smsCodeInputComponent: () => h('div', '请提供 smsCodeInputComponent'),
  editingField: null
});

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

// 账号显示（使用传入的 accountName）
const accountName = computed(() => props.accountName || '您');

// 手机号和邮箱绑定状态（通过 verify 接口获取）
const phoneBound = ref<boolean>(false);
const emailBound = ref<boolean>(false);
const checkingStatus = ref<boolean>(false);

// 检查是否有手机号和邮箱（基于实际绑定状态）
const hasPhone = computed(() => phoneBound.value);
const hasEmail = computed(() => emailBound.value);
const hasPhoneOnly = computed(() => hasPhone.value && !hasEmail.value);
const hasEmailOnly = computed(() => hasEmail.value && !hasPhone.value);
const hasBoth = computed(() => hasPhone.value && hasEmail.value);
const hasNeither = computed(() => !hasPhone.value && !hasEmail.value);

// 根据 editingField 和绑定状态，决定可用哪些验证方式
// 身份验证（如密码编辑）只能使用已绑定的验证方式
// 如果正在编辑手机号，但只有邮箱绑定：只能使用邮箱验证
// 如果正在编辑邮箱，但只有手机号绑定：只能使用手机号验证
const canUsePhoneVerify = computed(() => {
  // 如果没有编辑字段（如密码编辑），只能使用已绑定的手机号验证
  if (!props.editingField) {
    return hasPhone.value;
  }
  // 如果正在编辑手机号，必须有至少一个已绑定的联系方式用于验证
  if (props.editingField === 'phone') {
    return hasPhone.value || hasEmail.value;
  }
  // 如果正在编辑邮箱，必须有手机号绑定才能使用手机号验证
  if (props.editingField === 'email') {
    return hasPhone.value;
  }
  // 其他情况（如 initPass），只能使用已绑定的手机号验证
  return hasPhone.value;
});

const canUseEmailVerify = computed(() => {
  // 如果没有编辑字段（如密码编辑），只能使用已绑定的邮箱验证
  if (!props.editingField) {
    return hasEmail.value;
  }
  // 如果正在编辑邮箱，必须有至少一个已绑定的联系方式用于验证
  if (props.editingField === 'email') {
    return hasPhone.value || hasEmail.value;
  }
  // 如果正在编辑手机号，必须有邮箱绑定才能使用邮箱验证
  if (props.editingField === 'phone') {
    return hasEmail.value;
  }
  // 其他情况（如 initPass），只能使用已绑定的邮箱验证
  return hasEmail.value;
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
  sendSmsCode: props.sendSmsCode,
  sendEmailCode: props.sendEmailCode,
  verifySmsCode: props.verifySmsCode,
  verifyEmailCode: props.verifyEmailCode,
  onSuccess: () => {
    // 验证流程，验证成功后触发success事件，由页面处理后续逻辑（如打开编辑表单）
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

// 检查手机号和邮箱绑定状态
const checkBindingStatus = async () => {
  if (checkingStatus.value) {
    return;
  }

  checkingStatus.value = true;
  try {
    // 检查手机号状态
    try {
      const phoneResponse = await props.checkPhoneBinding({ type: 'phone' });
      // 处理响应数据：可能是字符串、对象或嵌套对象
      let phoneData = '';
      if (typeof phoneResponse === 'string') {
        phoneData = phoneResponse;
      } else if (phoneResponse && typeof phoneResponse === 'object') {
        // 尝试多种可能的数据路径
        const responseObj = phoneResponse as any;
        phoneData = responseObj.data || responseObj.phone || responseObj.phoneNumber || responseObj.value || '';
        // 如果 data 是对象，继续提取
        if (typeof phoneData === 'object' && phoneData !== null) {
          const phoneDataObj = phoneData as any;
          phoneData = phoneDataObj.phone || phoneDataObj.value || phoneDataObj.data || '';
        }
      }

      // 判断是否已绑定：数据不为空且不是无效值
      const isValidPhone = !!(
        phoneData &&
        typeof phoneData === 'string' &&
        phoneData.trim() !== '' &&
        phoneData !== 'null' &&
        phoneData !== 'undefined' &&
        phoneData !== '-' &&
        phoneData.length > 0
      );

      phoneBound.value = isValidPhone;

      if (phoneBound.value && phoneData) {
        // 已绑定时，保存脱敏的手机号用于显示
        phoneForm.phone = phoneData.trim();
      } else {
        // 未绑定时，清空表单，允许用户输入
        phoneForm.phone = '';
      }
    } catch (error: any) {
      // 如果接口返回错误，说明未绑定
      console.warn('检查手机号绑定状态失败:', error);
      phoneBound.value = false;
      phoneForm.phone = '';
    }

    // 检查邮箱状态
    try {
      const emailResponse = await props.checkEmailBinding({ type: 'email' });
      // 处理响应数据：可能是字符串、对象或嵌套对象
      let emailData = '';
      if (typeof emailResponse === 'string') {
        emailData = emailResponse;
      } else if (emailResponse && typeof emailResponse === 'object') {
        // 尝试多种可能的数据路径
        const responseObj = emailResponse as any;
        emailData = responseObj.data || responseObj.email || responseObj.emailAddress || responseObj.value || '';
        // 如果 data 是对象，继续提取
        if (typeof emailData === 'object' && emailData !== null) {
          const emailDataObj = emailData as any;
          emailData = emailDataObj.email || emailDataObj.value || emailDataObj.data || '';
        }
      }

      // 判断是否已绑定：数据不为空且不是无效值
      const isValidEmail = !!(
        emailData &&
        typeof emailData === 'string' &&
        emailData.trim() !== '' &&
        emailData !== 'null' &&
        emailData !== 'undefined' &&
        emailData !== '-' &&
        emailData.length > 0
      );

      emailBound.value = isValidEmail;

      if (emailBound.value && emailData) {
        // 已绑定时，保存脱敏的邮箱用于显示
        emailForm.email = emailData.trim();
      } else {
        // 未绑定时，清空表单，允许用户输入
        emailForm.email = '';
      }
    } catch (error: any) {
      // 如果接口返回错误，说明未绑定
      console.warn('检查邮箱绑定状态失败:', error);
      emailBound.value = false;
      emailForm.email = '';
    }
  } catch (error: any) {
    console.error('检查绑定状态失败:', error);
  } finally {
    checkingStatus.value = false;
  }
};

// 获取安全手机号（已绑定情况下）
const fetchSecurePhone = async () => {
  if (loadingPhone.value || phoneForm.phone || !phoneBound.value) {
    return; // 已加载或正在加载，或未绑定
  }

  loadingPhone.value = true;
  try {
    // 使用 verify API 获取脱敏手机号
    const response = await props.checkPhoneBinding({ type: 'phone' });

    // 后端直接返回脱敏的手机号字符串
    const maskedPhone = typeof response === 'string' ? response : (response?.data || response?.phone);
    if (maskedPhone) {
      phoneForm.phone = maskedPhone;
    }
  } catch (error: any) {
    console.error('获取安全手机号失败:', error);
    ElMessage.error(error?.message || '获取安全手机号失败');
  } finally {
    loadingPhone.value = false;
  }
};

// 获取安全邮箱（已绑定情况下）
const fetchSecureEmail = async () => {
  if (loadingEmail.value || emailForm.email || !emailBound.value) {
    return; // 已加载或正在加载，或未绑定
  }

  loadingEmail.value = true;
  try {
    // 使用 verify API 获取脱敏邮箱
    const response = await props.checkEmailBinding({ type: 'email' });

    // 后端直接返回脱敏的邮箱字符串
    const maskedEmail = typeof response === 'string' ? response : (response?.data || response?.email);
    if (maskedEmail) {
      emailForm.email = maskedEmail;
    }
  } catch (error: any) {
    console.error('获取安全邮箱失败:', error);
    ElMessage.error(error?.message || '获取安全邮箱失败');
  } finally {
    loadingEmail.value = false;
  }
};

// 监听弹窗打开，检查绑定状态
watch(visible, async (isVisible) => {
  if (!isVisible) {
    reset();
    return;
  }

  // 打开弹窗时，先根据传入的 userInfo 设置初始绑定状态（快速显示）
  // 这样可以避免在检查完成前显示错误的"（可绑定）"提示
  if (props.userInfo) {
    const hasPhoneFromProps = !!(props.userInfo.phone && props.userInfo.phone !== '-' && props.userInfo.phone.trim() !== '');
    const hasEmailFromProps = !!(props.userInfo.email && props.userInfo.email !== '-' && props.userInfo.email.trim() !== '');

    // 如果 props 中有值，先设置绑定状态，避免显示错误的提示
    if (hasPhoneFromProps) {
      phoneBound.value = true;
    }
    if (hasEmailFromProps) {
      emailBound.value = true;
    }
  }

  // 然后检查手机号和邮箱的绑定状态（从后端获取最新状态）
  await checkBindingStatus();

  // 根据 editingField 和绑定状态自动选择验证方式
  if (props.editingField) {
    // 如果有编辑字段，根据可用验证方式自动选择
    if (props.editingField === 'phone') {
      // 编辑手机号：优先使用邮箱验证（如果可用），否则使用手机号验证（如果可用）
      if (canUseEmailVerify.value) {
        // 如果邮箱验证可用，优先使用（因为不能用自己的手机号验证自己）
        if (currentVerifyType.value !== 'email') {
          switchVerifyType('email');
        }
      } else if (canUsePhoneVerify.value) {
        // 如果只有手机号验证可用，使用它
        if (currentVerifyType.value !== 'phone') {
          switchVerifyType('phone');
        }
      }
    } else if (props.editingField === 'email') {
      // 编辑邮箱：优先使用手机号验证（如果可用），否则使用邮箱验证（如果可用）
      if (canUsePhoneVerify.value) {
        // 如果手机号验证可用，优先使用（因为不能用自己的邮箱验证自己）
        if (currentVerifyType.value !== 'phone') {
          switchVerifyType('phone');
        }
      } else if (canUseEmailVerify.value) {
        // 如果只有邮箱验证可用，使用它
        if (currentVerifyType.value !== 'email') {
          switchVerifyType('email');
        }
      }
    }
  } else {
    // 没有编辑字段（如密码编辑），只能使用已绑定的验证方式
    if (hasEmailOnly.value) {
      // 如果只有邮箱，自动切换到邮箱验证
      if (currentVerifyType.value !== 'email') {
        switchVerifyType('email');
      }
    } else if (hasPhoneOnly.value) {
      // 如果只有手机号，自动切换到手机号验证
      if (currentVerifyType.value !== 'phone') {
        switchVerifyType('phone');
      }
    } else if (hasBoth.value) {
      // 如果都有，根据当前选择获取对应的脱敏信息
      if (currentVerifyType.value === 'phone' && !phoneForm.phone) {
        fetchSecurePhone();
      } else if (currentVerifyType.value === 'email' && !emailForm.email) {
        fetchSecureEmail();
      }
    }
    // 如果都没有绑定（hasNeither），不自动切换，让用户看到所有验证方式都被禁用
  }
}, { immediate: true });

// 监听验证方式切换，加载对应的安全信息
watch(currentVerifyType, (verifyType) => {
  if (!visible.value) {
    return;
  }

  // 如果用户有对应的绑定，从后端获取脱敏信息
  if (verifyType === 'phone' && hasPhone.value && !phoneForm.phone) {
    fetchSecurePhone();
  } else if (verifyType === 'email' && hasEmail.value && !emailForm.email) {
    fetchSecureEmail();
  }
});

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
@use './styles.scss' as *;
</style>

