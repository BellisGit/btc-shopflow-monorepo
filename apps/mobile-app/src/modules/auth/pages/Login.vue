<template>
  <div class="login-page">
    <div class="login-page__container">
      <!-- Logo 和标题 -->
      <BtcLoginHeader />

      <!-- 登录按钮组 -->
      <BtcLoginButtons
        @phone-login="handlePhoneLogin"
        @qr-login="handleQrLogin"
        @wechat-login="handleWeChatLogin"
        @qq-login="handleQQLogin"
      />

      <!-- 用户协议 -->
      <BtcAgreementCheckbox v-model="agreed" />
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BtcLoginHeader from '../components/login-header/index.vue';
import BtcLoginButtons from '../components/login-buttons/index.vue';
import BtcAgreementCheckbox from '../components/agreement-checkbox/index.vue';
import '../styles/index.scss';

defineOptions({
  name: 'BtcMobileLogin',
});

const agreed = ref(false);

const handlePhoneLogin = () => {
  // TODO: 打开手机号登录弹窗
  console.log('Phone login');
};

const handleQrLogin = () => {
  // TODO: 处理扫码登录
  console.log('QR login');
};

const handleWeChatLogin = () => {
  // TODO: 处理微信登录
  console.log('WeChat login');
};

const handleQQLogin = () => {
  // TODO: 处理 QQ 登录
  console.log('QQ login');
};
</script>
