<template>
  <div class="top-menu">
    <el-menu
      mode="horizontal"
      :default-active="activeMenu"
      :unique-opened="uniqueOpened"
      class="top-menu__menu"
      @select="handleMenuSelect"
    >
      <MenuRenderer
        :menu-items="currentMenuItems"
        :search-keyword="''"
        :is-collapse="false"
      />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutTopMenu',
});

import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { useSettingsState } from '@btc/shared-components/components/others/btc-user-setting/composables';
import { useCurrentApp } from '@btc/shared-components/composables/useCurrentApp';
import { getMenusForApp } from '@btc/shared-components/store/menuRegistry';
import MenuRenderer from '../menu-renderer/index.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();
const { uniqueOpened } = useSettingsState();

const activeMenu = ref(route.path);

// 获取当前应用的菜单项（从 menuRegistry 获取）
const currentMenuItems = computed(() => {
  return getMenusForApp(currentApp.value);
});

// 关键：顶部菜单模式下 Sidebar/DynamicMenu 可能不挂载，不能依赖其 onMounted 去触发“菜单注册兜底”
// 因此 TopMenu 自己也需要做一次 ensure，避免出现“布局切换为顶部/混合后顶部菜单为空”
onMounted(() => {
  let retrying = false;

  const ensureMenusForCurrentApp = () => {
    const app = currentApp.value;
    const menus = getMenusForApp(app) || [];
    if (menus.length > 0) return true;

    const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
    if (typeof registerMenusFn === 'function') {
      try {
        registerMenusFn(app);
      } catch (_e) {
        // 静默失败
      }
    }

    // 如果仍为空，做一次轻量重试（最多 3 秒）
    if (!retrying) {
      retrying = true;
      let retryCount = 0;
      const maxRetries = 30;
      const timer = window.setInterval(() => {
        retryCount++;
        const retryMenus = getMenusForApp(app) || [];
        if (retryMenus.length > 0) {
          window.clearInterval(timer);
          retrying = false;
        } else if (retryCount >= maxRetries) {
          window.clearInterval(timer);
          retrying = false;
        }
      }, 100);
    }

    return false;
  };

  ensureMenusForCurrentApp();

  // 应用切换时也做一次 ensure（例如从系统域切到财务域）
  watch(
    () => currentApp.value,
    () => {
      ensureMenusForCurrentApp();
    }
  );
});

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  },
  { immediate: true }
);

const handleMenuSelect = (index: string) => {
  if (import.meta.env.DEV) {
    console.log('[main-app] top-menu select', { index, currentApp: currentApp.value });
  }
  const absolutePath = index.startsWith('/') ? index : `/${index}`;
  router.push(absolutePath);
};
</script>

<style lang="scss" scoped>
.top-menu {
  height: 47px; // 与顶栏高度一致
  background-color: transparent;
  overflow: hidden;
  flex: 1; // 占据剩余空间
  margin-left: 10px; // 与搜索框的间距

  &__menu {
    border: none;
    height: 100%;
    background-color: transparent;

    :deep(.el-menu-item) {
      height: 47px;
      line-height: 47px;
      font-size: 14px;
      color: var(--el-text-color-primary);
      border-bottom: 2px solid transparent;

      &:hover {
        background-color: var(--el-fill-color-light);
        border-bottom-color: var(--el-color-primary);
      }

      &.is-active {
        color: var(--el-color-primary);
        border-bottom-color: var(--el-color-primary);
        background-color: transparent;
      }
    }

    :deep(.el-sub-menu) {
      .el-sub-menu__title {
        height: 47px;
        line-height: 47px;
        font-size: 14px;
        color: var(--el-text-color-primary);
        border-bottom: 2px solid transparent;

        &:hover {
          background-color: var(--el-fill-color-light);
          border-bottom-color: var(--el-color-primary);
        }
      }

      &.is-active {
        .el-sub-menu__title {
          color: var(--el-color-primary);
          border-bottom-color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>

