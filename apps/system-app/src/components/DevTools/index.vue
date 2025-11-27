<template>
  <Teleport to="body">
    <!-- 开发工具面板 -->
    <div
      ref="panelRef"
      class="dev-tools"
      :class="{ 'is-open': visible }"
    >
      <div class="dev-tools__content">
        <el-scrollbar>
          <div class="dev-tools__inner">
            <component :is="components[activeTab]" />
          </div>
        </el-scrollbar>
      </div>

      <!-- 菜单栏 -->
      <div class="dev-tools__menu">
        <el-tooltip
          v-for="item in tabList"
          :key="item.value"
          :content="item.tooltip || item.label"
          placement="right"
          :show-after="300"
          :teleported="true"
        >
          <div
            class="dev-tools__menu-item"
            :class="{ 'is-active': item.value === activeTab }"
            @click="switchTab(item.value)"
          >
            <el-icon :size="18">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </el-tooltip>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <el-tooltip
      v-if="isDev"
      :content="visible ? '关闭开发工具' : '打开开发工具'"
      placement="left"
    >
      <div
        ref="toggleRef"
        class="dev-tools__toggle"
        :class="{ 'is-hide': visible }"
        @click="toggle"
      >
        <el-icon :size="16">
          <Setting />
        </el-icon>
      </div>
    </el-tooltip>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { Setting, Lightning, Switch } from '@element-plus/icons-vue';
import { isDev } from '@/config';
import ApiSwitch from './ApiSwitch.vue';
import EpsViewer from './EpsViewer.vue';

const components: Record<string, any> = {
  api: ApiSwitch,
  eps: EpsViewer,
};

const tabList = [
  {
    label: '环境切换',
    value: 'api',
    icon: Switch,
    tooltip: '环境切换 - 在开发环境（10.80.9.76:8115）和生产环境（api.bellis.com.cn）之间切换',
  },
  {
    label: 'EPS',
    value: 'eps',
    icon: Lightning,
    tooltip: 'EPS - 查看所有后端 API 端点列表，支持搜索和浏览',
  },
];

const activeTab = ref('api');
const visible = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const toggleRef = ref<HTMLElement | null>(null);

function switchTab(tab: string) {
  activeTab.value = tab;
}

function toggle() {
  visible.value = !visible.value;
}

// 点击外部区域自动关闭面板
onClickOutside(
  panelRef,
  () => {
    if (visible.value) {
      visible.value = false;
    }
  },
  {
    ignore: [toggleRef], // 忽略悬浮按钮，点击按钮时不会关闭
  }
);
</script>

<style lang="scss" scoped>
.dev-tools {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s;
  height: 400px;
  width: 600px;
  max-width: calc(100vw - 20px);
  max-height: calc(100vh - 20px);
  display: flex;
  color: var(--el-text-color-primary);
  z-index: 2000;
  opacity: 0;
  transform: translate(calc(100% + 10px), 0);

  &.is-open {
    transform: translate(0, 0);
    opacity: 1;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  &__content {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  &__inner {
    padding: 16px;
  }

  &__menu {
    border-left: 1px solid var(--el-border-color-extra-light);
    padding: 8px 0;
    width: 50px;
    min-width: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
  }

  &__menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    width: 34px;
    cursor: pointer;
    border-radius: 8px;
    margin: 5px 0 0 0;
    color: var(--el-text-color-secondary);
    transition: all 0.3s;
    flex-shrink: 0;
    position: relative;
    z-index: 1;

    &:hover {
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
    }

    &.is-active {
      background-color: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }
  }

  &__toggle {
    position: fixed;
    right: 17px;
    bottom: 17px;
    z-index: 2001;
    border-radius: 50%;
    background-color: var(--el-color-primary);
    border: 2px solid var(--el-text-color-regular);
    cursor: pointer;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s;

    &:hover {
      background-color: var(--el-color-primary-light-3);
      border-color: var(--el-text-color-secondary);
      transform: scale(1.1);
    }

    &.is-hide {
      opacity: 0.6;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
