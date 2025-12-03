<template>
  <div class="btc-user-setting-toolbar">
    <!-- 偏好设置按钮 -->
    <BtcIconButton
      :config="{
        icon: 'theme',
        tooltip: t('common.tooltip.theme_settings'),
        onClick: handlePreferencesClick
      }"
    />

    <!-- 暗黑模式切换 -->
    <BtcIconButton
      :config="{
        icon: () => theme.isDark.value ? 'light' : 'dark',
        tooltip: t('common.tooltip.toggle_dark'),
        onClick: handleDarkToggle
      }"
    />
  </div>

  <!-- 用户设置抽屉 -->
  <BtcUserSettingDrawer 
    :model-value="drawerVisible" 
    @update:model-value="(val) => { drawerVisible = val; }"
  />
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcIconButton } from '@btc/shared-components';
import { useUserSetting } from './composables/useThemeSwitcher';
import BtcUserSettingDrawer from './components/preferences-drawer.vue';

defineOptions({
  name: 'BtcUserSetting'
});

const { t } = useI18n();
const userSetting = useUserSetting();
// 直接使用 userSetting.drawerVisible，它本身就是一个 ref
const drawerVisible = userSetting.drawerVisible;
const openDrawer = userSetting.openDrawer;
const handleDarkToggle = userSetting.handleDarkToggle;
const theme = userSetting.theme;

// 处理偏好设置按钮点击
const handlePreferencesClick = (event?: MouseEvent) => {
  if (openDrawer) {
    openDrawer();
  }
};

// 提供用户设置实例给子组件
provide('userSetting', userSetting);
</script>

<style lang="scss" scoped>
.btc-user-setting-toolbar {
  display: flex;
  align-items: center;
  gap: 10px; // 两个按钮之间的间距
}
</style>

