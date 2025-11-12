<template>
  <div class="app-breadcrumb">
    <el-breadcrumb separator="|">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
        <span class="breadcrumb-item">
          <el-icon
            v-if="item.icon && ElementPlusIconsVue[item.icon as keyof typeof ElementPlusIconsVue]"
            :size="14"
            class="breadcrumb-icon"
          >
            <component :is="ElementPlusIconsVue[item.icon as keyof typeof ElementPlusIconsVue]" />
          </el-icon>
          <span>{{ item.label }}</span>
        </span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutBreadcrumb',
});

import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@btc/shared-core';
// 动态导入 store
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const route = useRoute();
const { t } = useI18n();

// 动态导入 store
const getCurrentAppFromPath = ref<any>(null);

// 加载 store
import('@/store/process').then(({ getCurrentAppFromPath: getCurrentApp }) => {
  getCurrentAppFromPath.value = getCurrentApp;
});

interface BreadcrumbItem {
  label: string;
  icon?: string;
  path?: string;
}

// 内部使用的面包屑配置类型
interface BreadcrumbConfig {
  i18nKey: string;
  icon?: string;
}

// 根据路由生成面包屑（应用隔离）
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  if (!getCurrentAppFromPath.value) return [];
  const currentApp = getCurrentAppFromPath.value(route.path);

  // 主应用的路径映射（完整层级结构）
  const mainAppBreadcrumbs: Record<string, BreadcrumbConfig[]> = {
    // 平台治理
    '/platform/domains': [
      { i18nKey: 'menu.platform', icon: 'Coin' },
      { i18nKey: 'menu.platform.domains', icon: 'Location' },
    ],
    '/platform/modules': [
      { i18nKey: 'menu.platform', icon: 'Coin' },
      { i18nKey: 'menu.platform.modules', icon: 'Files' },
    ],
    '/platform/plugins': [
      { i18nKey: 'menu.platform', icon: 'Coin' },
      { i18nKey: 'menu.platform.plugins', icon: 'Connection' },
    ],

    // 组织与账号
    '/org/tenants': [
      { i18nKey: 'menu.org', icon: 'OfficeBuilding' },
      { i18nKey: 'menu.org.tenants', icon: 'School' },
    ],
    '/org/departments': [
      { i18nKey: 'menu.org', icon: 'OfficeBuilding' },
      { i18nKey: 'menu.org.departments', icon: 'Postcard' },
    ],
    '/org/users': [
      { i18nKey: 'menu.org', icon: 'OfficeBuilding' },
      { i18nKey: 'menu.org.users', icon: 'User' },
    ],

    // 访问控制
    '/access/resources': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.resources', icon: 'FolderOpened' },
    ],
    '/access/actions': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.actions', icon: 'TrendCharts' },
    ],
    '/access/permissions': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.permissions', icon: 'Key' },
    ],
    '/access/roles': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.roles', icon: 'UserFilled' },
    ],
    '/access/policies': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.policies', icon: 'Document' },
    ],
    '/access/perm-compose': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.perm_compose', icon: 'Grid' },
    ],

    // 导航与可见性
    '/navigation/menus': [
      { i18nKey: 'menu.navigation', icon: 'Menu' },
      { i18nKey: 'menu.navigation.menus', icon: 'List' },
    ],
    '/navigation/menus/preview': [
      { i18nKey: 'menu.navigation', icon: 'Menu' },
      { i18nKey: 'menu.navigation.menu_preview', icon: 'View' },
    ],

    // 运维与审计
    '/ops/logs/operation': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.logs', icon: 'Document' },
      { i18nKey: 'menu.ops.operation_log', icon: 'Operation' },
    ],
    '/ops/logs/request': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.logs', icon: 'Document' },
      { i18nKey: 'menu.ops.request_log', icon: 'Connection' },
    ],
    '/data/files/list': [
      { i18nKey: 'menu.data', icon: 'FolderOpened' },
      { i18nKey: 'menu.data.files', icon: 'Document' },
      { i18nKey: 'menu.data.files.list', icon: 'List' },
    ],
    '/data/files/templates': [
      { i18nKey: 'menu.data', icon: 'FolderOpened' },
      { i18nKey: 'menu.data.files', icon: 'Document' },
      { i18nKey: 'menu.data.files.templates', icon: 'Files' },
    ],
    '/data/files/preview': [
      { i18nKey: 'menu.data', icon: 'FolderOpened' },
      { i18nKey: 'menu.data.files', icon: 'Document' },
      { i18nKey: 'menu.data.files.preview', icon: 'View' },
    ],
    '/data/recycle': [
      { i18nKey: 'menu.data', icon: 'FolderOpened' },
      { i18nKey: 'menu.data.recycle', icon: 'DeleteFilled' },
    ],
    '/ops/baseline': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.baseline', icon: 'Histogram' },
    ],
    '/ops/api-list': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.api_list', icon: 'List' },
    ],
    '/ops/simulator': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.simulator', icon: 'Opportunity' },
    ],
    // 策略相关
    '/strategy/management': [
      { i18nKey: 'menu.strategy', icon: 'Document' },
      { i18nKey: 'menu.strategy.management', icon: 'FolderOpened' },
    ],
    '/strategy/designer': [
      { i18nKey: 'menu.strategy', icon: 'Document' },
      { i18nKey: 'menu.strategy.designer', icon: 'EditPen' },
    ],
    '/strategy/monitor': [
      { i18nKey: 'menu.strategy', icon: 'Document' },
      { i18nKey: 'menu.strategy.monitor', icon: 'Monitor' },
    ],
    // 测试功能
    '/test/components': [
      { i18nKey: 'menu.test_features', icon: 'Coin' },
      { i18nKey: 'menu.test_features.components', icon: 'Tickets' },
    ],
    '/test/api-test-center': [
      { i18nKey: 'menu.test_features', icon: 'Coin' },
      { i18nKey: 'menu.test_features.api_test_center', icon: 'Connection' },
    ],
  };

  // 子应用的面包屑映射（暂时为空，待实现具体页面）
  const subAppBreadcrumbs: Record<string, Record<string, BreadcrumbConfig[]>> = {
    logistics: {},
    engineering: {},
    quality: {},
    production: {},
  };

  // 应用首页不显示面包屑
  if (
    route.path === '/' ||
    route.path === '/logistics' ||
    route.path === '/engineering' ||
    route.path === '/quality' ||
    route.path === '/production'
  ) {
    return [];
  }

  // 获取面包屑数据
  const breadcrumbData =
    currentApp === 'main'
      ? mainAppBreadcrumbs[route.path]
      : subAppBreadcrumbs[currentApp]?.[route.path];

  if (!breadcrumbData) {
    return [];
  }

  // 转换为带翻译的面包屑
  return breadcrumbData.map((item) => ({
    label: t(item.i18nKey),
    icon: item.icon,
  }));
});
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
  position: relative;
  padding: 5px 10px;
  user-select: none;
  background-color: var(--el-bg-color);
  overflow: hidden;
  height: 39px; // 总高度 39px（包含 padding）
  box-sizing: border-box;

  :deep(.el-breadcrumb) {
    font-size: 14px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  :deep(.el-breadcrumb__item) {
    display: flex;
    align-items: center;

    .el-breadcrumb__inner {
      color: var(--el-text-color-regular);
      font-weight: normal;
      cursor: default;
      pointer-events: none;
      padding: 0; // 移除默认 padding
    }

    &:last-child .el-breadcrumb__inner {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }

  :deep(.el-breadcrumb__separator) {
    color: var(--el-text-color-placeholder);
    margin: 0 8px;
    font-weight: normal;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-blank);
    height: 26px;
    line-height: 26px;
  }

  .breadcrumb-icon {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }

  // 最后一级样式（当前页面）
  :deep(.el-breadcrumb__item:last-child) {
    .breadcrumb-item {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-5);
      color: var(--el-text-color-primary);

      .breadcrumb-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

// 深色主题样式（全局样式，不使用 scoped）
html.dark .app-breadcrumb {
  .breadcrumb-item {
    border-color: var(--el-border-color) !important;
    background-color: var(--el-bg-color) !important;
  }

  :deep(.el-breadcrumb__item:last-child) {
    .breadcrumb-item {
      background-color: var(--el-color-primary-light-9) !important;
      border-color: var(--el-color-primary-light-5) !important;
    }
  }
}
</style>
