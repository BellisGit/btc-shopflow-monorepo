<template>
  <!-- 主题设置按钮 -->
  <div class="btc-comm__icon" @click="openDrawer">
    <BtcSvg name="theme" />
  </div>

  <!-- 暗黑模式切换 -->
  <div class="btc-comm__icon ml-[10px]" @click="handleDarkToggle">
    <BtcSvg :name="theme.isDark.value ? 'light' : 'dark'" />
  </div>

  <!-- 用户设置抽屉 -->
  <BtcUserSettingDrawer v-model="drawerVisible" />
</template>

<script setup lang="ts">
import { provide } from 'vue';
import BtcSvg from '../../common/svg/index.vue';
import { useUserSetting } from './composables';
import BtcUserSettingDrawer from './components/theme-drawer.vue';

defineOptions({
  name: 'BtcUserSetting'
});

const userSetting = useUserSetting();
const {
  drawerVisible,
  openDrawer,
  handleDarkToggle,
  theme,
} = userSetting;

// 提供用户设置实例给子组件
provide('userSetting', userSetting);
</script>

