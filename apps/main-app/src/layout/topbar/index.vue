<template>
  <div class="topbar">
    <!-- 左侧：汉堡菜单 + Logo 区域（与侧边栏宽度一致） -->
    <div class="topbar__brand" :class="{ 'is-collapse': isCollapse }">
      <!-- 汉堡菜单 -->
      <div
        class="topbar__hamburger"
        :class="{ 'is-active': drawerVisible }"
        @click.stop="$emit('toggle-drawer')"
        @mouseenter="$emit('open-drawer')"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </div>

      <!-- Logo + 标题 -->
      <div class="topbar__logo-content">
        <img src="/logo.png" alt="BTC Logo" class="topbar__logo-img" />
        <h2 class="topbar__logo-text">BTC SaaS</h2>
      </div>
    </div>

    <!-- 中间：工具区域（折叠按钮 + 搜索框） -->
    <div class="topbar__left">
      <!-- 折叠按钮 -->
      <div class="btc-comm__icon" @click="$emit('toggle-sidebar')">
        <btc-svg :name="isCollapse ? 'expand' : 'fold'" />
      </div>

      <!-- 全局搜索 -->
      <GlobalSearch />
    </div>

    <div class="topbar__right">
      <!-- 工具栏 -->
      <ul class="topbar__tools">
        <!-- 动态插件工具栏组件（按order排序） -->
        <li v-for="toolbarConfig in toolbarComponents" :key="toolbarConfig.order">
          <component :is="toolbarConfig.component" />
        </li>
      </ul>

      <!-- 用户信息 -->
      <el-dropdown
        hide-on-click
        class="topbar__user-dropdown"
        placement="bottom-end"
        popper-class="topbar__user-popper"
        @command="handleCommand"
      >
        <div class="topbar__user">
          <span class="topbar__user-name">{{ userInfo.name }}</span>
          <el-avatar :size="26" :src="userInfo.avatar" />
        </div>

        <template #dropdown>
          <div class="topbar__user-info">
            <el-avatar :size="50" :src="userInfo.avatar" />
            <div class="topbar__user-details">
              <el-text size="default" tag="p">{{ userInfo.name }}</el-text>
              <el-text size="small" type="info">{{ userInfo.email }}</el-text>
            </div>
          </div>

          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <btc-svg name="my" :size="16" />
              <span>{{ t('common.profile') }}</span>
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <btc-svg name="set" :size="16" />
              <span>{{ t('common.settings') }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <btc-svg name="exit" :size="16" />
              <span>{{ t('common.logout') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutTopbar'
});

import { ref, onMounted } from 'vue';
import { useI18n, usePluginManager } from '@btc/shared-core';
import { ElMessage, ElMessageBox } from 'element-plus';
import GlobalSearch from '../global-search/index.vue';

interface Props {
  isCollapse?: boolean;
  drawerVisible?: boolean;
}

withDefaults(defineProps<Props>(), {
  isCollapse: false,
  drawerVisible: false,
});

defineEmits<{
  'toggle-sidebar': [];
  'toggle-drawer': [];
  'open-drawer': [];
}>();

const { t } = useI18n();

// 插件管理器
const pluginManager = usePluginManager();

// 动态工具栏组件
const toolbarComponents = ref<any[]>([]);

// 用户信息
const userInfo = ref({
  name: 'Admin',
  email: 'admin@btc-saas.com',
  avatar: '/logo.png',
});

// 初始化工具栏组件
onMounted(async () => {
  try {
    const toolbarConfigs = pluginManager.getToolbarComponents();

    for (const config of toolbarConfigs) {
      try {
        const component = await config.component();
        toolbarComponents.value.push({
          ...config,
          component: component.default || component
        });
      } catch (error) {
        console.error('Failed to load toolbar component:', error);
      }
    }
  } catch (error) {
    console.error('Failed to get toolbar components:', error);
  }
});

// 处理用户下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info(t('common.profile'));
      break;
    case 'settings':
      ElMessage.info(t('common.settings'));
      break;
    case 'logout':
      ElMessageBox.confirm(
        t('common.logout_confirm'),
        t('common.tip'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          ElMessage.success(t('common.logout_success'));
          // 这里可以添加退出登录的逻辑
        })
        .catch(() => {
          // 取消操作
        });
      break;
  }
};
</script>

<style lang="scss" scoped>
.topbar {
  height: 47px;
  min-height: 47px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  padding: 0 10px 0 0; // 右侧 10px，左侧 0（让汉堡菜单贴边）
  box-sizing: border-box;
  flex-shrink: 0;

  // 品牌区域（汉堡菜单 + Logo，与侧边栏宽度一致）
  &__brand {
    display: flex;
    align-items: stretch;
    width: 255px; // 与侧边栏宽度一致
    height: 47px;
    border-right: 1px solid var(--el-border-color); // 右侧分隔线
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    &.is-collapse {
      width: 64px; // 折叠时只显示汉堡菜单

      .topbar__logo-content {
        opacity: 0;
        visibility: hidden;
      }
    }
  }

  // 汉堡菜单样式（红色背景，原 Sidebar 样式）
  &__hamburger {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 47px;
    cursor: pointer;
    flex-shrink: 0;
    gap: 5px;
    background-color: #D9261B; // 红色背景
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: #c22018; // 悬停时深红色

      .hamburger-line {
        background-color: #fff;
      }
    }

    &:active {
      background-color: #a91c15; // 按下时更深的红色
    }

    .hamburger-line {
      width: 20px;
      height: 2px;
      background-color: #fff; // 白色线条
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }

    // 交叉状态（抽屉打开时）
    &.is-active {
      .hamburger-line {
        &:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        &:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        &:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      }
    }
  }

  // Logo 内容区域（填充剩余空间）
  &__logo-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    overflow: hidden;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                visibility 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__logo-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  &__logo-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }

  // 左侧工具区（折叠按钮 + 搜索）
  &__left {
    display: flex;
    align-items: center;
    gap: 5px; // 与 tabbar 的按钮间距保持一致
    padding-left: 10px; // 与品牌区域的间距（对应 tabbar 内容区的 padding-left）
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    user-select: none;
  }

  &__right {
    display: flex;
    align-items: center;
    margin-left: auto; // 自动靠右
  }

  &__tools {
    display: flex;
    margin-right: 10px;

    & > li {
      display: flex;
      justify-content: center;
      align-items: center;
      list-style: none;
      height: 45px;
      cursor: pointer;
      margin-left: 10px;
    }
  }

  &__user {
    display: flex;
    align-items: center;
    outline: none;
    cursor: pointer;
    white-space: nowrap;
    padding: 5px 5px 5px 10px;
    border-radius: 6px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
      margin-right: 10px;
    }
  }
}
</style>

<style lang="scss">
// 用户下拉菜单样式（非 scoped）
.topbar__user-popper {
  .el-dropdown-menu__item {
    padding: 6px 12px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .topbar__user-info {
    display: flex;
    align-items: center;
    padding: 10px;
    width: 200px;
    border-bottom: 1px solid var(--el-color-info-light-9);

    .topbar__user-details {
      margin-left: 10px;
      flex: 1;
      font-size: 12px;

      p {
        margin: 0;
        font-weight: 500;
      }
    }
  }

  .btc-svg {
    margin-right: 8px;
    font-size: 16px;
  }
}
</style>

