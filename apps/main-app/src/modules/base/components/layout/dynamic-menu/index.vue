<template>
  <el-menu
    :key="menuKey"
    ref="menuRef"
    :default-active="activeMenu"
    :default-openeds="defaultOpeneds"
    :collapse="isCollapse"
    :collapse-transition="false"
    class="sidebar__menu"
    @select="handleMenuSelect"
  >
    <!-- 使用配置文件动态渲染菜单 -->
    <MenuRenderer
      :menu-items="currentMenuItems"
      :search-keyword="searchKeyword"
      :is-collapse="isCollapse"
    />
  </el-menu>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutDynamicMenu',
});

import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { useCurrentApp } from '@/composables/useCurrentApp';
import { appMenus } from '@/micro/menus';
import MenuRenderer from '../menu-renderer/index.vue';

interface Props {
  isCollapse?: boolean;
  searchKeyword?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  searchKeyword: '',
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();

const activeMenu = ref(route.path);

// 菜单 ref
const menuRef = ref();
const menuKey = ref(0); // 用于强制重新渲染菜单

// 获取当前应用的菜单项
const currentMenuItems = computed(() => {
  return appMenus[currentApp.value] || [];
});

// 递归获取所有菜单项的 index（用于搜索匹配）
const getAllMenuIndexes = (items: any[]): string[] => {
  const indexes: string[] = [];

  items.forEach(item => {
    if (item.index) {
      indexes.push(item.index);
    }
    if (item.children && item.children.length > 0) {
      indexes.push(...getAllMenuIndexes(item.children));
    }
  });

  return indexes;
};

const defaultOpeneds = computed(() => {
  if (props.isCollapse) return [];

  // 如果有搜索关键词，根据匹配结果精确展开菜单
  if (props.searchKeyword) {
    const keyword = props.searchKeyword.toLowerCase().trim();
    if (!keyword) {
      // 空搜索，恢复默认展开
      return currentApp.value === 'main'
        ? ['platform', 'org', 'access', 'navigation', 'ops', 'test-features']
        : [];
    }

    // 递归查找匹配的菜单项并展开其父级
    const findMatchingParents = (items: any[], parents: string[] = []): string[] => {
      const openeds: string[] = [];

      items.forEach(item => {
        const currentParents = [...parents, item.index];

        // 检查当前菜单项是否匹配
        const currentMatch = t(item.title).toLowerCase().includes(keyword);

        if (currentMatch) {
          // 如果当前项匹配，展开所有父级
          openeds.push(...parents);
        }

        // 递归检查子菜单
        if (item.children && item.children.length > 0) {
          const childMatch = findMatchingParents(item.children, currentParents);
          if (childMatch.length > 0) {
            // 如果子菜单有匹配项，展开当前项
            openeds.push(item.index);
            openeds.push(...childMatch);
          }
        }
      });

      return openeds;
    };

    return [...new Set(findMatchingParents(currentMenuItems.value))];
  }

  // 无搜索时的默认展开
  switch (currentApp.value) {
    case 'main':
      return ['platform', 'org', 'access', 'navigation', 'ops', 'test-features'];
    default:
      return [];
  }
});

// 监听搜索关键词变化，强制重新渲染菜单以应用新的 defaultOpeneds
watch(
  () => props.searchKeyword,
  () => {
    menuKey.value++;
  }
);

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  },
  { immediate: true }
);

const handleMenuSelect = (index: string) => {
  // 确保使用绝对路径，避免相对路径拼接
  const absolutePath = index.startsWith('/') ? index : `/${index}`;
  router.push(absolutePath);
};
</script>

<style lang="scss" scoped>
.sidebar__menu {
  $slider-menu-height: 50px;

  flex: 1;
  border: none;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--el-bg-color) !important;

  :deep(.el-sub-menu__title) {
    height: $slider-menu-height;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    color: var(--el-text-color-primary);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    // 移除一级菜单的激活样式
    &.is-active {
      background-color: transparent;
    }
  }

  :deep(.el-menu-item) {
    height: $slider-menu-height;
    font-size: 14px;
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    color: var(--el-text-color-primary);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-active {
      background-color: var(--el-color-primary) !important;
      color: #fff !important;
    }
  }

  :deep(.el-sub-menu__icon-arrow) {
    color: var(--el-text-color-secondary);
  }

  :deep(.el-icon) {
    transition: margin 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    margin-right: 16px; // 图标和文字间距 16px（与 cool-admin 一致）
  }

  :deep(span) {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition:
      max-width 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 200px;
    opacity: 1;
    font-size: 14px; // 文字大小 14px
    letter-spacing: 0.05em; // 字间距
  }

  &.el-menu--collapse {
    width: 64px;

    :deep(.el-sub-menu__title),
    :deep(.el-menu-item) {
      justify-content: center;
      padding-left: 0 !important;
      padding-right: 0 !important;

      .el-icon {
        margin-right: 0 !important;
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
</style>
