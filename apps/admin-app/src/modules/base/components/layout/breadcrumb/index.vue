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

import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { useProcessStore, getCurrentAppFromPath } from '@/store/process';
import { getManifestRoute } from '@/micro/manifests';
import { getMenusForApp } from '@/store/menuRegistry';

const route = useRoute();
const { t } = useI18n();
const processStore = useProcessStore();

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

// 从菜单注册表中查找菜单项的图标
function findMenuIconByI18nKey(i18nKey: string, app: string): string | undefined {
  const menus = getMenusForApp(app);

  // 递归查找菜单项
  function findInMenuItems(items: any[]): string | undefined {
    for (const item of items) {
      // 检查当前菜单项的 title 是否匹配 i18nKey
      if (item.title === i18nKey && item.icon) {
        return item.icon;
      }
      // 递归查找子菜单
      if (item.children && item.children.length > 0) {
        const found = findInMenuItems(item.children);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  return findInMenuItems(menus);
}

// 根据路由生成面包屑（应用隔离）
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  const normalizedPath = route.path.replace(/\/+$/, '') || '/';
  const currentApp = getCurrentAppFromPath(normalizedPath);

  // 查找当前标签页，精确匹配路径
  const currentTab =
    processStore.list.find(
      (tab) =>
        (tab.fullPath && tab.fullPath.replace(/\/+$/, '') === normalizedPath) ||
        (tab.path && tab.path.replace(/\/+$/, '') === normalizedPath),
    ) ?? null;

  const normalizeBreadcrumbEntries = (entries: any[] | undefined) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    return entries
      .map((item) => {
        const key =
          (typeof item.labelKey === 'string' && item.labelKey) ||
          (typeof item.i18nKey === 'string' && item.i18nKey);
        const rawLabel =
          (typeof item.label === 'string' && item.label) ||
          (typeof key === 'string' ? key : '');

        if (!rawLabel) {
          return null;
        }

        const translated = key ? t(key) : t(rawLabel);
        const label =
          translated && translated !== (key ?? rawLabel) ? translated : rawLabel;

        // 优先使用配置中的图标，如果没有则从菜单注册表中查找
        const menuIcon = key ? findMenuIconByI18nKey(key, currentApp) : undefined;

        // 确保图标正确传递：优先使用配置中的图标
        const icon = item.icon || menuIcon;

        return {
          label,
          icon,
        };
      })
      .filter(Boolean) as BreadcrumbItem[];
  };

  const metaBreadcrumbs = normalizeBreadcrumbEntries(
    currentTab?.meta?.breadcrumbs,
  );
  if (metaBreadcrumbs.length > 0) {
    return metaBreadcrumbs;
  }

  const manifestBreadcrumbs = normalizeBreadcrumbEntries(
    getManifestRoute(currentApp, normalizedPath)?.breadcrumbs,
  );
  if (manifestBreadcrumbs.length > 0) {
    return manifestBreadcrumbs;
  }

  // 管理域的路径映射（完整层级结构）
  // 注意：图标将从菜单注册表中自动获取，这里只保留 i18nKey
  const adminAppBreadcrumbs: Record<string, BreadcrumbConfig[]> = {
    // 平台治理
    '/platform/domains': [
      { i18nKey: 'menu.platform' },
      { i18nKey: 'menu.platform.domains' },
    ],
    '/platform/modules': [
      { i18nKey: 'menu.platform' },
      { i18nKey: 'menu.platform.modules' },
    ],
    '/platform/plugins': [
      { i18nKey: 'menu.platform' },
      { i18nKey: 'menu.platform.plugins' },
    ],

    // 组织与账号
    '/org/tenants': [
      { i18nKey: 'menu.org' },
      { i18nKey: 'menu.org.tenants' },
    ],
    '/org/departments': [
      { i18nKey: 'menu.org' },
      { i18nKey: 'menu.org.departments' },
    ],
    '/org/users': [
      { i18nKey: 'menu.org' },
      { i18nKey: 'menu.org.users' },
    ],

    // 访问控制
    '/access/resources': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.config' },
      { i18nKey: 'menu.access.resources' },
    ],
    '/access/actions': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.config' },
      { i18nKey: 'menu.access.actions' },
    ],
    '/access/permissions': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.config' },
      { i18nKey: 'menu.access.permissions' },
    ],
    '/access/roles': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.config' },
      { i18nKey: 'menu.access.roles' },
    ],
    '/access/perm-compose': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.relations' },
      { i18nKey: 'menu.access.perm_compose' },
    ],
    '/org/users/:id/roles': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.relations' },
      { i18nKey: 'menu.access.user_assign' },
      { i18nKey: 'menu.access.user_role_bind' },
    ],
    '/org/users/users-roles': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.relations' },
      { i18nKey: 'menu.access.user_assign' },
      { i18nKey: 'menu.access.user_role_bind' },
    ],

    // 导航与可见性
    '/navigation/menus': [
      { i18nKey: 'menu.navigation' },
      { i18nKey: 'menu.navigation.menus' },
    ],
    '/navigation/menus/preview': [
      { i18nKey: 'menu.navigation' },
      { i18nKey: 'menu.navigation.menu_preview' },
    ],

    // 运维与审计
    '/ops/logs/operation': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.logs' },
      { i18nKey: 'menu.ops.operation_log' },
    ],
    '/ops/logs/request': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.logs' },
      { i18nKey: 'menu.ops.request_log' },
    ],
    '/ops/baseline': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.baseline' },
    ],
    '/ops/api-list': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.api_list' },
    ],
    '/ops/simulator': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.simulator' },
    ],
    // 策略相关
    '/strategy/management': [
      { i18nKey: 'menu.strategy' },
      { i18nKey: 'menu.strategy.management' },
    ],
    '/strategy/designer': [
      { i18nKey: 'menu.strategy' },
      { i18nKey: 'menu.strategy.designer' },
    ],
    '/strategy/monitor': [
      { i18nKey: 'menu.strategy' },
      { i18nKey: 'menu.strategy.monitor' },
    ],
    // 数据治理
    '/governance/files/templates': [
      { i18nKey: 'menu.governance' },
      { i18nKey: 'menu.data.files' },
      { i18nKey: 'menu.data.files.templates' },
    ],
    // 测试功能（图标将从菜单注册表中获取）
    '/test/components': [
      { i18nKey: 'menu.test_features' },
      { i18nKey: 'menu.test_features.components' },
    ],
    '/test/api-test-center': [
      { i18nKey: 'menu.test_features' },
      { i18nKey: 'menu.test_features.api_test_center' },
    ],
    '/test/inventory-ticket-print': [
      { i18nKey: 'menu.test_features' },
      { i18nKey: 'menu.test_features.inventory_ticket_print' },
    ],
  };

  // 子应用的面包屑映射（暂时为空，待实现具体页面）
  const subAppBreadcrumbs: Record<string, Record<string, BreadcrumbConfig[]>> = {
    system: {},
    logistics: {},
    engineering: {},
    quality: {},
    production: {},
    finance: {},
  };

  const homePaths = new Set([
    '/',
    '/admin',
  ]);

  if (homePaths.has(normalizedPath)) {
    return [];
  }

  // 获取面包屑数据
  // 生产环境下路径没有 /admin 前缀（如 /platform/domains），直接匹配
  let breadcrumbData: BreadcrumbConfig[] | undefined;

  // 优先使用识别到的应用类型
  if (currentApp === 'admin') {
    breadcrumbData = adminAppBreadcrumbs[normalizedPath];
  } else if (currentApp && subAppBreadcrumbs[currentApp]) {
    breadcrumbData = subAppBreadcrumbs[currentApp][normalizedPath];
  } else {
    // 如果无法识别应用，尝试使用 admin 应用的面包屑配置（作为后备方案）
    breadcrumbData = adminAppBreadcrumbs[normalizedPath];
  }

  if (!breadcrumbData) {
    return [];
  }

  // 转换为带翻译的面包屑，并从菜单注册表中获取图标
  return breadcrumbData.map((item) => {
    // 优先使用配置中的图标，如果没有则从菜单注册表中查找
    const menuIcon = findMenuIconByI18nKey(item.i18nKey, currentApp);
    return {
      label: t(item.i18nKey),
      icon: item.icon || menuIcon,
    };
  });
});
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
  position: relative;
  padding: 5px 10px; // 统一左右 padding
  user-select: none;
  background-color: var(--el-bg-color);
  overflow: hidden;
  height: 39px; // 总高度 39px（包含 padding）
  width: 100% !important; // 使用 !important 防止被覆盖，确保宽度稳定
  box-sizing: border-box !important; // 使用 !important 防止被覆盖，确保边框包含在宽度内

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
  }

  .breadcrumb-icon {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
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
