import { ref, computed, onBeforeUnmount, type Ref } from 'vue';
import { showToast } from 'vant';
import { authApi } from '@/services/auth';

/**
 * 验证码相关逻辑
 */
export function useSmsCode(smsType: 'login' | 'register' | 'reset' = 'login') {
  const countdown = ref(0);
  const sendingSms = ref(false);
  const hasSentSms = ref(false);
  let countdownTimer: NodeJS.Timeout | null = null;

  /**
   * 验证手机号格式
   */
  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast({
        type: 'fail',
        message: '请输入正确的手机号',
        duration: 2000,
      });
      return false;
    }
    return true;
  };

  /**
   * 创建验证是否可以发送验证码的计算属性
   */
  const createCanSendSms = (phone: Ref<string> | (() => string)) => {
    return computed(() => {
      const phoneValue = typeof phone === 'function' ? phone() : phone.value;
      return /^1[3-9]\d{9}$/.test(phoneValue) && countdown.value === 0;
    });
  };

  /**
   * 发送验证码
   */
  const sendSmsCode = async (phone: string) => {
    if (!validatePhone(phone)) {
      return false;
    }

    if (sendingSms.value || countdown.value > 0) {
      return false;
    }

    sendingSms.value = true;

    try {
      await authApi.sendSmsCode({
        phone,
        smsType,
      });

      showToast({
        type: 'success',
        message: '验证码已发送',
        duration: 2000,
      });

      hasSentSms.value = true;
      startCountdown();
      return true;
    } catch (error: any) {
      // 友好的错误提示
      let friendlyMessage = '验证码发送失败，请稍后重试';
      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('network') || msg.includes('timeout')) {
          friendlyMessage = '网络连接失败，请检查网络后重试';
        } else if (msg.includes('frequently') || msg.includes('频繁')) {
          friendlyMessage = '发送过于频繁，请稍后再试';
        } else if (msg.includes('phone') || msg.includes('手机号')) {
          friendlyMessage = '手机号格式不正确';
        } else if (msg.includes('limit') || msg.includes('超出限制')) {
          friendlyMessage = '今日发送次数已达上限';
        } else if (/[\u4e00-\u9fa5]/.test(error.message)) {
          friendlyMessage = error.message;
        }
      }
      showToast({
        type: 'fail',
        message: friendlyMessage,
        duration: 2000,
      });
      return false;
    } finally {
      sendingSms.value = false;
    }
  };

  /**
   * 开始倒计时
   */
  const startCountdown = () => {
    countdown.value = 60;
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
      }
    }, 1000);
  };

  /**
   * 清理定时器
   */
  const cleanup = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };

  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    countdown,
    sendingSms,
    hasSentSms,
    createCanSendSms,
    sendSmsCode,
    validatePhone,
    cleanup,
  };
}

