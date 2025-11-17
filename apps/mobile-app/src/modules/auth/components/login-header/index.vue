<template>
  <div class="login-header">
    <div class="login-header__logo">
      <!-- 保留原品牌logo图标文件 -->
      <img src="/icons/favicon.ico" alt="Logo" class="login-header__logo-img" />
    </div>
    <h1 class="login-header__title">{{ title }}</h1>
    <p v-if="subtitle" class="login-header__subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcLoginHeader',
});

interface Props {
  title?: string;
  subtitle?: string;
}

withDefaults(defineProps<Props>(), {
  title: '拜里斯科技',
  subtitle: '智慧验币，安全储存，因你而精彩！',
});
</script>

