/**
 * 身份验证 Composable
 * 封装验证码发送和校验逻辑
 */

import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useSmsCode } from '@btc/shared-core';

export type VerifyType = 'phone' | 'email';

export interface SendSmsCodeFn {
  (phone: string, smsType?: string): Promise<void>;
}

export interface SendEmailCodeFn {
  (email: string, type?: string): Promise<void>;
}

export interface VerifySmsCodeFn {
  (phone: string, smsCode: string, smsType?: string): Promise<void>;
}

export interface VerifyEmailCodeFn {
  (email: string, emailCode: string, type?: string): Promise<void>;
}

export interface IdentityVerifyOptions {
  /** 用户信息（包含手机号和邮箱） */
  userInfo: {
    phone?: string;
    email?: string;
  };
  /** 发送短信验证码函数 */
  sendSmsCode: SendSmsCodeFn;
  /** 发送邮箱验证码函数 */
  sendEmailCode: SendEmailCodeFn;
  /** 验证短信验证码函数 */
  verifySmsCode: VerifySmsCodeFn;
  /** 验证邮箱验证码函数 */
  verifyEmailCode: VerifyEmailCodeFn;
  /** 验证成功回调 */
  onSuccess?: () => void;
  /** 验证失败回调 */
  onError?: (error: Error) => void;
}

/**
 * 身份验证 Composable
 */
export function useIdentityVerify(options: IdentityVerifyOptions) {
  const { 
    userInfo, 
    sendSmsCode: sendSmsCodeApi,
    sendEmailCode: sendEmailCodeApi,
    verifySmsCode: verifySmsCodeApi,
    verifyEmailCode: verifyEmailCodeApi,
    onSuccess, 
    onError 
  } = options;

  // 当前验证方式
  const currentVerifyType = ref<VerifyType>('phone');

  // 手机号验证表单
  const phoneForm = reactive({
    phone: userInfo.phone || '',
    smsCode: ''
  });

  // 邮箱验证表单
  const emailForm = reactive({
    email: userInfo.email || '',
    emailCode: ''
  });

  // 验证状态
  const verifying = ref(false);
  const verifyError = ref('');

  // 手机号验证码 Composable
  const {
    countdown: smsCountdown,
    sending: smsSending,
    hasSent: smsHasSent,
    canSend: smsCanSend,
    send: sendSmsCode,
    reset: resetSmsCode
  } = useSmsCode({
    sendSmsCode: (data: { phone: string; smsType?: string }) => {
      return sendSmsCodeApi(data.phone, data.smsType);
    },
    countdown: 60,
    minInterval: 60,
    onSuccess: () => {
      ElMessage.success('验证码已发送');
    },
    onError: (error) => {
      ElMessage.error(error.message || '发送验证码失败');
    }
  });

  // 邮箱验证码状态
  const emailCountdown = ref(0);
  const emailSending = ref(false);
  const emailHasSent = ref(false);
  let emailCountdownTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * 发送邮箱验证码
   */
  const sendEmailCode = async () => {
    if (emailCountdown.value > 0 || emailSending.value) {
      return;
    }

    if (!emailForm.email) {
      ElMessage.warning('请输入邮箱地址');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.email)) {
      ElMessage.warning('请输入正确的邮箱地址');
      return;
    }

    emailSending.value = true;

    try {
      await sendEmailCodeApi(emailForm.email, 'verify');

      emailHasSent.value = true;
      ElMessage.success('验证码已发送');

      // 开始倒计时
      emailCountdown.value = 60;
      emailCountdownTimer = setInterval(() => {
        emailCountdown.value--;
        if (emailCountdown.value <= 0) {
          if (emailCountdownTimer) {
            clearInterval(emailCountdownTimer);
            emailCountdownTimer = null;
          }
        }
      }, 1000);
    } catch (error: any) {
      ElMessage.error(error.message || '发送验证码失败');
      throw error;
    } finally {
      emailSending.value = false;
    }
  };

  /**
   * 验证身份
   */
  const verify = async (): Promise<boolean> => {
    verifying.value = true;
    verifyError.value = '';

    try {
      if (currentVerifyType.value === 'phone') {
        // 验证手机号验证码
        if (!phoneForm.phone) {
          throw new Error('请输入手机号');
        }
        if (!phoneForm.smsCode || phoneForm.smsCode.length !== 6) {
          throw new Error('请输入6位验证码');
        }

        // 调用验证码校验接口
        try {
          await verifySmsCodeApi(phoneForm.phone, phoneForm.smsCode, 'verify');
        } catch (error: any) {
          throw new Error(error.message || '验证码校验失败');
        }
        
        onSuccess?.();
        return true;
      } else {
        // 验证邮箱验证码
        if (!emailForm.email) {
          throw new Error('请输入邮箱地址');
        }
        if (!emailForm.emailCode || emailForm.emailCode.length !== 6) {
          throw new Error('请输入6位验证码');
        }

        // 调用验证码校验接口
        try {
          await verifyEmailCodeApi(emailForm.email, emailForm.emailCode, 'verify');
        } catch (error: any) {
          throw new Error(error.message || '验证码校验失败');
        }
        
        onSuccess?.();
        return true;
      }
    } catch (error: any) {
      const err = error instanceof Error ? error : new Error(error.message || '验证失败');
      verifyError.value = err.message;
      ElMessage.error(err.message);
      onError?.(err);
      return false;
    } finally {
      verifying.value = false;
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    phoneForm.smsCode = '';
    emailForm.emailCode = '';
    verifyError.value = '';
    resetSmsCode();
    
    if (emailCountdownTimer) {
      clearInterval(emailCountdownTimer);
      emailCountdownTimer = null;
    }
    emailCountdown.value = 0;
    emailSending.value = false;
    emailHasSent.value = false;
  };

  /**
   * 切换验证方式
   */
  const switchVerifyType = (type: VerifyType) => {
    currentVerifyType.value = type;
    reset();
  };

  return {
    // 状态
    currentVerifyType,
    phoneForm,
    emailForm,
    verifying,
    verifyError,
    
    // 手机号验证码
    smsCountdown,
    smsSending,
    smsHasSent,
    smsCanSend,
    sendSmsCode,
    
    // 邮箱验证码
    emailCountdown,
    emailSending,
    emailHasSent,
    sendEmailCode,
    
    // 方法
    verify,
    reset,
    switchVerifyType
  };
}

