<template>
  <div class="sidebar">
    <!-- 搜索框 -->
    <div v-if="!isCollapse" class="sidebar__search">
      <el-input
        v-model="searchKeyword"
        :placeholder="t('common.search_menu')"
        clearable
        @focus="handleSearchFocus"
      >
        <template #prefix>
          <btc-svg name="search" :size="16" />
        </template>
      </el-input>
    </div>

    <!-- 动态菜单 -->
    <DynamicMenu :is-collapse="isCollapse" :search-keyword="searchKeyword" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutSidebar'
});

import DynamicMenu from '../dynamic-menu/index.vue';
import { ref } from 'vue';
import { useI18n } from '@btc/shared-core';

const { t } = useI18n();

// 搜索关键词
const searchKeyword = ref('');

interface Props {
  isCollapse?: boolean;
  drawerVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  drawerVisible: false,
});

// 搜索框聚焦时的处理（现在不需要做任何事，因为搜索框只在非折叠时显示）
const handleSearchFocus = () => {
  // 不再需要展开侧边栏逻辑，因为搜索框只在非折叠时显示
};
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);

  &__menu {
    flex: 1;
    border: none;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: var(--el-bg-color) !important;

    :deep(.el-sub-menu__title) {
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateZ(0); // 硬件加速
      color: var(--el-text-color-primary);

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    :deep(.el-menu-item) {
      font-size: 14px;
      transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateZ(0); // 硬件加速
      color: var(--el-text-color-primary);

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.is-active {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }
    }

    :deep(.el-sub-menu__icon-arrow) {
      color: var(--el-text-color-secondary);
    }

    :deep(.el-icon) {
      transition: margin 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
    }

    :deep(span) {
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      transition: max-width 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 200px;
      opacity: 1;
    }

    // 折叠状态下的样式
    &.el-menu--collapse {
      width: 64px;

      :deep(.el-sub-menu__title),
      :deep(.el-menu-item) {
        justify-content: center;

        .el-icon {
          margin-right: 0;
        }

        span {
          max-width: 0 !important;
          opacity: 0 !important;
        }
      }

      :deep(.el-sub-menu) {
        text-align: center;
      }
    }
  }

  // 搜索框样式
  &__search {
    padding: 6px 10px;  // 上下 6px，左右 10px
    border-bottom: 1px solid var(--el-border-color-extra-light);
    height: 39px;  // 总高度与 tabbar 对齐
    box-sizing: border-box;
    display: flex;
    align-items: center;

    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      box-shadow: none;
      height: 27px;  // 输入框高度：39 - 6 - 6 = 27px
      padding: 0 12px;
      border-radius: 6px;

      .el-input__inner {
        font-size: 13px;
      }
    }

    :deep(.el-input__prefix) {
      display: flex;
      align-items: center;
    }
  }
}
</style>

