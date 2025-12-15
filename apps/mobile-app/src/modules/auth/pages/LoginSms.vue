<template>
  <div class="login-page">
    <div class="login-page__container">
      <!-- Logo 和标题 -->
      <BtcLoginHeader />

      <!-- 手机号登录表单 -->
      <div class="login-page__form">
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
          class="login-page__submit-btn"
        >
          立即登录
        </van-button>
        <van-button
          v-if="canUseOneClick"
          type="success"
          block
          round
          plain
          :loading="oneClickLoading"
          @click="handleOneClickLogin"
          class="login-page__oneclick-btn"
        >
          本机号码一键登录
        </van-button>
      </div>

      <!-- 用户协议 -->
      <BtcAgreementCheckbox v-model="agreed" />

      <!-- 底部操作按钮 -->
      <div 
        v-show="showBottomActions" 
        class="login-page__bottom-actions"
      >
        <button
          class="login-page__action-btn login-page__action-btn--add-account"
          @click="showAccountMenu = true"
        >
          <van-icon name="user-o" size="20" />
        </button>
        <button
          class="login-page__action-btn login-page__action-btn--register"
          @click="handleRegister"
        >
          <van-icon name="plus" size="20" />
        </button>
      </div>
    </div>

    <!-- 添加账号弹出菜单 -->
    <van-popup
      v-model:show="showAccountMenu"
      position="bottom"
      round
      :style="{ padding: '0', background: '#1a1a1a' }"
      class="account-menu-popup"
      ref="popupRef"
      @click-overlay="showAccountMenu = false"
    >
      <div
        class="account-menu"
        ref="menuRef"
      >
        <!-- 拖拽指示器区域 -->
        <div
          class="account-menu__drag-area"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div class="account-menu__drag-indicator"></div>
        </div>
        <div class="account-menu__title">选择登录方式</div>
        <div class="account-menu__options">
          <div
            class="account-menu__option"
            @click="handleQrLogin"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="account-menu__icon">
              <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zM3 13h8v8H3v-8zm2 2v4h4v-4H5zM13 3h8v8h-8V3zm2 2v4h4V5h-4zM19 13h2v2h-2v-2zM13 13h2v2h-2v-2zM13 17h2v2h-2v-2zM15 19h2v2h-2v-2zM19 17h2v2h-2v-2zM21 15h2v2h-2v-2zM13 19h4v4h-4v-4z" fill="currentColor" stroke="none"/>
            </svg>
            <span>扫码登录</span>
            <van-icon name="arrow" class="account-menu__arrow" />
          </div>
          <div
            class="account-menu__option"
            @click="handleQQLogin"
          >
            <svg width="24" height="24" viewBox="0 0 1024 1024" fill="none" class="account-menu__icon">
              <path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" fill="#12B7F5" />
            </svg>
            <span>QQ登录</span>
            <van-icon name="arrow" class="account-menu__arrow" />
          </div>
          <div
            class="account-menu__option"
            @click="handleWeChatLogin"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" class="account-menu__icon">
              <path fill="#07C160" d="M20.314 18.59c1.333-.968 2.186-2.397 2.186-3.986 0-2.91-2.833-5.27-6.325-5.27-3.494 0-6.325 2.36-6.325 5.27 0 2.911 2.831 5.271 6.325 5.271.698.001 1.393-.096 2.064-.288l.186-.029c.122 0 .232.038.336.097l1.386.8.12.04a.21.21 0 0 0 .212-.211l-.034-.154-.285-1.063-.023-.135a.42.42 0 0 1 .177-.343ZM9.09 3.513C4.9 3.514 1.5 6.346 1.5 9.84c0 1.905 1.022 3.622 2.622 4.781a.505.505 0 0 1 .213.412l-.026.16-.343 1.276-.04.185c0 .14.113.254.252.254l.146-.047 1.663-.96a.793.793 0 0 1 .403-.116l.222.032c.806.231 1.64.348 2.478.348l.417-.01a4.888 4.888 0 0 1-.255-1.55c0-3.186 3.1-5.77 6.923-5.77l.411.011c-.57-3.02-3.71-5.332-7.494-5.332Zm4.976 10.248a.843.843 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001Zm4.217 0a1.012 1.012 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001ZM6.561 8.827a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Zm5.061 0a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Z" clip-rule="evenodd"></path>
            </svg>
            <span>微信登录</span>
            <van-icon name="arrow" class="account-menu__arrow" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Field, Button, Popup, Icon, showToast } from 'vant';
import BtcLoginHeader from '../components/login-header/index.vue';
import BtcAgreementCheckbox from '../components/agreement-checkbox/index.vue';
import { usePhoneLogin } from '../composables/usePhoneLogin';
import { useSmsCode } from '../register/composables/useSmsCode';
import { useNumberAuthLogin } from '../composables/useNumberAuthLogin';
import '../styles/index.scss';

defineOptions({
  name: 'BtcMobileLogin',
});

const router = useRouter();
const route = useRoute();
const agreed = ref(false);
const showAccountMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const popupRef = ref<any>(null);
const showBottomActions = ref(true); // 控制底部按钮显示

// 手机号登录相关
const { loading, login } = usePhoneLogin();
const { loading: oneClickLoading, login: handleOneClickLogin, supported: canUseOneClick } = useNumberAuthLogin();

// 表单数据
const form = reactive({
  phone: '',
  smsCode: '',
});

// 验证码逻辑
const { countdown, sendingSms, hasSentSms, createCanSendSms, sendSmsCode, validatePhone } = useSmsCode('login');
const canSendSms = createCanSendSms(() => form.phone);

// 验证规则
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
  return /^1[3-9]\d{9}$/.test(form.phone) && /^\d{6}$/.test(form.smsCode);
});

// 输入框获得焦点 - 隐藏底部按钮
const handleInputFocus = () => {
  showBottomActions.value = false;
};

// 输入框失去焦点 - 显示底部按钮
const handleInputBlur = () => {
  // 延迟显示，避免点击按钮时闪烁
  setTimeout(() => {
    showBottomActions.value = true;
  }, 200);
};

// 手机号失焦验证
const handlePhoneBlur = () => {
  validatePhone(form.phone);
  handleInputBlur();
};

// 发送验证码
const handleSendSmsCode = async () => {
  await sendSmsCode(form.phone);
};

// 提交登录
const handleSubmit = async () => {
  // 验证手机号
  if (!form.phone) {
    showToast({
      type: 'fail',
      message: '请输入手机号',
      duration: 2000,
    });
    return;
  }
  
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      showToast({
        type: 'fail',
        message: '请输入正确的手机号',
        duration: 2000,
      });
      return;
    }
  
  // 验证验证码
  if (!form.smsCode) {
    showToast({
      type: 'fail',
      message: '请输入验证码',
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
  
  // 验证用户协议
  if (!agreed.value) {
    showToast({
      type: 'fail',
      message: '请阅读并同意服务协议和拜里斯隐私保护指引',
      duration: 2000,
    });
    return;
  }

  try {
    await login(form.phone, form.smsCode);
    // 登录成功后会跳转，这里不需要额外处理
  } catch (error) {
    // 错误已在 login 函数中处理
  }
};

// 触摸滑动相关状态
const touchStartY = ref(0);
const touchStartTime = ref(0);
const isDragging = ref(false);

// 获取 popup 的 DOM 元素
const getPopupElement = (): HTMLElement | null => {
  // 尝试多种选择器方式
  let popupEl = document.querySelector('.account-menu-popup .van-popup') as HTMLElement;
  if (popupEl) return popupEl;

  // 备用选择器：直接查找 van-popup
  popupEl = document.querySelector('.account-menu-popup[data-popup] .van-popup') as HTMLElement;
  if (popupEl) return popupEl;

  // 查找包含 account-menu 的最近的 van-popup
  const menuEl = document.querySelector('.account-menu');
  if (menuEl) {
    let parent = menuEl.parentElement;
    while (parent) {
      if (parent.classList.contains('van-popup')) {
        return parent;
      }
      parent = parent.parentElement;
    }
  }

  // 最后备用：通过 ref 获取
  if (popupRef.value) {
    const el = (popupRef.value as any).$el || (popupRef.value as any).popupRef?.value?.$el;
    if (el) return el;
  }

  return null;
};

// 触摸开始
const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY;
  touchStartTime.value = Date.now();
  isDragging.value = true;
};

// 触摸移动
const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;

  const currentY = e.touches[0].clientY;
  const deltaY = currentY - touchStartY.value;

  // 只允许向下滑动
  if (deltaY > 0) {
    const popupEl = getPopupElement();

    if (popupEl) {
      // 实时跟随手指位置移动整个 popup 容器
      popupEl.style.transform = `translateY(${deltaY}px)`;
      popupEl.style.transition = 'none'; // 禁用过渡，实现即时跟随
    }

    // 防止页面滚动和默认行为
    e.preventDefault();
    e.stopPropagation();
  }
};

// 触摸结束
const handleTouchEnd = (e: TouchEvent) => {
  if (!isDragging.value) return;

  const touchEndY = e.changedTouches[0].clientY;
  const deltaY = touchEndY - touchStartY.value;
  const deltaTime = Date.now() - touchStartTime.value;
  const velocity = deltaTime > 0 ? Math.abs(deltaY) / deltaTime : 0;

  const popupEl = getPopupElement();

  // 滑动阈值：超过 100px 或速度超过 0.5px/ms 时关闭
  const threshold = 100;
  const velocityThreshold = 0.5;

  if (deltaY > threshold || (deltaY > 50 && velocity > velocityThreshold)) {
    // 满足关闭条件：平滑关闭菜单
    if (popupEl) {
      // 添加关闭动画
      const menuHeight = popupEl.offsetHeight;
      popupEl.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      popupEl.style.transform = `translateY(${menuHeight}px)`;

      // 等待动画完成后再关闭
      setTimeout(() => {
        showAccountMenu.value = false;
        // 重置样式
        if (popupEl) {
          popupEl.style.transform = '';
          popupEl.style.transition = '';
        }
      }, 300);
    } else {
      showAccountMenu.value = false;
    }
  } else if (popupEl) {
    // 不满足关闭条件：平滑回弹到原位置
    popupEl.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    popupEl.style.transform = '';

    // 等待动画结束后清除 transition
    setTimeout(() => {
      const el = getPopupElement();
      if (el) {
        el.style.transition = '';
      }
    }, 300);
  }

  // 重置状态
  isDragging.value = false;
  touchStartY.value = 0;
};

// 监听菜单打开/关闭，重置样式
watch(showAccountMenu, (visible) => {
  if (visible) {
    // 菜单打开时，重置样式
    nextTick(() => {
      const popupEl = getPopupElement();
      if (popupEl) {
        popupEl.style.transform = '';
        popupEl.style.transition = '';
      }
    });
  } else {
    // 菜单关闭时，确保样式被重置
    const popupEl = getPopupElement();
    if (popupEl) {
      popupEl.style.transform = '';
      popupEl.style.opacity = '';
      popupEl.style.transition = '';
    }
  }
});

const handleQrLogin = () => {
  showAccountMenu.value = false;
  showToast({
    type: 'loading',
    message: '扫码登录功能开发中...',
    duration: 1500,
  });
};

const handleWeChatLogin = () => {
  showAccountMenu.value = false;
  showToast({
    type: 'loading',
    message: '微信登录功能开发中...',
    duration: 1500,
  });
};

const handleQQLogin = () => {
  showAccountMenu.value = false;
  showToast({
    type: 'loading',
    message: 'QQ登录功能开发中...',
    duration: 1500,
  });
};

const handleRegister = () => {
  router.push({ name: 'Register', query: route.query });
};
</script>

<style lang="scss" scoped>
// 强制覆盖输入框样式，确保深灰色背景和圆角生效
.login-page {
  // 覆盖 Vant 组件的 CSS 变量
  --van-cell-background: rgba(60, 60, 60, 0.8);
  --van-cell-text-color: #fff;
  --van-field-label-color: #fff;
  --van-field-input-text-color: #fff;
  --van-field-placeholder-text-color: rgba(255, 255, 255, 0.5);
  --van-field-input-disabled-text-color: rgba(255, 255, 255, 0.7);
  --van-field-disabled-text-color: rgba(255, 255, 255, 0.7);
  --van-cell-border-radius: 24px;

  :deep(.form-field-wrapper) {
      .van-cell {
        background: rgba(60, 60, 60, 0.8) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 24px !important; // 圆角效果
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
      opacity: 1 !important;
      
      // 使用 SVG 图标时确保清晰度
      svg {
        width: 20px !important;
        height: 20px !important;
        fill: currentColor !important;
      }
      
      // 确保图标在禁用状态下也清晰可见
      .van-field--disabled & {
        opacity: 0.7 !important;
      }
    }
  }
}

.login-page__submit-btn {
  margin-top: 32px;
}

.login-page__oneclick-btn {
  margin-top: 12px;
  --van-button-border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}
</style>
