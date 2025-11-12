<template>
<!-- 偏好设置按钮 -->
  <BtcIconButton
    :config="{
      icon: 'theme',
      tooltip: t('common.tooltip.theme_settings'),
      onClick: openDrawer
    }"
  />

  <!-- 暗黑模式切换 -->
  <BtcIconButton
    :config="{
      icon: () => theme.isDark.value ? 'light' : 'dark',
      tooltip: t('common.tooltip.toggle_dark'),
      onClick: handleDarkToggle,
      class: 'ml-[10px]'
    }"
  />

  <!-- 用户设置抽屉 -->
  <BtcUserSettingDrawer v-model="drawerVisible" />
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcIconButton } from '@btc/shared-components';
import { useUserSetting } from './composables';
import BtcUserSettingDrawer from './components/preferences-drawer.vue';

defineOptions({
  name: 'BtcUserSetting'
});

const { t } = useI18n();
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

