<template>
  <div class="page">
    <!-- 导航栏 - 只保留返回按钮 -->
    <van-nav-bar
      left-arrow
      @click-left="handleBack"
      class="register__nav"
    />

    <!-- 内容区域 -->
    <div class="register__content">
      <!-- Logo 区域 -->
      <RegisterLogo />

      <!-- 表单区域 -->
      <RegisterForm @submit="handleFormSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NavBar } from 'vant';
import RegisterLogo from '../components/register-logo/index.vue';
import RegisterForm from '../components/register-form/index.vue';
import '../styles/index.scss';

defineOptions({
  name: 'Register',
});

const router = useRouter();

// 返回
const handleBack = () => {
  router.back();
};

// 表单提交（由 RegisterForm 组件内部处理，这里只是占位）
const handleFormSubmit = () => {
  // 提交逻辑已在 RegisterForm 组件内部通过 useRegister 处理
};
</script>

<style lang="scss" scoped>
@use '../styles/register-page' as *;

// 覆盖 Vant 组件的 CSS 变量，确保输入框样式与登录页一致


// 移除导航栏的 hairline 底部边框
:deep(.register__nav.van-hairline--bottom) {
  &::after {
    display: none !important;
    border: none !important;
    border-bottom: none !important;
  }
}

:deep(.register__nav .van-nav-bar__content) {
  &::after {
    display: none !important;
    border: none !important;
    border-bottom: none !important;
  }
}
</style>

