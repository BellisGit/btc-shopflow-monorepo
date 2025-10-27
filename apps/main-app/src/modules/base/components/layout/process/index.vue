<template>
  <div class="app-process">
    <!-- 左侧操作按钮 -->
    <ul class="app-process__op">
      <li class="btc-comm__icon" @click="toBack">
        <btc-svg name="back" />
      </li>
      <li class="btc-comm__icon" @click="toRefresh">
        <btc-svg name="refresh" />
      </li>
      <li class="btc-comm__icon" @click="toHome">
        <btc-svg name="home" />
      </li>
    </ul>

    <!-- 标签容器 -->
    <div class="app-process__container">
      <el-scrollbar ref="scrollerRef" class="app-process__scroller">
        <div class="app-process__list">
          <div
            v-for="(item, index) in filteredTabs"
            :key="item.fullPath"
            :ref="(el) => setItemRef(el, index)"
            class="app-process__item"
            :class="{ active: item.active }"
            @click="onTap(item, index)"
            @contextmenu.stop.prevent="openContextMenu($event, item, index)"
          >
            <span class="label" :title="getTabLabel(item)">
              {{ getTabLabel(item) }}
            </span>

            <btc-svg class="close" name="close" @mousedown.stop="onDel(index)" />
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 右侧操作按钮 -->
    <ul class="app-process__op">
      <!-- 标签页操作菜单 -->
      <li>
        <el-dropdown trigger="click" @command="handleTabCommand">
          <div class="btc-comm__icon">
            <btc-svg name="close-border" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="close-other" :disabled="filteredTabs.length <= 1">
                {{ t('common.close_other') }}
              </el-dropdown-item>
              <el-dropdown-item command="close-all" :disabled="filteredTabs.length === 0">
                {{ t('common.close_all') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </li>

      <!-- 全屏按钮 -->
      <li class="btc-comm__icon" @click="$emit('toggle-fullscreen')">
        <btc-svg :name="isFullscreen ? 'screen-normal' : 'screen-full'" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutProcess',
});

import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { ElMessageBox } from 'element-plus';
import type { ProcessItem } from '@/store/process';
import { useProcessStore, getCurrentAppFromPath } from '@/store/process';

interface Props {
  isFullscreen?: boolean;
}

withDefaults(defineProps<Props>(), {
  isFullscreen: false,
});

defineEmits<{
  'toggle-fullscreen': [];
}>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// 使用静态导入的 store
const processStore = useProcessStore();

const scrollerRef = ref();
const itemRefs = ref<Record<number, HTMLElement>>({});

// 根据当前路由过滤标签（只显示当前应用的标签）
const filteredTabs = computed(() => {
  if (!processStore) return [];
  const currentApp = getCurrentAppFromPath(route.path);
  return processStore.list.filter((tab: ProcessItem) => tab.app === currentApp);
});

function setItemRef(el: any, index: number) {
  if (el) {
    itemRefs.value[index] = el;
  }
}

// 获取标签的国际化文本
function getTabLabel(item: ProcessItem) {
  // 路径到 i18n key 的映射
  const pathToI18nKey: Record<string, string> = {
    // 个人中心
    '/profile': 'common.profile',

    // 测试功能
    '/test/components': 'menu.test_features.components',

    // 文档中心
    '/docs': 'menu.docs_center',

    // 平台治理
    '/platform/domains': 'menu.platform.domains',
    '/platform/modules': 'menu.platform.modules',
    '/platform/plugins': 'menu.platform.plugins',

    // 组织与账号
    '/org/tenants': 'menu.org.tenants',
    '/org/departments': 'menu.org.departments',
    '/org/users': 'menu.org.users',

    // 访问控制
    '/access/resources': 'menu.access.resources',
    '/access/actions': 'menu.access.actions',
    '/access/permissions': 'menu.access.permissions',
    '/access/roles': 'menu.access.roles',
    '/access/policies': 'menu.access.policies',
    '/access/perm-compose': 'menu.access.perm_compose',

    // 导航与可见性
    '/navigation/menus': 'menu.navigation.menus',
    '/navigation/menus/preview': 'menu.navigation.menu_preview',

    // 数据管理
    '/data/recycle': 'menu.data.recycle',

    // 运维与审计
    '/ops/logs/operation': 'menu.ops.operation_log',
    '/ops/logs/request': 'menu.ops.request_log',
    '/ops/baseline': 'menu.ops.baseline',
    '/ops/simulator': 'menu.ops.simulator',

    // 子应用路由（只保留首页）
    '/logistics': 'menu.logistics.overview',
    '/engineering': 'menu.engineering.overview',
    '/quality': 'menu.quality.overview',
    '/production': 'menu.production.overview',
  };

  const i18nKey = pathToI18nKey[item.path];

  if (i18nKey) {
    return t(i18nKey);
  }

  // 回退到原始标签
  return item.meta?.label || item.name || item.path;
}

// 返回上一页（在当前应用内）
function toBack() {
  const currentApp = getCurrentAppFromPath(route.path);
  const appHomes: Record<string, string> = {
    main: '/crud',
    logistics: '/logistics',
    engineering: '/engineering',
    quality: '/quality',
    production: '/production',
  };

  // 如果有历史记录且在当前应用内，则返回
  if (window.history.length > 1) {
    router.back();
  } else {
    // 否则回到当前应用首页
    router.push(appHomes[currentApp] || '/');
  }
}

// 刷新当前路由（通过事件总线）
function toRefresh() {
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.emit('view.refresh');
  }
}

// 回到当前应用首页
function toHome() {
  const currentApp = getCurrentAppFromPath(route.path);
  const appHomes: Record<string, string> = {
    main: '/',
    logistics: '/logistics',
    engineering: '/engineering',
    quality: '/quality',
    production: '/production',
  };

  router.push(appHomes[currentApp] || '/');
}

// 调整滚动位置
function scrollTo(left: number) {
  scrollerRef.value?.wrapRef?.scrollTo({
    left,
    behavior: 'smooth',
  });
}

function adjustScroll(index: number) {
  const el = itemRefs.value[index];

  if (el && scrollerRef.value?.wrapRef) {
    const container = scrollerRef.value.wrapRef;
    scrollTo(el.offsetLeft - (container.clientWidth + el.clientWidth) / 2);
  }
}

// 点击标签
function onTap(item: any, index: number) {
  adjustScroll(index);
  router.push(item.fullPath);
}

// 删除标签
function onDel(index: number) {
  const item = filteredTabs.value[index];

  // 在原始列表中找到并删除
  const globalIndex = processStore.list.findIndex((t) => t.fullPath === item.fullPath);
  if (globalIndex > -1) {
    processStore.remove(globalIndex);
  }

  // 如果删除的是当前激活标签，跳转到最后一个标签或首页
  if (item.active) {
    const last = filteredTabs.value[filteredTabs.value.length - 1];
    router.push(last ? last.fullPath : '/');
  }
}

// 标签页操作菜单命令
function handleTabCommand(command: string) {
  const currentApp = getCurrentAppFromPath(route.path);
  const currentPath = route.path;

  switch (command) {
    case 'close-other':
      // 关闭其他标签（只在当前应用内）
      processStore.set(
        processStore.list.filter((tab) => tab.path === currentPath || tab.app !== currentApp)
      );
      break;

    case 'close-all': {
      // 关闭所有标签（只在当前应用内）
      const otherAppTabs = processStore.list.filter((tab) => tab.app !== currentApp);
      processStore.set(otherAppTabs);

      // 跳转到当前应用首页
      const appHomes: Record<string, string> = {
        main: '/',
        logistics: '/logistics',
        engineering: '/engineering',
        quality: '/quality',
        production: '/production',
      };
      router.push(appHomes[currentApp] || '/');
      break;
    }
  }
}

// 右键菜单
function openContextMenu(e: MouseEvent, item: ProcessItem, _index: number) {
  const isCurrentTab = item.path === route.path;

  ElMessageBox.confirm(t('common.tip'), {
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: isCurrentTab ? t('common.close_current') : t('common.close_other'),
    cancelButtonText: t('common.button.cancel'),
    type: 'warning',
  })
    .then(() => {
      if (isCurrentTab) {
        processStore.close();
        const last = filteredTabs.value[filteredTabs.value.length - 1];
        router.push(last ? last.fullPath : '/');
      } else {
        const currentApp = getCurrentAppFromPath(route.path);
        processStore.set(
          processStore.list.filter(
            (e) => e.fullPath === item.fullPath || e.app !== currentApp
          )
        );
      }
    })
    .catch(() => {});
}

// 监听路由变化，调整滚动位置
watch(
  () => route.path,
  (val) => {
    const index = filteredTabs.value.findIndex((e) => e.fullPath === val);
    if (index >= 0) {
      adjustScroll(index);
    }
  }
);
</script>

<style lang="scss" scoped>
.app-process {
  display: flex;
  align-items: center;
  position: relative;
  padding: 5px 10px;
  user-select: none;
  background-color: var(--el-bg-color);
  overflow: hidden;
  height: 39px; // 与面包屑保持一致的高度
  box-sizing: border-box;
  border-bottom: 1px solid var(--el-border-color-extra-light);

  &__op {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 5px; // 使用 gap 统一间距

    .btc-comm__icon {
      // 移除单独的 margin，由 gap 统一控制
    }
  }

  &__container {
    height: 100%;
    flex: 1;
    position: relative;
    margin: 0 5px;
  }

  &__scroller {
    height: 40px;
    width: 100%;
    white-space: nowrap;
    position: absolute;
    left: 0;
    top: 0;
  }

  &__item {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    height: 26px;
    padding: 0 8px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    border-radius: var(--el-border-radius-base);
    margin-right: 5px;
    border: 1px solid var(--el-fill-color-dark);
    background-color: var(--el-bg-color);

    .close {
      width: 0;
      overflow: hidden;
      transition:
        width 0.2s ease-in-out,
        background-color 0.2s ease-in-out;
      font-size: 14px;
      border-radius: 4px;
      opacity: 0;
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    .label {
      font-size: 12px;
      line-height: 1;
    }

    &:last-child {
      margin-right: 0;
    }

    &:hover:not(.active) {
      background-color: var(--el-fill-color-light);
    }

    &.active {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: #fff;

      .close {
        &:hover {
          background-color: rgba(255, 255, 255, 0.3) !important;
        }
      }
    }

    &:hover,
    &.active {
      .close {
        margin-left: 10px;
        margin-right: -2px;
        width: 14px;
        opacity: 1;
      }
    }
  }
}
</style>
