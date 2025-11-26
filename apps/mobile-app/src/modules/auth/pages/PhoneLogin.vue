<template>
  <div class="phone-login-page">
    <!-- 炫彩粒子背景 -->
    <div class="phone-login-page__particles" ref="particlesRef"></div>
    
    <!-- 导航栏 -->
    <van-nav-bar
      title="手机号登录"
      left-arrow
      @click-left="handleBack"
      class="phone-login-page__nav"
    />

    <!-- 内容区域 -->
    <div class="phone-login-page__content">
      <!-- Logo 区域 -->
      <div class="phone-login-page__logo">
        <div class="logo-wrapper">
          <img :src="logoUrl" alt="Logo" class="logo-img" />
          <div class="logo-glow"></div>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="phone-login-page__form">
        <!-- 手机号输入 -->
        <div class="form-field-wrapper">
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            type="tel"
            maxlength="11"
            :rules="phoneRules"
            @blur="validatePhone"
            class="form-field"
          />
        </div>

        <!-- 验证码输入 -->
        <div class="form-field-wrapper">
          <van-field
            v-model="form.smsCode"
            name="smsCode"
            label="验证码"
            placeholder="请输入验证码"
            type="number"
            maxlength="6"
            :rules="smsCodeRules"
            :disabled="!hasSentSms"
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
          :disabled="!canSubmit"
          @click="handleSubmit"
          class="phone-login-page__submit-btn"
        >
          立即登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeUnmount, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NavBar, Field, Button, showToast } from 'vant';
import { usePhoneLogin } from '../composables/usePhoneLogin';
import { authApi } from '@/services/auth';
import logoUrl from '@/assets/images/logo.png';

defineOptions({
  name: 'PhoneLogin',
});

const router = useRouter();
const route = useRoute();
const { loading, login } = usePhoneLogin();

// 表单数据
const form = reactive({
  phone: '',
  smsCode: '',
});

// 验证码相关状态
const countdown = ref(0);
const sendingSms = ref(false);
const hasSentSms = ref(false);
let countdownTimer: NodeJS.Timeout | null = null;

// 粒子效果
const particlesRef = ref<HTMLElement | null>(null);
let animationFrameId: number | null = null;

// 系统主题检测
const isDarkMode = ref(false);
let themeMediaQuery: MediaQueryList | null = null;

const checkSystemTheme = () => {
  if (window.matchMedia) {
    themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkMode.value = themeMediaQuery.matches;
    
    // 更新页面 class
    updateThemeClass(isDarkMode.value);
    
    // 监听主题变化
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDark = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      isDarkMode.value = isDark;
      updateThemeClass(isDark);
      // 主题变化时重新创建粒子（使用新颜色）
      if (particlesRef.value) {
        particlesRef.value.innerHTML = '';
        createParticles();
      }
    };
    
    // 兼容新旧 API
    if (themeMediaQuery.addEventListener) {
      themeMediaQuery.addEventListener('change', handleThemeChange);
    } else if (themeMediaQuery.addListener) {
      // 兼容旧浏览器
      themeMediaQuery.addListener(handleThemeChange);
    }
  }
};

// 更新主题 class
const updateThemeClass = (isDark: boolean) => {
  const pageElement = document.querySelector('.phone-login-page') as HTMLElement;
  if (pageElement) {
    if (isDark) {
      pageElement.classList.add('theme-dark');
      pageElement.classList.remove('theme-light');
    } else {
      pageElement.classList.add('theme-light');
      pageElement.classList.remove('theme-dark');
    }
  }
};

// 手机号验证规则
const phoneRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
];

// 验证码验证规则
const smsCodeRules = [
  { required: true, message: '请输入验证码' },
  { pattern: /^\d{6}$/, message: '验证码为6位数字' },
];

// 是否可以发送验证码
const canSendSms = computed(() => {
  return /^1[3-9]\d{9}$/.test(form.phone) && countdown.value === 0;
});

// 是否可以提交
const canSubmit = computed(() => {
  return /^1[3-9]\d{9}$/.test(form.phone) && /^\d{6}$/.test(form.smsCode);
});

// 验证手机号
const validatePhone = () => {
  if (!form.phone) {
    return false;
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast({
      type: 'fail',
      message: '请输入正确的手机号',
      duration: 2000,
    });
    return false;
  }
  return true;
};

// 发送验证码
const handleSendSmsCode = async () => {
  if (!validatePhone()) {
    return;
  }

  if (sendingSms.value || countdown.value > 0) {
    return;
  }

  sendingSms.value = true;

  try {
    await authApi.sendSmsCode({
      phone: form.phone,
      smsType: 'login',
    });

    showToast({
      type: 'success',
      message: '验证码已发送',
      duration: 2000,
    });

    hasSentSms.value = true;
    startCountdown();
  } catch (error: any) {
    showToast({
      type: 'fail',
      message: error?.message || '发送验证码失败',
      duration: 2000,
    });
  } finally {
    sendingSms.value = false;
  }
};

// 开始倒计时
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

// 提交登录
const handleSubmit = async () => {
  if (!canSubmit.value) {
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      showToast({
        type: 'fail',
        message: '请输入正确的手机号',
        duration: 2000,
      });
      return;
    }
    if (!/^\d{6}$/.test(form.smsCode)) {
      showToast({
        type: 'fail',
        message: '请输入6位数字验证码',
        duration: 2000,
      });
      return;
    }
    return;
  }

  try {
    await login(form.phone, form.smsCode);
    // 登录成功后会跳转，这里不需要额外处理
  } catch (error) {
    // 错误已在 login 函数中处理
  }
};

// 返回
const handleBack = () => {
  router.back();
};

// 创建粒子效果
const createParticles = () => {
  if (!particlesRef.value) return;

  const container = particlesRef.value;
  const particleCount = 50;
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    element?: HTMLElement;
  }> = [];

  // 检测系统主题
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // 根据主题选择粒子颜色
  const particleColors = isDark
    ? [
        'rgba(0, 132, 255, 0.6)', // QQ蓝
        'rgba(255, 107, 107, 0.6)', // 红色
        'rgba(255, 206, 84, 0.6)', // 黄色
        'rgba(75, 192, 192, 0.6)', // 青色
        'rgba(153, 102, 255, 0.6)', // 紫色
      ]
    : [
        'rgba(0, 132, 255, 0.4)', // QQ蓝（浅色模式降低透明度）
        'rgba(255, 107, 107, 0.4)', // 红色
        'rgba(255, 206, 84, 0.4)', // 黄色
        'rgba(75, 192, 192, 0.4)', // 青色
        'rgba(153, 102, 255, 0.4)', // 紫色
      ];

  // 初始化粒子
  for (let i = 0; i < particleCount; i++) {
    const particle = {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    };

    // 创建粒子元素
    const element = document.createElement('div');
    element.className = 'particle';
    element.style.cssText = `
      position: absolute;
      left: ${particle.x}px;
      top: ${particle.y}px;
      width: ${particle.size}px;
      height: ${particle.size}px;
      background: ${particle.color};
      border-radius: 50%;
      box-shadow: 0 0 ${particle.size * 2}px ${particle.color};
      pointer-events: none;
      will-change: transform;
    `;
    container.appendChild(element);
    particle.element = element;
    particles.push(particle);
  }

  // 动画循环
  const animate = () => {
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 更新和绘制粒子
    particles.forEach((particle) => {
      if (!particle.element) return;

      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;

      // 边界反弹
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }

      // 更新元素位置
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  animate();
};

// 清理定时器和动画
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  // 清理主题监听器
  if (themeMediaQuery && themeMediaQuery.removeEventListener) {
    themeMediaQuery.removeEventListener('change', () => {});
  }
});

// 组件挂载后创建粒子和检测主题
onMounted(() => {
  checkSystemTheme();
  createParticles();
});
</script>

<style lang="scss" scoped>
.phone-login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  
  // 浅色模式背景 - 明亮炫彩风格（默认）
  background: linear-gradient(
    135deg,
    #f0f4ff 0%,
    #e8f0fe 25%,
    #f5f9ff 50%,
    #e8f0fe 75%,
    #f0f4ff 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  
  // 暗色模式背景 - QQ风格暗色炫彩
  @media (prefers-color-scheme: dark) {
    background: linear-gradient(
      135deg,
      #0a0e27 0%,
      #1a1f3a 25%,
      #0f1419 50%,
      #1a1f3a 75%,
      #0a0e27 100%
    );
  }
  
  // 通过 class 强制暗色模式（用于动态切换）
  &.theme-dark {
    background: linear-gradient(
      135deg,
      #0a0e27 0%,
      #1a1f3a 25%,
      #0f1419 50%,
      #1a1f3a 75%,
      #0a0e27 100%
    ) !important;
  }
  
  // 通过 class 强制浅色模式
  &.theme-light {
    background: linear-gradient(
      135deg,
      #f0f4ff 0%,
      #e8f0fe 25%,
      #f5f9ff 50%,
      #e8f0fe 75%,
      #f0f4ff 100%
    ) !important;
  }

  // 导航栏样式
  &__nav {
    position: relative;
    z-index: 10;
    // 浅色模式导航栏（默认）
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 132, 255, 0.2);

    :deep(.van-nav-bar__title) {
      color: #1a1a1a;
      font-weight: 500;
    }

    :deep(.van-nav-bar__arrow) {
      color: #1a1a1a;
    }
    
    // 暗色模式导航栏
    @media (prefers-color-scheme: dark) {
      background: rgba(10, 14, 39, 0.8);
      border-bottom: 1px solid rgba(0, 132, 255, 0.2);

      :deep(.van-nav-bar__title) {
        color: #fff;
      }

      :deep(.van-nav-bar__arrow) {
        color: #fff;
      }
    }
  }
  
  // 通过 class 强制切换导航栏样式
  .theme-dark &__nav {
    background: rgba(10, 14, 39, 0.8) !important;
    border-bottom: 1px solid rgba(0, 132, 255, 0.2) !important;

    :deep(.van-nav-bar__title) {
      color: #fff !important;
    }

    :deep(.van-nav-bar__arrow) {
      color: #fff !important;
    }
  }
  
  .theme-light &__nav {
    background: rgba(255, 255, 255, 0.9) !important;
    border-bottom: 1px solid rgba(0, 132, 255, 0.2) !important;

    :deep(.van-nav-bar__title) {
      color: #1a1a1a !important;
    }

    :deep(.van-nav-bar__arrow) {
      color: #1a1a1a !important;
    }
  }

  // 粒子背景容器
  &__particles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
  }

  &__content {
    position: relative;
    z-index: 2;
    padding: 40px 24px;
    min-height: calc(100vh - 46px); // 减去导航栏高度
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__logo {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 60px;
    animation: fadeInUp 0.8s ease-out;

    .logo-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-img {
      width: 80px;
      height: 80px;
      object-fit: contain;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 0 20px rgba(0, 132, 255, 0.5));
      animation: logoFloat 3s ease-in-out infinite;
    }

    .logo-glow {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(0, 132, 255, 0.4) 0%,
        rgba(0, 132, 255, 0.1) 50%,
        transparent 100%
      );
      animation: pulse 2s ease-in-out infinite;
      z-index: 1;
    }
  }

  &__form {
    animation: fadeInUp 0.8s ease-out 0.2s both;

    .form-field-wrapper {
      margin-bottom: 20px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(0, 132, 255, 0.1) 0%,
          rgba(255, 107, 107, 0.1) 100%
        );
        border-radius: 16px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      &:focus-within::before {
        opacity: 1;
      }
    }

    .form-field {
      :deep(.van-cell) {
        // 浅色模式输入框
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 132, 255, 0.2);
        border-radius: 16px;
        padding: 16px;
        transition: all 0.3s ease;
        color: #1a1a1a;

        &:focus-within {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 132, 255, 0.5);
          box-shadow: 0 0 20px rgba(0, 132, 255, 0.3);
        }
      }

      :deep(.van-field__label) {
        color: #666;
        font-weight: 500;
      }

      :deep(.van-field__control) {
        color: #1a1a1a;

        &::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }
      }
      
      // 暗色模式输入框
      @media (prefers-color-scheme: dark) {
        :deep(.van-cell) {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;

          &:focus-within {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(0, 132, 255, 0.5);
            box-shadow: 0 0 20px rgba(0, 132, 255, 0.3);
          }
        }

        :deep(.van-field__label) {
          color: rgba(255, 255, 255, 0.7);
        }

        :deep(.van-field__control) {
          color: #fff;

          &::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }
        }
      }
    }
    
    // 通过 class 强制切换输入框样式
    .theme-dark &__form {
      .form-field {
        :deep(.van-cell) {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #fff !important;

          &:focus-within {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(0, 132, 255, 0.5) !important;
            box-shadow: 0 0 20px rgba(0, 132, 255, 0.3) !important;
          }
        }

        :deep(.van-field__label) {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        :deep(.van-field__control) {
          color: #fff !important;

          &::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
          }
        }
      }
    }
    
    .theme-light &__form {
      .form-field {
        :deep(.van-cell) {
          background: rgba(255, 255, 255, 0.8) !important;
          border: 1px solid rgba(0, 132, 255, 0.2) !important;
          color: #1a1a1a !important;

          &:focus-within {
            background: rgba(255, 255, 255, 0.95) !important;
            border-color: rgba(0, 132, 255, 0.5) !important;
            box-shadow: 0 0 20px rgba(0, 132, 255, 0.3) !important;
          }
        }

        :deep(.van-field__label) {
          color: #666 !important;
        }

        :deep(.van-field__control) {
          color: #1a1a1a !important;

          &::placeholder {
            color: rgba(0, 0, 0, 0.4) !important;
          }
        }
      }

      :deep(.van-field__button) {
        .sms-button {
          background: linear-gradient(135deg, #0084ff 0%, #0066cc 100%);
          border: none;
          color: #fff;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 132, 255, 0.4);
          transition: all 0.3s ease;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 132, 255, 0.5);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }

          &:disabled {
            opacity: 0.5;
          }
        }
      }
    }

    .phone-login-page__submit-btn {
      margin-top: 32px;
      height: 52px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, #0084ff 0%, #0066cc 100%);
      border: none;
      box-shadow: 0 8px 24px rgba(0, 132, 255, 0.4);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        transition: left 0.5s ease;
      }

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 132, 255, 0.5);

        &::before {
          left: 100%;
        }
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

// 背景渐变动画
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// Logo浮动动画
@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

// Logo光晕脉冲动画
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

// 淡入上浮动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 粒子样式
:deep(.particle) {
  will-change: transform;
}
</style>

