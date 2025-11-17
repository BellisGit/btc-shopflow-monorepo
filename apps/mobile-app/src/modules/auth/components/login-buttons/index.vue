<template>
  <div class="login-buttons">
    <!-- 手机号登录按钮 -->
    <Button
      class="login-buttons__phone"
      round
      block
      type="primary"
      :loading="phoneLoading"
      :disabled="phoneLoading"
      @click="handlePhoneLogin"
    >
      <Icon name="phone-o" class="login-buttons__icon login-buttons__icon--white" />
      <span>手机号登录</span>
    </Button>

    <!-- 扫码登录按钮 -->
    <Button
      class="login-buttons__qr"
      round
      block
      :loading="qrLoading"
      :disabled="qrLoading"
      @click="handleQrLogin"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="login-buttons__icon">
        <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zM3 13h8v8H3v-8zm2 2v4h4v-4H5zM13 3h8v8h-8V3zm2 2v4h4V5h-4zM19 13h2v2h-2v-2zM13 13h2v2h-2v-2zM13 17h2v2h-2v-2zM15 19h2v2h-2v-2zM19 17h2v2h-2v-2zM21 15h2v2h-2v-2zM13 19h4v4h-4v-4z" fill="currentColor" stroke="none"/>
      </svg>
      <span>通过扫码登录</span>
    </Button>

    <!-- 其他登录方式 -->
    <div class="login-buttons__other">
      <span class="login-buttons__other-text">其他方式</span>
      <div class="login-buttons__social">
        <div class="login-buttons__social-item login-buttons__social-item--wechat" @click="handleWeChatLogin">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" class="wechat-icon">
            <path fill="#07C160" d="M20.314 18.59c1.333-.968 2.186-2.397 2.186-3.986 0-2.91-2.833-5.27-6.325-5.27-3.494 0-6.325 2.36-6.325 5.27 0 2.911 2.831 5.271 6.325 5.271.698.001 1.393-.096 2.064-.288l.186-.029c.122 0 .232.038.336.097l1.386.8.12.04a.21.21 0 0 0 .212-.211l-.034-.154-.285-1.063-.023-.135a.42.42 0 0 1 .177-.343ZM9.09 3.513C4.9 3.514 1.5 6.346 1.5 9.84c0 1.905 1.022 3.622 2.622 4.781a.505.505 0 0 1 .213.412l-.026.16-.343 1.276-.04.185c0 .14.113.254.252.254l.146-.047 1.663-.96a.793.793 0 0 1 .403-.116l.222.032c.806.231 1.64.348 2.478.348l.417-.01a4.888 4.888 0 0 1-.255-1.55c0-3.186 3.1-5.77 6.923-5.77l.411.011c-.57-3.02-3.71-5.332-7.494-5.332Zm4.976 10.248a.843.843 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001Zm4.217 0a1.012 1.012 0 1 1 0-1.685.843.843 0 0 1 0 1.684v.001ZM6.561 8.827a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Zm5.061 0a1.012 1.012 0 1 1 0-2.023 1.012 1.012 0 0 1 0 2.023Z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="login-buttons__social-item login-buttons__social-item--qq" @click="handleQQLogin">
          <svg width="24" height="24" viewBox="0 0 1024 1024" fill="none" class="qq-icon">
            <path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" fill="#12B7F5" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Icon, showToast } from 'vant';
import { usePhoneLogin } from '../../composables/usePhoneLogin';

defineOptions({
  name: 'BtcLoginButtons',
});

const emit = defineEmits<{
  phoneLogin: [];
  qrLogin: [];
  wechatLogin: [];
  qqLogin: [];
}>();

const { loading: phoneLoading, login: phoneLogin } = usePhoneLogin();

const qrLoading = ref(false);

const handlePhoneLogin = async () => {
  emit('phoneLogin');
  // TODO: 打开验证码登录弹窗或跳转
  showToast({
    type: 'loading',
    message: '验证码登录功能开发中...',
    duration: 1500,
  });
};

const handleQrLogin = async () => {
  if (qrLoading.value) return;

  qrLoading.value = true;
  emit('qrLogin');

  try {
    // TODO: 打开扫码登录页面或弹窗
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast({
      type: 'loading',
      message: '扫码登录功能开发中...',
      duration: 1500,
    });
  } finally {
    qrLoading.value = false;
  }
};

const handleWeChatLogin = () => {
  emit('wechatLogin');
  showToast({
    type: 'loading',
    message: '微信登录功能开发中...',
    duration: 1500,
  });
};

const handleQQLogin = () => {
  emit('qqLogin');
  showToast({
    type: 'loading',
    message: 'QQ登录功能开发中...',
    duration: 1500,
  });
};
</script>

