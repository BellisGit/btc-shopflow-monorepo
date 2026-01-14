<template>
  <div class="page">
    <div class="login__container">
      <!-- Logo 和标题 -->
      <BtcLoginHeader />

      <!-- 主登录区域 -->
      <div class="login__form">
        <!-- 初始按钮状态 -->
        <template v-if="!showSmsForm">
          <van-button
            type="primary"
            block
            round
            :loading="oneClickLoading"
            @click="handleOneClickLogin"
            class="login__submit-btn"
          >
            本机号码一键登录
          </van-button>

          <van-button
            type="primary"
            block
            round
            plain
            class="login__secondary-btn"
            @click="showSmsForm = true"
          >
            其他手机号登录
          </van-button>

          <p v-if="!canUseOneClick" class="login__hint">
            检测到当前网络环境可能无法使用一键登录，请使用其他手机号登录。
          </p>
        </template>

        <!-- 验证码登录表单 -->
        <template v-else>
          <SmsLoginForm
            :agreed="agreed"
            @focus="showBottomActions = false"
            @blur="handleFormBlur"
          />

          <van-button
            type="default"
            block
            round
            plain
            class="login__back-btn"
            @click="showSmsForm = false"
          >
            返回
          </van-button>
        </template>
      </div>

      <!-- 用户协议 -->
      <BtcAgreementCheckbox v-model="agreed" />

      <!-- 底部操作按钮 -->
      <div
        v-show="showBottomActions"
        class="login__bottom-actions"
      >
        <button
          class="login__action-btn login__action-btn--add-account"
          @click="showAccountMenu = true"
        >
          <van-icon name="user-o" size="20" />
        </button>
        <button
          class="login__action-btn login__action-btn--register"
          @click="handleRegister"
        >
          <van-icon name="plus" size="20" />
        </button>
      </div>
    </div>

    <!-- 更多登录方式弹出菜单 -->
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
          @touchstart="handleMenuTouchStart"
          @touchmove="handleMenuTouchMove"
          @touchend="handleMenuTouchEnd"
        >
          <div class="account-menu__drag-indicator"></div>
        </div>
        <div class="account-menu__title">更多登录方式</div>
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
import { ref, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Button, Popup, Icon, showToast } from 'vant';
import BtcLoginHeader from '../components/login-header/index.vue';
import BtcAgreementCheckbox from '../components/agreement-checkbox/index.vue';
import SmsLoginForm from '../components/sms-login-form/index.vue';
import { useNumberAuthLogin } from '../composables/useNumberAuthLogin';
import '../styles/index.scss';

defineOptions({
  name: 'BtcMobileLogin',
});

const router = useRouter();
const route = useRoute();
const agreed = ref(false);
const showAccountMenu = ref(false);
const showSmsForm = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const popupRef = ref<any>(null);
const showBottomActions = ref(true);

const { loading: oneClickLoading, login: triggerOneClick, supported: canUseOneClick } = useNumberAuthLogin();

const handleOneClickLogin = () => {
  if (!canUseOneClick.value) {
    showToast({
      type: 'fail',
      message: '请开启蜂窝网络后再试，或使用其他手机号登录',
      duration: 2000,
    });
    return;
  }

  if (!agreed.value) {
    showToast({
      type: 'fail',
      message: '请阅读并同意服务协议和拜里斯隐私保护指引',
      duration: 2000,
    });
    return;
  }

  triggerOneClick();
};

const handleFormBlur = () => {
  setTimeout(() => {
    showBottomActions.value = true;
  }, 200);
};

// 获取更多登录方式菜单的 popup 元素
const getPopupElement = (): HTMLElement | null => {
  let popupEl = document.querySelector('.account-menu-popup .van-popup') as HTMLElement;
  if (popupEl) return popupEl;

  popupEl = document.querySelector('.account-menu-popup[data-popup] .van-popup') as HTMLElement;
  if (popupEl) return popupEl;

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

  if (popupRef.value) {
    const el = (popupRef.value as any).$el || (popupRef.value as any).popupRef?.value?.$el;
    if (el) return el;
  }

  return null;
};

// 更多登录方式菜单拖拽相关
const menuTouchStartY = ref(0);
const menuTouchStartTime = ref(0);
const isMenuDragging = ref(false);

const handleMenuTouchStart = (e: TouchEvent) => {
  menuTouchStartY.value = e.touches[0].clientY;
  menuTouchStartTime.value = Date.now();
  isMenuDragging.value = true;
};

const handleMenuTouchMove = (e: TouchEvent) => {
  if (!isMenuDragging.value) return;

  const deltaY = e.touches[0].clientY - menuTouchStartY.value;
  if (deltaY > 0) {
    const popupEl = getPopupElement();
    if (popupEl) {
      popupEl.style.transform = `translateY(${deltaY}px)`;
      popupEl.style.transition = 'none';
    }
    e.preventDefault();
    e.stopPropagation();
  }
};

const handleMenuTouchEnd = (e: TouchEvent) => {
  if (!isMenuDragging.value) return;

  const deltaY = e.changedTouches[0].clientY - menuTouchStartY.value;
  const deltaTime = Date.now() - menuTouchStartTime.value;
  const velocity = deltaTime > 0 ? Math.abs(deltaY) / deltaTime : 0;
  const popupEl = getPopupElement();

  const threshold = 100;
  const velocityThreshold = 0.5;

  if (deltaY > threshold || (deltaY > 50 && velocity > velocityThreshold)) {
    if (popupEl) {
      const menuHeight = popupEl.offsetHeight;
      popupEl.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      popupEl.style.transform = `translateY(${menuHeight}px)`;

      setTimeout(() => {
        showAccountMenu.value = false;
        popupEl.style.transform = '';
        popupEl.style.transition = '';
      }, 300);
    } else {
      showAccountMenu.value = false;
    }
  } else if (popupEl) {
    popupEl.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    popupEl.style.transform = '';

    setTimeout(() => {
      const el = getPopupElement();
      if (el) {
        el.style.transition = '';
      }
    }, 300);
  }

  isMenuDragging.value = false;
  menuTouchStartY.value = 0;
};

watch(showAccountMenu, (visible) => {
  if (visible) {
    nextTick(() => {
      const popupEl = getPopupElement();
      if (popupEl) {
        popupEl.style.transform = '';
        popupEl.style.transition = '';
      }
    });
  } else {
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
// 统一间距：Logo -> 表单 -> 协议
.login__form {
  margin-top: 24px !important; // Logo 到按钮区域的间距
  margin-bottom: 24px !important; // 按钮区域到协议的间距
}

// 移除协议组件的默认上边距，使用表单的下边距
:deep(.agreement-checkbox) {
  margin-top: 0 !important;
}

// 移除第一个按钮的多余上边距
.login__submit-btn {
  margin-top: 0 !important;
}

// 额外的按钮样式
.login__secondary-btn {
  margin-top: 12px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.2) !important;
  }
}

.login__back-btn {
  margin-top: 16px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 15px;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.15) !important;
  }
}

.login__hint {
  margin-top: 16px;
  font-size: 12px;
  color: rgba(255, 200, 200, 0.9);
  text-align: center;
  line-height: 1.5;
}
</style>

<style>
/* 确保阿里云授权页能够正确覆盖登录页面 */
[id*="aliyun"],
[class*="aliyun"],
[id*="numberAuth"],
[class*="numberAuth"],
[class*="page"],
[id*="page"],
.dialog-type-container {
  z-index: 9999 !important;
  position: fixed !important;
}
.page-type-container .submit-btn {
  background: rgb(22, 93, 224);
}
</style>
